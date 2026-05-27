'use client';
import { ReactNode, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);

  useEffect(() => {
    const prev = previousPath.current;
    const next = pathname;

    if (prev?.startsWith('/dashboard') && next !== '/dashboard' && next !== '/dashboard/login') {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('lcc_admin_auth');
      }
    }

    previousPath.current = next;
  }, [pathname]);

  return <>{children}</>;
}
