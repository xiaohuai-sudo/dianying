/**
 * 镜间工作台 · 色卡质检（终端版）
 *
 * 按「色卡与画面的吻合度」从差到好排列，每帧给出：手写色卡 → 画面实测主色 → 建议动作。
 * 与网页版质检台（npm run studio）读同一份数据，结果一致。
 *
 *   node scripts/studio/palette-check.mjs                # 最差的 15 帧
 *   node scripts/studio/palette-check.mjs --limit 40
 *   node scripts/studio/palette-check.mjs --all
 *   node scripts/studio/palette-check.mjs --severe        # 只看覆盖率 <30%
 *   node scripts/studio/palette-check.mjs --film humid-summer
 */
import { loadStudio, suggestPalette } from "./lib/load.mjs";

const args = process.argv.slice(2);
const valueOf = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const limit = args.includes("--all") ? Number.POSITIVE_INFINITY : Number(valueOf("--limit", 15));
const onlySevere = args.includes("--severe");
const filmFilter = valueOf("--film", null);

const { frames } = await loadStudio();
const measured = frames.filter((frame) => frame.fit);
const ranked = measured
  .filter((frame) => !filmFilter || frame.film === filmFilter)
  .filter((frame) => !onlySevere || frame.fit.coverage < 0.3)
  .sort((a, b) => a.fit.coverage - b.fit.coverage || b.fit.worst - a.fit.worst);

const bucket = { 严重: measured.filter((frame) => frame.fit.coverage < 0.3).length, 偏低: measured.filter((frame) => frame.fit.coverage >= 0.3 && frame.fit.coverage < 0.6).length, 良好: measured.filter((frame) => frame.fit.coverage >= 0.6).length };
console.log(`\n镜间工作台 · 色卡质检   共 ${measured.length} 帧：严重 ${bucket.严重} · 偏低 ${bucket.偏低} · 良好 ${bucket.良好}   （已回填实测色卡 ${frames.filter((frame) => frame.paletteSource === "override").length} 帧）\n`);

const swatches = (colors) => colors.join(" ");
const percent = (value) => `${Math.round(value * 100)}%`.padStart(4);

ranked.slice(0, limit).forEach((frame, index) => {
  const suggestion = frame.fit.coverage < 0.3 ? "采用实测" : suggestPalette(frame.palette, frame.tone.dominants, "merge").length > frame.palette.length ? "补全" : "抽查即可";
  console.log(`${String(index + 1).padStart(3)}  ${frame.slug.padEnd(28)}${(frame.filmTitle ?? "").padEnd(12)}吻合${percent(frame.fit.coverage)}  ΔE最差 ${String(Math.round(frame.fit.worst)).padStart(3)}  ${suggestion}`);
  console.log(`     手写 ${swatches(frame.palette)}`);
  console.log(`     实测 ${swatches(frame.tone.dominants.slice(0, 5).map((dominant) => `${dominant.hex}(${dominant.share}%)`))}`);
  const offTarget = frame.fit.perColor.filter((entry) => entry.deltaE >= 12).map((entry) => `${entry.color}→${entry.hex} ΔE${entry.deltaE}`);
  if (offTarget.length) console.log(`     偏差 ${offTarget.slice(0, 4).join("  ")}`);
  console.log("");
});

if (ranked.length > limit) console.log(`… 另 ${ranked.length - limit} 帧未显示（--limit N 或 --all）`);
console.log(`提示：--severe 只看覆盖率 <30%，--film <slug> 只看某部作品。回填请用 npm run studio 的网页版质检台。\n`);
