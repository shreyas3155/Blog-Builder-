'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, Trash2, Eye, Heart, MessageSquare, ExternalLink, Calendar, Search, SlidersHorizontal } from 'lucide-react';
import { useAlert } from '@/providers/AlertProvider';
import { Pagination } from '@/components/ui/Pagination';

export function BlogsListTable({ blogs }) {
  const queryClient = useQueryClient();
  const { showConfirm } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Reset page to 1 on filters or sorting change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  // Delete blog mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/employee/blogs/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete article');
      return res.json();
    },
    onSuccess: () => {
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['employee-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
    },
  });

  const handleDelete = async (id, title) => {
    const ok = await showConfirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`);
    if (ok) {
      deleteMutation.mutate(id);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Filter and sort blogs list client-side
  const filteredBlogs = blogs
    .filter((blog) => {
      const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && blog.published) ||
        (statusFilter === 'draft' && !blog.published);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      // Handle nested stats sorting
      if (sortBy === 'views') {
        valA = a._count?.views || 0;
        valB = b._count?.views || 0;
      } else if (sortBy === 'likes') {
        valA = a._count?.likes || 0;
        valB = b._count?.likes || 0;
      } else if (sortBy === 'comments') {
        valA = a._count?.comments || 0;
        valB = b._count?.comments || 0;
      }

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const paginatedBlogs = filteredBlogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-secondary/15 border border-border/40 rounded-2xl">
        <div className="relative w-full sm:max-w-xs flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search your articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border/40 focus:border-indigo-500 rounded-xl text-xs outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              statusFilter === 'all'
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-background border-border/50 hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              statusFilter === 'published'
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-background border-border/50 hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              statusFilter === 'draft'
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-background border-border/50 hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            Drafts
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full border border-border/40 rounded-2xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/10 text-xs font-bold text-muted-foreground select-none">
                <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('title')}>Article</th>
                <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('categoryId')}>Category</th>
                <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('published')}>Status</th>
                <th className="p-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort('createdAt')}>Created</th>
                <th className="p-4 text-center">Stats</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-sm">
              {paginatedBlogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground italic">
                    No articles found matching filters.
                  </td>
                </tr>
              ) : (
                paginatedBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-secondary/5 transition-colors">
                    {/* Title and Thumbnail */}
                    <td className="p-4 min-w-[280px]">
                      <div className="flex items-center gap-3">
                        <img
                          src={blog.coverImage || 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?w=100'}
                          alt={blog.title}
                          className="w-12 h-8 object-cover rounded border border-border/50 bg-secondary/15 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-foreground truncate hover:text-indigo-400 max-w-[240px]">
                            <Link href={`/employee/editor/${blog.id}`}>{blog.title}</Link>
                          </h4>
                          <span className="text-[10px] text-muted-foreground font-mono truncate block">
                            {blog.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 text-xs font-semibold text-muted-foreground">
                      {blog.category?.name || 'Uncategorized'}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center text-[10px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-md border ${
                          blog.published
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}
                      >
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                    </td>

                    {/* Creation Date */}
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

                    {/* Metrics stats */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1" title="Views">
                          <Eye className="w-3.5 h-3.5" />
                          {blog._count?.views || 0}
                        </span>
                        <span className="flex items-center gap-1" title="Likes">
                          <Heart className="w-3.5 h-3.5" />
                          {blog._count?.likes || 0}
                        </span>
                        <span className="flex items-center gap-1" title="Comments">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {blog._count?.comments || 0}
                        </span>
                      </div>
                    </td>

                    {/* Action buttons */}
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
                        <Link
                          href={`/employee/editor/${blog.id}`}
                          className="p-1.5 rounded-lg bg-secondary/30 hover:bg-secondary/60 border border-border/40 text-indigo-400 hover:text-indigo-300 transition-all"
                          title="Edit Article"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(blog.id, blog.title)}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all disabled:opacity-50"
                          title="Delete Article"
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
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
