import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-off-white flex flex-col">
      <Navbar />

      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-6 gap-6">
        {/* Sidebar — hidden on mobile, shown from md breakpoint */}
        <aside className="hidden md:block w-52 flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
