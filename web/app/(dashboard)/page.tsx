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
    <div className="space-y-12">
      <header className="geometric-card border-accent-navy bg-white">
        <div className="inline-flex items-center border-2 border-navy px-3 py-1 text-xs font-bold uppercase tracking-[0.3em] text-navy">
          Memory Workspace
        </div>
        <div className="mt-6 space-y-4">
          <h1 className="text-headline text-navy">Memories</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Create, refine, and organize memories with a clear, professional workflow.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemoryCard
          href="/dashboard/contexts/new"
          title="Create Memory"
          description="Capture a new memory with structured context and intent."
          icon={<Plus className="h-6 w-6" />}
          step="01"
          accent="border-accent-cyan"
          tone="bg-cyan"
        />

        <MemoryCard
          href="/dashboard/contexts"
          title="Edit Memory"
          description="Review, update, and refine existing memories."
          icon={<Pencil className="h-6 w-6" />}
          step="02"
          accent="border-accent-orange"
          tone="bg-orange"
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Memories" value="0" />
        <StatCard label="Edited This Week" value="0" />
        <StatCard label="Ready for AI" value="0" />
      </section>

      <section className="geometric-card border-accent-navy bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-title text-navy">Recent Activity</h2>
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Last 30 days
          </span>
        </div>
        <div className="text-center py-10">
          <div className="inline-flex h-14 w-14 border-2 border-border items-center justify-center mb-4">
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
  accent,
  tone,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  step: string;
  accent: string;
  tone: string;
}) {
  return (
    <a
      href={href}
      className={`group relative overflow-hidden geometric-card bg-white cursor-pointer ${accent}`}
    >
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center justify-center h-12 w-12 border-2 border-navy text-navy ${tone}`}>
            {icon}
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
            Step {step}
          </span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-navy mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
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
    <div className="geometric-card bg-white">
      <div className="text-3xl font-bold text-navy">{value}</div>
      <p className="text-sm text-muted-foreground mt-2">{label}</p>
    </div>
  );
}
