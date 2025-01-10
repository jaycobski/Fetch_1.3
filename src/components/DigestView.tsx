import { DigestEmail } from '@/types/summary';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink } from 'lucide-react';

interface DigestViewProps {
  digest: DigestEmail;
}

export function DigestView({ digest }: DigestViewProps) {
  return (
    <ScrollArea className="h-[600px] w-full rounded-md border p-4">
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Your Bookmark Digest</h2>
          <p className="text-sm text-muted-foreground">
            Generated on {new Date(digest.generated_at).toLocaleDateString()}
          </p>
        </div>

        {digest.categories.map((category) => (
          <div key={category.name} className="space-y-4">
            <h3 className="text-xl font-semibold">{category.name}</h3>
            <div className="grid gap-4">
              {category.posts.map((post, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{post.title}</h4>
                      <span className="text-sm text-muted-foreground">
                        {post.source}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {post.summary}
                    </p>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-500 hover:text-blue-700"
                    >
                      Read more
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}