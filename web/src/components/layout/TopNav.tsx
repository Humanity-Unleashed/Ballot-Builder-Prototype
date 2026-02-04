'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare } from 'lucide-react';

const tabs = [
  { label: 'Blueprint', href: '/blueprint' },
  { label: 'Build', href: '/ballot' },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-lg items-center px-4">
        {/* App name with icon */}
        <div className="flex items-center gap-2 mr-6">
          <CheckSquare className="h-5 w-5 text-blue-500" />
          <span className="text-base font-bold text-gray-900">Ballot Builder</span>
        </div>

        {/* Tab links */}
        <div className="flex items-center gap-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/');
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={[
                  'relative pb-0.5 text-sm font-semibold transition-colors',
                  isActive ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700',
                ].join(' ')}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 -mb-[17px] h-0.5 rounded-full bg-blue-500" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
