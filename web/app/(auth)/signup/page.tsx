'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data?.user) {
        // Check if email confirmation is required
        if (data.user.identities?.length === 0) {
          setError('An account with this email already exists');
          return;
        }

        setSuccess(true);

        // If email confirmation is not required, redirect to dashboard
        if (data.session) {
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 2000);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="w-full max-w-md px-4">
          <div className="geometric-card border-accent-navy bg-white space-y-6">
            <div className="h-12 w-12 bg-navy flex items-center justify-center">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-title text-navy">Check your email</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We've sent you a confirmation link to <strong>{email}</strong>.
                Please check your inbox to verify your account.
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Already verified?{' '}
                <Link href="/login" className="font-semibold text-navy hover:text-navy/80">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="w-full max-w-md px-4">
        <div className="geometric-card border-accent-navy bg-white space-y-8">
          <div className="space-y-4">
            <div className="h-12 w-12 bg-navy flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div>
              <h2 className="text-title text-navy">Create your account</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Start managing your context bank
              </p>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
          {error && (
            <div className="border-2 border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-bold text-navy mb-2"
              >
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input-base"
                placeholder="John Doe"
              />
            </div>

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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold text-navy mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-base"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-navy hover:text-navy/80"
            >
              Sign in
            </Link>
          </p>
          </form>
        </div>
      </div>
    </div>
  );
}
