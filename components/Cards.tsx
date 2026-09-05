import Image from "next/image";
import Link from "next/link";
import type { Film, Frame, Topic } from "@/lib/types";
import { films, getFilm, getFrame } from "@/lib/data";
import { CopyrightBadge } from "./Copyright";
import { FavoriteButton } from "./FavoriteButton";
import { CompareButton } from "./CompareProvider";
import { displayTag, frameReading, localizeFilm, localizeTopic, withLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function Tag({ children }: { children: React.ReactNode }) { return <span className="tag">{children}</span>; }

export function FrameCard({ frame, priority = false, locale = "zh", reason }: { frame: Frame; priority?: boolean; locale?: Locale; reason?: string }) {
  const film = getFilm(frame.filmSlug);
  const localizedFilm = film ? localizeFilm(film, locale) : undefined;
  const reading = frameReading(frame, locale);
  return <article className="group relative">
    <Link href={withLocale(locale, `/frames/${frame.slug}`)} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
      <div className="image-frame aspect-video overflow-hidden bg-panel"><Image src={frame.image} alt={reading.alt} fill loading={priority ? "eager" : "lazy"} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]" /><div className="absolute left-3 top-3"><CopyrightBadge info={frame.copyright} locale={locale} /></div></div>
      <div className="mt-4 flex items-start justify-between gap-3"><div><h3 className="font-serif text-xl text-paper transition group-hover:text-gold">{reading.title}</h3><p className="mt-1 text-sm text-muted">{localizedFilm ? (locale === "zh" ? `《${localizedFilm.title}》` : localizedFilm.title) : ""} · {film?.year}</p></div></div>
      {reason && <p className="mt-3 text-xs text-gold">{reason}</p>}
      <div className="mt-3 flex flex-wrap gap-2">{[frame.colors[0], frame.compositions[0], frame.moods[0]].map((tag) => <Tag key={tag}>{displayTag(tag, locale)}</Tag>)}</div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#b8b6b0]">{reading.summary}</p>
    </Link>
    <div className="absolute right-2 top-2 flex flex-col gap-2"><FavoriteButton frameId={frame.slug} compact locale={locale} /><CompareButton frameId={frame.slug} compact /></div>
  </article>;
}

export function FilmCard({ film, locale = "zh" }: { film: Film; locale?: Locale }) {
  const cover = getFrame(film.frameIds[0]);
  if (!cover) return null;
  const item = localizeFilm(film, locale);
  const reading = frameReading(cover, locale);
  return <Link href={withLocale(locale, `/films/${film.slug}`)} className="group block">
    <div className="image-frame aspect-[4/3] overflow-hidden"><Image src={cover.image} alt={locale === "zh" ? `${film.title}虚构作品代表画面：${cover.alt}` : `Representative original frame for ${item.title}: ${reading.alt}`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" /></div>
    <p className="mt-4 text-xs uppercase tracking-[.18em] text-gold">{film.englishTitle} · {film.year}</p>
    <h3 className="mt-2 font-serif text-2xl text-paper group-hover:text-gold">{locale === "zh" ? `《${item.title}》` : item.title}</h3>
    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{item.visualStyle}</p>
  </Link>;
}

export function TopicCard({ topic, locale = "zh" }: { topic: Topic; locale?: Locale }) {
  const cover = getFrame(topic.coverFrameId);
  if (!cover) return null;
  const item = localizeTopic(topic, locale);
  return <Link href={withLocale(locale, `/topics/${topic.slug}`)} className="group grid gap-5 border-t border-line py-7 sm:grid-cols-[11rem_1fr]">
    <div className="image-frame aspect-video overflow-hidden sm:aspect-[4/3]"><Image src={cover.image} alt={locale === "zh" ? `${topic.title}专题封面：${cover.alt}` : `${item.title} feature cover`} fill sizes="(max-width: 640px) 100vw, 180px" className="object-cover transition duration-700 group-hover:scale-[1.025]" /></div>
    <div><p className="text-xs tracking-widest text-gold">{locale === "zh" ? "美学专题" : item.category.toUpperCase()} · {item.readTime}</p><h3 className="mt-2 font-serif text-xl leading-snug text-paper transition group-hover:text-gold sm:text-2xl">{item.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">{item.excerpt}</p><p className="mt-4 text-xs text-muted">{item.author} · {item.publishedAt}</p></div>
  </Link>;
}

export function ColorPalette({ colors, labeled = false, locale = "zh" }: { colors: string[]; labeled?: boolean; locale?: Locale }) {
  return <div className="flex min-h-16 overflow-hidden border border-line" aria-label={locale === "zh" ? "主要色卡" : "Primary color palette"}>{colors.map((color) => <div key={color} className="group/color relative flex min-w-0 flex-1 items-end p-2" style={{ backgroundColor: color }}><span className={`${labeled ? "opacity-100" : "opacity-0 group-hover/color:opacity-100"} rounded-sm bg-black/55 px-1.5 py-1 text-[10px] text-white transition-opacity`}>{color}</span></div>)}</div>;
}

export function FilmIndex({ locale = "zh" }: { locale?: Locale }) { return <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{films.map((film) => <FilmCard key={film.slug} film={film} locale={locale} />)}</div>; }
