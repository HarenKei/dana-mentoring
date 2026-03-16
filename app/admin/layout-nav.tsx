'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/admin/assignments', label: '출제 목록' },
  { href: '/admin/assignments/create', label: '문제 출제' },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
      <div className="flex items-center gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname === link.href
                ? 'bg-primary-100 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <button
        onClick={handleLogout}
        className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
      >
        로그아웃
      </button>
    </nav>
  );
}
