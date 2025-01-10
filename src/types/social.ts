export interface SocialPost {
  id: string;
  title?: string;
  content: string;
  author: string;
  url: string;
  metadata?: Record<string, any>;
}

export interface SocialClient {
  fetchPosts(): Promise<SocialPost[]>;
  connect(): void;
  disconnect(): void;
}

export type SocialPlatform = 'reddit' | 'twitter';