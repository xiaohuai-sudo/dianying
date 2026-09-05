import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyrightLine } from "@/components/Copyright";
import { TopicCard } from "@/components/Cards";
import { getFilm, getFrame, getTopic, topics } from "@/lib/data";

export function generateStaticParams() { return topics.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const topic = getTopic((await params).slug); return topic ? { title: topic.title, description: topic.excerpt } : { title: "专题不存在" }; }

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const topic = getTopic((await params).slug); if (!topic) notFound();
  const cover = getFrame(topic.coverFrameId); if (!cover) notFound();
  const related = topics.filter((item) => topic.relatedTopicIds.includes(item.slug));
  return <>
    <header className="site-container pb-10 pt-14 sm:pb-14 sm:pt-20"><p className="section-kicker">AESTHETIC ESSAY · 美学专题</p><h1 className="max-w-5xl font-serif text-4xl leading-tight sm:text-6xl">{topic.title}</h1><p className="mt-6 max-w-3xl text-base leading-8 text-muted sm:text-lg">{topic.excerpt}</p><p className="mt-8 text-xs tracking-wider text-muted">{topic.author} · {topic.publishedAt} · {topic.readTime}</p></header>
    <div className="relative aspect-[16/8] min-h-64 w-full overflow-hidden border-y border-line"><Image src={cover.image} alt={`专题封面：${cover.alt}`} fill loading="eager" sizes="100vw" className="object-cover" /></div>
    <div className="site-container"><article className="prose-jj mx-auto max-w-3xl py-12 sm:py-20"><p className="border-l border-gold pl-5 font-serif text-xl leading-9 text-paper">视觉分析不是为画面贴上答案，而是辨认形式如何安排我们的注意力、距离感与时间感。</p><div className="not-prose mt-8 grid grid-cols-3 gap-px border border-line bg-line text-center"><div className="bg-panel p-4"><strong className="block font-serif text-xl text-gold">{topic.sections.length}</strong><span className="text-[10px] text-muted">章节</span></div><div className="bg-panel p-4"><strong className="block font-serif text-xl text-gold">{topic.sections.filter((section) => section.frameId).length}</strong><span className="text-[10px] text-muted">画面案例</span></div><div className="bg-panel p-4"><strong className="block font-serif text-xl text-gold">{topic.readTime.replace(" 分钟", "")}</strong><span className="text-[10px] text-muted">分钟阅读</span></div></div>{topic.sections.map((section) => { const frame = section.frameId ? getFrame(section.frameId) : undefined; const film = frame ? getFilm(frame.filmSlug) : undefined; return <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{frame && <figure className="my-10"><Link href={`/frames/${frame.slug}`} className="image-frame block aspect-video overflow-hidden"><Image src={frame.image} alt={frame.alt} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover transition duration-700 hover:scale-[1.02]" /></Link><figcaption className="mt-4 text-sm leading-6 text-muted">《{film?.title}》· {frame.title}：{frame.analysis.slice(0, 82)}……</figcaption><CopyrightLine info={frame.copyright} /></figure>}</section>; })}<div className="mt-14 border border-line bg-panel p-6 text-sm leading-7 text-muted">本文示例作品与图片均为镜间原创虚构内容，用于说明电影视觉语言，不对应真实影片或演员。引用本文观点时，请注明“镜间”及本页面链接。</div></article>
      <section className="border-t border-line py-14"><p className="section-kicker">RELATED · 相关文章</p><div className="grid gap-x-12 lg:grid-cols-2">{related.map((item) => <TopicCard key={item.slug} topic={item} />)}</div></section>
    </div>
  </>;
}
