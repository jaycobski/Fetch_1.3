import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleTwitterCallback } from '@/utils/twitter';
import { Skeleton } from '@/components/ui/skeleton';

export default function TwitterCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const storedState = localStorage.getItem('twitter_state');

      if (!code) {
        navigate('/dashboard');
        return;
      }

      if (state !== storedState) {
        console.error('State mismatch');
        navigate('/dashboard');
        return;
      }

      const token = await handleTwitterCallback(code);
      if (token) {
        navigate('/dashboard/twitter-posts');
      } else {
        navigate('/dashboard');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}