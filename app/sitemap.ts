import type { MetadataRoute } from "next";
import { films, publicFrames, topics } from "@/lib/data";
import { visualIndex } from "@/lib/visual-index";
import { locales } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/config";

export const dynamic = "force-static";

/** Static export publishes both the default (unprefixed) tree and /zh, /en — list them all. */
const staticPaths = ["", "/explore", "/films", "/topics", "/visual-index", "/boards", "/compare", "/about", "/copyright", "/rights"];
const priorityFor = (path: string) => (path === "" ? 1 : path.split("/").length === 2 ? 0.8 : 0.6);
const rounded = (value: number) => Math.round(value * 10) / 10;
const trailing = (path: string) => (path === "" ? "/" : `${path}/`);

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paths = [...staticPaths, ...dynamicPaths()];
  const localized = locales.flatMap((locale) => paths.map((path) => ({
    url: absoluteUrl(`/${locale}${trailing(path)}`),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: priorityFor(path),
  })));
  const root = paths.map((path) => ({
    url: absoluteUrl(trailing(path)),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: rounded(Math.max(0.3, priorityFor(path) - 0.2)),
  }));
  return [...root, ...localized];
}

function dynamicPaths() {
  return [
    ...films.map((film) => `/films/${film.slug}`),
    ...publicFrames.map((frame) => `/frames/${frame.slug}`),
    ...topics.map((topic) => `/topics/${topic.slug}`),
    ...visualIndex.flatMap((group) => group.terms.map((term) => `/visual-index/${group.slug}/${encodeURIComponent(term.filterValue)}`)),
  ];
}
