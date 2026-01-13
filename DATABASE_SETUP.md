# Database Setup Guide

## Quick Start (Recommended)

Run these migrations in your Supabase SQL Editor **in order**:

### 1. Initial Schema (Documents & Users)

Copy and run `migrations/001_initial_schema_fixed.sql` in Supabase SQL Editor.

This creates:
- `documents` table (for Memories)
- `user_profiles` table
- Row Level Security policies
- Triggers for automatic timestamps

### 2. Prompts Table

Copy and run `migrations/002_add_prompts.sql` in Supabase SQL Editor.

This creates:
- `prompts` table (for reusable AI prompts)
- Row Level Security policies
- Indexes for performance

## How to Run Migrations

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `migrations/001_initial_schema_fixed.sql`
6. Paste and click **Run**
7. Repeat steps 4-6 for `migrations/002_add_prompts.sql`

## Verify Setup

After running migrations, check that these tables exist in **Table Editor**:
- ✅ documents
- ✅ prompts
- ✅ user_profiles

All tables should have RLS (Row Level Security) enabled with a green shield icon.

## Troubleshooting

### "relation does not exist" error
- Make sure you ran migrations in order (001 first, then 002)
- Check that you're running them in the correct Supabase project

### "permission denied" errors
- RLS policies should handle this automatically
- Make sure you're logged in when testing the app

### Need to reset?
```sql
-- WARNING: This deletes ALL data
drop table if exists prompts cascade;
drop table if exists documents cascade;
drop table if exists user_profiles cascade;
```

Then run the migrations again from scratch.

## What's Next?

After running migrations:
1. Start the web app: `cd web && npm run dev`
2. Sign up at http://localhost:3000/signup
3. Create your first Memory or Prompt!
