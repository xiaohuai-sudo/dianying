"use client";

import { useState } from "react";
import type { DominantColor, FrameTone, FrameToneStats, ToneBand, ToneBandKey } from "@/lib/frame-tones.generated";
import type { Locale } from "@/lib/types";

/* ------------------------------------------------------------------ *
 * Labels
 * Exposure offsets are relative to mid-grey (0.18) and match the
 * luminance windows used by scripts/extract-frame-tones.mjs.
 * ------------------------------------------------------------------ */
const paletteText = {
  zh: {
    paletteTitle: "主色提取", paletteKicker: "AUTHORED PALETTE",
    ladderTitle: "曝光阶梯", ladderKicker: "EXPOSURE BANDS",
    dominantsTitle: "主导色分布", dominantsKicker: "DOMINANT COLORS",
    statsTitle: "色彩统计", statsKicker: "FRAME STATISTICS",
    paletteGroup: "主色色卡", ladderGroup: "曝光影调阶梯", dominantsGroup: "主导色分布",
    copyHint: "点击任意色块复制色值", copied: "已复制", copy: "复制",
    share: "占比", luma: "平均明度", spread: "明度跨度", saturation: "平均饱和", temperature: "色温倾向",
    warm: "暖色", cool: "冷色", neutral: "近似中性色", empty: "画内无此影调",
    bands: {
      shadow: { label: "阴影", stop: "< −4 EV" }, dark: { label: "暗部", stop: "−4 ~ −2 EV" },
      midDark: { label: "中暗", stop: "−2 ~ −0.6 EV" }, midLight: { label: "中亮", stop: "−0.6 ~ +0.7 EV" },
      light: { label: "亮部", stop: "+0.7 ~ +1.8 EV" }, highlight: { label: "高光", stop: "> +1.8 EV" },
    } as Record<ToneBandKey, { label: string; stop: string }>,
  },
  en: {
    paletteTitle: "Authored palette", paletteKicker: "AUTHORED PALETTE",
    ladderTitle: "Exposure bands", ladderKicker: "EXPOSURE BANDS",
    dominantsTitle: "Dominant colors", dominantsKicker: "DOMINANT COLORS",
    statsTitle: "Frame statistics", statsKicker: "FRAME STATISTICS",
    paletteGroup: "Authored color palette", ladderGroup: "Exposure tone ladder", dominantsGroup: "Dominant color distribution",
    copyHint: "Click any swatch to copy its value", copied: "Copied", copy: "Copy",
    share: "share", luma: "Mean luma", spread: "Luma spread", saturation: "Mean saturation", temperature: "Temperature",
    warm: "Warm", cool: "Cool", neutral: "Mostly neutral", empty: "No tone in this band",
    bands: {
      shadow: { label: "Shadow", stop: "< −4 EV" }, dark: { label: "Low", stop: "−4 ~ −2 EV" },
      midDark: { label: "Low-mid", stop: "−2 ~ −0.6 EV" }, midLight: { label: "High-mid", stop: "−0.6 ~ +0.7 EV" },
      light: { label: "Light", stop: "+0.7 ~ +1.8 EV" }, highlight: { label: "Highlight", stop: "> +1.8 EV" },
    } as Record<ToneBandKey, { label: string; stop: string }>,
  },
} as const;

/* ------------------------------------------------------------------ *
 * Readability helpers — a swatch always carries its own ink color, so
 * light blocks (#D3CEC0) no longer print white-on-white labels.
 * ------------------------------------------------------------------ */
