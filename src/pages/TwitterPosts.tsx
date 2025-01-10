import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TwitterPosts } from "@/components/TwitterPosts";
import { initiateTwitterAuth } from "@/utils/twitter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function TwitterPostsPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('twitter_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
    }
  }, []);

  const handleConnect = () => {
    initiateTwitterAuth();
  };

  if (!accessToken) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold mb-8">Connect Your Twitter Account</h2>
          <p className="text-muted-foreground mb-4">Enter your Twitter Bearer Token to connect your account</p>
          <Button
            onClick={handleConnect}
            className="bg-twitter-primary hover:bg-twitter-hover text-white"
          >
            Connect with Twitter
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h2 className="text-2xl font-bold mb-8">My Twitter Bookmarks</h2>
        <TwitterPosts accessToken={accessToken} />
      </div>
    </DashboardLayout>
  );
}