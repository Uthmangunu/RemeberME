import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Plus, Pencil, FileText } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <div className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Memory Workspace
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Memories</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Create, refine, and organize memories with a clean, professional workflow.
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemoryCard
          href="/dashboard/contexts/new"
          title="Create Memory"
          description="Capture a new memory with structured context and intent."
          icon={<Plus className="h-6 w-6" />}
          step="01"
        />

        <MemoryCard
          href="/dashboard/contexts"
          title="Edit Memory"
          description="Review, update, and refine existing memories."
          icon={<Pencil className="h-6 w-6" />}
          step="02"
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Memories" value="0" />
        <StatCard label="Edited This Week" value="0" />
        <StatCard label="Ready for AI" value="0" />
      </section>

      <section className="rounded-2xl border border-border bg-card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Recent Activity</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Last 30 days
          </span>
        </div>
        <div className="text-center py-10">
          <div className="inline-flex h-14 w-14 rounded-full bg-muted items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            No activity yet. Create your first memory to get started.
          </p>
        </div>
      </section>
    </div>
  );
}

function MemoryCard({
  href,
  title,
  description,
  icon,
  step,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  step: string;
}) {
  return (
    <a
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 card-hover cursor-pointer"
    >
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl border border-primary/30 bg-primary/10 text-primary">
            {icon}
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Step {step}
          </span>
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-2 tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/5" />
    </a>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="text-2xl font-semibold">{value}</div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
