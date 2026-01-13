-- ================================================================
-- RemeberME Context Bank - Initial Schema Migration
-- ================================================================
-- This migration adds multi-user support, categorization, tags,
-- visibility control, and all supporting tables for the UI.
-- ================================================================

-- ================================================================
-- EXTENSIONS
-- ================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

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

-- ================================================================
-- CATEGORIES TABLE
-- ================================================================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  color text default '#3b82f6', -- Default blue color
  icon text default '📁', -- Default folder emoji
  parent_id uuid references categories(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_category_name_per_user unique(user_id, name)
);

comment on table categories is 'User-defined categories for organizing memories';
comment on column categories.parent_id is 'Enables hierarchical category structure';

create index idx_categories_user_id on categories(user_id);
create index idx_categories_parent_id on categories(parent_id);

-- ================================================================
-- TAGS TABLE
-- ================================================================
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_tag_name_per_user unique(user_id, name)
);

comment on table tags is 'Flexible tagging system for memories';

create index idx_tags_user_id on tags(user_id);
create index idx_tags_name on tags(name); -- For autocomplete searches

-- ================================================================
-- EXTEND DOCUMENTS TABLE
-- ================================================================
-- Add new columns to existing documents table
do $$
begin
  -- Add user_id column
  if not exists (select 1 from information_schema.columns
                 where table_name='documents' and column_name='user_id') then
    alter table documents add column user_id uuid references auth.users(id) on delete cascade;
  end if;

  -- Add title column
  if not exists (select 1 from information_schema.columns
                 where table_name='documents' and column_name='title') then
    alter table documents add column title text;
  end if;

  -- Add visibility column
  if not exists (select 1 from information_schema.columns
                 where table_name='documents' and column_name='visibility') then
    alter table documents add column visibility text default 'both'
      check (visibility in ('ui', 'ai', 'both'));
  end if;

  -- Add category_id column
  if not exists (select 1 from information_schema.columns
                 where table_name='documents' and column_name='category_id') then
    alter table documents add column category_id uuid references categories(id) on delete set null;
  end if;

  -- Add is_template column
  if not exists (select 1 from information_schema.columns
                 where table_name='documents' and column_name='is_template') then
    alter table documents add column is_template boolean default false;
  end if;

  -- Add template_name column
  if not exists (select 1 from information_schema.columns
                 where table_name='documents' and column_name='template_name') then
    alter table documents add column template_name text;
  end if;

  -- Add updated_at column
  if not exists (select 1 from information_schema.columns
                 where table_name='documents' and column_name='updated_at') then
    alter table documents add column updated_at timestamp with time zone
      default timezone('utc'::text, now()) not null;
  end if;
end $$;

comment on column documents.user_id is 'Owner of the document';
comment on column documents.title is 'Human-readable title extracted from content or filename';
comment on column documents.visibility is 'Controls whether document is visible to UI, AI, or both';
comment on column documents.category_id is 'Assigned category for organization';
comment on column documents.is_template is 'Marks document as a preset template';
comment on column documents.template_name is 'Name identifier for templates';

-- Create indexes on documents table
create index if not exists idx_documents_user_id on documents(user_id);
create index if not exists idx_documents_visibility on documents(visibility);
create index if not exists idx_documents_category on documents(category_id);
create index if not exists idx_documents_template on documents(is_template) where is_template = true;
create index if not exists idx_documents_created_at on documents(created_at desc);

