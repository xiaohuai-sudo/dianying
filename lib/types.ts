export type CopyrightStatus = "本站原创" | "已获授权" | "公有领域" | "开放许可" | "待版权审核";
export type ReviewStatus = "审核通过" | "待审核" | "暂时隐藏";

export type Locale = "zh" | "en";
export type LocalizedText = { zh: string; en: string };

export type AnnotationKind = "thirds" | "center" | "frame" | "depth" | "focus" | "light" | "subject" | "negative";

export interface FrameAnnotation {
  id: string;
  kind: AnnotationKind;
  label: LocalizedText;
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  width?: number;
  height?: number;
}

export interface FrameReading {
  title: string;
  alt: string;
  summary: string;
  techniqueIntent: string;
  narrativeEffect: string;
  watchFor: string;
  creationNotes: string[];
  questions: string[];
  annotations: FrameAnnotation[];
}

export interface CopyrightInfo {
  imageTitle: string;
  author: string;
  rightsHolder: string;
  sourceUrl: string;
  sourceType: string;
  licenseType: string;
  copyrightStatus: CopyrightStatus;
  usageScope: string;
  allowDownload: boolean;
  proofNote: string;
  addedDate: string;
  reviewStatus: ReviewStatus;
}

export interface Film {
  slug: string;
  title: string;
  englishTitle: string;
  year: number;
  director: string;
  cinematographer: string;
  region: string;
  aspectRatio: string;
  synopsis: string;
  visualStyle: string;
  compositionNotes: string;
  lightingNotes: string;
  palette: string[];
  frameIds: string[];
  topicIds: string[];
}

export interface Frame {
  slug: string;
  filmSlug: string;
  title: string;
  image: string;
  alt: string;
  palette: string[];
  colors: string[];
  compositions: string[];
  shotSize: string;
  lights: string[];
  lightDirection: string;
  lightQuality: string;
  subjectPosition: string;
  visualFocus: string;
  scenes: string[];
  moods: string[];
  time: string;
  region: string;
  decade: string;
  analysis: string;
  copyright: CopyrightInfo;
}

export interface TopicSection {
  heading: string;
  paragraphs: string[];
  frameId?: string;
}

export interface Topic {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: string;
  coverFrameId: string;
  sections: TopicSection[];
  relatedTopicIds: string[];
}

export interface VisualTerm {
  name: string;
  english: string;
  definition: string;
  effect: string;
  watchFor: string;
  filterKey: FilterKey;
  filterValue: string;
  frameIds: string[];
}

export interface VisualIndexGroup {
  slug: string;
  title: string;
  english: string;
  overview: string;
  guidingQuestion: string;
  accent: string;
  terms: VisualTerm[];
}

export interface InspirationBoard {
  id: string;
  name: string;
  frameIds: string[];
  createdAt: string;
}

export interface BoardState {
  version: 1;
  boards: InspirationBoard[];
  activeBoardId: string;
}

export type FilterKey = "colors" | "compositions" | "shotSize" | "lights" | "scenes" | "moods" | "time" | "region" | "decade";
export type FilterState = Record<FilterKey, string[]>;
