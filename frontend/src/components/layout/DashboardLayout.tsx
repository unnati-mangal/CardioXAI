import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth.tsx';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-white border-r border-brand-border">
        <Sidebar />
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-brand-border flex items-center justify-end px-6 flex-shrink-0">
          {user && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {(user.email ?? 'U')[0].toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-brand-muted hidden sm:block">
                {user.email}
              </span>
            </div>
          )}
        </header>

        {/* Decorative wave strip at bottom of viewport */}
        <div className="fixed bottom-0 left-56 right-0 pointer-events-none overflow-hidden h-28 z-0">
          <svg viewBox="0 0 1200 112" preserveAspectRatio="none"
               className="w-full h-full opacity-[0.06]">
            <path d="M0,56 C200,0 400,112 600,56 C800,0 1000,112 1200,56 L1200,112 L0,112 Z"
                  fill="#3D7A5A" />
          </svg>
          {/* faint heartbeat line */}
          <svg viewBox="0 0 1200 56" preserveAspectRatio="none"
               className="absolute bottom-12 left-0 w-full h-10 opacity-[0.08]">
            <polyline points="0,28 220,28 260,8 290,48 320,8 350,28 600,28 640,8 670,48 700,8 730,28 1200,28"
                      fill="none" stroke="#3D7A5A" strokeWidth="2"/>
          </svg>
        </div>

        {/* Page content — full width, generous padding */}
        <main className="relative z-10 flex-1 px-6 md:px-10 py-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
