"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/types";

export function HtmlLocaleSync({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.setAttribute("lang", locale === "zh" ? "zh-CN" : "en");
    document.cookie = `jingjian-locale=${locale};path=/;max-age=31536000;samesite=lax`;
    window.localStorage.setItem("jingjian-locale", locale);
  }, [locale]);
  return null;
}
