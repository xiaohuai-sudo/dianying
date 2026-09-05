import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getFrame, publicFrames } from "@/lib/data";
import { visualIndex } from "@/lib/visual-index";

export const metadata: Metadata = {
  title: "视觉语言索引",
  description: "从色彩、构图、光影、景别、空间与情绪六个维度建立电影画面的视觉词汇。",
};

export default function VisualIndexPage() {
  const termCount = visualIndex.reduce((total, group) => total + group.terms.length, 0);
  return <>
    <header className="site-container py-14 sm:py-20">
      <p className="section-kicker">VISUAL LANGUAGE INDEX · 视觉语言索引</p>
      <div className="grid gap-8 lg:grid-cols-[1fr_.7fr] lg:items-end">
        <div><h1 className="max-w-4xl font-serif text-4xl leading-tight sm:text-6xl">不是标签表，<br />而是一套观看路径</h1><p className="section-intro">从六个维度、{termCount} 个核心词条进入画面。每个词条回答三个问题：它是什么、它如何影响观看、实际看片时应该留意什么。</p></div>
        <div className="grid grid-cols-3 gap-px border border-line bg-line text-center"><div className="bg-panel p-5"><strong className="block font-serif text-3xl text-gold">6</strong><span className="mt-1 block text-xs text-muted">分析维度</span></div><div className="bg-panel p-5"><strong className="block font-serif text-3xl text-gold">{termCount}</strong><span className="mt-1 block text-xs text-muted">核心词条</span></div><div className="bg-panel p-5"><strong className="block font-serif text-3xl text-gold">{publicFrames.length}</strong><span className="mt-1 block text-xs text-muted">实例画面</span></div></div>
      </div>
      <nav aria-label="视觉索引章节" className="mt-10 flex flex-wrap gap-2">{visualIndex.map((group) => <a key={group.slug} href={`#${group.slug}`} className="tag px-4 py-2 hover:border-gold hover:text-gold">{group.title} · {group.english}</a>)}</nav>
    </header>

    {visualIndex.map((group, groupIndex) => <section id={group.slug} key={group.slug} className={groupIndex % 2 ? "border-y border-line bg-panel/35" : "border-t border-line"}>
      <div className="section site-container">
        <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
          <div><p className="text-xs tracking-[.22em]" style={{ color: group.accent }}>{String(groupIndex + 1).padStart(2, "0")} · {group.english}</p><h2 className="mt-4 font-serif text-4xl sm:text-5xl">{group.title}</h2><p className="mt-6 max-w-md text-sm leading-8 text-muted">{group.overview}</p><blockquote className="mt-7 max-w-md border-l border-gold/50 pl-4 font-serif text-lg leading-8 text-paper">“{group.guidingQuestion}”</blockquote></div>
          <div className="grid gap-px border border-line bg-line md:grid-cols-2">{group.terms.map((term, index) => {
            const example = getFrame(term.frameIds[0]);
            return <article key={term.name} className="group bg-ink p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] tracking-[.2em] text-muted">{String(index + 1).padStart(2, "0")} · {term.english}</p><h3 className="mt-2 font-serif text-2xl text-paper">{term.name}</h3></div><Link href={`/explore?${term.filterKey}=${encodeURIComponent(term.filterValue)}`} className="text-sm text-gold" aria-label={`探索${term.name}画面`}>↗</Link></div>
              <p className="mt-5 text-sm leading-7 text-[#d1cdc4]">{term.definition}</p><p className="mt-3 text-sm leading-7 text-muted">{term.effect}</p><div className="mt-5 border-t border-line pt-4"><p className="text-[10px] tracking-widest text-gold">观看提示</p><p className="mt-2 text-xs leading-6 text-muted">{term.watchFor}</p></div>
              {example && <Link href={`/frames/${example.slug}`} className="mt-5 flex items-center gap-3 border-t border-line pt-4"><span className="image-frame relative h-12 w-20 shrink-0 overflow-hidden"><Image src={example.image} alt="" fill sizes="80px" className="object-cover" /></span><span className="text-xs text-muted group-hover:text-paper">实例：{example.title}</span></Link>}
            </article>;
          })}</div>
        </div>
      </div>
    </section>)}
    <section className="site-container py-16"><div className="border border-line bg-panel p-7 sm:flex sm:items-center sm:justify-between sm:p-10"><div><h2 className="font-serif text-2xl">把词条带回具体画面</h2><p className="mt-3 text-sm leading-7 text-muted">索引提供入口，完整分析解释形式如何共同作用。</p></div><Link href="/explore" className="button-primary mt-6 sm:mt-0">探索全部画面</Link></div></section>
  </>;
}
