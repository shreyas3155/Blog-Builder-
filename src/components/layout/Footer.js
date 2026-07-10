'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Send, CheckCircle2, Heart } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="w-full bg-background border-t border-border/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 pb-8 border-b border-border/40">
          {/* Logo and Description */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link href="/" className="font-heading font-bold text-2xl tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent w-max">
              InkFlow
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              A premium space where high-quality technical ideas meet design. Create, design, and share your developer journey.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="p-2 rounded-lg bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all duration-200" aria-label="Github">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
              <a href="#" className="p-2 rounded-lg bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all duration-200" aria-label="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="p-2 rounded-lg bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all duration-200" aria-label="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resources</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/blogs" className="text-sm text-muted-foreground hover:text-foreground transition-all">Explore Blogs</Link>
              <Link href="/blogs?category=technology" className="text-sm text-muted-foreground hover:text-foreground transition-all">Technology</Link>
              <Link href="/blogs?category=design" className="text-sm text-muted-foreground hover:text-foreground transition-all">Design</Link>
              <Link href="/blogs?category=productivity" className="text-sm text-muted-foreground hover:text-foreground transition-all">Productivity</Link>
            </nav>
          </div>

          {/* Newsletter Box */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stay Updated</h4>
            <p className="text-xs text-muted-foreground">Subscribe to our newsletter for curated development insights.</p>
            
            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 animate-in fade-in duration-300">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-semibold">Thanks for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 w-full mt-1">
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-secondary/30 border border-border/40 focus:border-indigo-500 rounded-lg outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all flex items-center justify-center shadow-md shadow-indigo-500/10 disabled:opacity-50"
                  aria-label="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} InkFlow. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for the modern web.
          </p>
        </div>
      </div>
    </footer>
  );
}
