'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-client';

const tabs = [
  { label: 'Blueprint', href: '/blueprint' },
  { label: 'Build', href: '/ballot' },
];

export default function TopNav() {
  const pathname = usePathname();
  const { user, isAnonymous, signInWithGoogle, logout } = useAuth();

  return (
    <nav className="fixed top-5 left-0 right-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-lg items-center px-4">
        {/* App icon — hide text on small screens */}
        <div className="flex items-center gap-2 mr-4 shrink-0">
          <CheckSquare className="h-5 w-5 text-brand-primary" />
          <span className="text-base font-bold text-gray-900">Ballot Builder</span>
        </div>

        {/* Tab links */}
        <div className="flex items-center gap-4 sm:gap-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/');
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={[
                  'relative pb-0.5 text-sm font-semibold transition-colors',
                  isActive ? 'text-brand-primary' : 'text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 -mb-[17px] h-0.5 rounded-full bg-brand-primary" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Auth controls */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {isAnonymous ? (
            <button
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign in
            </button>
          ) : user ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-700 hidden sm:inline">
                {user.name || user.email}
              </span>
              <button
                onClick={() => logout()}
                className="flex items-center rounded-lg p-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-100"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
