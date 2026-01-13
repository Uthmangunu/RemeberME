-- ================================================================
-- RemeberME Context Bank - Initial Schema Migration (Fixed)
-- ================================================================
-- Creates all necessary tables for the application
-- ================================================================

-- ================================================================
-- EXTENSIONS
-- ================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- ================================================================
-- DOCUMENTS TABLE (Core Memories Storage)
-- ================================================================
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text not null,
  visibility text default 'both' check (visibility in ('ui', 'ai', 'both')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table documents is 'User memories and context storage';

create index idx_documents_user_id on documents(user_id);
create index idx_documents_created_at on documents(created_at desc);

-- ================================================================
-- ROW LEVEL SECURITY FOR DOCUMENTS
-- ================================================================
alter table documents enable row level security;

create policy "Users can view own documents"
  on documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on documents for update
  using (auth.uid() = user_id);

create policy "Users can delete own documents"
  on documents for delete
  using (auth.uid() = user_id);

-- ================================================================
-- USER PROFILES TABLE
-- ================================================================
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferences jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table user_profiles is 'Extended user profile information';

alter table user_profiles enable row level security;

create policy "Users can view own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on user_profiles for insert
  with check (auth.uid() = id);

-- ================================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_documents_updated_at
  before update on documents
  for each row execute function update_updated_at_column();

create trigger update_user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at_column();
