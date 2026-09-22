"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { extractFeatures, type FrameFeatures } from "@/lib/frame-features";
import { rankStyles, composePrompt, lumaToStops } from "@/lib/style-match";
import { displayTag, withLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

/**
 * 风格诊断：上传一张自己的图 → 在浏览器本地算出影调与色彩特征 → 对照风格库给出建议与提示词。
 * 图片不会离开浏览器（没有上传接口）；生成功能需要后端与账号，这里只做分析与提示词导出。
 */

const text = {
  zh: {
    uploadTitle: "上传一张画面",
    uploadHint: "支持 JPG / PNG / WebP。图片只在你的浏览器里被分析，不会上传到任何服务器。",
    choose: "选择图片", drop: "或把图片拖到这里", sample: "没有图？用站内画面试一下：",
    analyzing: "正在分析…", reset: "换一张",
    measured: "你的画面实测", styleCluster: "影调族", confidence: "匹配度",
    confidenceLabels: { high: "高 · 有明确对应风格", medium: "中 · 方向对，需要调整", low: "低 · 不属于已收录风格" },
    luma: "平均明度", shadow: "暗部占比", highlight: "亮部占比", spread: "明度跨度", saturation: "饱和度", temperature: "色温倾向",
    bands: "曝光阶梯", dominants: "主导色",
    tagsTitle: "补充形式信息（可选）", tagsHint: "构图、光位、景别无法从像素反推，勾选后会在同族风格里加权区分。",
    intentTitle: "你的意图（可选）", intentPlaceholder: "例如：雨夜独自撑伞的人，想要压抑但克制",
    matches: "接近的风格", score: "分", gap: "需要调整", hits: "标签命中", examples: "站内示例",
    promptTitle: "可复制的生成提示词", promptImage: "图片生成", promptVideo: "图生视频",
    copy: "复制", copied: "已复制", negative: "反向提示词",
    nextTitle: "接下来怎么用",
    nextBody: "把上面的提示词贴进任意支持图生视频 / 文生图的工具（即梦、可灵、通义万相等），配合这张图作为首帧即可。站内的生成与账号功能正在搭建：需要后端代理模型密钥，并在境内存储你的图片与成品。",
    boundary: "边界说明：风格档案为公开资料与作品观察的整理，不代表本人言论，也不覆盖其全部作品；站点不使用真实影片剧照，示例一律为站内原创画面。匹配分数只反映可测量的影调与色彩结构，不评价作品好坏。",
    emptyTitle: "先看一眼它怎么工作",
    emptyBody: "上传自己的图片，或先用站内画面试一次。分析在你的浏览器本地完成，速度取决于图片大小。",
  },
  en: {
    uploadTitle: "Upload a frame",
    uploadHint: "JPG / PNG / WebP. The image is analysed inside your browser and is never uploaded anywhere.",
    choose: "Choose image", drop: "or drop an image here", sample: "No image handy? Try a frame from this site:",
    analyzing: "Analysing…", reset: "Replace image",
    measured: "Measured from your frame", styleCluster: "Tone family", confidence: "Match",
    confidenceLabels: { high: "High · a clear counterpart", medium: "Medium · right direction, needs work", low: "Low · outside the collected styles" },
    luma: "Mean luma", shadow: "Shadow share", highlight: "Highlight share", spread: "Luma spread", saturation: "Saturation", temperature: "Temperature",
    bands: "Exposure bands", dominants: "Dominant colours",
    tagsTitle: "Add formal context (optional)", tagsHint: "Composition, light and shot size cannot be read from pixels; ticking them re-weights styles inside the same family.",
    intentTitle: "Your intent (optional)", intentPlaceholder: "e.g. one person with an umbrella on a rainy night, restrained but oppressive",
    matches: "Closest styles", score: "pts", gap: "What to adjust", hits: "Tag matches", examples: "Frames on this site",
    promptTitle: "Copy-ready prompts", promptImage: "Image generation", promptVideo: "Image-to-video",
    copy: "Copy", copied: "Copied", negative: "Negative prompt",
    nextTitle: "How to use this",
    nextBody: "Paste the prompt into any image / image-to-video tool (Jimeng, Kling, Tongyi Wanxiang …) and use your frame as the first frame. In-site generation and accounts are being built: they need a backend to hold model keys and to store your images domestically.",
    boundary: "Boundary note: style profiles are compiled from public interviews and viewing, are not the filmmakers' own words, and do not cover their whole body of work. The site uses no film stills; every example is an original demonstration frame. The score only reflects measurable tone and colour structure and says nothing about quality.",
    emptyTitle: "See how it works first",
    emptyBody: "Upload your own image, or start with a frame from this site. Analysis runs locally in your browser; speed depends on image size.",
  },
} as const;

const SAMPLES = ["teahouse-closing", "lane-neon", "summer-seawall", "cinema-seats"] as const;

/** 形式标签直接内联，避免把 199 帧数据打进这个页面的客户端包（lib/data 在探索页已经很大了）。 */
const FORM_GROUPS: { key: string; label: string; en: string; options: string[] }[] = [
  { key: "compositions", label: "构图", en: "COMPOSITION", options: ["中心", "对称", "三分法", "框架", "留白", "纵深", "倾斜"] },
  { key: "lights", label: "光线", en: "LIGHT", options: ["自然光", "侧光", "逆光", "轮廓光", "霓虹", "烛光", "低调光"] },
  { key: "shotSize", label: "景别", en: "SHOT SIZE", options: ["特写", "近景", "中景", "全景", "远景"] },
];

const inkFor = (hex: string) => {
  if (hex.length !== 7) return "#f4efe5";
  const channel = (value: number) => { const c = value / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const luma = 0.2126 * channel(parseInt(hex.slice(1, 3), 16)) + 0.7152 * channel(parseInt(hex.slice(3, 5), 16)) + 0.0722 * channel(parseInt(hex.slice(5, 7), 16));
  return luma > 0.24 ? "#15130f" : "#f4efe5";
};

async function featuresFromSource(source: File | string): Promise<FrameFeatures> {
  const bitmap = typeof source === "string"
    ? await createImageBitmap(await (await fetch(source)).blob())
    : await createImageBitmap(source);
  const scale = Math.min(1, 180 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas unavailable");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return extractFeatures(image.data, 4, 8);
}

export function StyleReader({ locale = "zh" }: { locale?: Locale }) {
  const copy = text[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const [features, setFeatures] = useState<FrameFeatures | null>(null);
  const [sourceLabel, setSourceLabel] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [intent, setIntent] = useState("");
  const [promptKind, setPromptKind] = useState<"image" | "video">("image");
  const [copied, setCopied] = useState(false);

  const formGroups = FORM_GROUPS;

  const analyse = async (source: File | string, label: string) => {
    setBusy(true);
    setError(null);
    try {
      const result = await featuresFromSource(source);
      setFeatures(result);
      setSourceLabel(label);
      setPreview(typeof source === "string" ? source : URL.createObjectURL(source));
    } catch {
      setError(locale === "zh" ? "这张图读不出来，换一张试试（支持 JPG / PNG / WebP）。" : "Could not read that image. Try another JPG / PNG / WebP file.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => { setFeatures(null); setPreview(null); setSourceLabel(""); setCopied(false); if (inputRef.current) inputRef.current.value = ""; };

  const analysis = features ? rankStyles(features, { tags, limit: 3 }) : null;
  const top = analysis?.matches[0];
  const composed = features && top ? composePrompt(top, features, promptKind, intent) : null;

  const copyPrompt = async () => {
    if (!composed) return;
    try {
      await navigator.clipboard.writeText(`${composed.prompt}\n\n${copy.negative}：${composed.negative}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch { setError(locale === "zh" ? "浏览器拒绝了复制，请手动选择文本。" : "Clipboard blocked; please select the text manually."); }
  };

  const metric = (label: string, value: string) => <div className="bg-panel p-3"><p className="text-[10px] uppercase tracking-[.16em] text-muted">{label}</p><p className="mt-1.5 font-mono text-sm text-paper">{value}</p></div>;

  return <div className="site-container py-12 sm:py-16">
    <header className="max-w-3xl">
      <p className="section-kicker">STYLE READER · 风格诊断</p>
      <h1 className="section-title">{locale === "zh" ? "把你的画面，读成一套可执行的拍摄语言" : "Read your frame as an executable visual language"}</h1>
      <p className="section-intro">{locale === "zh" ? "上传一张图，在浏览器本地算出它的影调与色彩结构，对照 10 位导演与摄影指导的风格档案，得到差距清单和可直接使用的生成提示词。图片不会离开你的设备。" : "Upload an image, measure its tone and colour structure locally in the browser, compare it against 10 director and cinematographer profiles, and get a gap list plus copy-ready prompts. Your image never leaves your device."}</p>
    </header>

    {/* 上传区 */}
    <section className="mt-10 border border-line bg-panel/40 p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          <h2 className="font-serif text-2xl">{copy.uploadTitle}</h2>
          <p className="mt-2 text-sm leading-7 text-muted">{copy.uploadHint}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="button-primary cursor-pointer">{copy.choose}
              <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void analyse(file, file.name); }} />
            </label>
            {features && <button type="button" onClick={reset} className="button-secondary">{copy.reset}</button>}
            <span className="text-xs text-muted">{busy ? copy.analyzing : copy.drop}</span>
          </div>
          <p className="mt-6 text-xs tracking-widest text-muted">{copy.sample}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SAMPLES.map((slug) => <button key={slug} type="button" onClick={() => void analyse(`/images/frames-optimized/${slug}-960.webp`, slug)} className="tag min-h-11 hover:border-gold hover:text-gold">{slug}</button>)}
          </div>
          {error && <p className="mt-4 text-sm text-ember" role="alert">{error}</p>}
        </div>
        <div className="border border-line bg-ink/60 p-3">
          {preview ? // 预览图可能是用户本地文件的 blob URL，next/image 无法处理，这里用原生 img
            <img src={preview} alt={sourceLabel} className="h-full max-h-56 w-full object-cover" />
            : <div className="grid h-40 place-items-center text-xs text-muted">{copy.emptyTitle}</div>}
          {sourceLabel && <p className="mt-2 truncate text-[11px] text-muted" title={sourceLabel}>{sourceLabel}</p>}
        </div>
      </div>
    </section>

    {!features && <p className="mt-8 max-w-2xl text-sm leading-7 text-muted">{copy.emptyBody}</p>}

    {/* 分析与匹配 */}
    {features && analysis && top && <div className="mt-12 grid gap-10 lg:grid-cols-[1.25fr_.75fr]">
      <div>
        <section>
          <div className="flex flex-wrap items-center gap-3">
            <p className="section-kicker mb-0">{copy.measured}</p>
            <span className="border border-gold px-2 py-0.5 text-xs text-gold">{copy.styleCluster}：{analysis.cluster}</span>
            <span className={`border px-2 py-0.5 text-xs ${analysis.confidence === "high" ? "border-[#7fa87f] text-[#7fa87f]" : analysis.confidence === "medium" ? "border-gold text-gold" : "border-ember text-ember"}`}>{copy.confidence}：{copy.confidenceLabels[analysis.confidence]}</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
            {metric(copy.luma, `${analysis.vector.luma}% · ${lumaToStops(analysis.vector.luma)} 档`)}
            {metric(copy.shadow, `${Math.round(analysis.vector.shadow)}%`)}
            {metric(copy.highlight, `${Math.round(analysis.vector.highlight)}%`)}
            {metric(copy.spread, `${analysis.vector.spread}`)}
            {metric(copy.saturation, `${analysis.vector.saturation}%`)}
            {metric(copy.temperature, `${analysis.vector.warmth > 0 ? "暖" : analysis.vector.warmth < 0 ? "冷" : "中性"} ${analysis.vector.warmth}`)}
          </div>

          <p className="mt-6 mb-3 text-xs tracking-widest text-muted">{copy.bands}</p>
          <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
            {features.bands.map((band) => band.hex
              ? <div key={band.key} className="flex min-h-[4.5rem] flex-col justify-between p-2.5" style={{ backgroundColor: band.hex, color: inkFor(band.hex) }}><span className="text-[11px] tracking-[.12em]">{band.share}%</span><span className="font-mono text-[11px]">{band.hex}</span></div>
              : <div key={band.key} className="grid min-h-[4.5rem] place-items-center border border-dashed border-line text-[11px] text-muted">{band.key}</div>)}
          </div>

          <p className="mt-6 mb-3 text-xs tracking-widest text-muted">{copy.dominants}</p>
          <div className="flex flex-wrap gap-3">
            {features.dominants.map((color) => <span key={color.hex} className="flex items-center gap-2 border border-line px-2 py-1 text-xs"><span className="h-4 w-4 border border-line" style={{ backgroundColor: color.hex }} /><span className="font-mono">{color.hex}</span><span className="text-muted">{color.share}%</span></span>)}
          </div>
        </section>

        <section className="mt-12">
          <p className="section-kicker">{copy.matches}</p>
          <div className="space-y-5">
            {analysis.matches.map((match, index) => <article key={match.profile.slug} className="border border-line bg-panel/40 p-5">
              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className="font-serif text-2xl">{index + 1}. {match.profile.name}</h3>
                <span className="text-xs text-muted">{match.profile.nameEn} · {match.profile.role} · {match.profile.cluster}</span>
                <span className="ml-auto font-mono text-sm text-gold">{match.score} {copy.score}</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[#d1cdc4]">{match.profile.oneLine}</p>
              {match.formHits.length > 0 && <p className="mt-3 text-xs text-gold">{copy.hits}：{match.formHits.map((tag) => displayTag(tag, locale)).join("、")}</p>}
              {match.priorities.length > 0 && <div className="mt-4"><p className="text-xs tracking-widest text-muted">{copy.gap}</p><ul className="mt-2 space-y-2">{match.priorities.map((priority) => <li key={priority.key} className="border-l border-gold/60 pl-3 text-sm leading-7 text-[#d1cdc4]">{priority.note}</li>)}</ul></div>}
              <p className="mt-4 text-xs leading-6 text-muted">{locale === "zh" ? "拍摄建议" : "On set"}：{match.profile.advice.join("　")}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted">{copy.examples}：</span>
                {match.profile.exampleFrameIds.slice(0, 4).map((slug) => <Link key={slug} href={withLocale(locale, `/frames/${slug}`)} className="tag min-h-9 hover:border-gold hover:text-gold">{slug}</Link>)}
              </div>
            </article>)}
          </div>
          {analysis.note && <p className="mt-5 border border-line bg-panel/40 p-4 text-sm leading-7 text-[#d1cdc4]">{analysis.note}</p>}
        </section>
      </div>

      {/* 右侧：标签、意图、提示词 */}
      <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
        <section className="border border-line p-5">
          <h2 className="font-serif text-xl">{copy.tagsTitle}</h2>
          <p className="mt-2 text-xs leading-6 text-muted">{copy.tagsHint}</p>
          {formGroups.map((group) => <fieldset key={group.key} className="mt-4">
            <legend className="mb-2 text-xs tracking-widest text-muted">{locale === "zh" ? group.label : group.en}</legend>
            <div className="flex flex-wrap gap-2">{group.options.map((option) => {
              const active = tags.includes(option);
              return <button key={option} type="button" aria-pressed={active} onClick={() => setTags((current) => current.includes(option) ? current.filter((item) => item !== option) : [...current, option])} className={`border px-2.5 py-1.5 text-xs transition ${active ? "border-gold bg-gold text-ink" : "border-line text-[#b8b6b0] hover:border-muted hover:text-paper"}`}>{displayTag(option, locale)}</button>;
            })}</div>
          </fieldset>)}
        </section>

        <section className="border border-line p-5">
          <label htmlFor="style-intent" className="font-serif text-xl">{copy.intentTitle}</label>
          <textarea id="style-intent" value={intent} onChange={(event) => setIntent(event.target.value)} placeholder={copy.intentPlaceholder} className="form-field mt-3 min-h-24" />
        </section>

        {composed && <section className="border border-gold/40 bg-panel/40 p-5">
          <h2 className="font-serif text-xl">{copy.promptTitle}</h2>
          <div className="mt-3 flex gap-2" role="group" aria-label={copy.promptTitle}>
            {(["image", "video"] as const).map((kind) => <button key={kind} type="button" aria-pressed={promptKind === kind} onClick={() => setPromptKind(kind)} className={`flex-1 border px-3 py-2 text-xs transition ${promptKind === kind ? "border-gold bg-gold text-ink" : "border-line text-[#b8b6b0] hover:border-gold"}`}>{kind === "image" ? copy.promptImage : copy.promptVideo}</button>)}
          </div>
          <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap border border-line bg-ink p-4 text-xs leading-6 text-[#d8d1c5]">{composed.prompt}</pre>
          <p className="mt-3 text-xs leading-6 text-muted">{copy.negative}：{composed.negative}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => void copyPrompt()} className="button-primary min-h-11">{copied ? copy.copied : copy.copy}</button>
            <span className="self-center text-xs text-muted">{composed.style.name} · {promptKind === "video" ? composed.motion : ""}</span>
          </div>
        </section>}

        <section className="border border-line p-5">
          <h2 className="font-serif text-xl">{copy.nextTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-muted">{copy.nextBody}</p>
        </section>
        <p className="text-xs leading-6 text-muted">{copy.boundary}</p>
      </aside>
    </div>}
  </div>;
}
