'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Search, Menu, X, Edit, LayoutDashboard, LogOut, LogIn } from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, isLoading } = useAuth();
  
  const [searchVal, setSearchVal] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Synchronize input value with search query params
  useEffect(() => {
    setSearchVal(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/blogs?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      router.push('/blogs');
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 bg-white dark:bg-black px-3 py-1.5 rounded-xl border border-border/40 shadow-xs">
          <img
            src="/logo.png"
            alt="BlogBuilder"
            className="h-10 w-auto dark:invert object-contain"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/blogs"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/blogs?category=technology"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Tech
          </Link>
          <Link
            href="/blogs?category=design"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Design
          </Link>
        </nav>

        {/* Search bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden sm:flex relative max-w-xs w-full flex-grow items-center"
        >
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search articles..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-secondary/30 focus:bg-secondary/60 hover:bg-secondary/50 border border-border/40 focus:border-indigo-500 rounded-lg outline-none transition-all duration-200"
          />
        </form>

        {/* Right side items */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <ThemeToggle />

          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-secondary/50 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              {(user.role === 'ADMIN' || user.role === 'EMPLOYEE') && (
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : '/employee'}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border/60 hover:bg-secondary/40 text-foreground transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              )}
              {/* Profile Avatar */}
              <div className="group relative flex items-center">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-border cursor-pointer"
                />
                {/* Dropdown on Hover */}
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="w-48 bg-card border border-border shadow-lg rounded-xl p-2 flex flex-col gap-1">
                    <div className="px-2 py-1.5 border-b border-border/50">
                      <p className="text-xs font-bold truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => logout()}
                      className="flex items-center gap-2 text-left text-xs text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-lg p-2 transition-all mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all shadow-md shadow-indigo-500/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-border/40 text-foreground transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full bg-background border-b border-border/60 py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-secondary/30 border border-border/40 rounded-lg outline-none"
            />
          </form>

          <nav className="flex flex-col gap-2">
            <Link
              href="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-secondary/40 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              Explore Articles
            </Link>
            <Link
              href="/blogs?category=technology"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-secondary/40 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              Tech Articles
            </Link>
            <Link
              href="/blogs?category=design"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-secondary/40 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              Design Articles
            </Link>
          </nav>

          <div className="border-t border-border/50 pt-4 flex flex-col gap-2">
            {isLoading ? (
              <div className="h-9 w-full bg-secondary/50 animate-pulse rounded-lg" />
            ) : user ? (
              <>
                <div className="px-2 py-1.5">
                  <p className="text-sm font-bold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                {(user.role === 'ADMIN' || user.role === 'EMPLOYEE') && (
                  <Link
                    href={user.role === 'ADMIN' ? '/admin' : '/employee'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 hover:bg-secondary/40 rounded-lg text-sm font-semibold text-foreground transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 text-left p-2 hover:bg-red-500/10 text-red-500 rounded-lg text-sm transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-2.5 border border-border rounded-lg text-sm font-medium hover:bg-secondary/40 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-semibold text-center transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
