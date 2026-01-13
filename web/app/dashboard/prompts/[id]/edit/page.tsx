'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditPromptPage() {
  const params = useParams();
  const promptId = params.id as string;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadPrompt() {
      try {
        const { data, error } = await supabase
          .from('prompts')
          .select('*')
          .eq('id', promptId)
          .single();

        if (error) {
          setError('Prompt not found');
          return;
        }

        setTitle(data.title || '');
        setContent(data.content || '');
      } catch (err) {
        console.error('Error loading prompt:', err);
        setError('Failed to load prompt');
      } finally {
        setLoading(false);
      }
    }

    loadPrompt();
  }, [promptId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('prompts')
        .update({
          title: title,
          content: content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', promptId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.push('/dashboard/prompts');
      router.refresh();
    } catch (err) {
      console.error('Error updating prompt:', err);
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-2xl font-bold text-navy">Loading...</div>
      </div>
    );
  }

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
          <h1 className="text-headline">Edit Prompt</h1>
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
              />
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
              disabled={saving}
              className="px-8 py-3 bg-orange text-navy font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
