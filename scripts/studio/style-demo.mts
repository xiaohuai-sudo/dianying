/**
 * 镜间工作台 · 风格匹配演示（端到端跑通未来「上传图片」页面的全部逻辑）
 *
 *   npm run studio:style-demo -- --frame teahouse-closing
 *   npm run studio:style-demo -- --frame summer-empty-pool --tags 留白,逆光 --kind video --intent "雨夜独自撑伞的人"
 *
 * 真图片路径也支持（--image <path>），逻辑与将来浏览器端一致：先在本地把图缩到 180px 取像素，再算特征。
 */
import path from "node:path";
import sharp from "sharp";
import { extractFeatures } from "../../lib/frame-features.ts";
import { rankStyles, composePrompt, lumaToStops } from "../../lib/style-match.ts";

const args = process.argv.slice(2);
const valueOf = (flag: string, fallback?: string) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const frame = valueOf("--frame");
const image = valueOf("--image");
const kind = (valueOf("--kind", "both") as "image" | "video" | "both");
const tags = (valueOf("--tags", "") ?? "").split(/[,，]/).map((tag) => tag.trim()).filter(Boolean);
const intent = valueOf("--intent");

if (!frame && !image) {
  console.log("用法：--frame <站内画面 slug> 或 --image <本地图片路径>，可选 --tags 留白,逆光 --kind image|video|both --intent \"……\"");
  process.exit(1);
}

const source = frame ? path.join(process.cwd(), "public", "images", "frames-optimized", `${frame}-1672.webp`) : path.resolve(image!);
const { data, info } = await sharp(source).resize({ width: 180, fit: "inside", withoutEnlargement: true }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const features = extractFeatures(data, info.channels);
const { vector, cluster, matches, ambiguous, confidence, note } = rankStyles(features, { tags, limit: 3 });

console.log(`\n画面：${frame ?? image}   （${info.width}×${Math.round(info.height ?? 0)} 缩放后实测，${features.sampleCount} 像素）`);
console.log(`置信度：${{ high: "高（有明确对应风格）", medium: "中（方向对，但需要调整）", low: "低（不属于已收录风格，见下方差距）" }[confidence]}`);
console.log(`你的影调族：${cluster}   平均明度 ${vector.luma}%（约 ${lumaToStops(vector.luma)} 档）· 暗部 ${Math.round(vector.shadow)}% · 亮部 ${Math.round(vector.highlight)}% · 跨度 ${vector.spread} · 饱和 ${vector.saturation}% · 色温 ${vector.warmth}`);
console.log(`影调性格：${features.shading} · 色温倾向：${features.temperature}`);
console.log(`实测主色：${features.dominants.slice(0, 5).map((color) => `${color.hex}(${color.share}%)`).join(" ")}`);

console.log(`\n匹配结果：`);
matches.forEach((match, index) => {
  console.log(`  ${index + 1}. ${match.profile.name}（${match.profile.cluster}）${match.score} 分${match.formHits.length ? `　标签命中：${match.formHits.join("、")}` : ""}`);
  console.log(`     ${match.profile.oneLine}`);
  for (const priority of match.priorities) console.log(`     · ${priority.note}`);
});
if (ambiguous && note) console.log(`\n注意：${note}`);

const top = matches[0];
if (kind !== "video") {
  const imagePrompt = composePrompt(top, features, "image", intent);
  console.log(`\n—— 图片生成提示词（${top.profile.name}）——\n${imagePrompt.prompt}`);
  console.log(`\n反向提示词：${imagePrompt.negative}`);
}
if (kind !== "image") {
  const videoPrompt = composePrompt(top, features, "video", intent);
  console.log(`\n—— 图生视频提示词（${top.profile.name}）——\n${videoPrompt.prompt}`);
  console.log(`\n反向提示词：${videoPrompt.negative}`);
}
console.log(`\n镜头级建议：${top.profile.advice.join(" / ")}`);
console.log(`常见误读：${top.profile.pitfalls.join(" / ")}\n`);
