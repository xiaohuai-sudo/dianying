/**
 * 镜间工作台 · 风格库交叉验证
 *
 *   node --experimental-strip-types scripts/studio/style-check.mts
 *
 * 做三件事，任何一件不通过就说明风格指纹标定有问题，必须改档案而不是改判定标准：
 *   1) 自洽：每位档案的代表画面，平均特征必须匹配到自己（Top1 算过，Top2~3 算勉强，其余算失败）。
 *   2) 交叉：每张代表画面单独跑匹配，看看它是否被别的档案抢走。
 *   3) 可分辨性：两两计算档案之间的距离，指出哪些档案在色影调上根本分不开（只能靠形式标签区分）。
 */
import path from "node:path";
import sharp from "sharp";
import { extractFeatures, type FrameFeatures } from "../../lib/frame-features.ts";
import { styleProfiles } from "../../lib/style-profiles.ts";
import { rankStyles, toVector, profileVector, type FeatureVector } from "../../lib/style-match.ts";

const SAMPLE_WIDTH = 180;
const root = process.cwd();

async function featuresOfFrame(slug: string): Promise<FrameFeatures> {
  const file = path.join(root, "public", "images", "frames-optimized", `${slug}-1672.webp`);
  const { data, info } = await sharp(file).resize({ width: SAMPLE_WIDTH, fit: "inside", withoutEnlargement: true }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return extractFeatures(data, info.channels);
}

const averageVector = (vectors: FeatureVector[]): FeatureVector => {
  const keys = Object.keys(vectors[0]) as (keyof FeatureVector)[];
  const averaged = {} as FeatureVector;
  for (const key of keys) averaged[key] = Math.round((vectors.reduce((total, vector) => total + vector[key], 0) / vectors.length) * 10) / 10;
  return averaged;
};

const frameCache = new Map<string, FrameFeatures>();
const cachedFeatures = async (slug: string) => {
  if (!frameCache.has(slug)) frameCache.set(slug, await featuresOfFrame(slug));
  return frameCache.get(slug)!;
};

console.log(`\n镜间工作台 · 风格库交叉验证   档案 ${styleProfiles.length} 位\n`);

/* ---------- 1 + 2：自洽与交叉 ---------- */
const failures: string[] = [];
const stolen: string[] = [];
console.log("档案".padEnd(22) + "代表画面".padEnd(34) + "平均特征匹配结果");
for (const profile of styleProfiles) {
  const features = await Promise.all(profile.exampleFrameIds.map(cachedFeatures));
  const average = averageVector(features.map(toVector));
  // rankStyles 需要完整特征：用平均值构造一个等价对象（band 占比与 stats 都从向量回填）
  const synthetic: FrameFeatures = {
    sampleCount: features[0].sampleCount,
    bands: features[0].bands,
    dominants: features[0].dominants,
    stats: { luma: average.luma, saturation: average.saturation, spread: average.spread, warmShare: Math.max(0, average.warmth), coolShare: Math.max(0, -average.warmth) },
    shading: average.shadow >= 55 ? "low-key" : average.highlight >= 45 ? "high-key" : "balanced",
    temperature: average.warmth > 15 ? "warm" : average.warmth < -15 ? "cool" : Math.abs(average.warmth) < 8 ? "neutral" : "mixed",
    shares: {
      shadow: features.reduce((total, item) => total + item.shares.shadow, 0) / features.length,
      dark: features.reduce((total, item) => total + item.shares.dark, 0) / features.length,
      mid: average.shadow === 0 ? 0 : Math.max(0, 100 - average.shadow - average.highlight),
      light: features.reduce((total, item) => total + item.shares.light, 0) / features.length,
      highlight: features.reduce((total, item) => total + item.shares.highlight, 0) / features.length,
    },
  };
  const { matches } = rankStyles(synthetic, { limit: styleProfiles.length });
  const position = matches.findIndex((match) => match.profile.slug === profile.slug) + 1;
  const top = matches[0];
  const verdict = position === 1 ? "✓ Top1" : position <= 3 ? `~ Top${position}（勉强）` : `✗ Top${position}（失败）`;
  if (position > 3) failures.push(`${profile.name} 的代表画面被判给了 ${top.profile.name}（自己排 Top${position}）`);
  else if (position > 1) stolen.push(`${profile.name} 排 Top${position}，被 ${top.profile.name} 压过`);
  console.log(`${(profile.name + ` (${profile.cluster})`).padEnd(22)}${profile.exampleFrameIds.join(" ").padEnd(34)}${verdict}  最佳=${top.profile.name} ${top.score} 分 / 自己 ${matches[position - 1].score} 分`);
  console.log(`${"".padEnd(22)}向量 暗部${String(average.shadow).padStart(5)} 亮部${String(average.highlight).padStart(5)} 跨度${String(average.spread).padStart(5)} 饱和${String(average.saturation).padStart(5)} 色温${String(average.warmth).padStart(6)} 明度${String(average.luma).padStart(5)}`);
}

/* ---------- 3：可分辨性 ---------- */
const distances: { a: string; b: string; distance: number }[] = [];
for (let i = 0; i < styleProfiles.length; i += 1) {
  for (let j = i + 1; j < styleProfiles.length; j += 1) {
    const left = profileVector(styleProfiles[i]);
    const right = profileVector(styleProfiles[j]);
    const keys = Object.keys(left) as (keyof FeatureVector)[];
    const mean = keys.reduce((total, key) => total + Math.abs(left[key] - right[key]) / Math.max(1, styleProfiles[i].fingerprint[key].tolerance), 0) / keys.length;
    distances.push({ a: styleProfiles[i].name, b: styleProfiles[j].name, distance: Math.round(mean * 100) / 100 });
  }
}
const tooClose = distances.filter((entry) => entry.distance < 0.45).sort((a, b) => a.distance - b.distance);

console.log(`\n最接近的档案对（距离 < 0.45 视为色影调分不开，需要靠构图/光位/运动标签区分）：`);
if (!tooClose.length) console.log("  无——每位档案在色影调上都能分开");
for (const entry of tooClose.slice(0, 12)) console.log(`  ${entry.distance.toFixed(2)}  ${entry.a} ↔ ${entry.b}`);

console.log(`\n结论：自洽失败 ${failures.length} 位 · 勉强 ${stolen.length} 位 · 分不开的档案对 ${tooClose.length} 组`);
for (const line of failures) console.log(`  ✗ ${line}`);
for (const line of stolen) console.log(`  ~ ${line}`);
console.log("");
