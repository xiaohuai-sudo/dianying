import type { Metadata } from "next";
import Link from "next/link";
import { TopicCard } from "@/components/Cards";
import { publicFrames, topics } from "@/lib/data";

export const metadata: Metadata = { title: "美学专题", description: "围绕色彩、构图、光线与空间的中文电影美学专题。" };
const readingPaths = [
  { title: "从色彩进入", note: "先辨认颜色如何分配注意力，再讨论情绪。", ids: ["warm-yellow", "red-danger", "warm-cool-attention"] },
  { title: "从空间进入", note: "把人物关系还原为距离、边界与可达性。", ids: ["framing-relationships", "negative-space", "depth-and-blocking", "centered-composition"] },
  { title: "从光线与镜头进入", note: "理解信息何时显露，以及观看距离为何改变。", ids: ["rain-night-light", "natural-light-time", "low-key-information", "close-up-without-dialogue"] },
];

export default function TopicsPage() {
  const orderedTopics = [...topics].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return <div className="site-container py-12 sm:py-16">
    <p className="section-kicker">ESSAYS · 美学专题</p><div className="grid gap-8 lg:grid-cols-[1fr_.65fr] lg:items-end"><div><h1 className="section-title">建立自己的视觉词汇</h1><p className="section-intro">{topics.length} 个主题，从一条清晰的问题出发，连接具体画面、创作方法与可操作练习。</p></div><div className="grid grid-cols-3 gap-px border border-line bg-line text-center"><div className="bg-panel p-4"><strong className="block font-serif text-2xl text-gold">{topics.length}</strong><span className="text-[10px] text-muted">专题</span></div><div className="bg-panel p-4"><strong className="block font-serif text-2xl text-gold">3</strong><span className="text-[10px] text-muted">阅读路径</span></div><div className="bg-panel p-4"><strong className="block font-serif text-2xl text-gold">{publicFrames.length}</strong><span className="text-[10px] text-muted">画面实例</span></div></div></div>
    <section className="mt-12"><p className="text-xs tracking-[.22em] text-gold">READING PATHS · 主题阅读路径</p><div className="mt-5 grid gap-px border border-line bg-line lg:grid-cols-3">{readingPaths.map((path) => <div key={path.title} className="bg-ink p-6"><h2 className="font-serif text-xl">{path.title}</h2><p className="mt-3 text-sm leading-6 text-muted">{path.note}</p><ol className="mt-5 space-y-2">{path.ids.map((id, index) => { const topic = topics.find((item) => item.slug === id); return topic ? <li key={id}><Link href={`/topics/${id}`} className="text-sm text-[#d7d1c7] hover:text-gold"><span className="mr-2 text-xs text-muted">{index + 1}.</span>{topic.title}</Link></li> : null; })}</ol></div>)}</div></section>
    <section className="mt-16"><p className="section-kicker">LATEST ESSAYS · 全部专题</p><div className="mt-4 grid gap-x-12 lg:grid-cols-2">{orderedTopics.map((topic) => <TopicCard key={topic.slug} topic={topic} />)}</div></section>
  </div>;
}
