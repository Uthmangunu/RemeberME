'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="w-full max-w-md px-4">
        <div className="geometric-card border-accent-navy bg-white space-y-8">
          <div className="space-y-4">
            <div className="h-12 w-12 bg-navy flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div>
              <h2 className="text-title text-navy">Welcome back</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to your RememberME account
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="border-2 border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-navy mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-navy mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="text-navy hover:text-navy/80 font-semibold"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-navy hover:text-navy/80"
            >
              Sign up
            </Link>
          </p>
        </form>
        </div>
      </div>
    </div>
  );
}
