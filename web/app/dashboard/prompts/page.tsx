import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Zap, Trash2, Edit, Copy } from 'lucide-react';
import { DeletePromptButton } from '@/components/prompts/DeletePromptButton';

export default async function PromptsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's prompts
  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prompts:', error);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-orange section-block-sm text-navy border-b-4 border-navy">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-headline mb-4">Prompts</h1>
              <p className="text-xl opacity-80">
                Save and organize your reusable AI prompts
              </p>
            </div>
            <Link
              href="/dashboard/prompts/new"
              className="flex items-center space-x-2 bg-navy text-white px-6 py-3 font-bold hover:bg-opacity-90 transition-all"
            >
              <Plus className="h-5 w-5" />
              <span>New Prompt</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Prompts Grid */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        {!prompts || prompts.length === 0 ? (
          <div className="geometric-card text-center py-16 border-4 border-orange">
            <div className="inline-flex h-20 w-20 bg-orange items-center justify-center mb-6">
              <Zap className="h-10 w-10 text-navy" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No prompts yet</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Create your first reusable prompt to streamline your AI workflows
            </p>
            <Link
              href="/dashboard/prompts/new"
              className="inline-flex items-center space-x-2 bg-orange text-navy px-6 py-3 font-bold hover:bg-opacity-90 transition-all"
            >
              <Plus className="h-5 w-5" />
              <span>Create Prompt</span>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PromptCard({ prompt }: { prompt: any }) {
  const createdDate = new Date(prompt.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="geometric-card border-l-8 border-orange">
      <div className="flex items-start justify-between mb-4">
        <Zap className="h-6 w-6 text-orange" />
        <div className="flex items-center space-x-2">
          <Link
            href={`/dashboard/prompts/${prompt.id}/edit`}
            className="p-2 hover:bg-muted transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <DeletePromptButton promptId={prompt.id} />
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3">{prompt.title || 'Untitled Prompt'}</h3>
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
        {prompt.content}
      </p>
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
        <span>{createdDate}</span>
        <button
          className="flex items-center space-x-1 hover:text-foreground transition-colors"
          onClick={() => {
            navigator.clipboard.writeText(prompt.content);
          }}
        >
          <Copy className="h-3 w-3" />
          <span>Copy</span>
        </button>
      </div>
    </div>
  );
}
