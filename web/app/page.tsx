import Link from 'next/link';
import { ArrowRight, Sparkles, Database, Share2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="text-center space-y-8 mb-20">
          {/* Logo */}
          <div className="inline-flex h-20 w-20 rounded-2xl border border-primary/30 bg-primary/10 items-center justify-center mb-4">
            <Database className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            Remeber<span className="text-primary">ME</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Your personal context bank for AI interactions.{' '}
            <span className="text-foreground font-medium">
              Store, organize, and share contexts
            </span>{' '}
            with any LLM.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-6">
            <Link
              href="/signup"
              className="group inline-flex items-center space-x-2 bg-primary px-8 py-4 rounded-xl text-primary-foreground font-semibold hover:shadow-lg transition-shadow"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 border-2 border-border px-8 py-4 rounded-xl font-semibold hover:bg-card transition-colors"
            >
              <span>Sign In</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <FeatureCard
            icon={<Sparkles className="h-8 w-8" />}
            title="Smart Organization"
            description="AI-powered categorization and tagging for your contexts"
            tone="tone-primary"
          />
          <FeatureCard
            icon={<Database className="h-8 w-8" />}
            title="Context Management"
            description="Store and manage all your AI contexts in one place"
            tone="tone-secondary"
          />
          <FeatureCard
            icon={<Share2 className="h-8 w-8" />}
            title="Universal Export"
            description="Export to any LLM platform in multiple formats"
            tone="tone-muted"
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 space-y-4 card-hover">
      <div className={`inline-flex p-4 rounded-xl ${tone}`}>
        <div className="text-primary">{icon}</div>
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
