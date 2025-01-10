import { ApiClient } from './api-client';
import { SocialClient, SocialPost } from '@/types/social';
import { generateRandomString } from '@/utils/reddit';

export class RedditClient implements SocialClient {
  private apiClient: ApiClient;
  private accessToken: string | null = null;

  constructor(accessToken?: string) {
    if (accessToken) {
      this.accessToken = accessToken;
    }
    
    this.apiClient = new ApiClient({
      baseUrl: 'https://oauth.reddit.com',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'User-Agent': 'web:saved-posts-fetcher:v1.0.0 (by /u/lovable_dev)',
      },
    });
  }

  async fetchPosts(): Promise<SocialPost[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }

    const userData = await this.apiClient.get<any>('/api/v1/me');
    const savedPosts = await this.apiClient.get<any>(`/user/${userData.name}/saved`);

    return savedPosts.data.children.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      content: child.data.selftext || '',
      author: child.data.author,
      url: child.data.url,
      metadata: {
        subreddit: child.data.subreddit,
        score: child.data.score,
        permalink: child.data.permalink,
        thumbnail: child.data.thumbnail,
      },
    }));
  }

  connect(): void {
    const state = generateRandomString();
    localStorage.setItem('reddit_state', state);

    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_REDDIT_CLIENT_ID,
      response_type: 'token',
      state: state,
      redirect_uri: import.meta.env.VITE_REDIRECT_URI,
      duration: 'temporary',
      scope: 'history identity',
    });

    window.location.href = `https://www.reddit.com/api/v1/authorize?${params}`;
  }

  disconnect(): void {
    this.accessToken = null;
    localStorage.removeItem('reddit_access_token');
    localStorage.removeItem('reddit_state');
  }
}