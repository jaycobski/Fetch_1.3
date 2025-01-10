import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SummaryToggle } from '@/components/SummaryToggle';
import { getUserPosts } from '@/utils/db';
import { useAuth } from '@/context/auth';
import { StoredPost } from '@/utils/db';
import { supabase } from '@/lib/supabase';

export function FetchesList() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<StoredPost[]>([]);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      if (!user) return;
      
      try {
        const fetchedPosts = await getUserPosts(user.id);
        setPosts(fetchedPosts);

        // Fetch summaries for posts
        const { data: summaryData } = await supabase
          .from('summaries')
          .select('post_id, content')
          .in('post_id', fetchedPosts.map(p => p.id));

        if (summaryData) {
          const summaryMap = summaryData.reduce((acc, curr) => {
            acc[curr.post_id] = curr.content;
            return acc;
          }, {} as Record<string, string>);
          setSummaries(summaryMap);
        }
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, [user]);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4 h-32" />
      ))}
    </div>;
  }

  if (posts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No fetches yet. Connect your accounts and start saving posts!</p>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <div className="space-y-4 p-4">
        {posts.map((post) => (
          <Card key={post.id} className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{post.title || 'Untitled Post'}</h3>
                <Badge variant="outline">{post.source}</Badge>
                <SummaryToggle 
                  postId={post.id} 
                  onSummaryGenerated={(summary) => {
                    setSummaries(prev => ({
                      ...prev,
                      [post.id]: summary
                    }));
                  }} 
                />
              </div>
              {summaries[post.id] && (
                <p className="text-sm text-muted-foreground">{summaries[post.id]}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>From: {post.subreddit || post.author}</span>
                <span>•</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}