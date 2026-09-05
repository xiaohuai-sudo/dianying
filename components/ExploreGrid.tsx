"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { filterGroups, getFilm, publicFrames } from "@/lib/data";
import { copy, displayTag, frameReading } from "@/lib/i18n";
import type { FilterKey, FilterState, Frame, Locale } from "@/lib/types";
import { FrameCard } from "./Cards";

const PAGE_SIZE = 30;
const emptyFilters = (): FilterState => ({ colors: [], compositions: [], shotSize: [], lights: [], scenes: [], moods: [], time: [], region: [], decade: [] });
type SortMode = "curated" | "newest" | "warm" | "light" | "people";

function frameValues(frame: Frame, key: FilterKey): string[] { const value = frame[key]; return Array.isArray(value) ? value : [value]; }
function curated(frames: Frame[]) {
  const buckets = new Map<string, Frame[]>();
  frames.forEach((frame) => buckets.set(frame.filmSlug, [...(buckets.get(frame.filmSlug) ?? []), frame]));
  const output: Frame[] = [];
  let index = 0;
  while (output.length < frames.length) { for (const bucket of buckets.values()) if (bucket[index]) output.push(bucket[index]); index += 1; }
  return output;
}

export function ExploreGrid({ locale = "zh" }: { locale?: Locale }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const resultTop = useRef<HTMLDivElement>(null);
  const closeFiltersButton = useRef<HTMLButtonElement>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!filtersOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setFiltersOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    const timer = window.setTimeout(() => closeFiltersButton.current?.focus(), 0);
    return () => { document.removeEventListener("keydown", closeOnEscape); window.clearTimeout(timer); };
  }, [filtersOpen]);
  const filters = useMemo(() => {
    const next = emptyFilters();
    filterGroups.forEach(({ key, options }) => {
      const values = searchParams.getAll(key).flatMap((item) => item.split(",")).filter((item) => options.includes(item));
      next[key] = [...new Set(values)];
    });
    return next;
  }, [searchParams]);
  const query = searchParams.get("q")?.trim() ?? "";
  const sort = (searchParams.get("sort") as SortMode) || "curated";
  const limit = Math.max(PAGE_SIZE, Number(searchParams.get("limit")) || PAGE_SIZE);
  const active = filterGroups.flatMap(({ key }) => filters[key].map((value) => ({ key, value })));

  const replaceParams = (mutate: (params: URLSearchParams) => void, reset = true) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    if (reset) params.delete("limit");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    if (reset) window.requestAnimationFrame(() => resultTop.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const toggle = (key: FilterKey, value: string) => replaceParams((params) => {
    const values = params.getAll(key).flatMap((item) => item.split(",")).filter(Boolean);
    params.delete(key);
    const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
    next.forEach((item) => params.append(key, item));
  });
  const clear = () => replaceParams((params) => { [...filterGroups.map((group) => group.key), "q", "sort"].forEach((key) => params.delete(key)); });

  const results = useMemo(() => {
    const needle = query.toLocaleLowerCase(locale === "zh" ? "zh-CN" : "en");
    let next = publicFrames.filter((frame) => filterGroups.every(({ key }) => filters[key].length === 0 || filters[key].some((value) => frameValues(frame, key).includes(value))));
    if (needle) next = next.filter((frame) => {
      const film = getFilm(frame.filmSlug);
      const reading = frameReading(frame, locale);
      const searchText = [reading.title, reading.summary, reading.techniqueIntent, film?.title, film?.englishTitle, ...frame.colors, ...frame.compositions, ...frame.lights, ...frame.scenes, ...frame.moods, ...frame.colors.map((item) => displayTag(item, "en")), ...frame.compositions.map((item) => displayTag(item, "en")), ...frame.lights.map((item) => displayTag(item, "en"))].join(" ").toLocaleLowerCase(locale === "zh" ? "zh-CN" : "en");
      return searchText.includes(needle);
    });
    if (sort === "newest") next = [...next].sort((a, b) => (getFilm(b.filmSlug)?.year ?? 0) - (getFilm(a.filmSlug)?.year ?? 0));
    else if (sort === "warm") next = [...next].sort((a, b) => Number(b.colors.includes("暖黄")) + Number(b.moods.includes("温暖")) + Number(b.moods.includes("浪漫")) - Number(a.colors.includes("暖黄")) - Number(a.moods.includes("温暖")) - Number(a.moods.includes("浪漫")));
    else if (sort === "light") next = [...next].sort((a, b) => b.lights.length + Number(b.colors.includes("高对比")) - a.lights.length - Number(a.colors.includes("高对比")));
    else if (sort === "people") next = [...next].sort((a, b) => Number(!b.subjectPosition.includes("无人")) + Number(b.moods.includes("温暖")) - Number(!a.subjectPosition.includes("无人")) - Number(a.moods.includes("温暖")));
    else next = curated(next);
    return next;
  }, [filters, locale, query, sort]);
  const visible = results.slice(0, limit);

  const filterContent = <><div className="flex items-center justify-between"><h2 className="font-serif text-lg">{copy[locale].filters}</h2>{active.length > 0 && <button type="button" onClick={clear} className="min-h-11 text-xs text-gold underline underline-offset-4">{locale === "zh" ? "清除全部" : "Clear all"}</button>}</div><div className="mt-3 divide-y divide-line">{filterGroups.map((group) => <fieldset key={group.key} className="py-5"><legend className="mb-3 text-xs tracking-widest text-[#aaa8a2]">{locale === "zh" ? group.label : ({ colors: "COLOR", compositions: "COMPOSITION", shotSize: "SHOT SIZE", lights: "LIGHT", scenes: "SCENE", moods: "MOOD", time: "TIME", region: "REGION", decade: "DECADE" } as Record<FilterKey, string>)[group.key]}</legend><div className="flex flex-wrap gap-2">{group.options.map((option) => { const checked = filters[group.key].includes(option); return <label key={option} className={`cursor-pointer border px-3 py-2 text-xs transition ${checked ? "border-gold bg-gold text-ink" : "border-line text-[#b8b6b0] hover:border-muted hover:text-paper"}`}><input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(group.key, option)} />{displayTag(option, locale)}</label>; })}</div></fieldset>)}</div></>;
  const sortOptions: { value: SortMode; zh: string; en: string }[] = [{ value: "curated", zh: "精选混排", en: "Curated mix" }, { value: "newest", zh: "最新作品", en: "Newest" }, { value: "warm", zh: "暖色情感", en: "Warm & tender" }, { value: "light", zh: "光影技巧", en: "Lighting craft" }, { value: "people", zh: "人物互动", en: "Human connection" }];

  return <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
    <div><button type="button" onClick={() => setFiltersOpen(true)} aria-expanded={filtersOpen} className="button-secondary w-full justify-between lg:hidden"><span>{copy[locale].filters}</span><span>{active.length ? `${active.length}` : (locale === "zh" ? "展开" : "Open")}</span></button>
      <aside className="hidden border border-line bg-panel p-5 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto" aria-label={copy[locale].filters}>{filterContent}</aside>
      {filtersOpen && <div className="fixed inset-0 z-[70] bg-black/70 lg:hidden" onClick={() => setFiltersOpen(false)}><aside role="dialog" aria-modal="true" aria-label={copy[locale].filters} className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto border-t border-gold/50 bg-panel p-5" onClick={(event) => event.stopPropagation()}><div className="mb-2 flex justify-end"><button ref={closeFiltersButton} type="button" onClick={() => setFiltersOpen(false)} className="button-secondary px-4">{copy[locale].close}</button></div>{filterContent}<button type="button" onClick={() => setFiltersOpen(false)} className="button-primary sticky bottom-3 mt-4 w-full">{locale === "zh" ? `查看 ${results.length} 个结果` : `View ${results.length} results`}</button></aside></div>}
    </div>
    <div ref={resultTop} className="scroll-mt-24">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]"><label className="sr-only" htmlFor="frame-search">{copy[locale].search}</label><input id="frame-search" type="search" value={query} onChange={(event) => replaceParams((params) => { if (event.target.value) params.set("q", event.target.value); else params.delete("q"); })} placeholder={copy[locale].search} className="form-field min-h-12" /><label className="sr-only" htmlFor="frame-sort">{locale === "zh" ? "排序" : "Sort"}</label><select id="frame-sort" value={sort} onChange={(event) => replaceParams((params) => params.set("sort", event.target.value))} className="form-field min-h-12 sm:w-44">{sortOptions.map((option) => <option key={option.value} value={option.value}>{option[locale]}</option>)}</select></div>
      <div className="mt-6 flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-end"><div><p className="text-sm text-[#aaa8a2]" aria-live="polite">{locale === "zh" ? "共找到" : "Found"} <span className="text-xl text-paper">{results.length}</span> {copy[locale].results}</p>{active.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{active.map(({ key, value }) => <button type="button" key={`${key}-${value}`} onClick={() => toggle(key, value)} className="tag min-h-9 hover:border-gold hover:text-gold">{displayTag(value, locale)} ×</button>)}</div>}</div><p className="text-xs leading-5 text-[#aaa8a2]">{locale === "zh" ? "同类任一匹配 · 跨类同时匹配" : "OR within groups · AND across groups"}</p></div>
      {results.length > 0 ? <><div className="mt-8 grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">{visible.map((item, index) => <FrameCard key={item.slug} frame={item} locale={locale} priority={index < 3} />)}</div>{visible.length < results.length && <div className="mt-14 text-center"><button type="button" onClick={() => replaceParams((params) => params.set("limit", String(limit + PAGE_SIZE)), false)} className="button-secondary min-w-44">{copy[locale].loadMore} · {visible.length}/{results.length}</button></div>}</> : <div className="mt-8 border border-dashed border-line py-20 text-center"><p className="font-serif text-2xl">{locale === "zh" ? "没有符合条件的画面" : "No frames match"}</p><p className="mt-3 text-sm text-muted">{locale === "zh" ? "减少一个筛选条件，或重新开始。" : "Remove a filter or begin again."}</p><button type="button" onClick={clear} className="button-secondary mt-6">{locale === "zh" ? "清除筛选" : "Clear filters"}</button></div>}
    </div>
  </div>;
}