const toLinear = (channel: number) => {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

function relativeLuminance(hex: string) {
  const value = hex.replace("#", "");
  if (value.length !== 6) return 0;
  return 0.2126 * toLinear(parseInt(value.slice(0, 2), 16)) + 0.7152 * toLinear(parseInt(value.slice(2, 4), 16)) + 0.0722 * toLinear(parseInt(value.slice(4, 6), 16));
}

const inkFor = (hex: string) => (relativeLuminance(hex) > 0.24 ? "#15130f" : "#f4efe5");

async function copyValue(hex: string) {
  try {
    await navigator.clipboard?.writeText(hex);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Swatch
 * ------------------------------------------------------------------ */
function Swatch({ hex, top, sub, label, className = "", copyHint, copiedText, reveal = false }: { hex: string; top?: string; sub?: string; label: string; className?: string; copyHint: string; copiedText: string; reveal?: boolean }) {
  const [copied, setCopied] = useState(false);
  return <button
    type="button"
    title={`${copyHint}：${hex}`}
    aria-label={`${label} ${hex}`}
    onClick={async () => { if (await copyValue(hex)) { setCopied(true); window.setTimeout(() => setCopied(false), 1200); } }}
    className={`group/swatch relative flex flex-col justify-between gap-2 p-2.5 text-left outline-offset-[-2px] transition duration-300 hover:z-10 hover:shadow-[inset_0_0_0_2px_rgba(198,154,91,.9)] ${className}`}
    style={{ backgroundColor: hex, color: inkFor(hex) }}
  >
    <span className="flex flex-wrap items-baseline gap-x-1.5 text-[11px] leading-4 tracking-[.12em]">{top}{sub && top && <span className="font-mono text-[10px] opacity-60">{sub}</span>}</span>
    <span className={`font-mono text-[11px] leading-4 transition-opacity ${reveal ? "opacity-0 group-hover/swatch:opacity-100 group-focus-visible/swatch:opacity-100" : ""}`}>{copied ? copiedText : hex}</span>
  </button>;
}

/* ------------------------------------------------------------------ *
 * Authored palette (frame + film level)
 * ------------------------------------------------------------------ */
export function ColorPalette({ colors, labeled = false, locale = "zh" }: { colors: string[]; labeled?: boolean; locale?: Locale }) {
  const text = paletteText[locale];
  const columns = colors.length <= 3 ? "grid-cols-2 sm:grid-cols-3" : colors.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
  return <div className={`grid gap-px border border-line bg-line ${columns}`} role="group" aria-label={`${text.paletteGroup} · ${text.copyHint}`}>
    {colors.map((color, index) => <Swatch
      key={color}
      hex={color}
      top={String(index + 1).padStart(2, "0")}
      label={`${text.paletteGroup} ${index + 1}`}
      copyHint={text.copyHint}
      copiedText={text.copied}
      reveal={!labeled}
      className="min-h-[5.5rem]"
    />)}
  </div>;
}

/* ------------------------------------------------------------------ *
 * Exposure ladder (extracted from the frame image)
 * ------------------------------------------------------------------ */
export function ToneLadder({ bands, locale }: { bands: ToneBand[]; locale: Locale }) {
  const text = paletteText[locale];
  return <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-6" role="group" aria-label={text.ladderGroup}>
    {bands.map((band) => {
      const meta = text.bands[band.key];
      if (!band.hex || band.share < 0.05) return <div
        key={band.key}
        className="flex min-h-[5.5rem] flex-col justify-between gap-2 bg-panel p-2.5 text-muted"
        style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,.045) 0 5px, transparent 5px 10px)" }}
      >
        <span className="text-[11px] leading-4 tracking-[.12em]">{meta.label}</span>
        <span className="text-[10px] leading-4">{text.empty}</span>
      </div>;
      return <Swatch
        key={band.key}
        hex={band.hex}
        top={meta.label}
        sub={`${band.share}%`}
        label={`${meta.label} ${meta.stop}`}
        copyHint={text.copyHint}
        copiedText={text.copied}
        className="min-h-[5.5rem]"
      />;
    })}
  </div>;
}

/* ------------------------------------------------------------------ *
 * Dominant colors with pixel share
 * ------------------------------------------------------------------ */
export function DominantColors({ dominants, locale }: { dominants: DominantColor[]; locale: Locale }) {
  const text = paletteText[locale];
  if (!dominants.length) return null;
  return <div role="group" aria-label={text.dominantsGroup}>
    <div className="flex h-4 overflow-hidden border border-line" aria-hidden="true">
      {dominants.map((color) => <span key={color.hex} style={{ backgroundColor: color.hex, width: `${color.share}%` }} />)}
    </div>
    <ul className="mt-3 divide-y divide-line border-y border-line">
      {dominants.map((color) => <li key={color.hex} className="flex items-center gap-3 py-2.5">
        <button
          type="button"
          title={`${text.copyHint}：${color.hex}`}
          aria-label={`${text.dominantsGroup} ${color.hex} ${text.share} ${color.share}%`}
          onClick={() => copyValue(color.hex)}
          className="h-6 w-6 shrink-0 border border-line outline-offset-2 transition hover:shadow-[0_0_0_2px_rgba(198,154,91,.9)]"
          style={{ backgroundColor: color.hex }}
        />
        <span className="font-mono text-xs text-paper">{color.hex}</span>
        <span className="ml-auto flex items-center gap-3">
          <span className="hidden h-1 w-24 bg-line sm:block"><span className="block h-full bg-gold" style={{ width: `${Math.max(2, color.share)}%` }} /></span>
          <span className="w-14 text-right text-xs text-muted">{color.share}%</span>
        </span>
      </li>)}
    </ul>
  </div>;
}

/* ------------------------------------------------------------------ *
 * Frame statistics
 * ------------------------------------------------------------------ */
export function ToneStatistics({ stats, locale }: { stats: FrameToneStats; locale: Locale }) {
  const text = paletteText[locale];
  const chromatic = stats.warmShare + stats.coolShare > 5;
  const cells: [string, string][] = [
    [text.luma, `${stats.luma}%`],
    [text.spread, `${stats.spread}`],
    [text.saturation, `${stats.saturation}%`],
  ];
  return <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
    {cells.map(([label, value]) => <div key={label} className="bg-panel p-3">
      <p className="text-[10px] uppercase tracking-[.16em] text-muted">{label}</p>
      <p className="mt-1.5 font-mono text-sm text-paper">{value}</p>
    </div>)}
    <div className="bg-panel p-3">
      <p className="text-[10px] uppercase tracking-[.16em] text-muted">{text.temperature}</p>
      {chromatic ? <>
        <p className="mt-1.5 font-mono text-sm text-paper">{text.warm} {stats.warmShare}% · {text.cool} {stats.coolShare}%</p>
        <span className="mt-2 flex h-1.5 overflow-hidden bg-line">
          <span className="bg-[#C69A5B]" style={{ width: `${stats.warmShare}%` }} />
          <span className="bg-[#4E7C9A]" style={{ width: `${stats.coolShare}%` }} />
        </span>
      </> : <p className="mt-1.5 font-mono text-sm text-paper">{text.neutral}</p>}
    </div>
  </div>;
}

/* ------------------------------------------------------------------ *
 * Full panel used on frame detail pages: authored palette + the two
 * layers extracted from the image itself.
 * ------------------------------------------------------------------ */
export function FrameTonePanel({ palette, tone, locale = "zh" }: { palette: string[]; tone?: FrameTone; locale?: Locale }) {
  const text = paletteText[locale];
  const heading = (title: string, kicker: string) => <p className="mb-3 flex flex-wrap items-baseline gap-x-3 text-xs tracking-widest text-muted"><span>{title}</span><span className="text-[10px] tracking-[.18em] text-gold/80">{kicker}</span></p>;
  return <div className="space-y-9">
    <section>{heading(text.paletteTitle, text.paletteKicker)}<ColorPalette colors={palette} labeled locale={locale} /></section>
    {tone && <>
      <section>{heading(text.ladderTitle, text.ladderKicker)}<ToneLadder bands={tone.bands} locale={locale} /></section>
      <section>{heading(text.dominantsTitle, text.dominantsKicker)}<DominantColors dominants={tone.dominants} locale={locale} /></section>
      <section>{heading(text.statsTitle, text.statsKicker)}<ToneStatistics stats={tone.stats} locale={locale} /></section>
    </>}
    <p className="text-xs text-muted">{text.copyHint}。</p>
  </div>;
}
