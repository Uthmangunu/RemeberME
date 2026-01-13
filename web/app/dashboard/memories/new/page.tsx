'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewMemoryPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in to create a memory');
        return;
      }

      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: title,
          content: content,
          visibility: 'both',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        setError(insertError.message);
        return;
      }

      router.push('/dashboard/memories');
      router.refresh();
    } catch (err) {
      console.error('Error creating memory:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-cyan section-block-sm text-navy border-b-4 border-navy">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/dashboard/memories"
            className="inline-flex items-center space-x-2 mb-6 hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-bold">Back to Memories</span>
          </Link>
          <h1 className="text-headline">Create New Memory</h1>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="border-4 border-destructive bg-destructive/10 p-6">
              <p className="font-bold text-destructive">{error}</p>
            </div>
          )}

          <div className="geometric-card border-l-8 border-cyan space-y-8">
            <div className="space-y-3">
              <label
                htmlFor="title"
                className="block text-sm font-bold uppercase tracking-wider"
              >
                Memory Title <span className="text-destructive">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-2 border-border bg-background px-4 py-3 text-lg font-medium focus:outline-none focus:border-cyan transition-colors"
                placeholder="e.g., Personal Background, Work Preferences, Tech Stack"
              />
            </div>

            <div className="space-y-3">
              <label
                htmlFor="content"
                className="block text-sm font-bold uppercase tracking-wider"
              >
                Memory Content <span className="text-destructive">*</span>
              </label>
              <textarea
                id="content"
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="w-full border-2 border-border bg-background px-4 py-3 text-base focus:outline-none focus:border-cyan resize-none transition-colors"
                placeholder="Enter information about yourself that AI should remember...&#10;&#10;Example:&#10;- I'm a full-stack developer working primarily with React and Node.js&#10;- I prefer TypeScript over JavaScript&#10;- I live in New York City and work remotely&#10;- I'm passionate about clean code and best practices"
              />
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> Be specific and organized. This information helps AI provide more personalized and relevant responses.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/memories"
              className="px-6 py-3 border-2 border-navy text-navy font-bold hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-cyan text-navy font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Memory'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
