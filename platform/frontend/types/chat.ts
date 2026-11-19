export interface ReviewSource {
  city: string;
  rating: number;
  comment: string;
  score: number;
}

export interface SqlResult {
  sql: string;
  columns: string[];
  rows: Record<string, any>[];
  row_count: number;
  can_chart: boolean;
  chart_title?: string | null;
  value_suffix?: string | null;
}

export type QueryMode = "auto" | "rag" | "sql";
export type ModeUsed = "rag" | "sql" | "dual";

export interface ChatRequest {
  question: string;
  mode: QueryMode;
  city?: string;
}

export interface ChatResponse {
  mode_used: ModeUsed;
  answer: string;
  sql_result?: SqlResult | null;
  sources: ReviewSource[];
  latency_ms: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  modeUsed?: ModeUsed;
  sqlResult?: SqlResult | null;
  sources?: ReviewSource[];
  latencyMs?: number;
  error?: string | null;
}

export interface ChatThread {
  id: string;
  title: string;
  updatedAt: string;
  cityFilter: string;
  messages: ChatMessage[];
}

export interface PlatformHealth {
  status: string;
  model: string;
  total_reviews: number;
  snowflake_configured: boolean;
}

export interface PlatformMetadata {
  cities: string[];
  model: string;
  total_reviews: number;
}

