export interface PostSummary {
  id: string;
  title: string;
  content: string;
  category: string;
  source_post_id: string;
  created_at: string;
}

export interface SummaryCategory {
  name: string;
  posts: Array<{
    title: string;
    summary: string;
    source: string;
    url: string;
  }>;
}

export interface DigestEmail {
  categories: SummaryCategory[];
  generated_at: string;
}

export interface SummaryOptions {
  maxLength?: number;
  style?: 'concise' | 'detailed';
  format?: 'text' | 'html';
}