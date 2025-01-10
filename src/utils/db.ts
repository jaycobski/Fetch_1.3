import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

import { SocialPost, SocialPlatform } from '@/types/social';

export interface StoredPost extends SocialPost {
  id: string;
  user_id: string;
  source: SocialPlatform;
  external_id: string;
  fetched_at: string;
  created_at: string;
  updated_at: string;
}

export async function storeUserPosts(userId: string, posts: SocialPost[], source: SocialPlatform) {
  console.log('Storing posts for user:', userId);
  console.log(`Processing ${posts.length} posts from ${source}`);
  
  // Ensure we have a valid user ID
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Validate posts before processing
  if (!Array.isArray(posts) || posts.length === 0) {
    console.warn('No posts to store');
    return [];
  }

  const formattedPosts = posts.map(post => ({
    user_id: userId,
    source,
    external_id: post.id,
    title: post.title,
    content: post.content,
    url: post.url || `https://reddit.com${post.metadata?.permalink || ''}`,
    author: post.author,
    metadata: {
      ...post.metadata,
      stored_at: new Date().toISOString(),
    },
    updated_at: new Date().toISOString()
  }));

  // Filter out any posts that still don't have a URL
  const validPosts = formattedPosts.filter(post => {
    if (!post.url) {
      console.warn(`Skipping post ${post.external_id} due to missing URL`);
      return false;
    }
    return true;
  });

  console.log(`Attempting to store ${formattedPosts.length} formatted posts`);

  try {
    const { data, error } = await supabase
      .from('fetched_posts')
      .upsert(validPosts, {
        onConflict: 'user_id,source,external_id',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error("Database error:", error);
      throw new Error(error.message);
    }

    console.log(`Successfully stored ${data?.length || 0} posts`);
    toast.success(`Saved ${data?.length || 0} posts to your account`);
    return data;

  } catch (error) {
    console.error("Error in storeUserPosts:", error);
    toast.error(error.message || "Failed to store posts");
    throw error;
  }
}

export async function deleteUserPosts(userId: string, postIds: string[]) {
  const { error } = await supabase
    .from('fetched_posts')
    .delete()
    .eq('user_id', userId)
    .in('id', postIds);

  if (error) {
    console.error("Error deleting posts:", error);
    toast.error("Failed to delete posts");
    throw error;
  }

  toast.success("Successfully deleted posts");
}

export async function getUserPosts(userId: string, source?: 'reddit' | 'twitter') {
  const query = supabase
    .from('fetched_posts')
    .select('*')
    .eq('user_id', userId);

  if (source) {
    query.eq('source', source);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching posts:", error);
    toast.error("Failed to fetch stored posts");
    throw error;
  }

  return data as StoredPost[];
}