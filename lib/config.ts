export const SITE = {
  name: "镜间",
  description: "中文电影视觉语言与美学分析平台",
  tagline: "从一帧画面，读懂电影的视觉语言。",
  rightsEmail: process.env.NEXT_PUBLIC_RIGHTS_EMAIL || "rights@jingjian.example",
  year: 2026,
};

export const IS_PLACEHOLDER_EMAIL = SITE.rightsEmail.endsWith(".example");
