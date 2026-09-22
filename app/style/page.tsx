import type { Metadata } from "next";
import { StyleReader } from "@/components/StyleReader";

export const metadata: Metadata = { title: "风格诊断", description: "上传自己的画面，在浏览器本地分析影调与色彩结构，对照导演与摄影指导的风格档案，得到差距清单与可复制的生成提示词。", alternates: { canonical: "/zh/style/" } };

export default function StylePage() {
  return <><header className="border-b border-line bg-panel/30"><div className="site-container py-12 sm:py-16"><p className="section-kicker">STYLE READER · 风格诊断</p><h1 className="section-title">风格诊断</h1><p className="section-intro">用自己的画面，对照导演与摄影指导的视觉语言，得到差距清单与可复制的生成提示词。分析在你的浏览器里完成，图片不会上传。</p></div></header><StyleReader /></>;
}