-- ================================================================
-- DOCUMENT_TAGS JOIN TABLE
-- ================================================================
create table if not exists document_tags (
  document_id uuid not null references documents(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (document_id, tag_id)
);

comment on table document_tags is 'Many-to-many relationship between documents and tags';

create index idx_document_tags_document on document_tags(document_id);
create index idx_document_tags_tag on document_tags(tag_id);

-- ================================================================
-- EXTEND DOCUMENT_CHUNKS TABLE
-- ================================================================
-- Add user_id for RLS policies
do $$
begin
  if not exists (select 1 from information_schema.columns
                 where table_name='document_chunks' and column_name='user_id') then
    alter table document_chunks add column user_id uuid references auth.users(id) on delete cascade;
  end if;
end $$;

comment on column document_chunks.user_id is 'Denormalized user_id for efficient RLS queries';

create index if not exists idx_chunks_user_id on document_chunks(user_id);
create index if not exists idx_chunks_document_id on document_chunks(document_id);

-- ================================================================
-- EXPORT_TEMPLATES TABLE
-- ================================================================
create table if not exists export_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  format text not null check (format in ('json', 'markdown', 'txt', 'xml', 'custom')),
  template_config jsonb not null default '{}'::jsonb,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_template_name_per_user unique(user_id, name)
);

comment on table export_templates is 'User-defined custom export templates';
comment on column export_templates.template_config is 'JSON configuration for export formatting rules';
comment on column export_templates.is_public is 'Whether template can be shared with other users';

create index idx_export_templates_user_id on export_templates(user_id);

-- ================================================================
-- PRESET_DATASETS TABLE
-- ================================================================
create table if not exists preset_datasets (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  category text,
  data jsonb not null,
  tags text[] default array[]::text[],
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table preset_datasets is 'Pre-built dataset templates users can import';
comment on column preset_datasets.data is 'Contains categories, memories, and metadata in JSON format';

create index idx_preset_datasets_category on preset_datasets(category);
create index idx_preset_datasets_active on preset_datasets(is_active) where is_active = true;

-- ================================================================
-- CATEGORIZATION_SUGGESTIONS TABLE
-- ================================================================
create table if not exists categorization_suggestions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  suggested_category_id uuid references categories(id) on delete cascade,
  confidence float not null check (confidence >= 0 and confidence <= 1),
  suggested_tags uuid[] default array[]::uuid[],
  reasoning text,
  applied boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table categorization_suggestions is 'AI-generated categorization suggestions history';
comment on column categorization_suggestions.confidence is 'Confidence score between 0 and 1';
comment on column categorization_suggestions.applied is 'Whether user accepted the suggestion';

create index idx_cat_suggestions_document on categorization_suggestions(document_id);
create index idx_cat_suggestions_created on categorization_suggestions(created_at desc);

-- ================================================================
-- ACTIVITY_LOG TABLE
-- ================================================================
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('create', 'update', 'delete', 'export', 'import', 'categorize')),
  entity_type text not null check (entity_type in ('document', 'category', 'tag', 'template')),
  entity_id uuid,
  details jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table activity_log is 'User activity tracking for audit and analytics';

create index idx_activity_user_created on activity_log(user_id, created_at desc);
create index idx_activity_entity on activity_log(entity_type, entity_id);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS on all tables
alter table documents enable row level security;
alter table document_chunks enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table document_tags enable row level security;
alter table user_profiles enable row level security;
alter table export_templates enable row level security;
alter table categorization_suggestions enable row level security;
alter table activity_log enable row level security;

-- User Profiles Policies
create policy "Users can view own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on user_profiles for insert
  with check (auth.uid() = id);

-- Documents Policies
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

-- Document Chunks Policies
create policy "Users can view own chunks"
  on document_chunks for select
  using (auth.uid() = user_id);

create policy "Users can insert own chunks"
  on document_chunks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own chunks"
  on document_chunks for update
  using (auth.uid() = user_id);

create policy "Users can delete own chunks"
  on document_chunks for delete
  using (auth.uid() = user_id);

-- Categories Policies
create policy "Users can view own categories"
  on categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on categories for delete
  using (auth.uid() = user_id);

-- Tags Policies
create policy "Users can view own tags"
  on tags for select
  using (auth.uid() = user_id);

create policy "Users can insert own tags"
  on tags for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tags"
  on tags for update
  using (auth.uid() = user_id);

