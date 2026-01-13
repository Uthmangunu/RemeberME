import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Brain, Zap, ArrowRight } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch counts
  const { data: memories } = await supabase
    .from('documents')
    .select('id')
    .eq('user_id', user.id);

  const { data: prompts } = await supabase
    .from('prompts')
    .select('id')
    .eq('user_id', user.id);

  const memoriesCount = memories?.length || 0;
  const promptsCount = prompts?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-navy section-block text-white border-b-4 border-navy">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-display mb-6">Dashboard</h1>
          <p className="text-2xl opacity-90 max-w-3xl">
            Manage your memories and prompts. Build a personal knowledge base for AI.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="grid md:grid-cols-2">
        {/* Memories Section */}
        <Link
          href="/dashboard/memories"
          className="section-block bg-cyan text-navy hover:opacity-90 transition-opacity border-r-4 border-b-4 border-navy group"
        >
          <div className="flex items-start justify-between mb-8">
            <Brain className="h-16 w-16 opacity-80" />
            <ArrowRight className="h-8 w-8 opacity-60 group-hover:translate-x-2 transition-transform" />
          </div>
          <h2 className="text-headline mb-4">Memories</h2>
          <p className="text-xl opacity-80 mb-6">
            Personal context and information that AI should remember about you
          </p>
          <div className="flex items-baseline space-x-3">
            <span className="text-6xl font-bold">{memoriesCount}</span>
            <span className="text-lg uppercase font-bold tracking-wider">
              {memoriesCount === 1 ? 'Memory' : 'Memories'}
            </span>
          </div>
        </Link>

        {/* Prompts Section */}
        <Link
          href="/dashboard/prompts"
          className="section-block bg-orange text-navy hover:opacity-90 transition-opacity border-b-4 border-navy group"
        >
          <div className="flex items-start justify-between mb-8">
            <Zap className="h-16 w-16 opacity-80" />
            <ArrowRight className="h-8 w-8 opacity-60 group-hover:translate-x-2 transition-transform" />
          </div>
          <h2 className="text-headline mb-4">Prompts</h2>
          <p className="text-xl opacity-80 mb-6">
            Reusable prompts for common tasks and workflows
          </p>
          <div className="flex items-baseline space-x-3">
            <span className="text-6xl font-bold">{promptsCount}</span>
            <span className="text-lg uppercase font-bold tracking-wider">
              {promptsCount === 1 ? 'Prompt' : 'Prompts'}
            </span>
          </div>
        </Link>
      </section>

      {/* Quick Actions */}
      <section className="section-block bg-background">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-title mb-8">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/dashboard/memories/new"
              className="geometric-card border-l-8 border-cyan hover:-translate-y-1 transition-transform"
            >
              <Brain className="h-8 w-8 text-cyan mb-4" />
              <h3 className="text-xl font-bold mb-2">Create Memory</h3>
              <p className="text-muted-foreground">
                Add new personal context for AI to remember
              </p>
            </Link>

            <Link
              href="/dashboard/prompts/new"
              className="geometric-card border-l-8 border-orange hover:-translate-y-1 transition-transform"
            >
              <Zap className="h-8 w-8 text-orange mb-4" />
              <h3 className="text-xl font-bold mb-2">Create Prompt</h3>
              <p className="text-muted-foreground">
                Save a reusable prompt for common tasks
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
