import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "关于本站" };

const methods = [
  ["01", "色彩", "观察主色、色温、饱和度与色彩面积，避免把颜色直接翻译成固定情绪。"],
  ["02", "构图", "分析主体位置、空间分割、视觉动线与画外区域如何组织人物关系。"],
  ["03", "光影", "辨认光源方向、软硬、反差与动机，理解可见和不可见如何参与叙事。"],
  ["04", "空间", "从景别、纵深、框架和留白进入画面，感受人物与环境的力量比例。"],
  ["05", "景别", "比较观看距离如何改变信息压力，让环境、动作或细节在正确时刻成为主体。"],
  ["06", "情绪", "拒绝把形式翻译成固定答案，追踪多种视觉条件如何共同产生观看感受。"],
];

export default function AboutPage() {
  return (
    <div className="site-container py-12 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
        <div><p className="section-kicker">ABOUT · 关于镜间</p><h1 className="section-title">观看，不止是辨认内容</h1></div>
        <div>
          <p className="font-serif text-2xl leading-relaxed text-paper sm:text-3xl">镜间是一个中文电影视觉语言与美学分析项目。我们从单个画面出发，解释颜色、构图、光线和空间怎样改变情绪，并推动叙事。</p>
          <p className="mt-7 text-sm leading-8 text-muted">网站面向影视、摄影、动画与视觉传达专业学生，也面向导演、摄影师、设计师和认真观看电影的普通观众。初版不提供电影原图下载，而是把画面作为分析对象，帮助创作者建立能够描述、比较和迁移的视觉词汇。</p>
        </div>
      </div>
      <section className="section">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="section-kicker">METHOD · 分析方法</p><h2 className="section-title">六个互相连接的维度</h2></div>
          <Link href="/visual-index" className="text-sm text-gold">查阅 36 个视觉词条 →</Link>
        </div>
        <div className="mt-7 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {methods.map(([number, title, body]) => <div key={number} className="bg-ink p-7"><span className="text-xs text-gold">{number}</span><h2 className="mt-5 font-serif text-2xl">{title}</h2><p className="mt-3 text-sm leading-7 text-muted">{body}</p></div>)}
        </div>
      </section>
      <section className="border-y border-line py-12">
        <h2 className="font-serif text-2xl">关于当前演示内容</h2>
        <p className="mt-5 max-w-4xl text-sm leading-8 text-muted">当前六部电影、主创姓名、故事梗概及 200 张画面全部为网站功能演示而创作，并经过内容与版权字段审核；它们不模仿或复现具体影片，不使用真实演员、真实电影名称、角色或受保护标志。</p>
        <div className="mt-7 flex flex-wrap gap-4"><Link href="/explore" className="button-primary">开始探索</Link><Link href="/copyright" className="button-secondary">版权与使用说明</Link></div>
      </section>
    </div>
  );
}
