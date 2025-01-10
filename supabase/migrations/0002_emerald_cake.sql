/*
  # Reddit Integration Schema
  
  1. New Tables
    - `reddit_connections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `access_token` (text, encrypted)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `reddit_saved_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `reddit_id` (text)
      - `title` (text)
      - `subreddit` (text)
      - `url` (text)
      - `created_at` (timestamp)
      - `synced_at` (timestamp)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create reddit_connections table
create table if not exists public.reddit_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  access_token text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create reddit_saved_posts table
create table if not exists public.reddit_saved_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  reddit_id text not null,
  title text not null,
  subreddit text not null,
  url text not null,
  created_at timestamptz default now(),
  synced_at timestamptz default now()
);

-- Enable RLS
alter table public.reddit_connections enable row level security;
alter table public.reddit_saved_posts enable row level security;

-- Create policies for reddit_connections
create policy "Users can read own reddit connections"
  on reddit_connections for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own reddit connections"
  on reddit_connections for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own reddit connections"
  on reddit_connections for update
  to authenticated
  using (auth.uid() = user_id);

-- Create policies for reddit_saved_posts
create policy "Users can read own saved posts"
  on reddit_saved_posts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own saved posts"
  on reddit_saved_posts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own saved posts"
  on reddit_saved_posts for update
  to authenticated
  using (auth.uid() = user_id);