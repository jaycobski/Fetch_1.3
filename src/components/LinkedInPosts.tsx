import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LinkedInPost, fetchSavedPosts } from "@/utils/linkedin";
import { ExternalLink, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LinkedInPostsProps {
  accessToken: string;
}

interface PostCardProps {
  post: LinkedInPost;
}

const PostCard = ({ post }: PostCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow animate-fade-in">
      <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <span className="font-medium">{post.author}</span>
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
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-gray-500 hover:text-linkedin-primary"
      >
        View on LinkedIn
        <ExternalLink className="ml-1 h-4 w-4" />
      </a>
    </Card>
  );
};

export const LinkedInPosts = ({ accessToken }: LinkedInPostsProps) => {
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
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