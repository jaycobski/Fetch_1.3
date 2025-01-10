/*
  # Add Summaries Support

  1. New Tables
    - `summaries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `post_id` (uuid, references fetched_posts)
      - `content` (text)
      - `category` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `summaries` table
    - Add policies for authenticated users
*/

-- Create summaries table
CREATE TABLE IF NOT EXISTS public.summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES public.fetched_posts(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own summaries"
  ON public.summaries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own summaries"
  ON public.summaries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own summaries"
  ON public.summaries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own summaries"
  ON public.summaries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_summaries_user_id ON public.summaries(user_id);
CREATE INDEX idx_summaries_post_id ON public.summaries(post_id);
CREATE INDEX idx_summaries_category ON public.summaries(category);