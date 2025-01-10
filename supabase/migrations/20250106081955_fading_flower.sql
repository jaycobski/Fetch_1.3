/*
  # Fix Perplexity API Tracking

  1. Add missing functionality
    - Add update policy for perplexity_completions
    - Add composite index for faster lookups
    - Add status tracking column
    - Add request tracking fields

  2. Changes
    - Add new indexes and columns
    - Add missing policies
    - No table creation (already exists)
    - No duplicate policies
*/

-- Add status tracking
ALTER TABLE public.perplexity_completions
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'completed'
  CHECK (status IN ('pending', 'processing', 'completed', 'failed'));

-- Add request tracking
ALTER TABLE public.perplexity_completions
ADD COLUMN IF NOT EXISTS request_id text,
ADD COLUMN IF NOT EXISTS request_timestamp timestamptz DEFAULT now();

-- Add composite index for faster lookups
CREATE INDEX IF NOT EXISTS idx_perplexity_completions_user_post
ON public.perplexity_completions(user_id, post_id);

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_perplexity_completions_status
ON public.perplexity_completions(status);

-- Add index for request tracking
CREATE INDEX IF NOT EXISTS idx_perplexity_completions_request
ON public.perplexity_completions(request_id);

-- Add missing update policy (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'perplexity_completions' 
    AND policyname = 'Users can update own completions'
  ) THEN
    CREATE POLICY "Users can update own completions"
      ON public.perplexity_completions
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;