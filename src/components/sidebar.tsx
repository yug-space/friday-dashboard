'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Blocks,
  LayoutDashboard,
  Bot,
  Settings,
  Plus,
  Search,
  Zap,
  BarChart3,
  FileCode,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  onAddAgent?: () => void;
}

export function Sidebar({ onAddAgent }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Agents',
      href: '/agents',
      icon: Bot,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      disabled: true,
    },
    {
      name: 'Triggers',
      href: '/triggers',
      icon: Zap,
      disabled: true,
    },
    {
      name: 'Logs',
      href: '/logs',
      icon: FileCode,
      disabled: true,
    },
  ];

  const secondaryNav = [
    {
      name: 'Team',
      href: '/team',
      icon: Users,
      disabled: true,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      disabled: true,
    },
  ];

  return (
    <aside className="w-64 border-r bg-card/50 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center">
            <Blocks className="h-5 w-5 text-background" />
          </div>
          <div>
            <h1 className="font-semibold tracking-tight">Friday</h1>
            <p className="text-xs text-muted-foreground">Agent Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Search */}
      <div className="p-3">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground font-normal h-9"
        >
          <Search className="h-4 w-4 mr-2" />
          Search...
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </Button>
      </div>

      {/* Add Agent Button */}
      <div className="px-3 mb-2">
        <Button className="w-full" onClick={onAddAgent}>
          <Plus className="h-4 w-4 mr-2" />
          Add Agent
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-xs font-medium text-muted-foreground px-3 py-2">
          Overview
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.disabled ? '#' : item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
              {item.disabled && (
                <span className="ml-auto text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </Link>
          );
        })}

        <div className="text-xs font-medium text-muted-foreground px-3 py-2 mt-4">
          Settings
        </div>
        {secondaryNav.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.disabled ? '#' : item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
              {item.disabled && (
                <span className="ml-auto text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-medium">YG</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Yug Gupta</p>
            <p className="text-xs text-muted-foreground truncate">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
