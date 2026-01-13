'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditContextPage() {
  const params = useParams();
  const contextId = params.id as string;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadContext() {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', contextId)
          .single();

        if (error) {
          setError('Context not found');
          return;
        }

        setTitle(data.title || '');
        setContent(data.content || '');
      } catch (err) {
        console.error('Error loading context:', err);
        setError('Failed to load context');
      } finally {
        setLoading(false);
      }
    }

    loadContext();
  }, [contextId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          title: title,
          content: content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contextId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      router.push('/dashboard/contexts');
      router.refresh();
    } catch (err) {
      console.error('Error updating context:', err);
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/contexts"
          className="p-2 rounded-lg border border-border hover:bg-card transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Context</h1>
          <p className="text-muted-foreground">
            Update your context information
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="professional-card space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium"
            >
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g., Personal Information, Work Context, etc."
            />
          </div>

          {/* Content Textarea */}
          <div className="space-y-2">
            <label
              htmlFor="content"
              className="block text-sm font-medium"
            >
              Content <span className="text-destructive">*</span>
            </label>
            <textarea
              id="content"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Enter your context information here..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/contexts"
            className="px-4 py-2 rounded-lg border border-border hover:bg-card transition-colors font-medium text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
