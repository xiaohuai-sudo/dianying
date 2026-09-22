/**
 * 镜间工作台 · 彩排台（只读）
 *
 * 把一帧画面从「生成记录 → 源图 → 优化图 → 数据 → 色卡吻合 → 版权 → 构建产物」七个环节
 * 画成一张对账表。数据来自 scripts/studio/lib/load.mjs，与色卡质检台同源。
 *
 *   node scripts/studio/audit.mjs                 # 全部画面 + 问题清单
 *   node scripts/studio/audit.mjs --only-issues   # 只列有问题的帧
 *   node scripts/studio/audit.mjs --frame <slug>  # 单帧详情
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadStudio } from "./lib/load.mjs";

const args = process.argv.slice(2);
const frameIndex = args.indexOf("--frame");
const onlyFrame = frameIndex >= 0 ? args[frameIndex + 1] : null;
const onlyIssues = args.includes("--only-issues");

const { frames, techniqueTemplateCount } = await loadStudio();
const readRelative = async (relative) => readFile(path.join(process.cwd(), relative), "utf8").catch(() => "");
const dataSource = await readRelative("lib/data.ts");
const uiSource = await readRelative("components/LocalizedViews.tsx");
const footerSource = await readRelative("components/Footer.tsx");

const coverageLabel = (value) => `${Math.round(value * 100)}%`;
function issuesOf(frame) {
  const list = [];
  if (!frame.hasSource) list.push(["源图缺失", frame.slug]);
  if (!frame.hasOptimized) list.push(["未生成响应式 WebP", frame.slug]);
  if (!frame.built) list.push(["不在本地构建产物中", frame.slug]);
  if (frame.prompt === "缺失") list.push(["无生成记录", frame.slug]);
  if (frame.fit && frame.fit.coverage < 0.3) list.push(["色卡与画面明显不符（覆盖率 <30%）", `${frame.slug}(${coverageLabel(frame.fit.coverage)})`]);
  else if (frame.fit && frame.fit.coverage < 0.6) list.push(["色卡覆盖偏低，建议抽查（30–60%）", `${frame.slug}(${coverageLabel(frame.fit.coverage)})`]);
  if (frame.paletteSource === "film-default") list.push(["沿用电影级默认色卡，未针对本帧校色", frame.slug]);
  if (frame.emptyBands >= 2) list.push([`曝光阶梯缺 ${frame.emptyBands} 档`, frame.slug]);
  return list;
}
const issues = frames.flatMap(issuesOf);

const copyrightTemplate = (dataSource.match(/const originalCopyright[\s\S]*?\n\}\);/) ?? [""])[0];
const copyrightFields = [...copyrightTemplate.matchAll(/^\s{2}(\w+):/gm)].map((match) => match[1]);
const copyClaims = [...new Set([...(dataSource + uiSource + footerSource).matchAll(/(\d{3})\s*(?:个画面|张)/g)].map((match) => Number(match[1])))];
const ok = (value) => (value ? "✓" : "✗");
const ready = frames.filter((frame) => frame.hasSource && frame.hasOptimized && frame.built && frame.fit && frame.fit.coverage >= 0.6).length;

const stages = [
  ["数据录入", frames.length],
  ["生成记录", frames.filter((frame) => frame.prompt !== "缺失").length],
  ["源图", frames.filter((frame) => frame.hasSource).length],
  ["响应式 WebP", frames.filter((frame) => frame.hasOptimized).length],
  ["本帧手写色卡", frames.filter((frame) => frame.paletteSource === "hand").length],
  ["已回填实测色卡", frames.filter((frame) => frame.paletteSource === "override").length],
  ["色卡吻合(≥60%)", frames.filter((frame) => frame.fit && frame.fit.coverage >= 0.6).length],
  ["本地构建产物", frames.filter((frame) => frame.built).length],
];

console.log(`\n镜间工作台 · 彩排台   画面 ${frames.length} 帧   七环全绿：${ready} 帧\n`);
console.log("环节".padEnd(22) + "通过 / 总数   比例");
for (const [label, passed] of stages) console.log(`${label.padEnd(22)}${String(passed).padStart(4)} / ${frames.length}    ${String(Math.round((passed / frames.length) * 100)).padStart(3)}%`);
console.log(`\n生成记录细分         逐图 ${frames.filter((frame) => frame.prompt === "逐图").length} · 共用框架 ${frames.filter((frame) => frame.prompt === "框架").length}`);
console.log(`色卡来源细分         本帧手写 ${frames.filter((frame) => frame.paletteScope === "本帧手写").length} · 电影级默认 ${frames.filter((frame) => frame.paletteScope === "电影级默认").length} · 已回填 ${frames.filter((frame) => frame.paletteSource === "override").length}`);
console.log(`文字模板             生成画面的分析文案共用 ${techniqueTemplateCount} 套技法模板`);
console.log(`版权字段             ${copyrightFields.length} 项齐全，模板统一（${copyrightFields.slice(0, 3).join(" / ")} …）`);
console.log(`跨页数字一致性        文案里出现 ${copyClaims.join("、")} 个画面，实际 ${frames.length} → ${copyClaims.some((value) => value !== frames.length) ? "不一致" : "一致"}`);

const selection = onlyFrame ? frames.filter((frame) => frame.slug.includes(onlyFrame)) : onlyIssues ? frames.filter((frame) => issuesOf(frame).length) : frames;
console.log(`\n${"画面".padEnd(30)}生成    色卡来源      吻合率  ΔE最差  构建`);
for (const frame of selection) {
  const coverage = frame.fit ? coverageLabel(frame.fit.coverage).padStart(5) : "    —";
  const worst = frame.fit ? String(Math.round(frame.fit.worst)).padStart(3) : "  —";
  const promptMark = frame.prompt === "逐图" ? "✓逐图" : frame.prompt === "框架" ? "~框架" : "✗缺失";
  console.log(`${frame.slug.padEnd(30)}${promptMark.padEnd(7)}${frame.paletteScope.padEnd(12)}${coverage}  ${worst}    ${ok(frame.built)}`);
}

const grouped = issues.reduce((map, [reason, slug]) => map.set(reason, [...(map.get(reason) ?? []), slug]), new Map());
console.log(`\n问题清单（${issues.length} 条，按类型）：`);
for (const [reason, slugs] of [...grouped.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${String(slugs.length).padStart(3)}  ${reason}`);
  console.log(`       ${slugs.slice(0, 6).join("、")}${slugs.length > 6 ? ` … 另 ${slugs.length - 6} 帧` : ""}`);
}
console.log("\n下一步：node scripts/studio/palette-check.mjs 看色卡排名，或 npm run studio 打开色卡质检台。\n");
