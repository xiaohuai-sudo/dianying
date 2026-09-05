import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ColorPalette, FrameCard, Tag } from "@/components/Cards";
import { CopyrightLine, CopyrightPanel } from "@/components/Copyright";
import { FavoriteButton } from "@/components/FavoriteButton";
import { getFilm, getFrame, publicFrames } from "@/lib/data";
import { buildFrameStudy } from "@/lib/visual-index";

export function generateStaticParams() { return publicFrames.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const item = getFrame((await params).slug); return item ? { title: `${item.title}｜画面分析`, description: item.analysis } : { title: "画面不存在" };
}

export default async function FramePage({ params }: { params: Promise<{ slug: string }> }) {
  const item = getFrame((await params).slug);
  if (!item) notFound();
  const film = getFilm(item.filmSlug);
  if (!film) notFound();
  const study = buildFrameStudy(item);
  const similar = publicFrames.filter((candidate) => candidate.slug !== item.slug).map((candidate) => ({ candidate, score: candidate.colors.filter((x) => item.colors.includes(x)).length + candidate.compositions.filter((x) => item.compositions.includes(x)).length + candidate.moods.filter((x) => item.moods.includes(x)).length })).sort((a, b) => b.score - a.score).slice(0, 3).map(({ candidate }) => candidate);
  const facts = [["景别", item.shotSize], ["构图方式", item.compositions.join("、")], ["光线方向", item.lightDirection], ["光线软硬", item.lightQuality], ["人物位置", item.subjectPosition], ["视觉重心", item.visualFocus], ["时间", item.time]];
  return <div className="site-container py-10 sm:py-14">
    <nav aria-label="面包屑" className="text-xs text-muted"><Link href="/explore" className="hover:text-paper">探索</Link><span className="mx-2">/</span><Link href={`/films/${film.slug}`} className="hover:text-paper">{film.title}</Link><span className="mx-2">/</span><span className="text-paper">{item.title}</span></nav>
    <header className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="section-kicker">FRAME ANALYSIS · 画面分析</p><h1 className="font-serif text-4xl sm:text-5xl">{item.title}</h1><p className="mt-3 text-sm text-muted">《{film.title}》 · {film.year} · 原创演示画面</p></div><FavoriteButton frameId={item.slug} /></header>
    <figure className="mt-10"><div className="image-frame aspect-video overflow-hidden"><Image src={item.image} alt={item.alt} fill loading="eager" sizes="100vw" className="object-cover" /></div><CopyrightLine info={item.copyright} /></figure>
    <section className="mt-14 grid gap-12 lg:grid-cols-[1.3fr_.7fr]">
      <article><p className="section-kicker">READING THE FRAME · 读图</p><h2 className="section-title">画面如何影响情绪与叙事</h2><p className="mt-7 font-serif text-xl leading-10 text-[#ddd6ca] sm:text-2xl">{item.analysis}</p><div className="mt-10"><p className="mb-3 text-xs tracking-widest text-muted">主色提取</p><ColorPalette colors={item.palette} labeled /></div><div className="mt-6 flex flex-wrap gap-2">{[...item.colors, ...item.compositions, ...item.lights, ...item.moods].map((tag) => <Tag key={tag}>{tag}</Tag>)}</div></article>
      <aside><h2 className="font-serif text-xl">视觉参数</h2><dl className="mt-5 divide-y divide-line border-y border-line">{facts.map(([label, value]) => <div key={label} className="py-4"><dt className="text-xs text-muted">{label}</dt><dd className="mt-1.5 text-sm leading-6 text-paper">{value}</dd></div>)}</dl></aside>
    </section>
    <section className="mt-16 border-y border-line py-14">
      <div className="grid gap-10 lg:grid-cols-3">
        <div><p className="section-kicker">HOW TO WATCH · 观看顺序</p><h2 className="font-serif text-2xl">用三步读完这一帧</h2><ol className="mt-6 space-y-5">{study.observation.map((text, index) => <li key={text} className="grid grid-cols-[2rem_1fr] gap-3 text-sm leading-7 text-muted"><span className="font-serif text-xl text-gold">{index + 1}</span><span>{text}</span></li>)}</ol></div>
        <div><p className="section-kicker">TRANSLATE · 创作转译</p><h2 className="font-serif text-2xl">把分析用于分镜与拍摄</h2><ul className="mt-6 space-y-5">{study.practice.map((text) => <li key={text} className="border-l border-line pl-4 text-sm leading-7 text-muted">{text}</li>)}</ul></div>
        <div><p className="section-kicker">QUESTIONS · 继续追问</p><h2 className="font-serif text-2xl">让判断保持开放</h2><ul className="mt-6 space-y-5">{study.questions.map((text) => <li key={text} className="font-serif text-base leading-7 text-[#d8d1c5]">“{text}”</li>)}</ul></div>
      </div>
    </section>
    <section className="mt-16"><CopyrightPanel info={item.copyright} /></section>
    <section className="section"><p className="section-kicker">SIMILAR FRAMES · 相似画面</p><h2 className="section-title">继续观看</h2><div className="mt-9 grid gap-7 md:grid-cols-3">{similar.map((frame) => <FrameCard key={frame.slug} frame={frame} />)}</div></section>
  </div>;
}
