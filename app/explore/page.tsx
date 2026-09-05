import { Suspense } from "react";
import type { Metadata } from "next";
import { ExploreGrid } from "@/components/ExploreGrid";
import Link from "next/link";

export const metadata: Metadata = { title: "探索画面", description: "按色彩、构图、景别、光线、场景与情绪探索原创电影感画面。" };

export default function ExplorePage() { return <div className="site-container py-12 sm:py-16"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="section-kicker">EXPLORE · 探索</p><h1 className="section-title">探索画面</h1><p className="section-intro">从标签进入画面，但不止步于标签。每一帧都附有色彩、空间与叙事关系的原创分析。</p></div><Link href="/visual-index" className="button-secondary whitespace-nowrap">先读视觉语言索引</Link></div><div className="mb-10 mt-8 border-y border-line py-4 text-xs leading-6 text-muted">不知道从哪里开始？先选择一种情绪，再叠加一个构图或光线条件；或者到视觉索引中理解 36 个核心词条。</div><Suspense fallback={<p className="text-muted">正在载入画面…</p>}><ExploreGrid /></Suspense></div>; }
