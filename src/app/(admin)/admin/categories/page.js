'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Tag,
  Plus,
  Trash2,
  FolderOpen,
  Hash,
  Loader2
} from 'lucide-react';
import { useAlert } from '@/providers/AlertProvider';

export default function AdminTaxonomyPage() {
  const queryClient = useQueryClient();
  const { showAlert, showConfirm } = useAlert();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formError, setFormError] = useState('');

  // 1. Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });
  const categories = categoriesData?.categories || [];

  // 2. Fetch tags
  const { data: tagsData, isLoading: tagsLoading } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: async () => {
      const res = await fetch('/api/tags');
      if (!res.ok) throw new Error('Failed to fetch tags');
      return res.json();
    },
  });
  const tags = tagsData?.tags || [];

  // 3. Create Category Mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (name) => {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Category creation failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] }); // Public categories list too
      setNewCategoryName('');
      setFormError('');
    },
    onError: (err) => {
      setFormError(err.message || 'Something went wrong.');
    },
  });

  // 4. Delete Category Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete category');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] }); // Blogs mapping changed
    },
    onError: (err) => {
      showAlert(err.message || 'Operation failed', 'error');
    },
  });

  // 5. Delete Tag Mutation
  const deleteTagMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete tag');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (err) => {
      showAlert(err.message || 'Operation failed', 'error');
    },
  });

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      return setFormError('Category name is required.');
    }
    createCategoryMutation.mutate(newCategoryName);
  };

  const handleDeleteCategory = async (id, name) => {
    const ok = await showConfirm(`Are you sure you want to delete category "${name}"? Blogs mapped to this category will be set to uncategorized.`);
    if (ok) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleDeleteTag = async (id, name) => {
    const ok = await showConfirm(`Are you sure you want to delete tag "#${name}"? This removes the tag indicator from all blogs.`);
    if (ok) {
      deleteTagMutation.mutate(id);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight mb-1">
          Taxonomy Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Define global classification categories and purge unused tag indexes across articles.
        </p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Categories management */}
        <div className="md:col-span-6 flex flex-col gap-6">
          <h3 className="font-heading font-extrabold text-lg flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-500" />
            Categories
          </h3>

          {/* Add Category Form */}
          <div className="p-5 bg-card border border-border/50 rounded-2xl shadow-sm flex flex-col gap-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Create Category</h4>
            <form onSubmit={handleCreateCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="Category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/20 border border-border/40 focus:border-indigo-500 rounded-xl text-xs outline-none transition-all"
                required
              />
              <button
                type="submit"
                disabled={createCategoryMutation.isPending}
                className="px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all flex items-center justify-center shadow-md disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
            {formError && <span className="text-[10px] text-red-500 font-bold">{formError}</span>}
          </div>

          {/* Categories List Table */}
          <div className="border border-border/40 rounded-2xl overflow-hidden bg-card shadow-sm">
            {categoriesLoading ? (
              <div className="p-8 text-center flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/40 bg-secondary/10 font-bold text-muted-foreground">
                      <th className="p-3">Category</th>
                      <th className="p-3">Slug</th>
                      <th className="p-3 text-center">Blogs Count</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-secondary/5 transition-colors">
                        <td className="p-3 font-bold text-foreground capitalize">{cat.name}</td>
                        <td className="p-3 text-muted-foreground font-mono truncate max-w-[120px]">{cat.slug}</td>
                        <td className="p-3 text-center font-mono font-bold">{cat._count?.blogs || 0}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            disabled={deleteCategoryMutation.isPending}
                            className="p-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition-all disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tags management */}
        <div className="md:col-span-6 flex flex-col gap-6">
          <h3 className="font-heading font-extrabold text-lg flex items-center gap-2">
            <Hash className="w-5 h-5 text-cyan-500" />
            Tags
          </h3>

          <div className="border border-border/40 rounded-2xl overflow-hidden bg-card shadow-sm">
            {tagsLoading ? (
              <div className="p-8 text-center flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              </div>
            ) : tags.length === 0 ? (
              <p className="p-8 text-center text-muted-foreground text-xs italic">No tags index registered yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/40 bg-secondary/10 font-bold text-muted-foreground">
                      <th className="p-3">Tag Name</th>
                      <th className="p-3">Slug</th>
                      <th className="p-3 text-center">Blogs Count</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {tags.map((tag) => (
                      <tr key={tag.id} className="hover:bg-secondary/5 transition-colors">
                        <td className="p-3 font-semibold text-foreground">#{tag.name}</td>
                        <td className="p-3 text-muted-foreground font-mono truncate max-w-[120px]">{tag.slug}</td>
                        <td className="p-3 text-center font-mono font-bold">{tag._count?.blogs || 0}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteTag(tag.id, tag.name)}
                            disabled={deleteTagMutation.isPending}
                            className="p-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition-all disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
