import { toast } from "sonner";
import { generateRandomString } from "./reddit";

export interface TwitterPost {
  id: string;
  text: string;
  author: {
    name: string;
    username: string;
  };
  created_at: string;
  url: string;
}

export const initiateTwitterAuth = () => {
  try {
    const bearerToken = prompt('Please enter your Twitter Bearer Token:');
    if (bearerToken) {
      localStorage.setItem('twitter_access_token', bearerToken);
      toast.success('Successfully connected to Twitter!');
      window.location.href = '/dashboard/twitter-posts';
    }
  } catch (error) {
    console.error('Error initiating Twitter auth:', error);
    toast.error('Failed to initiate Twitter authentication');
  }
};

export const fetchBookmarkedTweets = async (accessToken: string): Promise<TwitterPost[]> => {
  try {
    // First get the user ID
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await userResponse.json();
    const userId = userData.data.id;

    // Then fetch bookmarks
    const params = new URLSearchParams({
      'max_results': '100',
      'expansions': 'author_id',
      'tweet.fields': 'created_at,text',
      'user.fields': 'name,username'
    });

    const response = await fetch(
      `https://api.twitter.com/2/users/${userId}/bookmarks?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch bookmarks');
    }

    const data = await response.json();
    
    return data.data.map((tweet: any) => {
      const author = data.includes.users.find(
        (user: any) => user.id === tweet.author_id
      );
      
      return {
        id: tweet.id,
        text: tweet.text,
        author: {
          name: author.name,
          username: author.username
        },
        created_at: tweet.created_at,
        url: `https://twitter.com/${author.username}/status/${tweet.id}`
      };
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    toast.error('Failed to fetch bookmarks');
    throw error;
  }
};