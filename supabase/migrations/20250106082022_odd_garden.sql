/*
  # Fix Perplexity API Tracking

  1. Add missing functionality
    - Add delete policy for perplexity_completions
    - Add composite index for faster lookups
    - Add request tracking fields

  2. Changes
    - Add new indexes
    - Add missing policy
    - No table creation (already exists)
    - No duplicate policies
*/

-- Add missing delete policy (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'perplexity_completions' 
    AND policyname = 'Users can delete own completions'
  ) THEN
    CREATE POLICY "Users can delete own completions"
      ON public.perplexity_completions
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Add composite index for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_perplexity_completions_user_model
ON public.perplexity_completions(user_id, model);

-- Add index for timestamp filtering (if not exists)
CREATE INDEX IF NOT EXISTS idx_perplexity_completions_timestamp
ON public.perplexity_completions(request_timestamp);

-- Add index for error tracking (if not exists)
CREATE INDEX IF NOT EXISTS idx_perplexity_completions_error
ON public.perplexity_completions(error_message)
WHERE error_message IS NOT NULL;