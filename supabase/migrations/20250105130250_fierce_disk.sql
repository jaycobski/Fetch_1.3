/*
  # Fix summaries table structure

  1. Changes
    - Make content column nullable
    - Add status column for tracking summary generation
    - Add error_message column for storing failure reasons
  
  2. Data Migration
    - No data migration needed as this is a new table
*/

-- Make content nullable and add status tracking
ALTER TABLE public.summaries 
  ALTER COLUMN content DROP NOT NULL,
  ADD COLUMN status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  ADD COLUMN error_message text;

-- Add index for status filtering
CREATE INDEX idx_summaries_status ON public.summaries(status);