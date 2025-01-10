import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LinkedInPosts } from "@/components/LinkedInPosts";
import { initiateLinkedInAuth } from "@/utils/linkedin";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function LinkedInPostsPage() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("linkedin_access_token");
    if (storedToken) {
      setAccessToken(storedToken);
    }
  }, []);

  if (!accessToken) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold mb-8">Connect Your LinkedIn Account</h2>
          <Button
            onClick={initiateLinkedInAuth}
            className="bg-linkedin-primary hover:bg-linkedin-hover text-white"
          >
            Connect with LinkedIn
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h2 className="text-2xl font-bold mb-8">My LinkedIn Posts</h2>
        <LinkedInPosts accessToken={accessToken} />
      </div>
    </DashboardLayout>
  );
}