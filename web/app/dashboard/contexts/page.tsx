import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, FileText, Trash2, Edit } from 'lucide-react';
import { DeleteContextButton } from '@/components/contexts/DeleteContextButton';

export default async function ContextsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's contexts
  const { data: contexts, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contexts:', error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Contexts</h1>
          <p className="text-muted-foreground">
            Manage your AI memory bank
          </p>
        </div>
        <Link
          href="/dashboard/contexts/new"
          className="inline-flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Context</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="professional-card">
          <p className="text-sm text-muted-foreground">Total Contexts</p>
          <p className="text-2xl font-bold">{contexts?.length || 0}</p>
        </div>
        <div className="professional-card">
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="text-2xl font-bold">
            {contexts?.filter(c => {
              const created = new Date(c.created_at);
              const now = new Date();
              return created.getMonth() === now.getMonth() &&
                     created.getFullYear() === now.getFullYear();
            }).length || 0}
          </p>
        </div>
        <div className="professional-card">
          <p className="text-sm text-muted-foreground">Categories</p>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="professional-card">
          <p className="text-sm text-muted-foreground">Tags</p>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Contexts List */}
      <div className="space-y-4">
        {!contexts || contexts.length === 0 ? (
          <div className="professional-card text-center py-12">
            <div className="inline-flex h-16 w-16 rounded-full bg-muted items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No contexts yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first context to start building your AI memory bank
            </p>
            <Link
              href="/dashboard/contexts/new"
              className="inline-flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Context</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {contexts.map((context) => (
              <ContextCard key={context.id} context={context} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContextCard({ context }: { context: any }) {
  const createdDate = new Date(context.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="professional-card accent-bar-blue">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">{context.title || 'Untitled Context'}</h3>
            <div className="flex items-center space-x-2">
              <Link
                href={`/dashboard/contexts/${context.id}/edit`}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </Link>
              <DeleteContextButton contextId={context.id} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {context.content}
          </p>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>Created {createdDate}</span>
            <span>•</span>
            <span>{context.content?.length || 0} characters</span>
          </div>
        </div>
      </div>
    </div>
  );
}
