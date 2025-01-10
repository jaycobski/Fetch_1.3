/*
  # Make category column nullable

  1. Changes
    - Makes the category column nullable in the summaries table
    - Adds a default value of 'Other' for the category column
    
  2. Reason
    - Some summaries may not have a category assigned immediately
    - Provides a default category for uncategorized content
*/

-- Make category column nullable and add default value
ALTER TABLE public.summaries 
  ALTER COLUMN category DROP NOT NULL,
  ALTER COLUMN category SET DEFAULT 'Other';

-- Update any existing NULL categories to 'Other'
UPDATE public.summaries 
SET category = 'Other' 
WHERE category IS NULL;