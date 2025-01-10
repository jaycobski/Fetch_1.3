import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SavedPosts } from "@/components/SavedPosts";
import { initiateRedditAuth, handleRedditCallback } from "@/utils/reddit";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function RedditPosts() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('RedditPosts component mounted');
    try {
      // Only try to get the hash token if we're not already authenticated
      const storedToken = localStorage.getItem("reddit_access_token");      
       
      if (storedToken) {
        console.log('Found stored Reddit token');
        setAccessToken(storedToken);
      }
    } catch (error) {
      console.error('Error checking Reddit token:', error);
      toast.error('Error checking Reddit authentication');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleConnect = () => {
    console.log('Initiating Reddit connection...');
    initiateRedditAuth();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!accessToken) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold mb-8">Connect Your Reddit Account</h2>
          <Button
            onClick={handleConnect}
            className="bg-reddit-primary hover:bg-reddit-hover text-white"
          >
            Connect with Reddit
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h2 className="text-2xl font-bold mb-8">My Reddit Posts</h2>
        <SavedPosts accessToken={accessToken} />
      </div>
    </DashboardLayout>
  );
}