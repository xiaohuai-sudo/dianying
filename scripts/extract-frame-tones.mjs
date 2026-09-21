/**
 * Extract the color layers that sit next to each frame's authored palette:
 *   bands      — 6 absolute luminance windows (shadow → highlight) with averaged color + pixel share
 *   dominants  — 6 dominant colors with pixel share, HSV-grid quantisation + merge
 *   stats      — frame-level numbers: mean luma, dynamic range, warm/cool split, saturation
 *
 * Output: lib/frame-tones.generated.ts (committed, consumed at build time by server components)
 * Run:    npm run palette:tones
 */
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const imagesDirectory = path.join(projectRoot, "public", "images", "frames-optimized");
const outputFile = path.join(projectRoot, "lib", "frame-tones.generated.ts");

const SAMPLE_WIDTH = 180;
// Exposure windows (linear relative luminance, mid-grey = 0.18): each band is roughly two stops.
// An empty band therefore really means "the frame contains no tone in this exposure range".
const LUMINANCE_EDGES = [0, 0.01, 0.045, 0.12, 0.3, 0.62, 1];
const BAND_KEYS = ["shadow", "dark", "midDark", "midLight", "light", "highlight"];
const DOMINANT_COUNT = 8;

const toLinear = (value) => {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
};
const luminance = (r, g, b) => 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

const hex = (r, g, b) => `#${[r, g, b].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0")).join("")}`;

function hsv(r, g, b) {
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

function bandColors(measured) {
  return BAND_KEYS.map((key, band) => {
    const from = LUMINANCE_EDGES[band];
    const to = LUMINANCE_EDGES[band + 1];
    const slice = measured.filter((entry) => entry.luma >= from && (band === BAND_KEYS.length - 1 ? entry.luma <= to : entry.luma < to));
    if (slice.length === 0) return { key, hex: "", luma: 0, share: 0 };
    let r = 0, g = 0, b = 0, luma = 0;
    for (const entry of slice) {
      r += entry.pixel[0]; g += entry.pixel[1]; b += entry.pixel[2]; luma += entry.luma;
    }
    const count = slice.length;
    return { key, hex: hex(r / count, g / count, b / count), luma: Math.round((luma / count) * 1000) / 10, share: Math.round((count / measured.length) * 1000) / 10 };
  });
}

function frameStats(measured) {
  const total = measured.length;
  const sorted = measured.map((entry) => entry.luma).sort((a, b) => a - b);
  const quantile = (fraction) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(fraction * (sorted.length - 1))))];
  let luma = 0, saturation = 0, warm = 0, cool = 0, chromatic = 0;
  for (const entry of measured) {
    luma += entry.luma;
    saturation += entry.saturation;
    // Warm/cool split follows the colour-temperature axis: hue 300–60 reads warm, 150–270 reads cool.
    if (entry.saturation > 0.12 && entry.luma > 0.01) {
      chromatic += 1;
      if (entry.hue < 60 || entry.hue >= 300) warm += 1;
      else if (entry.hue >= 150 && entry.hue < 270) cool += 1;
    }
  }
  const chromaBase = Math.max(1, chromatic);
  return {
    luma: Math.round((luma / total) * 1000) / 10,
    saturation: Math.round((saturation / total) * 1000) / 10,
    // Brightness spread between the 10th and 90th percentile, in luminance points.
    spread: Math.round(Math.min(100, (quantile(0.9) - quantile(0.1)) * 100) * 10) / 10,
    warmShare: Math.round((warm / chromaBase) * 1000) / 10,
    coolShare: Math.round((cool / chromaBase) * 1000) / 10,
  };
}

function dominantColors(pixels) {
  const bins = new Map();
  for (const pixel of pixels) {
    const [r, g, b] = pixel;
    const { hue, saturation, value } = hsv(r, g, b);
    const key = saturation < 0.14 || value < 0.12
      ? `n${Math.min(4, Math.floor(value * 5))}`
      : `c${Math.floor(hue / 30) % 12}s${Math.min(3, Math.floor(saturation * 4))}`;
    const bin = bins.get(key) ?? { r: 0, g: 0, b: 0, count: 0 };
    bin.r += r; bin.g += g; bin.b += b; bin.count += 1;
    bins.set(key, bin);
  }
  const total = pixels.length;
  const candidates = [...bins.values()]
    .map((bin) => ({ r: bin.r / bin.count, g: bin.g / bin.count, b: bin.b / bin.count, count: bin.count }))
    .sort((a, b) => b.count - a.count);
  const merged = [];
  for (const candidate of candidates) {
    const near = merged.find((entry) => Math.abs(entry.r - candidate.r) + Math.abs(entry.g - candidate.g) + Math.abs(entry.b - candidate.b) < 42);
    if (near) {
      const count = near.count + candidate.count;
      near.r = (near.r * near.count + candidate.r * candidate.count) / count;
      near.g = (near.g * near.count + candidate.g * candidate.count) / count;
      near.b = (near.b * near.count + candidate.b * candidate.count) / count;
      near.count = count;
    } else {
      merged.push({ ...candidate });
    }
    if (merged.length >= DOMINANT_COUNT * 3) break;
  }
  return merged
    .sort((a, b) => b.count - a.count)
    .slice(0, DOMINANT_COUNT)
    .map((entry) => ({ hex: hex(entry.r, entry.g, entry.b), share: Math.round((entry.count / total) * 1000) / 10 }));
}

const files = (await readdir(imagesDirectory)).filter((name) => name.endsWith("-1672.webp")).sort();
const tones = {};
const measured = [];
let processed = 0;

for (const file of files) {
  const slug = file.replace(/-1672\.webp$/, "");
  const { data, info } = await sharp(path.join(imagesDirectory, file))
    .resize({ width: SAMPLE_WIDTH, fit: "inside", withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = [];
  for (let offset = 0; offset < data.length; offset += info.channels) {
    const pixel = [data[offset], data[offset + 1], data[offset + 2]];
    const color = hsv(pixel[0], pixel[1], pixel[2]);
    pixels.push(pixel);
    measured.push({ pixel, luma: luminance(pixel[0], pixel[1], pixel[2]), hue: color.hue, saturation: color.saturation });
  }
  tones[slug] = {
    bands: bandColors(measured),
    dominants: dominantColors(pixels).filter((entry) => entry.share >= 0.2),
    stats: frameStats(measured),
  };
  measured.length = 0;
  processed += 1;
}

const body = Object.keys(tones).sort().map((slug) => `  ${JSON.stringify(slug)}: ${JSON.stringify(tones[slug])},`).join("\n");

const source = `/* AUTO-GENERATED — do not edit by hand. Rebuild with: npm run palette:tones */
export type ToneBandKey = "shadow" | "dark" | "midDark" | "midLight" | "light" | "highlight";
export interface ToneBand { key: ToneBandKey; hex: string; luma: number; share: number }
export interface DominantColor { hex: string; share: number }
export interface FrameToneStats { luma: number; saturation: number; spread: number; warmShare: number; coolShare: number }
export interface FrameTone { bands: ToneBand[]; dominants: DominantColor[]; stats: FrameToneStats }

export const frameTones: Record<string, FrameTone> = {
${body}
};

export const getFrameTone = (slug: string): FrameTone | undefined => frameTones[slug];
`;

await writeFile(outputFile, source, "utf8");
console.log(`frame tones written: ${processed} frames -> ${path.relative(projectRoot, outputFile)}`);
