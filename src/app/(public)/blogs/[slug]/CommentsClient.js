'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

export function CommentsClient({ blogSlug, blogId, initialComments, currentUser }) {
  const queryClient = useQueryClient();
  const [commentVal, setCommentVal] = useState('');

  // Hydrate from server-fetched initial data, but keep live via React Query
  const { data: commentsData } = useQuery({
    queryKey: ['blog-comments', blogId],
    queryFn: async () => {
      const res = await fetch(`/api/blogs/${blogSlug}/comments`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json();
    },
    initialData: { comments: initialComments }, // No loading flash on first render
    staleTime: 30 * 1000, // 30s before background refetch
  });

  const comments = commentsData?.comments || [];

  const commentMutation = useMutation({
    mutationFn: async (content) => {
      const res = await fetch(`/api/blogs/${blogSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Comment operation failed');
      return res.json();
    },
    onSuccess: () => {
      setCommentVal('');
      queryClient.invalidateQueries({ queryKey: ['blog-comments', blogId] });
    },
  });

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentVal.trim()) return;
    commentMutation.mutate(commentVal);
  };

  return (
    <section id="comments" className="mt-16 pt-8 border-t border-border/50">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="w-5 h-5 text-indigo-500" />
        <h3 className="font-heading font-extrabold text-2xl">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {currentUser ? (
        <form onSubmit={handlePostComment} className="flex flex-col gap-3 mb-8">
          <textarea
            placeholder="Join the discussion... Type your comment here."
            rows={3}
            value={commentVal}
            onChange={(e) => setCommentVal(e.target.value)}
            required
            className="w-full p-4 bg-secondary/20 hover:bg-secondary/30 focus:bg-secondary/20 border border-border/40 focus:border-indigo-500 rounded-2xl text-sm outline-none resize-none transition-all"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={commentMutation.isPending || !commentVal.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
            >
              {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 text-center border border-border/40 rounded-2xl bg-secondary/15 mb-8 flex flex-col items-center">
          <p className="text-sm text-muted-foreground mb-4">
            Sign in to join the conversation and share your feedback.
          </p>
          <Link
            href="/login"
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg transition-all"
          >
            Sign In to Comment
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-6">
            No comments posted yet. Be the first to start the conversation!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-4 p-4 border border-border/40 rounded-2xl bg-secondary/10"
            >
              <img
                src={
                  comment.author?.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                }
                alt={comment.author?.name}
                className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0"
              />
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-xs font-bold truncate">{comment.author?.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
