'use client';

import { Sidebar } from './sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onAddAgent?: () => void;
}

export function DashboardLayout({ children, onAddAgent }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onAddAgent={onAddAgent} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
