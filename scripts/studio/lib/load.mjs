/**
 * 镜间工作台 · 共用数据层
 *
 * 只读仓库现有文件，把「一帧画面」需要的全部事实聚合成一条记录：
 * 标题、所属电影、手写/模板色卡、实测影调、生成记录、源图与优化图、构建产物、命中的质检问题。
 * 彩排台（audit.mjs）、色卡质检台（palette-check.mjs / serve.mjs）都从这里取数，避免三处各算一遍。
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = async (relative) => readFile(path.join(root, relative), "utf8").catch(() => "");
const exists = async (relative) => Boolean(await stat(path.join(root, relative)).catch(() => null));
export const listDir = async (relative) => readdir(path.join(root, relative)).catch(() => []);

/* ---------------- 颜色计算 ---------------- */
/** 从 `"#C39A5A", "#665A43"` 这类片段里取出干净的色值。 */
const hexList = (fragment) => [...fragment.matchAll(/"#[0-9A-Fa-f]{6}"/g)].map((hit) => hit[0].slice(1, -1).toUpperCase());

const toLab = (hex) => {
  const linear = (channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [1, 3, 5].map((index) => linear(parseInt(hex.slice(index, index + 2), 16)));
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const pivot = (value) => (value > 0.008856 ? value ** (1 / 3) : 7.787 * value + 16 / 116);
  const [fx, fy, fz] = [pivot(x), pivot(y), pivot(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};

/** CIE76 色差。ΔE < 12 视为「画面里真的存在这个颜色」。 */
export const deltaE = (a, b) => {
  const left = toLab(a);
  const right = toLab(b);
  return Math.sqrt(left.reduce((total, value, index) => total + (value - right[index]) ** 2, 0));
};

export const luminanceOf = (hex) => {
  const linear = (channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [1, 3, 5].map((index) => linear(parseInt(hex.slice(index, index + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * 色卡与画面的吻合度：
 * coverage = 被色卡覆盖到的实测主色所占像素比例；
 * worst    = 色卡里最找不到对应像素的那个颜色的 ΔE。
 */
export function paletteFit(palette, dominants) {
  if (!palette?.length || !dominants?.length) return null;
  const perColor = palette.map((color) => {
    const nearest = dominants.reduce((best, dominant) => (deltaE(color, dominant.hex) < best.deltaE ? { hex: dominant.hex, share: dominant.share, deltaE: deltaE(color, dominant.hex) } : best), { hex: dominants[0].hex, share: dominants[0].share, deltaE: Number.POSITIVE_INFINITY });
    return { color, hex: nearest.hex, share: nearest.share, deltaE: Math.round(nearest.deltaE * 10) / 10 };
  });
  const covered = dominants.filter((dominant) => palette.some((color) => deltaE(color, dominant.hex) < 12));
  return { coverage: covered.reduce((total, dominant) => total + dominant.share, 0) / 100, worst: Math.max(...perColor.map((entry) => entry.deltaE)), perColor };
}

/* ---------------- 建议色卡 ---------------- */
const uniqueUpper = (list) => [...new Set(list.map((color) => color.toUpperCase()))];

/**
 * replace：直接用画面实测主色替换（画面里本来就有的颜色，最大的几个）。
 * merge  ：保留手写色卡，只在色卡完全没有覆盖的实测色里补几种。
 */
export function suggestPalette(palette, dominants, mode) {
  if (mode === "replace") return uniqueUpper(dominants.filter((dominant) => dominant.share >= 0.5).slice(0, 5).map((dominant) => dominant.hex));
  if (mode === "merge") {
    const added = dominants.filter((dominant) => dominant.share >= 2 && (palette ?? []).every((color) => deltaE(color, dominant.hex) >= 12)).map((dominant) => dominant.hex);
    return uniqueUpper([...(palette ?? []), ...added].slice(0, 6));
  }
  return [...(palette ?? [])];
}

/* ---------------- 源数据 ---------------- */
let cache = null;
export const clearStudioCache = () => { cache = null; };

export async function loadStudio() {
  if (cache) return cache;
  const [dataSource, extendedSource, expansionSource, toneSource, promptsDoc, expansionDoc] = await Promise.all([
    read("lib/data.ts"), read("lib/extended-frames.ts"), read("lib/cinematic-expansion.ts"),
    read("lib/frame-tones.generated.ts"), read("docs/image-prompts.md"), read("docs/cinematic-expansion.md"),
  ]);

  // 手写色卡：data.ts 与 extended-frames.ts 里逐帧写死的 palette
  const typed = new Map();
  for (const source of [dataSource, extendedSource]) {
    for (const match of source.matchAll(/slug:\s*"([a-z0-9-]+)"[^}]*?title:\s*"([^"]+)"[^}]*?palette:\s*\[([^\]]+)\]/gs)) {
      typed.set(match[1], { title: match[2], palette: hexList(match[3]) });
    }
  }

  // 电影级：films[].palette 与 cinematic-expansion 的 FilmDefaults
  const filmPalettes = new Map([...dataSource.matchAll(/slug:\s*"([a-z-]+)",\s*title:\s*"([^"]+)",\s*englishTitle[^}]*?palette:\s*\[([^\]]+)\]/gs)].map((match) => [match[1], { title: match[2], palette: hexList(match[3]) }]));
  const defaults = new Map([...expansionSource.matchAll(/const (\w+): FilmDefaults = \{[^}]*?filmSlug:\s*"([a-z-]+)"[^}]*?palette:\s*\[([^\]]+)\]/gs)].map((match) => [match[1], { film: match[2], palette: hexList(match[3]) }]));

  // 模板生成的 150 帧：specs 分组 + 逐帧标题
  const generatedSpecs = new Map();
  for (const match of expansionSource.matchAll(/const (\w+Specs)[^=]*=\s*\[(.*?)\n\];/gs)) {
    for (const spec of match[2].matchAll(/slug:\s*"([a-z0-9-]+)",\s*title:\s*"([^"]+)"/g)) generatedSpecs.set(spec[1], { group: match[1], title: spec[2] });
  }
  const techniqueTemplates = [...expansionSource.matchAll(/analysis:\s*"([^"]{40,})"/g)].map((match) => match[1]);

  // 实测影调
  const tones = new Map();
  for (const line of toneSource.split("\n")) {
    const match = line.match(/^\s*"([a-z0-9-]+)": (\{.*\}),$/);
    if (match) tones.set(match[1], JSON.parse(match[2]));
  }

  // 生产痕迹与产物
  const promptRecords = new Set([...promptsDoc.matchAll(/\|\s*`([a-z0-9-]+)\.png`\s*\|/g)].map((match) => match[1]));
  const bulkPromptRecord = expansionDoc.includes("共用生成提示框架");
  const sourceFiles = new Set((await listDir("source-assets/frames")).map((name) => name.replace(/\.[a-z]+$/i, "")));
  const optimizedFiles = new Set((await listDir("public/images/frames-optimized")).map((name) => name.replace(/-\d+\.webp$/, "")));
  const builtFrames = new Set((await listDir("out/zh/frames")).filter((name) => name !== "index.txt"));
  const overrides = await loadOverrides();
  const filmByFrame = filmByIdList(dataSource + extendedSource);

  const frames = [...tones.keys()].sort().map((slug) => {
    const spec = generatedSpecs.get(slug);
    const filmDefault = spec ? defaults.get(`${spec.group.replace(/Specs$/, "")}Defaults`) : undefined;
    const typedEntry = typed.get(slug);
    const authoredPalette = typedEntry?.palette ?? filmDefault?.palette ?? [];
    const override = overrides[slug];
    const film = filmDefault?.film ?? filmByFrame.get(slug) ?? null;
    const tone = tones.get(slug);
    const fit = paletteFit(override ?? authoredPalette, tone.dominants);
    return {
      slug,
      title: typedEntry?.title ?? spec?.title ?? slug,
      film,
      filmTitle: filmPalettes.get(film)?.title ?? film,
      palette: override ?? authoredPalette,
      authoredPalette,
      override: override ?? null,
      paletteSource: override ? "override" : typedEntry ? "hand" : "film-default",
      paletteScope: typedEntry ? "本帧手写" : "电影级默认",
      prompt: promptRecords.has(slug) ? "逐图" : bulkPromptRecord ? "框架" : "缺失",
      hasSource: sourceFiles.has(slug),
      hasOptimized: optimizedFiles.has(slug),
      built: builtFrames.has(slug),
      thumbnail: `/images/frames-optimized/${slug}-480.webp`,
      preview: `/images/frames-optimized/${slug}-1280.webp`,
      tone,
      fit,
      suggestions: fit ? { replace: suggestPalette(override ?? authoredPalette, tone.dominants, "replace"), merge: suggestPalette(override ?? authoredPalette, tone.dominants, "merge") } : null,
      emptyBands: tone.bands.filter((band) => band.share < 0.05).length,
    };
  });

  cache = { frames, tones, techniqueTemplateCount: new Set(techniqueTemplates).size, generatedCount: generatedSpecs.size, filmPalettes };
  return cache;
}

const filmByIdList = (source) => {
  const map = new Map();
  for (const match of source.matchAll(/slug:\s*"([a-z0-9-]+)",\s*filmSlug:\s*"([a-z-]+)"/g)) map.set(match[1], match[2]);
  for (const match of source.matchAll(/slug:\s*"([a-z-]+)"[^}]*?frameIds:\s*\[([^\]]+)\]/gs)) {
    for (const id of match[2].matchAll(/"([a-z0-9-]+)"/g)) if (!map.has(id[1])) map.set(id[1], match[1]);
  }
  return map;
};

/* ---------------- 回填文件 ---------------- */
export const OVERRIDE_FILE = "lib/palette-overrides.ts";
export const STATE_FILE = ".studio/state.json";

export async function loadOverrides() {
  const source = await read(OVERRIDE_FILE);
  const overrides = {};
  for (const match of source.matchAll(/"([a-z0-9-]+)":\s*\[([^\]]*)\]/g)) {
    const colors = [...match[2].matchAll(/"#[0-9A-Fa-f]{6}"/g)].map((hit) => hit[0].slice(1, -1).toUpperCase());
    if (colors.length) overrides[match[1]] = colors;
  }
  return overrides;
}

export async function loadState() {
  const source = await read(STATE_FILE);
  try {
    return source ? JSON.parse(source) : { decisions: {} };
  } catch {
    return { decisions: {} };
  }
}

export async function saveState(state) {
  const { mkdir, writeFile } = await import("node:fs/promises");
  await mkdir(path.join(root, ".studio"), { recursive: true });
  await writeFile(path.join(root, STATE_FILE), `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export async function writeOverrideFile(overrides, note) {
  const { writeFile } = await import("node:fs/promises");
  await writeFile(path.join(root, OVERRIDE_FILE), renderOverrideFile(overrides, note), "utf8");
}

export function renderOverrideFile(overrides, note) {
  const body = Object.keys(overrides).sort().map((slug) => `  ${JSON.stringify(slug)}: [${overrides[slug].map((color) => `"${color}"`).join(", ")}],`).join("\n");
  return `/* AUTO-GENERATED by 镜间工作台（scripts/studio）—— ${note}
 * 在色卡质检台里「采用实测 / 补全」过的画面会写入这里，构建时覆盖 lib/data.ts 里的手写色卡。
 * 手工编辑会被下一次回填覆盖；要撤销某帧，重跑工作台并选择「撤销」。
 */
export const paletteOverrides: Record<string, string[]> = {
${body}${body ? "\n" : ""}};

export const getPaletteOverride = (slug: string): string[] | undefined => paletteOverrides[slug];
`;
}

export const existsInRepo = exists;
