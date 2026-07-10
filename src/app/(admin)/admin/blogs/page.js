'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  Calendar,
  Eye,
  Heart,
  MessageSquare,
  ExternalLink,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

export default function AdminBlogsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');

  // 1. Fetch all blogs (admin lists everything)
  const { data: blogsData, isLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => {
      const res = await fetch('/api/admin/blogs');
      if (!res.ok) throw new Error('Failed to fetch platform blogs');
      return res.json();
    },
  });
  const blogs = blogsData?.blogs || [];

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });
  const categories = categoriesData?.categories || [];

  // 2. Publish toggle mutation
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }) => {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published }),
      });
      if (!res.ok) throw new Error('Failed to toggle status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (err) => {
      alert(err.message || 'Operation failed');
    },
  });

  // 3. Delete blog mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete blog');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (err) => {
      alert(err.message || 'Deletion failed');
    },
  });

  const handleTogglePublish = (id, currentStatus) => {
    togglePublishMutation.mutate({ id, published: !currentStatus });
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  // 4. Filtering in-memory
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && blog.published) ||
      (statusFilter === 'draft' && !blog.published);
    const matchesCategory = !categoryFilter || blog.categoryId === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header section */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight mb-1">
          Manage Blogs
        </h1>
        <p className="text-sm text-muted-foreground">
          Audit all articles on the platform, switch publication states, or delete invalid postings.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-secondary/15 border border-border/40 rounded-2xl">
        <div className="relative w-full md:max-w-xs flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border/40 focus:border-indigo-500 rounded-xl text-xs outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground mr-1" />
          
          {/* Status buttons */}
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              statusFilter === 'all'
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-background border-border/50 hover:bg-secondary/40 text-muted-foreground'
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              statusFilter === 'published'
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-background border-border/50 hover:bg-secondary/40 text-muted-foreground'
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              statusFilter === 'draft'
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-background border-border/50 hover:bg-secondary/40 text-muted-foreground'
            }`}
          >
            Drafts
          </button>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-background border border-border/50 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <div className="w-full border border-border/40 rounded-2xl p-16 text-center bg-card flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          <span className="text-xs text-muted-foreground font-semibold">Loading platform articles...</span>
        </div>
      ) : (
        <div className="w-full border border-border/40 rounded-2xl overflow-hidden bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-secondary/10 text-xs font-bold text-muted-foreground select-none">
                  <th className="p-4">Article</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Published</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4 text-center">Stats</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredBlogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground italic">
                      No blogs found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredBlogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-secondary/5 transition-colors">
                      {/* Blog Cover & Title */}
                      <td className="p-4 min-w-[260px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={blog.coverImage || 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?w=100'}
                            alt={blog.title}
                            className="w-12 h-8 object-cover rounded border border-border/50 flex-shrink-0 bg-secondary/10"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-foreground truncate max-w-[200px]" title={blog.title}>
                              {blog.title}
                            </h4>
                            <span className="text-[10px] text-muted-foreground font-mono block truncate max-w-[200px]">
                              /{blog.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="p-4 text-xs font-semibold text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <img
                            src={blog.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50'}
                            alt="author avatar"
                            className="w-5 h-5 rounded-full object-cover border border-border"
                          />
                          <span className="truncate max-w-[120px]">{blog.author?.name}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 text-xs font-semibold text-muted-foreground">
                        {blog.category?.name || 'Uncategorized'}
                      </td>

                      {/* Publish status toggle button */}
                      <td className="p-4">
                        <button
                          onClick={() => handleTogglePublish(blog.id, blog.published)}
                          disabled={togglePublishMutation.isPending}
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold tracking-wide uppercase px-2.5 py-0.5 rounded-md border cursor-pointer hover:opacity-85 transition-all ${
                            blog.published
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}
                          title="Click to toggle publish status"
                        >
                          {blog.published ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {blog.published ? 'Published' : 'Draft'}
                        </button>
                      </td>

                      {/* Created date */}
                      <td className="p-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(blog.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Stats */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5" title="Views">
                            <Eye className="w-3 h-3" /> {blog._count?.views || 0}
                          </span>
                          <span className="flex items-center gap-0.5" title="Likes">
                            <Heart className="w-3 h-3" /> {blog._count?.likes || 0}
                          </span>
                          <span className="flex items-center gap-0.5" title="Comments">
                            <MessageSquare className="w-3 h-3" /> {blog._count?.comments || 0}
                          </span>
                        </div>
                      </td>

                      {/* Admin actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {blog.published && (
                            <Link
                              href={`/blogs/${blog.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg bg-secondary/30 hover:bg-secondary/60 border border-border/40 text-muted-foreground hover:text-foreground transition-all"
                              title="View Public Post"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(blog.id, blog.title)}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all disabled:opacity-50"
                            title="Delete Post"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
