/**
 * 画面特征提取（浏览器与 Node 通用，无依赖）
 *
 * 口径与 scripts/extract-frame-tones.mjs 一致：曝光分段以中间灰 0.18 为基准、每档约两档光圈。
 * 浏览器里用 canvas 把图缩到 ~180px 再取 ImageData 传入；Node 里用 sharp 解码后传入。
 * 只做「能被像素证明」的部分——构图、光位、景别属于描述性标签，必须由用户勾选或视觉模型判断。
 */

export type ToneBandKey = "shadow" | "dark" | "midDark" | "midLight" | "light" | "highlight";

export interface ToneBand { key: ToneBandKey; hex: string; luma: number; share: number }
export interface DominantColor { hex: string; share: number }
export interface FrameStats { luma: number; saturation: number; spread: number; warmShare: number; coolShare: number }

export interface FrameFeatures {
  sampleCount: number;
  bands: ToneBand[];
  dominants: DominantColor[];
  stats: FrameStats;
  /** 影调性格：低明度主导 / 均衡 / 高明度主导 */
  shading: "low-key" | "balanced" | "high-key";
  /** 色温倾向：暖色或有色像素的比例差 */
  temperature: "warm" | "cool" | "mixed" | "neutral";
  /** 关键影调占比，供匹配与提示词直接引用 */
  shares: { shadow: number; dark: number; mid: number; light: number; highlight: number };
}

export const LUMINANCE_EDGES = [0, 0.01, 0.045, 0.12, 0.3, 0.62, 1] as const;
export const BAND_KEYS: ToneBandKey[] = ["shadow", "dark", "midDark", "midLight", "light", "highlight"];

const toLinear = (channel: number) => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};
const luminance = (r: number, g: number, b: number) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
const hexOf = (r: number, g: number, b: number) => `#${[r, g, b].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0")).join("")}`;
const round = (value: number, digits = 1) => Math.round(value * 10 ** digits) / 10 ** digits;

function hsv(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta !== 0) {
    if (max === r) hue = 60 * (((g - b) / delta) % 6);
    else if (max === g) hue = 60 * ((b - r) / delta + 2);
    else hue = 60 * ((r - g) / delta + 4);
  }
  if (hue < 0) hue += 360;
  return { hue, saturation: max === 0 ? 0 : delta / max, value: max / 255 };
}

/**
 * @param rgba 每个像素 4 字节（RGBA 或 RGB，channelCount 指定）；浏览器 ImageData.data 可直接传入
 * @param channelCount 3 或 4
 * @param dominantCount 返回的主色数量
 */
export function extractFeatures(rgba: ArrayLike<number>, channelCount = 4, dominantCount = 8): FrameFeatures {
  const pixels: number[][] = [];
  for (let offset = 0; offset + 2 < rgba.length; offset += channelCount) pixels.push([rgba[offset], rgba[offset + 1], rgba[offset + 2]]);

  const measured = pixels.map((pixel) => {
    const color = hsv(pixel[0], pixel[1], pixel[2]);
    return { pixel, luma: luminance(pixel[0], pixel[1], pixel[2]), hue: color.hue, saturation: color.saturation };
  });

  const bands: ToneBand[] = BAND_KEYS.map((key, index) => {
    const from = LUMINANCE_EDGES[index];
    const to = LUMINANCE_EDGES[index + 1];
    const slice = measured.filter((entry) => entry.luma >= from && (index === BAND_KEYS.length - 1 ? entry.luma <= to : entry.luma < to));
    if (!slice.length) return { key, hex: "", luma: 0, share: 0 };
    let r = 0, g = 0, b = 0, luma = 0;
    for (const entry of slice) { r += entry.pixel[0]; g += entry.pixel[1]; b += entry.pixel[2]; luma += entry.luma; }
    return { key, hex: hexOf(r / slice.length, g / slice.length, b / slice.length), luma: round((luma / slice.length) * 100), share: round((slice.length / measured.length) * 100) };
  });

  const sorted = measured.map((entry) => entry.luma).sort((a, b) => a - b);
  const quantile = (fraction: number) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(fraction * (sorted.length - 1))))];
  let lumaSum = 0, saturationSum = 0, warm = 0, cool = 0, chromatic = 0;
  for (const entry of measured) {
    lumaSum += entry.luma;
    saturationSum += entry.saturation;
    if (entry.saturation > 0.12 && entry.luma > 0.01) {
      chromatic += 1;
      if (entry.hue < 60 || entry.hue >= 300) warm += 1;
      else if (entry.hue >= 150 && entry.hue < 270) cool += 1;
    }
  }
  const chromaBase = Math.max(1, chromatic);
  const stats: FrameStats = {
    luma: round((lumaSum / measured.length) * 100),
    saturation: round((saturationSum / measured.length) * 100),
    spread: round(Math.min(100, (quantile(0.9) - quantile(0.1)) * 100)),
    warmShare: round((warm / chromaBase) * 100),
    coolShare: round((cool / chromaBase) * 100),
  };

  const bins = new Map<string, { r: number; g: number; b: number; count: number }>();
  for (const entry of measured) {
    const [r, g, b] = entry.pixel;
    const { hue, saturation, value } = hsv(r, g, b);
    const key = saturation < 0.14 || value < 0.12 ? `n${Math.min(4, Math.floor(value * 5))}` : `c${Math.floor(hue / 30) % 12}s${Math.min(3, Math.floor(saturation * 4))}`;
    const bin = bins.get(key) ?? { r: 0, g: 0, b: 0, count: 0 };
    bin.r += r; bin.g += g; bin.b += b; bin.count += 1;
    bins.set(key, bin);
  }
  const merged: { r: number; g: number; b: number; count: number }[] = [];
  for (const bin of [...bins.values()].map((item) => ({ r: item.r / item.count, g: item.g / item.count, b: item.b / item.count, count: item.count })).sort((a, b) => b.count - a.count)) {
    const near = merged.find((entry) => Math.abs(entry.r - bin.r) + Math.abs(entry.g - bin.g) + Math.abs(entry.b - bin.b) < 42);
    if (near) {
      const count = near.count + bin.count;
      near.r = (near.r * near.count + bin.r * bin.count) / count;
      near.g = (near.g * near.count + bin.g * bin.count) / count;
      near.b = (near.b * near.count + bin.b * bin.count) / count;
      near.count = count;
    } else merged.push({ ...bin });
  }
  const dominants: DominantColor[] = merged.slice(0, dominantCount)
    .map((entry) => ({ hex: hexOf(entry.r, entry.g, entry.b), share: round((entry.count / measured.length) * 100) }))
    .filter((entry) => entry.share >= 0.2);

  const shadowShare = bands[0].share + bands[1].share;
  const highlightShare = bands[4].share + bands[5].share;
  const shading: FrameFeatures["shading"] = shadowShare >= 55 ? "low-key" : highlightShare >= 45 ? "high-key" : "balanced";
  const warmth = stats.warmShare - stats.coolShare;
  const temperature: FrameFeatures["temperature"] = Math.max(stats.warmShare, stats.coolShare) < 8 ? "neutral" : warmth > 15 ? "warm" : warmth < -15 ? "cool" : "mixed";

  return {
    sampleCount: measured.length,
    bands,
    dominants,
    stats,
    shading,
    temperature,
    shares: {
      shadow: bands[0].share,
      dark: bands[1].share,
      mid: round(bands[2].share + bands[3].share),
      light: bands[4].share,
      highlight: bands[5].share,
    },
  };
}
