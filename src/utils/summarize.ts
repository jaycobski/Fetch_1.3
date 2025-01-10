import { StoredPost } from './db';
import { DigestEmail, SummaryCategory } from '@/types/summary';
import { supabase } from '@/lib/supabase';

// Categories and their related subreddits/keywords
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
  'Other': [] // Catch-all category
};

function categorizePost(post: StoredPost): string {
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

export async function generateDigest(posts: StoredPost[]): Promise<DigestEmail> {
  // Group posts by category
  const categorizedPosts = posts.reduce((acc, post) => {
    const category = categorizePost(post);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(post);
    return acc;
  }, {} as Record<string, StoredPost[]>);

  // Generate summaries for each category
  const categories: SummaryCategory[] = await Promise.all(
    Object.entries(categorizedPosts)
      .filter(([_, posts]) => posts.length > 0)
      .map(async ([categoryName, posts]) => {
        const summarizedPosts = await Promise.all(posts.map(async (post) => {
          // Here we'll integrate with Perplexity API
          // For now, we'll use a placeholder summary
          const summary = `Summary of post: ${post.title}`;

          return {
            title: post.title || 'Untitled Post',
            summary,
            source: `r/${post.subreddit}`,
            url: post.url
          };
        }));

        return {
          name: categoryName,
          posts: summarizedPosts
        };
      })
  );

  return {
    categories: categories.sort((a, b) => b.posts.length - a.posts.length),
    generated_at: new Date().toISOString()
  };
}

export async function storeDigest(userId: string, digest: DigestEmail) {
  const { data, error } = await supabase
    .from('summaries')
    .insert({
      user_id: userId,
      content: JSON.stringify(digest),
      category: 'Digest',
      status: 'completed',
      created_at: digest.generated_at,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getLatestDigest(userId: string) {
  const { data, error } = await supabase
    .from('summaries')
    .select('*')
    .eq('user_id', userId)
    .eq('category', 'Digest')
    .eq('status', 'completed')
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    throw error;
  }

  return data;
}