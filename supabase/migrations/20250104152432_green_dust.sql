/*
  # Fix post schema and constraints

  1. Changes
    - Make title and content nullable
    - Add default empty object for metadata
    - Add indexes for better query performance
    - Update constraints to handle null values
*/

-- Make title and content nullable
ALTER TABLE public.fetched_posts 
  ALTER COLUMN title DROP NOT NULL,
  ALTER COLUMN content DROP NOT NULL;

-- Set default empty object for metadata if null
ALTER TABLE public.fetched_posts 
  ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;

-- Add composite index for faster lookups
CREATE INDEX IF NOT EXISTS idx_fetched_posts_user_source_external
  ON public.fetched_posts(user_id, source, external_id);

-- Add index for source filtering
CREATE INDEX IF NOT EXISTS idx_fetched_posts_source
  ON public.fetched_posts(source);