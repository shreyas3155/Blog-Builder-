'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Eye, Heart, MessageSquare, Link2, CheckCircle2, Share2 } from 'lucide-react';

export function BlogInteractionsClient({ blogSlug, initialLikes, initialViews, initialComments, initialHasLiked }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [likes, setLikes] = useState(initialLikes);
  const [views, setViews] = useState(initialViews);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [copiedLink, setCopiedLink] = useState(false);

  // Increment view count once on mount
  useEffect(() => {
    fetch(`/api/blogs/${blogSlug}/view`, { method: 'POST' })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.views !== undefined) setViews(data.views);
        }
      })
      .catch(() => {}); // Silently fail — view tracking is non-critical
  }, [blogSlug]);

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/blogs/${blogSlug}/like`, { method: 'POST' });
      if (res.status === 401) {
        router.push('/login');
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Like operation failed');
      return res.json();
    },
    onSuccess: (data) => {
      setLikes(data.likesCount);
      setHasLiked(data.liked);
    },
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <>
      {/* Metrics + Like + Comments row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1" title="Views">
          <Eye className="w-4 h-4" />
          {views} views
        </span>
        <button
          onClick={() => likeMutation.mutate()}
          disabled={likeMutation.isPending}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all disabled:opacity-60 ${
            hasLiked
              ? 'bg-red-500/10 border-red-500/30 text-red-500'
              : 'bg-secondary/30 border-border/40 hover:bg-secondary/60 hover:text-foreground'
          }`}
        >
          <Heart className={`w-4 h-4 ${hasLiked ? 'fill-red-500' : ''}`} />
          <span>{likes}</span>
        </button>
        <a
          href="#comments"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-secondary/30 border-border/40 hover:bg-secondary/60 hover:text-foreground transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{initialComments}</span>
        </a>
      </div>

      {/* Mobile share bar (visible under post body on small screens) */}
      <div className="flex lg:hidden items-center justify-center gap-3 border-y border-border/50 py-4 my-8">
        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
          <Share2 className="w-4 h-4" /> Share:
        </span>
        <button
          onClick={handleCopyLink}
          className="p-2 rounded-lg bg-secondary/30 hover:bg-secondary/60 border border-border/40 text-xs flex items-center gap-1 transition-all"
        >
          {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Link2 className="w-3.5 h-3.5" />}
          Copy Link
        </button>
      </div>

      {/* Desktop share panel (used inside ToC sidebar — exported as a named export below) */}
    </>
  );
}

/** Desktop sidebar share panel — used inside the sticky left aside */
export function SharePanelClient({ blogSlug }) {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Share this Post</h4>
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyLink}
          className="p-2 rounded-lg bg-secondary/30 hover:bg-secondary/60 border border-border/40 hover:text-foreground transition-all flex items-center justify-center gap-2 text-xs"
        >
          {copiedLink ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Link2 className="w-4 h-4" />
          )}
          <span>Copy Link</span>
        </button>
      </div>
    </div>
  );
}
