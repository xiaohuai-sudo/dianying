/**
 * 风格匹配与提示词生成
 *
 * 输入：从用户图片提取的实测特征（lib/frame-features.ts）
 * 输出：
 *   1) 影调族判定（色影调只能稳定分到族这一层）
 *   2) 风格排序 + 每个维度的「差在哪、差多少、往哪改」
 *   3) 结构化提示词（图片 / 视频两套，视频另带运动建议）
 *
 * 诚实边界：构图、光位、景别、运动无法从色影调反推，必须由用户勾选标签或由视觉模型判断，
 * 因此这里把形式标签作为可选过滤条件，而不是假装能自动读出来。
 */

import type { FrameFeatures } from "./frame-features";
import { styleProfiles, type StyleProfile } from "./style-profiles";

export interface FeatureVector {
  shadow: number;
  highlight: number;
  spread: number;
  saturation: number;
  warmth: number;
  luma: number;
}

export interface DimensionDiff {
  key: keyof FeatureVector;
  label: string;
  unit: string;
  user: number;
  profile: number;
  /** 归一化偏差 0~1 */
  deviation: number;
  /** 用户值高于 / 低于该风格 */
  direction: "higher" | "lower" | "close";
  /** 人话描述 */
  note: string;
}

export interface StyleMatch {
  profile: StyleProfile;
  score: number;
  clusterMatch: boolean;
  diffs: DimensionDiff[];
  /** 最需要改的两三个维度 */
  priorities: DimensionDiff[];
  formHits: string[];
}

const DIMENSION_LABELS: Record<keyof FeatureVector, { label: string; unit: string }> = {
  shadow: { label: "暗部占比", unit: "%" },
  highlight: { label: "亮部占比", unit: "%" },
  spread: { label: "明度跨度", unit: "" },
  saturation: { label: "饱和度", unit: "%" },
  warmth: { label: "色温倾向", unit: "" },
  luma: { label: "平均明度", unit: "%" },
};

/** 平均相对明度 → 相对中间灰 0.18 的曝光档位 */
export const lumaToStops = (luma: number) => Math.round((Math.log2(Math.max(0.001, luma / 100) / 0.18)) * 10) / 10;

export function toVector(features: FrameFeatures): FeatureVector {
  const warmth = Math.round((features.stats.warmShare - features.stats.coolShare) * 10) / 10;
  return {
    shadow: features.shares.shadow + features.shares.dark,
    highlight: features.shares.light + features.shares.highlight,
    spread: features.stats.spread,
    saturation: features.stats.saturation,
    warmth,
    luma: features.stats.luma,
  };
}

export function profileVector(profile: StyleProfile): FeatureVector {
  return {
    shadow: profile.fingerprint.shadow.center,
    highlight: profile.fingerprint.highlight.center,
    spread: profile.fingerprint.spread.center,
    saturation: profile.fingerprint.saturation.center,
    warmth: profile.fingerprint.warmth.center,
    luma: profile.fingerprint.luma.center,
  };
}

function describeDiff(key: keyof FeatureVector, user: number, profile: number, direction: DimensionDiff["direction"]): string {
  const meta = DIMENSION_LABELS[key];
  const delta = Math.round(Math.abs(user - profile) * 10) / 10;
  if (direction === "close") return `${meta.label}已经落在该风格的区间内`;
  if (key === "luma") {
    const stops = Math.round(Math.abs(lumaToStops(user) - lumaToStops(profile)) * 10) / 10;
    return direction === "higher" ? `你的平均明度 ${user}% 比该风格亮约 ${stops} 档：先减一档曝光再谈风格` : `你的平均明度 ${user}% 比该风格暗约 ${stops} 档：需要补回一点整体亮度，否则暗部会先糊掉`;
  }
  if (key === "warmth") {
    return direction === "higher" ? `你的画面明显偏暖（色温倾向 ${user}）：该风格更冷，先压色温再加暖色点缀` : `你的画面明显偏冷（色温倾向 ${user}）：该风格更暖，先把白平衡往钨丝方向推`;
  }
  if (key === "shadow") {
    return direction === "higher" ? `暗部占了 ${user}%（这是阴影+暗部合计）：该风格只用约 ${profile}%，画面整体太沉，需要给中亮部留空间` : `暗部只占 ${user}%：该风格约 ${profile}%，需要主动压暗环境或减少补光`;
  }
  if (key === "highlight") {
    return direction === "higher" ? `亮部占了 ${user}%：该风格只给约 ${profile}%，高光太多会稀释重点` : `亮部只占 ${user}%：该风格约 ${profile}%，可以放开高光让画面透气`;
  }
  if (key === "saturation") {
    return direction === "higher" ? `饱和度 ${user}%（差 ${delta}）：该风格更含蓄，需降饱和而不是加滤镜` : `饱和度 ${user}%（差 ${delta}）：该风格更浓，需要提高主色纯度`;
  }
  return direction === "higher" ? `明度跨度 ${user} 大于该风格（${profile}）：对比过强，收一点亮暗落差` : `明度跨度 ${user} 小于该风格（${profile}）：对比不足，需要拉开亮暗层次`;
}

