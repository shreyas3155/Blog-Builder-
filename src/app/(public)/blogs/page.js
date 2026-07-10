'use client';

import { useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BlogCard, BlogCardSkeleton } from '@/components/cards/BlogCard';
import { Search, LayoutGrid, AlertCircle, Sparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function BlogsContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '');

  // Debounce search input handler
  const handleSearchChange = (val) => {
    setSearchQuery(val);
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
      let url = '/api/blogs?limit=12';
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

  return (
    <div className="w-full min-h-screen bg-background py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-10 text-left">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight mb-2">
            Explore Articles
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Discover articles, tutorials, and insights written by top contributors across development, design, and product engineering.
          </p>
        </div>

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

        {/* List of articles */}
        <div>
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
          ) : blogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-border rounded-3xl bg-secondary/10">
              <Search className="w-10 h-10 text-muted-foreground mb-4 stroke-1" />
              <h3 className="font-bold text-lg mb-1">No articles found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                We couldn't find any articles matching your search criteria. Try adjusting your categories or search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function BlogsPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-background py-10 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-secondary/50 rounded w-1/4 mb-4" />
          <div className="h-4 bg-secondary/50 rounded w-1/2 mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    }>
      <BlogsContent />
    </Suspense>
  );
}
