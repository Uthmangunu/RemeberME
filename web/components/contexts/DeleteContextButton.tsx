'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Trash2 } from 'lucide-react';

export function DeleteContextButton({ contextId }: { contextId: string }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', contextId);

      if (error) {
        console.error('Error deleting context:', error);
        alert('Failed to delete context');
        return;
      }

      router.refresh();
      setShowConfirm(false);
    } catch (err) {
      console.error('Error:', err);
      alert('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowConfirm(false)}
          className="px-3 py-1 text-xs rounded border border-border hover:bg-card transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1 text-xs rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Confirm'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
