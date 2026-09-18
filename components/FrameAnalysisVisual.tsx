"use client";

import Image from "next/image";
import { useState } from "react";
import type { AnnotationKind, FrameAnnotation, Locale } from "@/lib/types";

type Layer = "composition" | "light" | "relationship" | "off";
const kindsByLayer: Record<Exclude<Layer, "off">, AnnotationKind[]> = {
  composition: ["thirds", "center", "frame", "depth", "negative", "focus"],
  light: ["light", "focus"],
  relationship: ["subject", "negative", "frame", "focus"],
};

function Line({ item }: { item: FrameAnnotation }) {
  const x2 = item.x2 ?? item.x;
  const y2 = item.y2 ?? item.y;
  const dx = x2 - item.x;
  const dy = y2 - item.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return <span className={`annotation-line annotation-${item.kind}`} style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${length}%`, transform: `rotate(${angle}deg)` }}><span className="annotation-arrow" /></span>;
}

export function FrameAnalysisVisual({ src, alt, annotations, locale }: { src: string; alt: string; annotations: FrameAnnotation[]; locale: Locale }) {
  const [layer, setLayer] = useState<Layer>("composition");
  const labels: Record<Layer, [string, string]> = { composition: ["构图线", "Composition"], light: ["光线", "Light"], relationship: ["人物关系", "Relationship"], off: ["全部关闭", "Hide all"] };
  const visible = layer === "off" ? [] : annotations.filter((item) => kindsByLayer[layer].includes(item.kind));
  return <div>
    <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={locale === "zh" ? "画面分析标注" : "Frame-analysis overlays"}>{(Object.keys(labels) as Layer[]).map((value) => <button key={value} type="button" onClick={() => setLayer(value)} aria-pressed={layer === value} className={`min-h-11 border px-4 text-xs transition ${layer === value ? "border-gold bg-gold text-ink" : "border-line text-[#c3c0b8] hover:border-gold"}`}>{labels[value][locale === "zh" ? 0 : 1]}</button>)}</div>
    <figure>
      <div className="image-frame aspect-video overflow-hidden bg-panel"><Image src={src} alt={alt} fill preload sizes="100vw" className="object-cover" />
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {visible.map((item) => {
            if (item.kind === "thirds") return <span key={item.id} className="absolute inset-0 thirds-grid" />;
            if (item.kind === "center") return <span key={item.id} className="absolute bottom-0 top-0 left-1/2 border-l border-dashed border-gold/80" />;
            if (item.kind === "light" || item.kind === "depth") return <Line key={item.id} item={item} />;
            if (item.kind === "focus") return <span key={item.id} className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold bg-gold/20 shadow-[0_0_0_6px_rgba(198,154,91,.18)]" style={{ left: `${item.x}%`, top: `${item.y}%` }} />;
            return <span key={item.id} className={`absolute border ${item.kind === "negative" ? "border-dashed border-[#a9c8c0] bg-[#6e9c91]/10" : item.kind === "subject" ? "border-[#d87a69] bg-[#b64a3a]/10" : "border-gold/80"}`} style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.width}%`, height: `${item.height}%` }} />;
          })}
        </div>
      </div>
      {visible.length > 0 && <figcaption className="mt-4 grid gap-2 text-xs text-[#b8b6b0] sm:grid-cols-2">{visible.map((item) => <span key={item.id} className="flex gap-2"><span className="text-gold">—</span>{item.label[locale]}</span>)}</figcaption>}
    </figure>
  </div>;
}
