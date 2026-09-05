import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ColorPalette, FrameCard, Tag, TopicCard } from "@/components/Cards";
import { CopyrightLine } from "@/components/Copyright";
import { films, getFilm, getFilmFrames, topics } from "@/lib/data";

export function generateStaticParams() { return films.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const film = getFilm((await params).slug);
  return film ? { title: `《${film.title}》`, description: film.visualStyle } : { title: "作品不存在" };
}

export default async function FilmPage({ params }: { params: Promise<{ slug: string }> }) {
  const film = getFilm((await params).slug);
  if (!film) notFound();
  const frames = getFilmFrames(film.slug);
  const hero = frames[0];
  const relatedTopics = topics.filter((topic) => film.topicIds.includes(topic.slug));
  const vocabularies = [
    { label: "色彩词汇", values: Array.from(new Set(frames.flatMap((item) => item.colors))), key: "colors" },
    { label: "构图词汇", values: Array.from(new Set(frames.flatMap((item) => item.compositions))), key: "compositions" },
    { label: "光线词汇", values: Array.from(new Set(frames.flatMap((item) => item.lights))), key: "lights" },
    { label: "情绪走向", values: Array.from(new Set(frames.flatMap((item) => item.moods))), key: "moods" },
  ];
  return <>
    <section className="relative min-h-[62vh] overflow-hidden border-b border-line">
      <Image src={hero.image} alt={hero.alt} fill loading="eager" sizes="100vw" className="object-cover opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="site-container relative flex min-h-[62vh] items-end pb-12"><div className="max-w-4xl"><p className="text-xs uppercase tracking-[.24em] text-gold">FICTIONAL FILM · 虚构演示作品</p><h1 className="mt-5 font-serif text-4xl tracking-wider sm:text-6xl">《{film.title}》</h1><p className="mt-4 text-sm tracking-[.14em] text-[#d5d0c8]">{film.englishTitle} · {film.year} · {film.aspectRatio}</p></div></div>
    </section>
    <div className="site-container">
      <section className="section grid min-w-0 grid-cols-1 gap-12 lg:grid-cols-[.7fr_1.3fr]">
        <dl className="grid min-w-0 content-start grid-cols-[7rem_minmax(0,1fr)] gap-y-4 border-t border-line pt-6 text-sm"><dt className="text-muted">导演</dt><dd>{film.director}</dd><dt className="text-muted">摄影指导</dt><dd>{film.cinematographer}</dd><dt className="text-muted">地区</dt><dd>{film.region}</dd><dt className="text-muted">画幅比例</dt><dd>{film.aspectRatio}</dd><dt className="text-muted">年份</dt><dd>{film.year}</dd></dl>
        <div className="min-w-0"><p className="section-kicker">VISUAL PROFILE · 视觉档案</p><p className="font-serif text-2xl leading-relaxed text-paper sm:text-3xl">{film.visualStyle}</p><p className="mt-7 text-sm leading-7 text-muted">故事设定：{film.synopsis}</p><div className="mt-8"><ColorPalette colors={film.palette} labeled /></div></div>
      </section>
      <section className="border-y border-line py-10"><div className="grid gap-8 md:grid-cols-2"><div><p className="text-xs tracking-widest text-gold">代表性构图</p><p className="mt-3 text-sm leading-7 text-muted">{film.compositionNotes}</p><div className="mt-4 flex flex-wrap gap-2">{Array.from(new Set(frames.flatMap((item) => item.compositions))).map((tag) => <Tag key={tag}>{tag}</Tag>)}</div></div><div><p className="text-xs tracking-widest text-gold">光影特点</p><p className="mt-3 text-sm leading-7 text-muted">{film.lightingNotes}</p><div className="mt-4 flex flex-wrap gap-2">{Array.from(new Set(frames.flatMap((item) => item.lights))).map((tag) => <Tag key={tag}>{tag}</Tag>)}</div></div></div></section>
      <section className="section grid gap-12 lg:grid-cols-[.65fr_1.35fr]">
        <div><p className="section-kicker">VISUAL GRAMMAR · 视觉语法</p><h2 className="section-title">这部作品如何建立一致性</h2><p className="section-intro">视觉风格不是单个漂亮镜头，而是一组形式选择在不同场景中反复出现、变化并积累意义。</p><Link href="/visual-index" className="mt-6 inline-block text-sm text-gold underline underline-offset-4">查阅完整视觉索引 →</Link></div>
        <div className="divide-y divide-line border-y border-line">{vocabularies.map((group) => <div key={group.label} className="grid gap-4 py-5 sm:grid-cols-[7rem_1fr]"><p className="text-xs tracking-wider text-muted">{group.label}</p><div className="flex flex-wrap gap-2">{group.values.map((value) => <Link key={value} href={`/explore?${group.key}=${encodeURIComponent(value)}`}><Tag>{value}</Tag></Link>)}</div></div>)}</div>
      </section>
      <section className="section"><p className="section-kicker">SELECTED FRAMES · 精选画面</p><h2 className="section-title">视觉分析</h2><div className="mt-10 grid gap-x-7 gap-y-12 md:grid-cols-2">{frames.map((item) => <div key={item.slug}><FrameCard frame={item} /><CopyrightLine info={item.copyright} /></div>)}</div></section>
      <section className="border-t border-line py-16"><p className="section-kicker">VIEWING ROUTE · 观看路线</p><h2 className="section-title">沿着画面变化理解风格</h2><ol className="mt-9 grid gap-px border border-line bg-line md:grid-cols-2">{frames.map((item, index) => <li key={item.slug} className="bg-ink p-6"><p className="text-xs text-gold">{String(index + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}</p><Link href={`/frames/${item.slug}`} className="mt-3 block font-serif text-xl hover:text-gold">{item.title}</Link><p className="mt-3 text-sm leading-7 text-muted">先看{item.visualFocus}，再留意{item.lightDirection}形成的{item.lightQuality}。这一帧把“{item.moods.join("、")}”落实为具体观看路径。</p></li>)}</ol></section>
      {relatedTopics.length > 0 && <section className="border-t border-line py-16"><p className="section-kicker">RELATED ESSAYS · 相关专题</p><div className="mt-4 grid gap-x-10 lg:grid-cols-2">{relatedTopics.map((topic) => <TopicCard key={topic.slug} topic={topic} />)}</div></section>}
      <section className="border border-line bg-panel p-6 sm:p-8"><p className="font-serif text-xl">内容与图片说明</p><p className="mt-4 text-sm leading-7 text-muted">《{film.title}》及相关主创、故事与画面均为镜间网站功能演示而创作的虚构内容。图片为本站原创演示资产，不对应任何真实影片、演员或剧照，不提供下载及商业素材授权。</p><Link href="/copyright" className="mt-4 inline-block text-sm text-gold underline underline-offset-4">阅读完整版权说明</Link></section>
    </div>
  </>;
}
