import type { Metadata } from "next";
import { BoardManager } from "@/components/BoardManager";
export const metadata: Metadata = { title: "收藏与灵感板", description: "在本机浏览器中整理你的电影视觉参考。" };
export default function BoardsPage() { return <div className="site-container py-12 sm:py-16"><p className="section-kicker">INSPIRATION BOARDS · 本地收藏</p><h1 className="section-title">收藏与灵感板</h1><p className="section-intro mb-10">无需登录。收藏仅保存在当前浏览器，清理浏览器数据后将无法恢复。</p><BoardManager /></div>; }
