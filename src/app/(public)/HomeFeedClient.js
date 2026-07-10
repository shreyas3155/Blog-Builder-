'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BlogCard, BlogCardSkeleton } from '@/components/cards/BlogCard';
import { Search, Flame, LayoutGrid, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function HomeFeedClient({ initialBlogs, initialCategories }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    const timeout = setTimeout(() => setDebouncedSearch(val), 400);
    return () => clearTimeout(timeout);
  };

  // Categories — seeded with server data, no loading state on first paint
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
    initialData: { categories: initialCategories },
    staleTime: 60 * 1000,
  });

  // Blogs — seeded with server data, refetches when user filters/searches
  const isFiltered = !!selectedCategory || !!debouncedSearch;
  const { data: blogsData, isLoading: blogsLoading, error: blogsError } = useQuery({
    queryKey: ['blogs', selectedCategory, debouncedSearch],
    queryFn: async () => {
      let url = '/api/blogs?limit=9';
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch blogs');
      return res.json();
    },
    initialData: !isFiltered ? { blogs: initialBlogs } : undefined,
    staleTime: 30 * 1000,
  });

  const categories = categoriesData?.categories || [];
  const blogs = blogsData?.blogs || [];

  // Pin first blog as "Featured Spotlight" only on default view
  const featuredBlog = !selectedCategory && !debouncedSearch ? blogs[0] : null;
  const listBlogs = featuredBlog ? blogs.slice(1) : blogs;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

      {/* Filter bar: Category pills + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/50 mb-10">
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

      {/* Featured Spotlight — only on default (no filter) view */}
      {featuredBlog && (
        <div className="mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            Featured Spotlight
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-card border border-border/50 rounded-3xl overflow-hidden hover:shadow-xl hover:border-indigo-500/20 transition-all duration-300">
            <Link href={`/blogs/${featuredBlog.slug}`} className="lg:col-span-7 aspect-video lg:aspect-auto relative block overflow-hidden bg-secondary/10">
              <img
                src={featuredBlog.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200'}
                alt={featuredBlog.title}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
              />
            </Link>
            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-center">
              {featuredBlog.category && (
                <span className="text-[10px] font-bold tracking-wide uppercase text-indigo-400 mb-3">
                  {featuredBlog.category.name}
                </span>
              )}
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground mb-4 hover:text-indigo-500 transition-colors leading-tight">
                <Link href={`/blogs/${featuredBlog.slug}`}>{featuredBlog.title}</Link>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{featuredBlog.excerpt}</p>
              <div className="flex items-center gap-3">
                <img
                  src={featuredBlog.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={featuredBlog.author?.name}
                  className="w-9 h-9 rounded-full object-cover border border-border"
                />
                <div>
                  <p className="text-xs font-bold">{featuredBlog.author?.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(featuredBlog.publishedAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Latest / Search Results Grid */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">
          <LayoutGrid className="w-4 h-4" />
          {featuredBlog ? 'Latest Articles' : 'Search Results'}
        </div>

        {blogsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <BlogCardSkeleton key={i} />)}
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
              We couldn&apos;t find any articles matching &quot;{searchQuery}&quot; in this category. Try adjusting your keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listBlogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)}
          </div>
        )}
      </div>
    </section>
  );
}
