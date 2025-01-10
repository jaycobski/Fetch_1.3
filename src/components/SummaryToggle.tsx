import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { PerplexityClient } from '@/lib/perplexity';
import { useAuth } from '@/context/auth';

interface SummaryToggleProps {
  postId: string;
  onSummaryGenerated?: (summary: string) => void;
}

export function SummaryToggle({ postId, onSummaryGenerated }: SummaryToggleProps) {
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const { user } = useAuth();
  const [existingSummaryId, setExistingSummaryId] = useState<string | null>(null);

  useEffect(() => {
    async function checkSummary() {
      if (!user) return;

      const { data, error } = await supabase
        .from('summaries')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error checking summary:', error);
        return;
      }

      if (data) {
        setExistingSummaryId(data.id);
        setIsEnabled(true);
        if (data.content && onSummaryGenerated) {
          onSummaryGenerated(data.content);
        }
      }
    }

    checkSummary();
  }, [postId, user]);

  const handleToggle = async (checked: boolean) => {
    if (!user) return;

    if (!checked) {
      setIsEnabled(false);
      return;
    }

    setLoading(true);
    setIsEnabled(checked);
    console.log('Starting summary generation for post:', postId);
    try {
      // Get post data first
      const { data: post, error: postError } = await supabase
        .from('fetched_posts')
        .select('*')
        .eq('id', postId)
        .single();

      console.log('Fetched post data:', post);
      if (postError) throw new Error(postError.message);
      if (!post) throw new Error('Post not found');
      
      let summaryId = existingSummaryId;
      
      // Create or update summary record
      if (!summaryId) {
        const { data: newSummary, error: insertError } = await supabase
          .from('summaries')
          .insert({
            user_id: user.id,
            post_id: postId,
            status: 'processing',
            content: '',
            category: 'Other'
          })
          .select()
          .maybeSingle();

        if (insertError) {
          throw new Error(insertError?.message || 'Failed to create summary');
        }
        summaryId = newSummary?.id;
      } else {
        // Update existing summary to processing
        await supabase
          .from('summaries')
          .update({ status: 'processing' })
          .eq('id', summaryId);
      }

      // Generate summary
      const perplexity = new PerplexityClient(user.id);
      const summary = await perplexity.generateSummary(post);
      
      if (!summary) {
        throw new Error('Failed to generate summary');
      }

      // Get category for the post
      const category = perplexity.categorizePost(post) || 'Other';

      // Store summary
      const { data: storedSummary } = await supabase
        .from('summaries')
        .update({
          content: summary,
          category: category,
          status: 'completed'
        })
        .eq('id', summaryId)
        .select()
        .maybeSingle();

      if (!storedSummary) {
        console.error('Failed to store summary in database');
        throw new Error('Failed to store summary');
      }

      if (onSummaryGenerated) {
        onSummaryGenerated(summary);
      }
      toast.success('Summary generated successfully');
      setIsEnabled(true);
    } catch (error) {
      console.error('Error generating summary:', error);
      if (existingSummaryId) {
        await supabase
          .from('summaries')
          .update({
            status: 'failed',
            error_message: error.message || 'Unknown error'
          })
          .eq('id', existingSummaryId);
      }

      toast.error(error.message || 'Failed to generate summary');
      setIsEnabled(checked);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`summary-toggle-${postId}`}
        checked={isEnabled}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
      <Label htmlFor={`summary-toggle-${postId}`} className="flex items-center gap-2">
        AI Summary
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      </Label>
    </div>
  );
}