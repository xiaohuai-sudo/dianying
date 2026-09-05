import Image from "next/image";
import Link from "next/link";
import { ColorPalette, FilmCard, FrameCard, TopicCard } from "@/components/Cards";
import { films, publicFrames, topics } from "@/lib/data";
import { visualIndex } from "@/lib/visual-index";

export default function HomePage() {
  const hero = publicFrames[0];
  const latestTopics = [...topics].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return <>
    <section className="relative min-h-[78vh] overflow-hidden border-b border-line">
      <Image src={hero.image} alt={hero.alt} fill loading="eager" sizes="100vw" className="object-cover opacity-65" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/65 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/20" />
      <div className="site-container relative flex min-h-[78vh] items-end pb-16 pt-28 sm:items-center sm:pb-0">
        <div className="max-w-3xl">
          <p className="mb-5 text-xs uppercase tracking-[.28em] text-gold">JINGJIAN · FILM AESTHETICS ARCHIVE</p>
          <h1 className="font-serif text-5xl leading-none tracking-[.12em] text-paper sm:text-7xl lg:text-8xl">镜间</h1>
          <p className="mt-6 text-lg tracking-wide text-paper sm:text-2xl">从一帧画面，读懂电影的视觉语言。</p>
          <blockquote className="mt-8 max-w-xl border-l border-gold/60 pl-5 text-sm leading-7 text-[#d8d1c5] sm:text-base">暖黄色并不总是代表温馨。<br />当人物被阴影和门框分割时，它也可能意味着封闭与疏离。</blockquote>
          <Link href="/explore" className="button-primary mt-9">开始探索 <span aria-hidden="true">→</span></Link>
        </div>
      </div>
      <p className="absolute bottom-5 right-5 text-[10px] tracking-wider text-white/60 sm:right-8">原创演示画面 · 禁止下载</p>
    </section>

    <section className="section site-container">
      <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
        <div><p className="section-kicker">FRAME OF THE DAY · 今日画面</p><h2 className="section-title">隔窗的午后</h2><p className="section-intro">{hero.analysis}</p><Link href={`/frames/${hero.slug}`} className="mt-7 inline-block text-sm text-gold underline decoration-gold/30 underline-offset-8">阅读全文 →</Link></div>
        <div><Link href={`/frames/${hero.slug}`} className="image-frame block aspect-video overflow-hidden"><Image src={hero.image} alt={hero.alt} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover transition duration-700 hover:scale-[1.02]" /></Link><ColorPalette colors={hero.palette} labeled /></div>
      </div>
    </section>

    <section className="border-y border-line bg-panel/35"><div className="section site-container"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="section-kicker">VISUAL INDEX · 视觉索引</p><h2 className="section-title">六条进入画面的路径</h2></div><Link href="/visual-index" className="text-sm text-gold">查看 36 个视觉词条 →</Link></div><div className="mt-8 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-2 lg:grid-cols-3">{visualIndex.map((group) => <Link key={group.slug} href={`/visual-index#${group.slug}`} className="group relative min-h-64 overflow-hidden bg-ink p-7"><div className="absolute inset-x-0 bottom-0 h-2/3 opacity-40 transition-transform duration-700 group-hover:scale-110" style={{ background: `linear-gradient(20deg, ${group.accent}, transparent 72%)` }} /><div className="relative"><p className="text-xs tracking-widest text-muted">{group.english} · {group.terms.length} 个词条</p><h3 className="mt-6 font-serif text-3xl text-paper">{group.title}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-muted">{group.overview}</p></div><span className="absolute bottom-7 right-7 text-xl text-gold">↗</span></Link>)}</div></div></section>

    <section className="section site-container">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="section-kicker">SELECTED FILMS · 精选电影</p><h2 className="section-title">虚构作品，真实的观看方法</h2></div><Link href="/explore" className="text-sm text-gold">查看全部画面 →</Link></div>
      <div className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">{films.map((film) => <FilmCard key={film.slug} film={film} />)}</div>
    </section>

    <section className="border-y border-line bg-panel/35"><div className="section site-container"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="section-kicker">MORE FRAMES · 更多画面</p><h2 className="section-title">在不同空间里练习观看</h2></div><Link href="/explore" className="text-sm text-gold">进入完整画面库 →</Link></div><div className="mt-10 grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">{publicFrames.slice(4, 10).map((frame) => <FrameCard key={frame.slug} frame={frame} />)}</div></div></section>

    <section><div className="section site-container"><div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><p className="section-kicker">ESSAYS · 美学专题</p><h2 className="section-title">慢一点看见<br />画面如何说话</h2><p className="section-intro">从颜色的误读到空间的暗示，12 篇专题聚焦可被练习、比较与迁移的观看方法。</p><Link href="/topics" className="button-secondary mt-7">浏览全部专题</Link></div><div>{latestTopics.slice(0, 4).map((topic) => <TopicCard key={topic.slug} topic={topic} />)}</div></div></div></section>

    <section className="section site-container"><div className="border border-line p-7 sm:p-10"><div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center"><div><p className="section-kicker">DEMO & RIGHTS · 演示与版权</p><h2 className="font-serif text-2xl text-paper">这里没有真实电影截图</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-muted">本站当前展示的六部作品、人物与 200 个画面均为功能演示而创作的虚构内容，图片为镜间原创演示资产。它们不对应真实影片，也不提供原图下载或商业素材授权。</p></div><Link href="/copyright" className="button-secondary whitespace-nowrap">查看版权说明</Link></div></div></section>
  </>;
}
