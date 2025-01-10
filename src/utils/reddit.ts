import { toast } from "sonner";
import { storeUserPosts } from "./db";
import { PerplexityClient } from "@/lib/perplexity";
import { supabase } from "@/lib/supabase";

const CLIENT_ID = import.meta.env.VITE_REDDIT_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const SCOPES = ["history", "identity"];

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  subreddit: string;
  score: number;
  url: string;
  created_utc: number;
  permalink: string;
  thumbnail: string;
}

export const generateRandomString = () => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0].toString(36);
};

export const initiateRedditAuth = () => {
  console.log('Initiating Reddit auth...');
  const state = generateRandomString();
  localStorage.setItem("reddit_state", state);

  const redirectUri = import.meta.env.VITE_REDIRECT_URI;
  console.log('Using redirect URI:', redirectUri);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "token",
    state: state,
    redirect_uri: redirectUri,
    duration: "temporary",
    scope: SCOPES.join(" ")
  });

  const authUrl = `https://www.reddit.com/api/v1/authorize?${params.toString()}`;
  console.log('Auth URL:', authUrl);
  window.location.href = authUrl;
};

export const handleRedditCallback = (hash: string) => {
  console.log('Handling Reddit callback with hash:', hash);
  if (!hash) return null;

  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get("access_token");
  const state = params.get("state");
  const storedState = localStorage.getItem("reddit_state");
  const error = params.get("error");

  if (error) {
    console.error('Reddit OAuth error:', error);
    toast.error(`Authentication failed: ${error}`);
    return null;
  }
  
  // Validate state parameter first
  if (!state || state !== storedState) {
    console.error('State parameter validation failed');
    toast.error("Authentication failed - Invalid state parameter");
    return null;
  }

  // Validate access token
  if (!accessToken) {
    console.error('Access token missing from response');
    toast.error("Authentication failed - Missing access token");
    return null;
  }

  // Clear state from storage
  localStorage.removeItem("reddit_state");
  
  // Store the token
  localStorage.setItem("reddit_access_token", accessToken);
  toast.success("Successfully connected to Reddit!");
  
  return accessToken;
};

export const fetchSavedPosts = async (accessToken: string): Promise<RedditPost[]> => {
  try {
    console.log("Starting API request with token:", accessToken.substring(0, 5) + "...");
    
    // First, get the username
    const userResponse = await fetch("https://oauth.reddit.com/api/v1/me", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "User-Agent": "web:saved-posts-fetcher:v1.0.0 (by /u/lovable_dev)",
      }
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user info: ${userResponse.status}`);
    }

    const userData = await userResponse.json();
    const username = userData.name;

    // Then fetch saved posts using the correct endpoint format
    const response = await fetch(`https://oauth.reddit.com/user/${username}/saved?limit=100&raw_json=1`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "User-Agent": "web:saved-posts-fetcher:v1.0.0 (by /u/lovable_dev)",
      }
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    console.log("API Response data structure:", Object.keys(data));

    if (!data.data?.children) {
      console.error("Unexpected API response format:", data);
      throw new Error("Invalid API response format");
    }

    const posts = data.data.children.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      content: child.data.selftext || child.data.body || child.data.url || "",
      author: child.data.author,
      url: child.data.url,
      subreddit: child.data.subreddit,
      metadata: {
        subreddit: child.data.subreddit,
        score: child.data.score,
        created_utc: child.data.created_utc,
        permalink: child.data.permalink,
        thumbnail: child.data.thumbnail,
        num_comments: child.data.num_comments,
        upvote_ratio: child.data.upvote_ratio,
        is_video: child.data.is_video,
        post_hint: child.data.post_hint,
        domain: child.data.domain
      }
    }));
    
    // Store posts in database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      const storedPosts = await storeUserPosts(user.id, posts, 'reddit');
      
      // Generate summaries for stored posts
      try {
        const perplexity = new PerplexityClient();
        for (const post of storedPosts) {
          const summary = await perplexity.generateSummary(post);
          await supabase
            .from('summaries')
            .insert({
              user_id: user.id,
              post_id: post.id,
              content: summary,
              category: perplexity.categorizePost(post)
            });
        }
        toast.success('Generated summaries for your posts');
      } catch (error) {
        console.error('Error generating summaries:', error);
        toast.error('Failed to generate summaries');
      }
      
    } catch (error) {
      console.error("Error storing posts:", error);
      toast.error(error.message || "Failed to store posts in database");
    }
    
    return posts;
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    toast.error(error.message || "Failed to fetch saved posts");
    throw error;
  }
};