'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { BlogCard, BlogCardSkeleton } from '@/components/cards/BlogCard';
import { Search, LayoutGrid, AlertCircle } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';

export function BlogsFeedClient({ initialBlogs, initialCategories, initialCategory, initialSearch, initialTotal }) {
  const router = useRouter();
  const pathname = usePathname();

  const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch || '');
  const [page, setPage] = useState(1);

  // Debounce search input
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    const timeout = setTimeout(() => setDebouncedSearch(val), 400);
    return () => clearTimeout(timeout);
  };

  // Reset page to 1 on category or search query change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, debouncedSearch]);

  const isDefaultView = !selectedCategory && !debouncedSearch && page === 1;

  // Categories — seeded with server data
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

  // Blogs — seeded with server data, refetches on filter/page change
  const { data: blogsData, isLoading: blogsLoading, error: blogsError } = useQuery({
    queryKey: ['blogs', selectedCategory, debouncedSearch, page],
    queryFn: async () => {
      let url = `/api/blogs?limit=12&page=${page}`;
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch blogs');
      return res.json();
    },
    initialData: isDefaultView && initialBlogs && initialBlogs.length > 0 ? {
      blogs: initialBlogs,
      pagination: {
        total: initialTotal,
        totalPages: Math.ceil(initialTotal / 12),
        page: 1,
        limit: 12,
      }
    } : undefined,
    staleTime: 30 * 1000,
  });

  const categories = categoriesData?.categories || [];
  const blogs = blogsData?.blogs || [];
  const pagination = blogsData?.pagination || { total: 0, totalPages: 1 };

  return (
    <>
      {/* Category Pills + Search */}
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

      {/* Blog Grid */}
      <div>
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
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-border rounded-3xl bg-secondary/10">
            <Search className="w-10 h-10 text-muted-foreground mb-4 stroke-1" />
            <h3 className="font-bold text-lg mb-1">No articles found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              We couldn&apos;t find any articles matching your search criteria. Try adjusting your categories or search query.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)}
            </div>
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </>
  );
}
