import type { Metadata } from "next";
import { FilmIndex } from "@/components/Cards";
export const metadata: Metadata = { title: "虚构电影档案", description: "六部为镜间初版创作的虚构电影视觉档案。" };
export default function FilmsPage() { return <div className="site-container py-12 sm:py-16"><p className="section-kicker">FILM ARCHIVE · 作品档案</p><h1 className="section-title">六部虚构电影</h1><p className="section-intro mb-11">从茶馆、雨巷到空放映厅：作品与图片均为展示分析方法而创作，不对应任何真实影片。</p><FilmIndex /></div>; }
