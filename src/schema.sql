-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store documents (files)
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  content text, -- Optional: store full text if needed, or just rely on chunks
  metadata jsonb, -- Store file metadata: name, source, type, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table to store document chunks
create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  content text, -- The text content of the chunk
  embedding vector(1536), -- OpenAI embeddings are 1536 dimensions
  metadata jsonb, -- Chunk-specific metadata (e.g., page number)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter jsonb default '{}'
) returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
) language plpgsql stable as $$
begin
  return query
  select
    document_chunks.id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;
