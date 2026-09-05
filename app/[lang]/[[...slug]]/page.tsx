import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { films, getFilm, getFrame, getTopic, publicFrames, topics } from "@/lib/data";
import { isLocale, localizeFilm, localizeTopic, locales, withLocale } from "@/lib/i18n";
import { visualIndex } from "@/lib/visual-index";
import {
  AboutView, BoardsView, CompareView, CopyrightView, ExploreView, FilmDetailView, FilmsView,
  FrameDetailView, HomeView, RightsView, TopicDetailView, TopicsView, VisualIndexView, VisualTermView,
} from "@/components/LocalizedViews";

type Props = { params: Promise<{ lang: string; slug?: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

function pageTitle(locale: "zh" | "en", slug: string[]) {
  if (!slug.length) return locale === "zh" ? "镜间｜电影视觉语言与美学分析" : "Jingjian | Cinematic Visual Language";
  if (slug[0] === "explore") return locale === "zh" ? "探索画面｜镜间" : "Explore Frames | Jingjian";
  if (slug[0] === "visual-index") return locale === "zh" ? "视觉语言索引｜镜间" : "Visual Language Index | Jingjian";
  if (slug[0] === "films" && slug[1]) { const film = getFilm(slug[1]); if (film) return `${localizeFilm(film, locale).title} | Jingjian`; }
  if (slug[0] === "frames" && slug[1]) { const frame = getFrame(slug[1]); if (frame) return `${locale === "zh" ? frame.title : frame.slug.split("-").join(" ")} | Jingjian`; }
  if (slug[0] === "topics" && slug[1]) { const topic = getTopic(slug[1]); if (topic) return `${localizeTopic(topic, locale).title} | Jingjian`; }
  const names: Record<string, [string, string]> = { films: ["虚构电影", "Fictional Films"], topics: ["美学专题", "Visual Essays"], boards: ["灵感板", "Inspiration Boards"], compare: ["画面对比", "Frame Comparison"], about: ["关于本站", "About"], copyright: ["版权说明", "Copyright"], rights: ["权利人联系", "Rights Contact"] };
  return names[slug[0]]?.[locale === "zh" ? 0 : 1] ?? "Jingjian";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug = [] } = await params; const locale = isLocale(lang) ? lang : "zh"; const tail = slug.length ? `/${slug.join("/")}` : "";
  return { title: pageTitle(locale, slug), description: locale === "zh" ? "从色彩、构图、光影、空间与情绪读懂电影视觉语言。" : "Read cinematic visual language through color, composition, light, space and emotion.", alternates: { canonical: withLocale(locale, tail || "/"), languages: { "zh-CN": withLocale("zh", tail || "/"), en: withLocale("en", tail || "/") } } };
}

export function generateStaticParams() {
  const base = [[], ["explore"], ["films"], ["topics"], ["visual-index"], ["boards"], ["compare"], ["about"], ["copyright"], ["rights"]];
  const paths = [...base, ...films.map((film) => ["films", film.slug]), ...publicFrames.map((frame) => ["frames", frame.slug]), ...topics.map((topic) => ["topics", topic.slug]), ...visualIndex.flatMap((group) => group.terms.map((term) => ["visual-index", group.slug, term.filterValue]))];
  return locales.flatMap((lang) => paths.map((slug) => ({ lang, slug })));
}

export default async function LocalizedPage({ params, searchParams }: Props) {
  const { lang, slug = [] } = await params; if (!isLocale(lang)) notFound(); const query = await searchParams; const [section, item, term] = slug;
  if (!section) return <HomeView locale={lang} />;
  if (section === "explore" && !item) return <ExploreView locale={lang} />;
  if (section === "films" && !item) return <FilmsView locale={lang} />;
  if (section === "films" && item && getFilm(item)) return <FilmDetailView locale={lang} slug={item} />;
  if (section === "frames" && item && getFrame(item)) return <FrameDetailView locale={lang} slug={item} />;
  if (section === "topics" && !item) return <TopicsView locale={lang} />;
  if (section === "topics" && item && getTopic(item)) return <TopicDetailView locale={lang} slug={item} />;
  if (section === "visual-index" && !item) return <VisualIndexView locale={lang} />;
  if (section === "visual-index" && item && term) return <VisualTermView locale={lang} groupSlug={item} termValue={term} />;
  if (section === "compare" && !item) { const value = Array.isArray(query.frames) ? query.frames[0] : query.frames; return <CompareView locale={lang} ids={value?.split(",").filter(Boolean) ?? []} />; }
  if (section === "boards" && !item) return <BoardsView locale={lang} />;
  if (section === "about" && !item) return <AboutView locale={lang} />;
  if (section === "copyright" && !item) return <CopyrightView locale={lang} />;
  if (section === "rights" && !item) return <RightsView locale={lang} />;
  notFound();
}
