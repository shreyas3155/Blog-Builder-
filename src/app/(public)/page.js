'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BlogCard, BlogCardSkeleton } from '@/components/cards/BlogCard';
import { Search, Flame, LayoutGrid, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input handler
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    // Simple debounce timeout
    const timeout = setTimeout(() => {
      setDebouncedSearch(val);
    }, 400);
    return () => clearTimeout(timeout);
  };

  // 1. Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  // 2. Fetch Blogs matching active filters
  const { data: blogsData, isLoading: blogsLoading, error: blogsError } = useQuery({
    queryKey: ['blogs', selectedCategory, debouncedSearch],
    queryFn: async () => {
      let url = '/api/blogs?limit=9';
      if (selectedCategory) {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (debouncedSearch) {
        url += `&search=${encodeURIComponent(debouncedSearch)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch blogs');
      return res.json();
    },
  });

  const categories = categoriesData?.categories || [];
  const blogs = blogsData?.blogs || [];
  
  // Identify the first blog post as the "Featured Pinned Article" when no active filters are set
  const featuredBlog = !selectedCategory && !debouncedSearch ? blogs[0] : null;
  const listBlogs = featuredBlog ? blogs.slice(1) : blogs;

  return (
    <div className="relative w-full overflow-hidden bg-background">
      {/* Background ambient glowing circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />

      {/* 1. Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28 text-center flex flex-col items-center">
        {/* Glow Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          The future of developer insights is here
        </div>
        
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight max-w-3xl leading-[1.1] mb-6">
          Where <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Creative Minds</span> Meet High-Quality Execution.
        </h1>
        
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10">
          InkFlow is a modern SaaS blogging platform built for developer tools, design systems, and software engineering insights. Completely responsive, glassmorphic, and blazing fast.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link
            href="/blogs"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            Explore Articles
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 border border-border/80 hover:bg-secondary/40 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5"
          >
            Join InkFlow
          </Link>
        </div>
      </section>

      {/* 2. Main Content Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Category Pills & Search header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50 mb-10">
          {/* Categories list */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none flex-grow">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex-shrink-0 ${
                selectedCategory === null
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-secondary/20 text-muted-foreground border-border/50 hover:bg-secondary/40 hover:text-foreground'
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex-shrink-0 ${
                  selectedCategory === cat.slug
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-secondary/20 text-muted-foreground border-border/50 hover:bg-secondary/40 hover:text-foreground'
                }`}
              >
                {cat.name} ({cat._count?.blogs || 0})
              </button>
            ))}
          </div>

          {/* Search box within category row */}
          <div className="relative max-w-xs w-full flex items-center flex-shrink-0">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-secondary/20 border border-border/40 focus:border-indigo-500 rounded-xl text-xs outline-none transition-all"
            />
          </div>
        </div>

        {/* 3. Featured Spot Light Section (Only shown on initial page without filter/search) */}
        {featuredBlog && (
          <div className="mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              Featured Spotlight
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-card border border-border/50 rounded-3xl overflow-hidden hover:shadow-xl hover:border-indigo-500/20 transition-all duration-300">
              {/* Featured Image */}
              <Link href={`/blogs/${featuredBlog.slug}`} className="lg:col-span-7 aspect-video lg:aspect-auto relative block overflow-hidden bg-secondary/10">
                <img
                  src={featuredBlog.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200'}
                  alt={featuredBlog.title}
                  className="object-cover w-full h-full hover:scale-102 transition-transform duration-500"
                />
              </Link>
              {/* Featured content details */}
              <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-center">
                {featuredBlog.category && (
                  <span className="text-[10px] font-bold tracking-wide uppercase text-indigo-400 mb-3">
                    {featuredBlog.category.name}
                  </span>
                )}
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground mb-4 hover:text-indigo-500 transition-colors leading-tight">
                  <Link href={`/blogs/${featuredBlog.slug}`}>
                    {featuredBlog.title}
                  </Link>
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {featuredBlog.excerpt}
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={featuredBlog.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={featuredBlog.author?.name}
                    className="w-9 h-9 rounded-full object-cover border border-border"
                  />
                  <div>
                    <p className="text-xs font-bold">{featuredBlog.author?.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(featuredBlog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Latest Blogs Grid */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">
            <LayoutGrid className="w-4 h-4" />
            {featuredBlog ? 'Latest Articles' : 'Search Results'}
          </div>

          {blogsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : blogsError ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-red-500/20 rounded-2xl bg-red-500/5 text-red-500 gap-2">
              <AlertCircle className="w-8 h-8" />
              <p className="font-semibold text-sm">Failed to load articles.</p>
              <p className="text-xs opacity-80">Check your connection or refresh the page.</p>
            </div>
          ) : listBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-border rounded-3xl bg-secondary/10">
              <Search className="w-10 h-10 text-muted-foreground mb-4 stroke-1" />
              <h3 className="font-bold text-lg mb-1">No articles found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                We couldn't find any articles matching "{searchQuery}" in this category. Try adjusting your keywords.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
