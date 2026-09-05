"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { publicFrames } from "@/lib/data";
import { useBoards } from "./BoardProvider";
import { Tag } from "./Cards";
import type { Locale } from "@/lib/types";
import { displayTag, frameReading, withLocale } from "@/lib/i18n";

export function BoardManager({ locale = "zh" }: { locale?: Locale }) {
  const { boards, activeBoard, hydrated, setActiveBoard, createBoard, renameBoard, deleteBoard, removeFrame, moveFrame } = useBoards();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const items = activeBoard.frameIds.map((id) => publicFrames.find((frame) => frame.slug === id)).filter((frame): frame is NonNullable<typeof frame> => Boolean(frame));

  const submitNew = (event: FormEvent) => { event.preventDefault(); if (newName.trim()) { createBoard(newName); setNewName(""); } };
  if (!hydrated) return <div className="border border-line p-10 text-sm text-muted">{locale === "zh" ? "正在读取浏览器中的灵感板…" : "Loading boards from this browser…"}</div>;
  return <div className="grid gap-10 lg:grid-cols-[15rem_1fr]">
    <aside>
      <form onSubmit={submitNew} className="border border-line bg-panel p-4"><label htmlFor="new-board" className="text-xs tracking-wider text-muted">{locale === "zh" ? "创建灵感板" : "Create a board"}</label><input id="new-board" value={newName} onChange={(event) => setNewName(event.target.value)} maxLength={30} placeholder={locale === "zh" ? "例如：雨夜参考" : "e.g. Rain-night references"} className="form-field mt-3" /><button className="button-primary mt-3 w-full" type="submit">{locale === "zh" ? "创建" : "Create"}</button></form>
      <div className="mt-5 border-y border-line">{boards.map((board) => <button type="button" key={board.id} onClick={() => { setActiveBoard(board.id); setEditing(false); }} className={`flex w-full items-center justify-between border-b border-line px-3 py-4 text-left text-sm transition ${board.id === activeBoard.id ? "bg-gold text-ink" : "text-muted hover:bg-panel hover:text-paper"}`}><span className="truncate">{board.name}</span><span className="ml-2 text-xs">{board.frameIds.length}</span></button>)}</div>
    </aside>
    <section>
      <div className="flex flex-col justify-between gap-5 border-b border-line pb-6 sm:flex-row sm:items-end"><div><p className="text-xs tracking-widest text-gold">{locale === "zh" ? "当前灵感板" : "ACTIVE BOARD"}</p>{editing ? <form onSubmit={(event) => { event.preventDefault(); renameBoard(activeBoard.id, editName); setEditing(false); }} className="mt-3 flex gap-2"><input autoFocus value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={30} className="form-field" aria-label={locale === "zh" ? "灵感板新名称" : "New board name"} /><button type="submit" className="button-primary">{locale === "zh" ? "保存" : "Save"}</button></form> : <h2 className="mt-2 font-serif text-3xl">{activeBoard.name}</h2>}<p className="mt-2 text-sm text-muted">{items.length} {locale === "zh" ? "个画面 · 顺序保存在本机浏览器" : "frames · order saved in this browser"}</p></div><div className="flex gap-3"><button type="button" onClick={() => { setEditName(activeBoard.name); setEditing(true); }} className="button-secondary">{locale === "zh" ? "重命名" : "Rename"}</button><button type="button" onClick={() => { if (window.confirm(locale === "zh" ? `确定删除「${activeBoard.name}」吗？` : `Delete “${activeBoard.name}”?`)) deleteBoard(activeBoard.id); }} className="button-secondary border-ember/60 text-[#dc8174]">{locale === "zh" ? "删除" : "Delete"}</button></div></div>
      {items.length === 0 ? <div className="mt-8 border border-dashed border-line py-20 text-center"><p className="font-serif text-2xl">{locale === "zh" ? "这块灵感板还是空的" : "This board is empty"}</p><p className="mt-3 text-sm text-muted">{locale === "zh" ? "浏览画面时点击心形按钮，即可收藏到当前灵感板。" : "Use the heart button while browsing to save a frame here."}</p><Link href={withLocale(locale, "/explore")} className="button-primary mt-6">{locale === "zh" ? "开始探索" : "Start exploring"}</Link></div> : <ol className="mt-8 space-y-5">{items.map((frame, index) => { const reading = frameReading(frame, locale); return <li key={frame.slug} className="grid gap-5 border border-line bg-panel p-4 sm:grid-cols-[12rem_1fr_auto] sm:items-center"><Link href={withLocale(locale, `/frames/${frame.slug}`)} className="image-frame aspect-video overflow-hidden"><Image src={frame.image} alt={reading.alt} fill sizes="192px" className="object-cover" /></Link><div><p className="text-xs text-gold">{String(index + 1).padStart(2, "0")}</p><Link href={withLocale(locale, `/frames/${frame.slug}`)} className="mt-1 block font-serif text-xl hover:text-gold">{reading.title}</Link><div className="mt-3 flex flex-wrap gap-2">{[frame.colors[0], frame.compositions[0], frame.moods[0]].map((tag) => <Tag key={tag}>{displayTag(tag, locale)}</Tag>)}</div></div><div className="flex gap-2 sm:flex-col"><button type="button" disabled={index === 0} onClick={() => moveFrame(activeBoard.id, frame.slug, -1)} className="button-secondary min-h-11 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`${locale === "zh" ? "上移" : "Move up"} ${reading.title}`}>↑</button><button type="button" disabled={index === items.length - 1} onClick={() => moveFrame(activeBoard.id, frame.slug, 1)} className="button-secondary min-h-11 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`${locale === "zh" ? "下移" : "Move down"} ${reading.title}`}>↓</button><button type="button" onClick={() => removeFrame(activeBoard.id, frame.slug)} className="button-secondary min-h-11 px-3 py-2 text-[#dc8174]" aria-label={`${locale === "zh" ? "从灵感板移除" : "Remove"} ${reading.title}`}>×</button></div></li>; })}</ol>}
    </section>
  </div>;
}
