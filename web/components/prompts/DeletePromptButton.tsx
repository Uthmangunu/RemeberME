'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Trash2 } from 'lucide-react';

export function DeletePromptButton({ promptId }: { promptId: string }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', promptId);

      if (error) {
        console.error('Error deleting prompt:', error);
        alert('Failed to delete prompt');
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
          className="px-3 py-1 text-xs border-2 border-navy hover:bg-muted transition-colors"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1 text-xs bg-destructive text-white hover:bg-opacity-90 transition-colors"
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
      className="p-2 hover:bg-destructive/10 text-destructive transition-colors"
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