export interface MatchOptions {
  /** 用户勾选的形式标签（构图 / 光位 / 景别），用于族内细分 */
  tags?: string[];
  /** 只在某个影调族里找（可选） */
  cluster?: StyleProfile["cluster"];
  limit?: number;
}

/** 影调族中心：族内档案指纹的均值。用户的族必须由用户自己的画面决定，不能用最佳档案的族倒推。 */
const clusterCenters = (() => {
  const centers = new Map<StyleProfile["cluster"], FeatureVector>();
  for (const profile of styleProfiles) {
    const vector = profileVector(profile);
    const accumulated = centers.get(profile.cluster);
    if (!accumulated) centers.set(profile.cluster, { ...vector });
    else {
      const current = centers.get(profile.cluster)!;
      for (const key of Object.keys(vector) as (keyof FeatureVector)[]) current[key] = (current[key] + vector[key]) / 2;
    }
  }
  return centers;
})();

export function clusterOf(vector: FeatureVector): StyleProfile["cluster"] {
  let best: { cluster: StyleProfile["cluster"]; distance: number } | null = null;
  for (const [cluster, center] of clusterCenters) {
    const distance = (["shadow", "highlight", "spread", "saturation", "warmth"] as (keyof FeatureVector)[])
      .reduce((total, key) => total + Math.abs(vector[key] - center[key]) / (key === "warmth" ? 60 : key === "spread" ? 40 : 30), 0) / 5;
    if (!best || distance < best.distance) best = { cluster, distance };
  }
  return best?.cluster ?? "低调冷";
}

export function rankStyles(features: FrameFeatures, options: MatchOptions = {}): { vector: FeatureVector; cluster: StyleProfile["cluster"]; matches: StyleMatch[]; ambiguous: boolean; confidence: "high" | "medium" | "low"; note?: string } {
  const vector = toVector(features);
  const candidates = options.cluster ? styleProfiles.filter((profile) => profile.cluster === options.cluster) : styleProfiles;
  const tags = options.tags ?? [];

  const matches = candidates.map((profile) => {
    const target = profileVector(profile);
    let weighted = 0;
    let weightSum = 0;
    const diffs: DimensionDiff[] = [];
    for (const key of Object.keys(DIMENSION_LABELS) as (keyof FeatureVector)[]) {
      const dimension = profile.fingerprint[key];
      const deviation = Math.min(1, Math.abs(vector[key] - target[key]) / dimension.tolerance);
      weighted += deviation * dimension.weight;
      weightSum += dimension.weight;
      const rawDelta = Math.abs(vector[key] - target[key]);
      const direction: DimensionDiff["direction"] = rawDelta <= dimension.tolerance * 0.35 ? "close" : vector[key] > target[key] ? "higher" : "lower";
      diffs.push({ key, label: DIMENSION_LABELS[key].label, unit: DIMENSION_LABELS[key].unit, user: vector[key], profile: target[key], deviation: Math.round(deviation * 100) / 100, direction, note: describeDiff(key, vector[key], target[key], direction) });
    }
    const normalized = weighted / weightSum;
    const formHits = tags.filter((tag) => [...profile.forms.compositions, ...profile.forms.lights, ...profile.forms.shotSizes, ...profile.forms.motions].includes(tag));
    // 形式标签命中给小幅加分：族内细分靠它，但不足以推翻色影调的巨大偏差
    const score = Math.max(0, Math.min(100, Math.round((1 - normalized) * 100) + formHits.length * 3));
    const priorities = diffs.filter((diff) => diff.deviation >= 0.35).sort((a, b) => b.deviation - a.deviation).slice(0, 3);
    return { profile, score, clusterMatch: false, diffs, priorities, formHits };
  }).sort((a, b) => b.score - a.score);

  // 用户的影调族由自己的画面决定；再给出全局排名（族外但分数高时同样值得看）
  const cluster = options.cluster ?? clusterOf(vector);
  for (const match of matches) match.clusterMatch = match.profile.cluster === cluster;

  const top = matches[0];
  const confidence: "high" | "medium" | "low" = top.score >= 75 ? "high" : top.score >= 55 ? "medium" : "low";
  // 色影调只能分到族：Top2 分数很接近时，必须让用户用形式标签二次区分，而不是硬给一个「最像」。
  const ambiguous = matches.length > 1 && top.score - matches[1].score <= 8;
  const notes: string[] = [];
  if (ambiguous) notes.push(`${top.profile.name} 与 ${matches[1].profile.name} 在色影调上很接近（${top.score} 分 / ${matches[1].score} 分），两者主要靠构图、光位与运动区分：前者偏 ${top.profile.forms.compositions.join("、")}，后者偏 ${matches[1].profile.forms.compositions.join("、")}。`);
  if (!top.clusterMatch) notes.push(`你的画面实测属于「${cluster}」族，但最接近的档案是「${top.profile.cluster}」族的 ${top.profile.name}：这说明你要的可能是跨族的效果，先按下面的差距调，再决定要不要坚持这个方向。`);
  if (confidence === "low") notes.push(`与已收录的 ${styleProfiles.length} 位风格都有明显差距（最高 ${top.score} 分）。可以按下面的差距往某个方向调，也可以把它当作你自己的风格基线记录下来。`);

  return { vector, cluster, matches: matches.slice(0, options.limit ?? 3), ambiguous, confidence, note: notes.length ? notes.join(" ") : undefined };
}

