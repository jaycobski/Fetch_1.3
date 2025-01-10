import { ApiClient } from './api-client';
import { StoredPost } from '@/utils/db';
import { SummaryCategory } from '@/types/summary';
import { supabase } from '@/lib/supabase';

export class PerplexityClient {
  private apiClient: ApiClient;
  private model = 'llama-3.1-sonar-large-128k-online';
  private userId: string | null = null;
  private maxRetries = 3;
  private retryDelay = 2000; // Base delay in ms
  private timeout = 30000; // 30 second timeout
  private baseUrl: string;

  constructor(userId?: string) {
    this.userId = userId;
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/perplexity`;
  }

  // Make categorizePost public so it can be used elsewhere
  public categorizePost(post: StoredPost): string {
    const CATEGORIES = {
      'Technology & Programming': [
        'programming', 'webdev', 'javascript', 'typescript', 'react', 'node',
        'technology', 'coding', 'developer', 'software', 'tech'
      ],
      'Investing & Crypto': [
        'bitcoin', 'cryptocurrency', 'investing', 'stocks', 'wallstreetbets',
        'finance', 'crypto', 'trading'
      ],
      'Science & Education': [
        'science', 'space', 'physics', 'biology', 'chemistry', 'education',
        'learning', 'research', 'study'
      ],
      'Entertainment & Gaming': [
        'gaming', 'games', 'pcgaming', 'nintendo', 'playstation', 'xbox',
        'entertainment', 'movies', 'television'
      ],
      'Other': []
    };

    const subreddit = post.subreddit?.toLowerCase() || '';
    const title = post.title?.toLowerCase() || '';
    const content = post.content?.toLowerCase() || '';

    for (const [category, keywords] of Object.entries(CATEGORIES)) {
      if (keywords.some(keyword => 
        subreddit.includes(keyword) || 
        title.includes(keyword) || 
        content.includes(keyword)
      )) {
        return category;
      }
    }

    return 'Other';
  }

  private async createApiClient() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.access_token) {
      throw new Error('No valid session found');
    }

    return new ApiClient({
      baseUrl: this.baseUrl,
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: this.timeout,
      retries: this.maxRetries
    });
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    attempt = 1
  ): Promise<T> {
    try {
      const result = await Promise.race([
        operation(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), this.timeout)
        )
      ]);
      return result as T;
    } catch (error) {
      // Don't retry on auth errors
      if (error.message.includes('authorization') || error.message.includes('auth')) {
        throw error;
      }

      if (attempt >= this.maxRetries) {
        console.error(`Failed after ${this.maxRetries} attempts:`, error);
        throw error;
      }
      
      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      console.log(`Retry attempt ${attempt}/${this.maxRetries} after ${delay}ms`);
      
      await new Promise(resolve =>
        setTimeout(resolve, delay)
      );
      
      return this.retryWithBackoff(operation, attempt + 1);
    }
  }

  async generateSummary(post: StoredPost, options: {
    maxLength?: number;
    style?: 'concise' | 'detailed';
  } = {}): Promise<string | null> {
    console.log('Starting generateSummary for post:', post.id);

    if (!post.content && !post.title) {
      throw new Error('No content available to summarize');
    }

    // Create API client with fresh auth token
    this.apiClient = await this.createApiClient();

    const prompt = this.buildPrompt(post, options);

    // Prepare the request payload
    const requestPayload = {
      model: this.model,
      messages: [{
        role: "system",
        content: "You are an AI assistant specializing in summarizing content. Your task is to provide clear, informative summaries that capture the key points and main ideas of the content."
      }, {
        role: "user",
        content: prompt 
      }]
    };

    // Validate payload before sending
    if (!requestPayload.messages || !Array.isArray(requestPayload.messages) || requestPayload.messages.length === 0) {
      throw new Error('Invalid messages format in payload');
    }

    if (!requestPayload.model) {
      throw new Error('Model parameter is required');
    }

    // Stringify the payload
    const stringifiedPayload = JSON.stringify(requestPayload);

    // Create initial summary record
    try {
      const { data: initialSummary, error: insertError } = await supabase
        .from('summaries')
        .insert([{
          user_id: this.userId,
          post_id: post.id,
          status: 'processing',
          category: this.categorizePost(post)
        }])
        .select()
        .single();
      
      if (insertError) {
        console.error('Failed to create summary record:', insertError);
        throw new Error('Failed to initialize summary');
      }

      const summaryId = initialSummary.id;

      try {
        // Make API request with retries
        const response = await this.retryWithBackoff(() => 
          this.apiClient.post('', stringifiedPayload)
        );

        if (!response?.choices?.[0]?.message?.content) {
          throw new Error('Invalid or empty response from Perplexity API');
        }

        const completion = response.choices[0].message.content;

        // Update summary with completed status
        await supabase
          .from('summaries')
          .update({
            content: completion,
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', summaryId);

        return completion;

      } catch (error) {
        console.error('Error generating summary:', error);

        // Update summary with failed status
        await supabase
          .from('summaries')
          .update({
            status: 'failed',
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', summaryId);

        throw error;
        throw new Error(`Failed to generate summary: ${error.message}`);
      }

    } catch (error) {
      console.error('Fatal error in generateSummary:', error);
      throw new Error(`Summary generation failed: ${error.message}`);
    }
  }

  async generateDigest(posts: StoredPost[]): Promise<SummaryCategory[]> {
    // Group posts by subreddit for batch processing
    const groupedPosts = posts.reduce((acc, post) => {
      const category = this.categorizePost(post);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(post);
      return acc;
    }, {} as Record<string, StoredPost[]>);

    // Generate summaries for each category
    const categories = await Promise.all(
      Object.entries(groupedPosts).map(async ([category, posts]) => {
        const summaries = await Promise.all(
          posts.map(post => this.generateSummary(post))
        );

        return {
          name: category,
          posts: posts.map((post, i) => ({
            title: post.title || '',
            summary: summaries[i],
            source: `r/${post.subreddit}`,
            url: post.url
          }))
        };
      })
    );

    return categories;
  }

  private buildPrompt(post: StoredPost, options: {
    maxLength?: number;
    style?: 'concise' | 'detailed';
  }): string {
    const maxLength = options.maxLength || 200;
    const style = options.style || 'concise';
    const content = post.content || post.title;

    return `
      Please provide a clear and informative summary of the following content:

      Title: ${post.title}
      Content: ${content}
      Source: Reddit - r/${post.subreddit}
      
      Guidelines:
      - Aim for a ${maxLength}-word ${style} summary
      - Focus on key points and main ideas
      - Maintain original context and meaning
      - Use clear, concise language
      
      Please provide the summary in a single paragraph.
    `.trim();
  }

}