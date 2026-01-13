'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPromptPage() {
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
        setError('You must be logged in to create a prompt');
        return;
      }

      const { error: insertError } = await supabase
        .from('prompts')
        .insert({
          user_id: user.id,
          title: title,
          content: content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        setError(insertError.message);
        return;
      }

      router.push('/dashboard/prompts');
      router.refresh();
    } catch (err) {
      console.error('Error creating prompt:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-orange section-block-sm text-navy border-b-4 border-navy">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/dashboard/prompts"
            className="inline-flex items-center space-x-2 mb-6 hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-bold">Back to Prompts</span>
          </Link>
          <h1 className="text-headline">Create New Prompt</h1>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-4 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="border-4 border-destructive bg-destructive/10 p-6">
              <p className="font-bold text-destructive">{error}</p>
            </div>
          )}

          <div className="geometric-card border-l-8 border-orange space-y-8">
            <div className="space-y-3">
              <label
                htmlFor="title"
                className="block text-sm font-bold uppercase tracking-wider"
              >
                Prompt Title <span className="text-destructive">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-2 border-border bg-background px-4 py-3 text-lg font-medium focus:outline-none focus:border-orange transition-colors"
                placeholder="e.g., Code Review Template, Blog Post Writer"
              />
            </div>

            <div className="space-y-3">
              <label
                htmlFor="content"
                className="block text-sm font-bold uppercase tracking-wider"
              >
                Prompt Content <span className="text-destructive">*</span>
              </label>
              <textarea
                id="content"
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="w-full border-2 border-border bg-background px-4 py-3 text-base focus:outline-none focus:border-orange resize-none transition-colors font-mono"
                placeholder="Enter your reusable prompt here...&#10;&#10;Example:&#10;Review the following code for:&#10;- Performance issues&#10;- Security vulnerabilities&#10;- Best practices&#10;- Code style consistency"
              />
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> Use placeholders like [CODE], [TOPIC], or [CONTEXT] that you can replace when using the prompt.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/prompts"
              className="px-6 py-3 border-2 border-navy text-navy font-bold hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-orange text-navy font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Prompt'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
