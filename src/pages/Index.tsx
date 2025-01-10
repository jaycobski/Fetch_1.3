import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { FetchesList } from "@/components/FetchesList";
import { DigestList } from "@/components/DigestList";
import { useEffect, useState } from "react";

const Index = () => {
  const [isRedditConnected, setIsRedditConnected] = useState(false);
  const [isTwitterConnected, setIsTwitterConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("reddit_access_token");
    setIsRedditConnected(!!token);

    const twitterToken = localStorage.getItem("twitter_access_token");
    setIsTwitterConnected(!!twitterToken);
  }, []);

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <h2 className="text-2xl font-bold">Welcome to Your Dashboard</h2>
        
        <div className="grid gap-6">
          <h3 className="text-xl font-semibold">My Fetches</h3>
          <FetchesList />
        </div>

        <div className="grid gap-6">
          <h3 className="text-xl font-semibold">My Digests</h3>
          <DigestList />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link to="/dashboard/reddit-posts">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">My Reddit Posts</span>
                  <ConnectionStatus isConnected={isRedditConnected} />
                </div>
                <span className="text-sm text-muted-foreground">View and manage your saved Reddit posts</span>
              </div>
            </Card>
          </Link>
          
          <Link to="/dashboard/twitter-posts">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">My Twitter Bookmarks</span>
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900 dark:text-yellow-300">
                    Coming soon
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">View and manage your Twitter bookmarks</span>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;