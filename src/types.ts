

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface MetaTags {
  title: string | null;
  description: string | null;
  keywords: string | null;
  robots: string | null;
  canonical: string | null;
  charset: string | null;
  viewport: string | null;
}

export interface SocialTags {
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
}

export interface HeadingStructure {
  h1: string[];
  h2: string[];
  h3: string[];
  h4: string[];
  h5: string[];
  h6: string[];
}

export interface ImageAudit {
  total: number;
  withAlt: number;
  withoutAlt: number;
  details: { src: string; alt: string }[];
}

export interface LinkAudit {
  total: number;
  internal: number;
  external: number;
  internalUrls?: string[]; // Added for deep scan capability
}

export interface KeywordData {
  word: string;
  count: number;
  density: number;
  inTitle: boolean;
  inDescription: boolean;
  inH1: boolean;
}

export interface CrawledPage {
  url: string;
  status: '200' | '404' | '500';
  score: number;
  issues: number;
  title: string;
  issueDetails?: {
    type: string;
    label: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
  }[];
}

export interface SeoReport {
  url: string;
  meta: MetaTags;
  social: SocialTags;
  headings: HeadingStructure;
  images: ImageAudit;
  links: LinkAudit;
  keywords: KeywordData[];
  wordCount: number;
  score: number; // 0-100
  rawHtml: string;
  crawledPages: CrawledPage[]; // New field for site-wide analysis
}

// New Advanced Analysis Types
export interface AiIssue {
  issue_description: string;
  category: string;
  impact: 'High' | 'Medium' | 'Low';
  page_or_section: string;
  recommendation: string;
  error_or_notes?: string;
}

export interface AiAnalysisResult {
  checklist: string[];
  issues: AiIssue[];
}

// PageSpeed Types
export interface CoreWebVitals {
  lcp: { value: string; score: string }; // Largest Contentful Paint
  fcp: { value: string; score: string }; // First Contentful Paint
  cls: { value: string; score: string }; // Cumulative Layout Shift
  inp: { value: string; score: string }; // Interaction to Next Paint
}

export interface AuditResult {
  id: string;
  title: string;
  description: string;
  score: number; // 0-1
  displayValue?: string;
}

export interface PageSpeedResult {
  performanceScore: number; // 0-100
  coreWebVitals: CoreWebVitals;
  failedAudits: AuditResult[];
  screenshot?: string;
}

export interface PerformanceAiAnalysis {
  summary: string;
  fixes: {
    title: string;
    severity: 'High' | 'Medium' | 'Low';
    technical_explanation: string;
    code_suggestion: string;
    impact_on_seo: string;
  }[];
}