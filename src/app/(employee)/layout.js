'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LayoutDashboard, FileEdit, ArrowLeft, LogOut, Loader2 } from 'lucide-react';

export default function EmployeeLayout({ children }) {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-muted-foreground font-semibold">Verifying credentials...</span>
      </div>
    );
  }

  // Fallback if middleware bypassed but client-side check catches unauthorized
  if (!user || (user.role !== 'EMPLOYEE' && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center gap-4 text-center px-4">
        <h2 className="font-heading font-extrabold text-2xl">Access Denied</h2>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          You do not have permission to view the employee author workspace. Please log in with a valid account.
        </p>
        <Link href="/login" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs shadow-md">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col lg:flex-row">
      {/* 1. Sidebar Navigation (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/60 bg-card p-6 flex-shrink-0">
        {/* Brand */}
        <Link href="/" className="mb-8 flex items-center gap-2">
          <img src="/logo.png" alt="InkFlow" className="h-16 w-auto dark:invert object-contain" />
        </Link>

        {/* User Block */}
        <div className="flex items-center gap-3 p-3 border border-border/40 rounded-xl bg-secondary/15 mb-6">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border border-border"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold truncate">{user.name}</h4>
            <span className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-wider">{user.role}</span>
          </div>
        </div>

        {/* Menu Links */}
        <nav className="flex flex-col gap-1.5 flex-grow">
          <Link
            href="/employee"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview Dashboard
          </Link>
          <Link
            href="/employee/editor/new"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-all"
          >
            <FileEdit className="w-4 h-4" />
            Write Article
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-all mt-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Website
          </Link>
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-border/40 pt-4 flex items-center justify-between mt-4">
          <ThemeToggle />
          <button
            onClick={() => logout()}
            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:scale-105 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </aside>

      {/* 2. Collapsible Mobile Header */}
      <header className="lg:hidden w-full bg-card border-b border-border/60 px-4 py-3 flex items-center justify-between">
        <Link href="/employee" className="flex items-center">
          <img src="/logo.png" alt="InkFlow" className="h-12 w-auto dark:invert object-contain" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/employee" className="text-xs font-bold text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/employee/editor/new" className="text-xs font-bold text-muted-foreground hover:text-foreground">
            Write
          </Link>
          <ThemeToggle />
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/25"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 3. Main Dashboard Workspace Content Area */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
