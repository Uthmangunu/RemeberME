-- ================================================================
-- RemeberME Context Bank - Add Prompts Table
-- ================================================================
-- This migration adds a prompts table for storing reusable AI prompts
-- ================================================================

-- ================================================================
-- PROMPTS TABLE
-- ================================================================
create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table prompts is 'Reusable AI prompts for common tasks and workflows';

create index idx_prompts_user_id on prompts(user_id);
create index idx_prompts_created_at on prompts(created_at desc);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
alter table prompts enable row level security;

-- Users can view their own prompts
create policy "Users can view their own prompts"
  on prompts for select
  using (auth.uid() = user_id);

-- Users can insert their own prompts
create policy "Users can insert their own prompts"
  on prompts for insert
  with check (auth.uid() = user_id);

-- Users can update their own prompts
create policy "Users can update their own prompts"
  on prompts for update
  using (auth.uid() = user_id);

-- Users can delete their own prompts
create policy "Users can delete their own prompts"
  on prompts for delete
  using (auth.uid() = user_id);
