'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { LayoutDashboard, FileText, Users, Tag, ArrowLeft, LogOut, Loader2 } from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-muted-foreground font-semibold">Verifying administrative access...</span>
      </div>
    );
  }

  // Guard: Only ADMINS can view this admin root group
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center gap-4 text-center px-4">
        <h2 className="font-heading font-extrabold text-2xl">Access Denied</h2>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          You do not have permission to view the administrative panel. Please sign in with an administrator account.
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
        {/* Brand Logo */}
        <Link href="/" className="mb-8 flex items-center gap-2 bg-white dark:bg-black px-3 py-1.5 rounded-xl border border-border/40 shadow-xs w-max">
          <img src="/logo.png" alt="BlogBuilder" className="h-10 w-auto dark:invert object-contain" />
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">Admin</span>
        </Link>

        {/* User Block */}
        <div className="flex items-center gap-3 p-3 border border-border/40 rounded-xl bg-secondary/15 mb-6">
          <Image
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt={user.name || 'User'}
            width={36}
            height={36}
            className="rounded-full object-cover border border-border"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold truncate">{user.name}</h4>
            <span className="text-[9px] text-red-400 font-extrabold uppercase tracking-wider">{user.role}</span>
          </div>
        </div>

        {/* Menu Navigation Links */}
        <nav className="flex flex-col gap-1.5 flex-grow">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-all"
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-500" />
            Dashboard Overview
          </Link>
          <Link
            href="/admin/blogs"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-all"
          >
            <FileText className="w-4 h-4 text-emerald-500" />
            Manage Blogs
          </Link>
          <Link
            href="/admin/employees"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-all"
          >
            <Users className="w-4 h-4 text-amber-500" />
            Manage Employees
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-all"
          >
            <Tag className="w-4 h-4 text-cyan-500" />
            Taxonomy CRUD
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
        <Link href="/admin" className="flex items-center gap-2 bg-white dark:bg-black px-2.5 py-1 rounded-xl border border-border/40 shadow-xs w-max">
          <img src="/logo.png" alt="BlogBuilder" className="h-8 w-auto dark:invert object-contain" />
          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">Admin</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-xs font-bold text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/admin/blogs" className="text-xs font-bold text-muted-foreground hover:text-foreground">
            Blogs
          </Link>
          <Link href="/admin/employees" className="text-xs font-bold text-muted-foreground hover:text-foreground">
            Authors
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

      {/* 3. Main Administration Workspace Content Area */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
