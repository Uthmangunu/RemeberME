import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Brain, Edit } from 'lucide-react';
import { DeleteContextButton } from '@/components/contexts/DeleteContextButton';

export default async function MemoriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's memories
  const { data: memories, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching memories:', error);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-cyan section-block-sm text-navy border-b-4 border-navy">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-headline mb-4">Memories</h1>
              <p className="text-xl opacity-80">
                Personal context that AI should remember about you
              </p>
            </div>
            <Link
              href="/dashboard/memories/new"
              className="flex items-center space-x-2 bg-navy text-white px-6 py-3 font-bold hover:bg-opacity-90 transition-all"
            >
              <Plus className="h-5 w-5" />
              <span>New Memory</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Memories Grid */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        {!memories || memories.length === 0 ? (
          <div className="geometric-card text-center py-16 border-4 border-cyan">
            <div className="inline-flex h-20 w-20 bg-cyan items-center justify-center mb-6">
              <Brain className="h-10 w-10 text-navy" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No memories yet</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Create your first memory to help AI remember important information about you
            </p>
            <Link
              href="/dashboard/memories/new"
              className="inline-flex items-center space-x-2 bg-cyan text-navy px-6 py-3 font-bold hover:bg-opacity-90 transition-all"
            >
              <Plus className="h-5 w-5" />
              <span>Create Memory</span>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MemoryCard({ memory }: { memory: any }) {
  const createdDate = new Date(memory.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="geometric-card border-l-8 border-cyan">
      <div className="flex items-start justify-between mb-4">
        <Brain className="h-6 w-6 text-cyan" />
        <div className="flex items-center space-x-2">
          <Link
            href={`/dashboard/memories/${memory.id}/edit`}
            className="p-2 hover:bg-muted transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <DeleteContextButton contextId={memory.id} />
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3">{memory.title || 'Untitled Memory'}</h3>
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
        {memory.content}
      </p>
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
        <span>{createdDate}</span>
        <span>{memory.content?.length || 0} characters</span>
      </div>
    </div>
  );
}
