'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BlogForm } from '@/components/forms/BlogForm';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function UpdateBlogPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const blogId = params.id;

  // 1. Fetch initial blog post details by ID
  const { data: blogData, isLoading, error } = useQuery({
    queryKey: ['employee-blog-detail', blogId],
    queryFn: async () => {
      const res = await fetch(`/api/employee/blogs/${blogId}`);
      if (!res.ok) throw new Error('Failed to load article');
      return res.json();
    },
    enabled: !!blogId,
  });

  const blog = blogData?.blog;

  // 2. Update blog post mutation
  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`/api/employee/blogs/${blogId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Update failed');
      }

      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['employee-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['employee-blog-detail', blogId] });
      queryClient.invalidateQueries({ queryKey: ['blog-detail', data.blog?.slug] }); // Invalidate public detail if slug changed
      queryClient.invalidateQueries({ queryKey: ['blogs'] }); // Refresh explore grid
      
      // Redirect back to dashboard
      router.push('/employee');
    },
    onError: (error) => {
      alert(error.message || 'An error occurred while updating post.');
    },
  });

  const handleSave = (data) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-muted-foreground font-semibold">Loading article details...</span>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center px-4 flex flex-col items-center gap-3">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <h2 className="font-heading font-extrabold text-xl">Failed to load article</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The article you are trying to edit could not be retrieved, or you do not have permission to modify it.
        </p>
        <Link href="/employee" className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-secondary border border-border rounded-lg text-foreground transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Header Row */}
      <div className="flex items-center gap-4">
        <Link
          href="/employee"
          className="p-2 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-border/40 text-foreground transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-foreground tracking-tight">
            Edit Article
          </h1>
          <p className="text-xs text-muted-foreground">Modify draft details or update publish options.</p>
        </div>
      </div>

      {/* Main editor form */}
      {updateMutation.isPending ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs text-muted-foreground font-semibold">Saving your updates...</span>
        </div>
      ) : (
        <BlogForm initialData={blog} onSave={handleSave} isSaving={updateMutation.isPending} />
      )}
    </div>
  );
}