create policy "Users can delete own tags"
  on tags for delete
  using (auth.uid() = user_id);

-- Document Tags Policies
create policy "Users can view own document tags"
  on document_tags for select
  using (
    exists (
      select 1 from documents
      where documents.id = document_tags.document_id
      and documents.user_id = auth.uid()
    )
  );

create policy "Users can insert own document tags"
  on document_tags for insert
  with check (
    exists (
      select 1 from documents
      where documents.id = document_tags.document_id
      and documents.user_id = auth.uid()
    )
  );

create policy "Users can delete own document tags"
  on document_tags for delete
  using (
    exists (
      select 1 from documents
      where documents.id = document_tags.document_id
      and documents.user_id = auth.uid()
    )
  );

-- Export Templates Policies
create policy "Users can view own templates"
  on export_templates for select
  using (auth.uid() = user_id or is_public = true);

create policy "Users can insert own templates"
  on export_templates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own templates"
  on export_templates for update
  using (auth.uid() = user_id);

create policy "Users can delete own templates"
  on export_templates for delete
  using (auth.uid() = user_id);

-- Categorization Suggestions Policies
create policy "Users can view own suggestions"
  on categorization_suggestions for select
  using (
    exists (
      select 1 from documents
      where documents.id = categorization_suggestions.document_id
      and documents.user_id = auth.uid()
    )
  );

create policy "Users can insert own suggestions"
  on categorization_suggestions for insert
  with check (
    exists (
      select 1 from documents
      where documents.id = categorization_suggestions.document_id
      and documents.user_id = auth.uid()
    )
  );

create policy "Users can update own suggestions"
  on categorization_suggestions for update
  using (
    exists (
      select 1 from documents
      where documents.id = categorization_suggestions.document_id
      and documents.user_id = auth.uid()
    )
  );

-- Activity Log Policies
create policy "Users can view own activity"
  on activity_log for select
  using (auth.uid() = user_id);

create policy "Users can insert own activity"
  on activity_log for insert
  with check (auth.uid() = user_id);

-- Preset Datasets (public read access)
-- Note: Presets are managed by admins, not individual users
alter table preset_datasets enable row level security;

create policy "Anyone can view active presets"
  on preset_datasets for select
  using (is_active = true);

-- ================================================================
-- UPDATED SEARCH FUNCTION WITH VISIBILITY FILTER
-- ================================================================
create or replace function match_documents_filtered (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid,
  p_visibility text default 'both',
  filter jsonb default '{}'::jsonb
) returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float,
  document_id uuid,
  document_title text,
  document_visibility text
) language plpgsql stable as $$
begin
  return query
  select
    dc.id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity,
    dc.document_id,
    d.title as document_title,
    d.visibility as document_visibility
  from document_chunks dc
  join documents d on dc.document_id = d.id
  where
    dc.user_id = p_user_id
    and (
      d.visibility = p_visibility
      or d.visibility = 'both'
      or p_visibility = 'both'
    )
    and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;

comment on function match_documents_filtered is 'Semantic search with user scoping and visibility filtering';

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

-- Apply triggers to tables with updated_at column
drop trigger if exists update_documents_updated_at on documents;
create trigger update_documents_updated_at
  before update on documents
  for each row execute function update_updated_at_column();

drop trigger if exists update_categories_updated_at on categories;
create trigger update_categories_updated_at
  before update on categories
  for each row execute function update_updated_at_column();

drop trigger if exists update_user_profiles_updated_at on user_profiles;
create trigger update_user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at_column();

drop trigger if exists update_export_templates_updated_at on export_templates;
create trigger update_export_templates_updated_at
  before update on export_templates
  for each row execute function update_updated_at_column();

drop trigger if exists update_preset_datasets_updated_at on preset_datasets;
create trigger update_preset_datasets_updated_at
  before update on preset_datasets
  for each row execute function update_updated_at_column();

