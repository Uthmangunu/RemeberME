'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, User, Brain, Zap } from 'lucide-react';
import { useState } from 'react';

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <nav className="border-b-4 border-navy bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-navy flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <span className="text-2xl font-bold text-navy">Remember<span className="text-cyan">ME</span></span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-8">
            <Link
              href="/dashboard/memories"
              className={`flex items-center space-x-2 text-sm font-bold uppercase tracking-wider transition-colors pb-1 ${
                isActive('/dashboard/memories')
                  ? 'text-navy border-b-4 border-cyan'
                  : 'text-muted-foreground hover:text-navy'
              }`}
            >
              <Brain className="h-5 w-5" />
              <span>Memories</span>
            </Link>
            <Link
              href="/dashboard/prompts"
              className={`flex items-center space-x-2 text-sm font-bold uppercase tracking-wider transition-colors pb-1 ${
                isActive('/dashboard/prompts')
                  ? 'text-navy border-b-4 border-orange'
                  : 'text-muted-foreground hover:text-navy'
              }`}
            >
              <Zap className="h-5 w-5" />
              <span>Prompts</span>
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center justify-center h-10 w-10 border-2 border-navy hover:bg-navy hover:text-white transition-all"
                aria-label="User menu"
              >
                <User className="h-5 w-5" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 border-2 border-navy bg-white shadow-xl z-50">
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium hover:bg-muted transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
