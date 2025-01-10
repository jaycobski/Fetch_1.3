import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { RedditPost, fetchSavedPosts } from "@/utils/reddit";
import { ExternalLink, ChevronDown, ArrowBigUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavedPostsProps {
  accessToken: string;
}

interface PostCardProps {
  post: RedditPost;
}

const PostCard = ({ post }: PostCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow animate-fade-in">
      <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <a 
          href={`https://reddit.com/r/${post.subreddit}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-reddit-primary font-medium hover:underline"
        >
          r/{post.subreddit}
        </a>
        <span className="mx-2">•</span>
        <span className="flex items-center">
          <ArrowBigUp className="w-4 h-4 mr-1" />
          {post.metadata?.score?.toLocaleString() || 0}
        </span>
        <span className="mx-2">•</span>
        <span className="flex items-center">
          <MessageSquare className="w-4 h-4 mr-1" />
          {post.metadata?.num_comments?.toLocaleString() || 0}
        </span>
      </div>
      {post.content && (
        <>
          <div className={`text-sm text-gray-700 mb-2 ${!expanded ? 'line-clamp-3' : ''}`}>
            {post.content}
          </div>
          {post.content.length > 100 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="mb-2"
            >
              {expanded ? 'Show less' : 'Show more'}
              <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </Button>
          )}
        </>
      )}
      <a
        href={`https://reddit.com${post.metadata?.permalink}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-gray-500 hover:text-reddit-primary"
      >
        View on Reddit
        <ExternalLink className="ml-1 h-4 w-4" />
      </a>
    </Card>
  );
};

export const SavedPosts = ({ accessToken }: SavedPostsProps) => {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      const fetchedPosts = await fetchSavedPosts(accessToken);
      setPosts(fetchedPosts);
      setLoading(false);
    };

    loadPosts();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};