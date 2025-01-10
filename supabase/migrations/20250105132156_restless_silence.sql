/*
  # Add Perplexity API tracking

  1. New Tables
    - `perplexity_completions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `post_id` (uuid, references fetched_posts)
      - `prompt` (text, the input prompt)
      - `completion` (text, the API response)
      - `model` (text, the model used)
      - `tokens_used` (integer, token count)
      - `duration_ms` (integer, request duration)
      - `success` (boolean, request status)
      - `error_message` (text, optional error details)
      - `metadata` (jsonb, additional request data)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `perplexity_completions` table
    - Add policies for authenticated users to manage their own completions
*/

-- Create perplexity_completions table
CREATE TABLE IF NOT EXISTS public.perplexity_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES public.fetched_posts(id) ON DELETE CASCADE NOT NULL,
  prompt text NOT NULL,
  completion text,
  model text NOT NULL,
  tokens_used integer,
  duration_ms integer,
  success boolean NOT NULL DEFAULT false,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.perplexity_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own completions"
  ON public.perplexity_completions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own completions"
  ON public.perplexity_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions"
  ON public.perplexity_completions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for better query performance
CREATE INDEX idx_perplexity_completions_user_id 
  ON public.perplexity_completions(user_id);
CREATE INDEX idx_perplexity_completions_post_id 
  ON public.perplexity_completions(post_id);
CREATE INDEX idx_perplexity_completions_success 
  ON public.perplexity_completions(success);
CREATE INDEX idx_perplexity_completions_model 
  ON public.perplexity_completions(model);