-- ================================================================
-- HELPER FUNCTION: Sync user_id from documents to chunks
-- ================================================================
-- This function ensures document_chunks always have the correct user_id
create or replace function sync_chunk_user_id()
returns trigger as $$
begin
  -- When a new chunk is inserted, set user_id from parent document
  if TG_OP = 'INSERT' then
    select user_id into new.user_id
    from documents
    where id = new.document_id;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists sync_chunk_user_id_trigger on document_chunks;
create trigger sync_chunk_user_id_trigger
  before insert on document_chunks
  for each row execute function sync_chunk_user_id();

-- ================================================================
-- SEED DEFAULT PRESET DATASETS (Optional)
-- ================================================================
-- Insert starter preset datasets
insert into preset_datasets (name, description, category, data, tags, is_active)
values
  (
    'Personal Assistant Starter',
    'Essential categories and sample memories for personal productivity',
    'productivity',
    '{
      "categories": [
        {"name": "Goals", "description": "Long-term and short-term goals", "color": "#10b981", "icon": "🎯"},
        {"name": "Habits", "description": "Daily habits and routines", "color": "#8b5cf6", "icon": "✅"},
        {"name": "Tasks", "description": "To-do items and action items", "color": "#f59e0b", "icon": "📋"},
        {"name": "Notes", "description": "Quick notes and thoughts", "color": "#3b82f6", "icon": "📝"}
      ],
      "memories": [
        {"title": "Sample Goal", "content": "This is an example goal memory. You can track your aspirations here.", "categoryName": "Goals", "tags": ["example"]},
        {"title": "Sample Habit", "content": "Track your daily habits and build consistency.", "categoryName": "Habits", "tags": ["example", "daily"]}
      ]
    }'::jsonb,
    array['productivity', 'personal', 'starter'],
    true
  ),
  (
    'Developer Context',
    'Categories optimized for software development context',
    'development',
    '{
      "categories": [
        {"name": "Projects", "description": "Active and past projects", "color": "#3b82f6", "icon": "💻"},
        {"name": "Learning", "description": "Technologies and concepts being learned", "color": "#8b5cf6", "icon": "📚"},
        {"name": "Code Snippets", "description": "Useful code patterns and snippets", "color": "#10b981", "icon": "🔧"},
        {"name": "Documentation", "description": "Project documentation and notes", "color": "#f59e0b", "icon": "📖"}
      ],
      "memories": [
        {"title": "Sample Project", "content": "Project overview and key details.", "categoryName": "Projects", "tags": ["example", "project"]}
      ]
    }'::jsonb,
    array['development', 'coding', 'starter'],
    true
  ),
  (
    'Research Notes',
    'Academic-style organization for research and learning',
    'academic',
    '{
      "categories": [
        {"name": "Papers", "description": "Academic papers and articles", "color": "#3b82f6", "icon": "📄"},
        {"name": "Ideas", "description": "Research ideas and hypotheses", "color": "#f59e0b", "icon": "💡"},
        {"name": "References", "description": "Citations and sources", "color": "#8b5cf6", "icon": "🔖"},
        {"name": "Quotes", "description": "Notable quotes and excerpts", "color": "#10b981", "icon": "💬"}
      ],
      "memories": [
        {"title": "Sample Paper Note", "content": "Summary and key findings from research paper.", "categoryName": "Papers", "tags": ["example", "research"]}
      ]
    }'::jsonb,
    array['academic', 'research', 'starter'],
    true
  )
on conflict (name) do nothing;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
-- Run this migration on your Supabase database using the SQL editor
-- or via the Supabase CLI.
--
-- After running this migration:
-- 1. Existing documents will have NULL user_id (needs manual assignment)
-- 2. Existing document_chunks will have NULL user_id (will be synced on next insert)
-- 3. All new tables will be created with proper RLS policies
-- 4. Preset datasets will be available for import
-- ================================================================
