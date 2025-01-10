/*
  # Add subreddit column to fetched_posts

  1. Changes
    - Add subreddit column to fetched_posts table
    - Add index on subreddit column for faster filtering
    - Backfill subreddit data from metadata

  2. Notes
    - Makes subreddit searchable without JSON operations
    - Maintains existing metadata for backward compatibility
*/

-- Add subreddit column
ALTER TABLE public.fetched_posts
ADD COLUMN subreddit text;

-- Add index for subreddit filtering
CREATE INDEX IF NOT EXISTS idx_fetched_posts_subreddit
ON public.fetched_posts(subreddit);

-- Backfill subreddit data from metadata
UPDATE public.fetched_posts
SET subreddit = metadata->>'subreddit'
WHERE source = 'reddit'
AND metadata->>'subreddit' IS NOT NULL;