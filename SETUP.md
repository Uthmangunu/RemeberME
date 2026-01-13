# RemeberME Setup Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account and project

## 1. Database Setup

You need to run the SQL migration to create the required tables.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `migrations/001_initial_schema.sql`
5. Paste and run the query
6. Verify tables were created in the **Table Editor**

### Option B: Quick Setup (Minimal)

If you want to start quickly, run this minimal SQL in the Supabase SQL Editor:

```sql
-- Create documents table if it doesn't exist
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  content text,
  visibility text default 'both' check (visibility in ('ui', 'ai', 'both')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table documents enable row level security;

-- Create policies
create policy "Users can view their own documents"
  on documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on documents for update
  using (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on documents for delete
  using (auth.uid() = user_id);

-- Create index
create index idx_documents_user_id on documents(user_id);
```

## 2. Web Application Setup

### Install Dependencies

```bash
cd web
npm install
```

### Configure Environment Variables

The `.env.local` file should already be configured with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xcetovmdgmykkufwuaja.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Start Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:3000**

## 3. Testing the Application

1. **Create an account**: Visit http://localhost:3000/signup
2. **Login**: Use your credentials at http://localhost:3000/login
3. **Dashboard**: After login, you'll be redirected to http://localhost:3000/dashboard
4. **Create a context**: Click "Create Context" and add your first memory
5. **View contexts**: Navigate to "All Contexts" to see your saved contexts

## Features

### Current Functionality
- ✅ User authentication (signup/login/logout)
- ✅ Protected dashboard
- ✅ Create contexts/memories
- ✅ View all contexts
- ✅ Edit contexts
- ✅ Delete contexts
- ✅ Session management

### Planned Features
- ⏳ Categories and tags
- ⏳ Export to various formats
- ⏳ Import from files
- ⏳ AI-powered categorization
- ⏳ Context search and filtering
- ⏳ MCP server integration

## Troubleshooting

### "Context not found" or database errors
- Make sure you've run the database migration
- Check that Row Level Security policies are enabled
- Verify your user is authenticated

### Port already in use
- Next.js will automatically use the next available port (3001, 3002, etc.)
- Or kill the process using the port: `lsof -ti:3000 | xargs kill`

### Authentication issues
- Clear browser cookies and try again
- Verify Supabase credentials in `.env.local`
- Check Supabase dashboard for authentication errors

## Project Structure

```
web/
├── app/
│   ├── (auth)/           # Authentication pages (login, signup)
│   ├── dashboard/        # Protected dashboard pages
│   │   ├── contexts/     # Context management
│   │   │   ├── new/      # Create context
│   │   │   ├── [id]/     # Context details and edit
│   │   │   └── page.tsx  # List all contexts
│   │   └── page.tsx      # Dashboard home
│   ├── api/              # API routes
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/           # Reusable components
│   ├── contexts/         # Context-specific components
│   └── layout/           # Layout components (TopNav)
├── lib/                  # Utilities
│   └── supabase/         # Supabase clients and middleware
└── providers/            # React providers (QueryProvider)
```
