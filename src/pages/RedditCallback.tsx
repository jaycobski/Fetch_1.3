import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleRedditCallback } from '@/utils/reddit';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function RedditCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      if (!window.location.hash) {
        console.error('No hash found in URL');
        navigate('/dashboard/reddit-posts', { replace: true });
        return;
      }

      const token = handleRedditCallback(window.location.hash);
      
      if (token) {
        navigate('/dashboard/reddit-posts', { replace: true });
      } else {
        toast.error('Failed to authenticate with Reddit');
        navigate('/dashboard/reddit-posts', { replace: true });
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold">Connecting to Reddit...</h2>
          <p className="text-sm text-muted-foreground">Please wait while we complete the authentication</p>
        </div>
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}