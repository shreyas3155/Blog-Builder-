'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BlogForm } from '@/components/forms/BlogForm';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAlert } from '@/providers/AlertProvider';

export default function CreateBlogPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAlert } = useAlert();

  // Create blog post mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch('/api/employee/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Creation failed');
      }

      return res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['employee-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] }); // Refresh public lists
      
      // Redirect back to dashboard
      router.push('/employee');
    },
    onError: (error) => {
      showAlert(error.message || 'An error occurred while creating post.', 'error');
    },
  });

  const handleSave = (data) => {
    createMutation.mutate(data);
  };

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
            Create Article
          </h1>
          <p className="text-xs text-muted-foreground">Draft a new post for your readers.</p>
        </div>
      </div>

      {/* Main editor form */}
      {createMutation.isPending ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs text-muted-foreground font-semibold">Saving your post...</span>
        </div>
      ) : (
        <BlogForm onSave={handleSave} isSaving={createMutation.isPending} />
      )}
    </div>
  );
}
