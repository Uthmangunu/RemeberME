import Link from 'next/link';
import { Brain, Zap, Lock, Share2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section - Navy Block */}
      <section className="bg-navy section-block text-white">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl fade-in-up">
            <h1 className="text-display mb-8">
              Remember<span className="text-yellow">ME</span>
            </h1>
            <p className="text-2xl md:text-3xl mb-12 leading-relaxed opacity-90">
              Your personal memory bank for AI. Store contexts, craft prompts, and never repeat yourself again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-yellow text-navy font-bold text-lg hover:bg-opacity-90 transition-all"
              >
                Get Started →
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-navy transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Modular Blocks */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4">
        <FeatureBlock
          title="Memories"
          description="Store personal context, preferences, and information that AI should remember about you"
          color="bg-cyan"
          icon={<Brain className="h-12 w-12" />}
        />
        <FeatureBlock
          title="Prompts"
          description="Craft and organize reusable prompts for common tasks and workflows"
          color="bg-orange"
          icon={<Zap className="h-12 w-12" />}
        />
        <FeatureBlock
          title="Privacy"
          description="Your data stays yours. Secure, encrypted, and fully under your control"
          color="bg-lime"
          icon={<Lock className="h-12 w-12" />}
        />
        <FeatureBlock
          title="Export"
          description="Share contexts with any AI assistant in multiple formats"
          color="bg-lavender"
          icon={<Share2 className="h-12 w-12" />}
        />
      </section>

      {/* How It Works - Yellow Block */}
      <section className="bg-yellow section-block">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-headline text-navy mb-16">How it works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <Step
              number="01"
              title="Create Memories"
              description="Add information about yourself, your work, preferences, and context"
            />
            <Step
              number="02"
              title="Build Prompts"
              description="Save and organize prompts you use frequently across different AI tools"
            />
            <Step
              number="03"
              title="Share Context"
              description="Export and share your contexts with AI assistants for personalized responses"
            />
          </div>
        </div>
      </section>

      {/* Use Cases - Coral Block */}
      <section className="bg-coral section-block text-white">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-headline mb-16">Perfect for</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <UseCase
              title="Developers"
              description="Store your tech stack, coding preferences, and project contexts. Get AI responses tailored to your development environment."
            />
            <UseCase
              title="Writers & Creators"
              description="Save your writing style, tone preferences, and project details. Maintain consistency across all your AI-assisted work."
            />
            <UseCase
              title="Professionals"
              description="Keep work contexts, client information, and common prompts organized. Streamline your AI-powered workflows."
            />
            <UseCase
              title="Researchers"
              description="Organize research contexts, methodology notes, and domain-specific prompts for more accurate AI assistance."
            />
          </div>
        </div>
      </section>

      {/* CTA - Navy Block */}
      <section className="bg-navy section-block text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-headline mb-8">Start building your AI memory bank</h2>
          <p className="text-xl mb-12 opacity-90">
            Join RememberME and make every AI conversation more personal and productive
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-12 py-5 bg-cyan text-navy font-bold text-xl hover:bg-opacity-90 transition-all"
          >
            Create Free Account →
          </Link>
        </div>
      </section>
    </main>
  );
}

function FeatureBlock({
  title,
  description,
  color,
  icon,
}: {
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`${color} section-block-sm text-navy`}>
      <div className="mb-6 opacity-80">{icon}</div>
      <h3 className="text-title mb-4">{title}</h3>
      <p className="text-lg opacity-80">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="text-6xl font-bold text-navy opacity-20 mb-4">{number}</div>
      <h3 className="text-2xl font-bold text-navy mb-3">{title}</h3>
      <p className="text-lg text-navy opacity-80">{description}</p>
    </div>
  );
}

function UseCase({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-2 border-white p-8">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-lg opacity-90">{description}</p>
    </div>
  );
}
