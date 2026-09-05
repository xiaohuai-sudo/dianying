"use client";

import Image from "next/image";
import Link from "next/link";
import { ColorPalette } from "./Cards";
import { CompareButton, useCompare } from "./CompareProvider";
import { getFilm, getFrame } from "@/lib/data";
import { displayTag, frameReading, localizeFilm, withLocale } from "@/lib/i18n";
import type { Frame, Locale } from "@/lib/types";

export function CompareViewClient({ locale }: { locale: Locale }) {
  const { frameIds, clear } = useCompare();
  const frames = frameIds.map(getFrame).filter(Boolean).slice(0, 4) as Frame[];
  const columns = frames.length === 2 ? "md:grid-cols-2" : frames.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";

  return <div className="site-container py-12 sm:py-16">
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div><p className="section-kicker">FRAME COMPARISON</p><h1 className="section-title">{locale === "zh" ? "并排读懂画面" : "Read frames side by side"}</h1></div>
      {frames.length > 0 && <button type="button" onClick={clear} className="button-secondary">{locale === "zh" ? "清空对比" : "Clear comparison"}</button>}
    </div>
    <p className="section-intro">{locale === "zh" ? "比较色彩、构图、光线与人物位置，寻找视觉策略真正改变意义的地方。" : "Compare color, composition, light and figure placement to see where visual strategy changes meaning."}</p>
    {frames.length < 2 ? <div className="mt-12 border border-dashed border-line py-20 text-center"><p className="font-serif text-2xl">{locale === "zh" ? "请选择至少两张画面" : "Choose at least two frames"}</p><Link href={withLocale(locale, "/explore")} className="button-primary mt-6">{locale === "zh" ? "前往探索" : "Explore frames"}</Link></div> : <div className={`mt-12 grid gap-px overflow-x-auto border border-line bg-line ${columns}`}>{frames.map((frame) => {
      const reading = frameReading(frame, locale);
      const film = getFilm(frame.filmSlug)!;
      const rows = [
        [locale === "zh" ? "景别" : "Shot size", displayTag(frame.shotSize, locale)],
        [locale === "zh" ? "构图" : "Composition", frame.compositions.map((item) => displayTag(item, locale)).join(" · ")],
        [locale === "zh" ? "光线" : "Light", frame.lights.map((item) => displayTag(item, locale)).join(" · ")],
        [locale === "zh" ? "人物" : "Figures", locale === "zh" ? frame.subjectPosition : "Placement shown in the relationship overlay"],
        [locale === "zh" ? "叙事作用" : "Narrative effect", reading.narrativeEffect],
      ];
      return <article key={frame.slug} className="min-w-0 bg-panel p-5"><div className="image-frame aspect-video overflow-hidden"><Image src={frame.image} alt={reading.alt} fill sizes="(max-width:768px) 100vw, 25vw" className="object-cover" /></div><h2 className="mt-5 font-serif text-2xl">{reading.title}</h2><p className="mt-1 text-xs text-muted">{localizeFilm(film, locale).title}</p><ColorPalette colors={frame.palette} labeled locale={locale} /><dl className="mt-6 divide-y divide-line text-sm">{rows.map(([label, value]) => <div key={label} className="py-4"><dt className="text-xs text-gold">{label}</dt><dd className="mt-2 leading-6 text-[#c7c4bd]">{value}</dd></div>)}</dl><div className="mt-6 flex gap-2"><CompareButton frameId={frame.slug} /><Link href={withLocale(locale, `/frames/${frame.slug}`)} className="button-secondary px-3">{locale === "zh" ? "详情" : "Detail"}</Link></div></article>;
    })}</div>}
  </div>;
}
