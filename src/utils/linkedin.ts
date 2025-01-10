import { toast } from "sonner";

export interface LinkedInPost {
  id: string;
  title: string;
  content: string;
  author: string;
  url: string;
  created_at: string;
}

export const generateRandomString = () => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0].toString(36);
};

export const initiateLinkedInAuth = () => {
  const state = generateRandomString();
  localStorage.setItem("linkedin_state", state);

  // TODO: Add LinkedIn OAuth configuration
  toast.error("LinkedIn integration coming soon!");
};

export const handleLinkedInCallback = (code: string) => {
  // TODO: Implement LinkedIn OAuth callback handling
  return null;
};

export const fetchSavedPosts = async (accessToken: string): Promise<LinkedInPost[]> => {
  // TODO: Implement LinkedIn API integration
  return [];
};