export interface ComposedPrompt {
  style: { slug: string; name: string };
  kind: "image" | "video";
  prompt: string;
  negative: string;
  motion?: string;
  /** 与用户画面的实测差距，供界面提示"想更像就这样改" */
  adjustments: string[];
}

/**
 * 把「风格档案 + 用户画面实测」合成结构化提示词。
 * kind = image 用于图片生成；kind = video 用于图生视频（附加运动描述，因为视频的差异主要来自运镜与动作）。
 */
export function composePrompt(match: StyleMatch, features: FrameFeatures, kind: "image" | "video", userIntent?: string): ComposedPrompt {
  const profile = match.profile;
  const vector = toVector(features);
  const palette = features.dominants.slice(0, 4).map((color) => color.hex).join(" ");
  const tone = `平均明度 ${vector.luma}%（约 ${lumaToStops(vector.luma)} 档）· 暗部 ${Math.round(vector.shadow)}% · 亮部 ${Math.round(vector.highlight)}% · 饱和 ${vector.saturation}%`;

  const imageLines = [
    userIntent?.trim() ? `主体与情境：${userIntent.trim()}` : "主体与情境：保持用户原图的主体与人物关系不变",
    `视觉风格：${profile.name}（${profile.nameEn}）—— ${profile.oneLine}`,
    `影调控制：${tone}`,
    `色彩：以原图主色为锚点（${palette}），${profile.cluster.includes("低调") ? "保留大面积暗部，只让一到两块颜色露出来" : profile.cluster === "高调" ? "允许亮部溢出，让空气和光线成为主体" : "让主色块承担叙事划分"}`,
    `形式参考：${profile.forms.compositions.join("、")}；${profile.forms.lights.join("、")}；${profile.forms.shotSizes.join("、")}`,
    "技术要求：保持原图构图与主体一致性；不使用真实影片剧照、真实演员肖像或品牌标识",
  ];

  const prompt = kind === "video"
    ? [`【图生视频】以用户上传图片为首帧。`, ...imageLines, `运动：${profile.forms.motions.join("；")}`, "时长与节奏：单镜头，运动方向连续，不切镜"].join("\n")
    : [`【图片生成】参考风格而非复制作品。`, ...imageLines, "画幅：保持原图画幅比例", "输出：单张关键帧，供后续图生视频使用"].join("\n");

  return {
    style: { slug: profile.slug, name: profile.name },
    kind,
    prompt,
    negative: [...profile.prompt.negative, "真实影片剧照", "可识别真实演员面容", "品牌标识与文字", "水印与边框"].join("，"),
    motion: kind === "video" ? profile.prompt.motion.join("；") : undefined,
    adjustments: match.priorities.map((priority) => priority.note),
  };
}
