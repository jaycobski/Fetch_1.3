/*
  # Add tables for storing fetched posts

  1. New Tables
    - `fetched_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `source` (text) - 'reddit' or 'twitter'
      - `external_id` (text) - ID from the source platform
      - `title` (text)
      - `content` (text)
      - `url` (text)
      - `author` (text)
      - `metadata` (jsonb) - Platform-specific data
      - `fetched_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `post_summaries`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references fetched_posts)
      - `summary` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create fetched_posts table
CREATE TABLE IF NOT EXISTS public.fetched_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  source text NOT NULL CHECK (source IN ('reddit', 'twitter')),
  external_id text NOT NULL,
  title text,
  content text,
  url text NOT NULL,
  author text,
  metadata jsonb DEFAULT '{}'::jsonb,
  fetched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, source, external_id)
);

-- Create post_summaries table
CREATE TABLE IF NOT EXISTS public.post_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.fetched_posts(id) ON DELETE CASCADE NOT NULL,
  summary text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fetched_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_summaries ENABLE ROW LEVEL SECURITY;

-- Policies for fetched_posts
CREATE POLICY "Users can read own fetched posts"
  ON public.fetched_posts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fetched posts"
  ON public.fetched_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fetched posts"
  ON public.fetched_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fetched posts"
  ON public.fetched_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for post_summaries
CREATE POLICY "Users can read summaries of own posts"
  ON public.post_summaries
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.fetched_posts
    WHERE id = post_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert summaries for own posts"
  ON public.post_summaries
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.fetched_posts
    WHERE id = post_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update summaries of own posts"
  ON public.post_summaries
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.fetched_posts
    WHERE id = post_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete summaries of own posts"
  ON public.post_summaries
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.fetched_posts
    WHERE id = post_id AND user_id = auth.uid()
  ));

-- Add indexes for better query performance
CREATE INDEX fetched_posts_user_id_idx ON public.fetched_posts(user_id);
CREATE INDEX fetched_posts_source_idx ON public.fetched_posts(source);
CREATE INDEX fetched_posts_external_id_idx ON public.fetched_posts(external_id);
CREATE INDEX post_summaries_post_id_idx ON public.post_summaries(post_id);