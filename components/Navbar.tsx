'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <nav style={{ backgroundColor: '#1f2937', color: 'white' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link href="/dashboard" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', textDecoration: 'none' }}>
              Clinic EMR
            </Link>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link
                href="/dashboard"
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.25rem',
                  backgroundColor: isActive('/dashboard') && pathname === '/dashboard' ? '#374151' : 'transparent',
                  color: 'white',
                  textDecoration: 'none',
                }}
              >
                Dashboard
              </Link>
              <Link
                href="/patients"
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.25rem',
                  backgroundColor: isActive('/patients') ? '#374151' : 'transparent',
                  color: 'white',
                  textDecoration: 'none',
                }}
              >
                Patients
              </Link>
              <Link
                href="/visits"
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.25rem',
                  backgroundColor: isActive('/visits') ? '#374151' : 'transparent',
                  color: 'white',
                  textDecoration: 'none',
                }}
              >
                Visits
              </Link>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              style={{ padding: '0.5rem 0.75rem', backgroundColor: '#dc2626', color: 'white', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}