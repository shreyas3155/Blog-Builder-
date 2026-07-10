'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { TipTapRenderer, slugify } from '@/components/editor/TipTapRenderer';
import { Calendar, Clock, Eye, Heart, MessageSquare, ArrowLeft, ArrowRight, Share2, Twitter, Linkedin, Link2, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function BlogDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [activeHeading, setActiveHeading] = useState('');
  const [commentVal, setCommentVal] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [headings, setHeadings] = useState([]);
  const articleRef = useRef(null);

  // 1. Fetch Blog Details (via React Query so likes/views are real-time updated)
  const { data: blogData, isLoading: blogLoading, error: blogError } = useQuery({
    queryKey: ['blog-detail', params.slug],
    queryFn: async () => {
      const res = await fetch(`/api/blogs/${params.slug}`);
      if (!res.ok) throw new Error('Blog post not found');
      return res.json();
    },
  });

  const blog = blogData?.blog;
  const hasLiked = blogData?.hasLiked;

  // 2. Fetch comments list
  const { data: commentsData } = useQuery({
    queryKey: ['blog-comments', blog?.id],
    queryFn: async () => {
      const res = await fetch(`/api/blogs/${params.slug}/comments`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json();
    },
    enabled: !!blog?.id,
  });

  const comments = commentsData?.comments || [];

  // 3. Fetch Related Blogs in the same category
  const { data: relatedData } = useQuery({
    queryKey: ['related-blogs', blog?.category?.slug, blog?.id],
    queryFn: async () => {
      const res = await fetch(`/api/blogs?category=${blog.category.slug}&limit=3`);
      if (!res.ok) throw new Error('Failed to fetch related blogs');
      const data = await res.json();
      return data.blogs.filter((b) => b.id !== blog.id);
    },
    enabled: !!blog?.category?.slug && !!blog?.id,
  });

  const relatedBlogs = relatedData || [];

  // 4. Like post mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/blogs/${params.slug}/like`, { method: 'POST' });
      if (res.status === 401) {
        router.push('/login');
        throw new Error('Unauthorized');
      }
      if (!res.ok) throw new Error('Like operation failed');
      return res.json();
    },
    onSuccess: (data) => {
      // Optimistically update details state
      queryClient.setQueryData(['blog-detail', params.slug], (old) => {
        if (!old) return old;
        return {
          ...old,
          hasLiked: data.liked,
          blog: {
            ...old.blog,
            _count: {
              ...old.blog._count,
              likes: data.likesCount,
            },
          },
        };
      });
    },
  });

  // 5. Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content) => {
      const res = await fetch(`/api/blogs/${params.slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Comment operation failed');
      return res.json();
    },
    onSuccess: (data) => {
      setCommentVal('');
      // Invalidate comments query to trigger refresh
      queryClient.invalidateQueries({ queryKey: ['blog-comments', blog?.id] });
      queryClient.invalidateQueries({ queryKey: ['blog-detail', params.slug] });
    },
  });

  // Increment views count on load
  useEffect(() => {
    if (blog?.id) {
      fetch(`/api/blogs/${params.slug}/view`, { method: 'POST' })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['blog-detail', params.slug] });
        })
        .catch(console.error);
    }
  }, [blog?.id]);

  // Generate Table of Contents items from TipTap JSON
  useEffect(() => {
    if (!blog?.content) return;

    try {
      const doc = JSON.parse(blog.content);
      const extracted = [];
      doc.content.forEach((node) => {
        if (node.type === 'heading') {
          const text = node.content?.map((c) => c.text).join('') || '';
          if (text) {
            extracted.push({
              text,
              slug: slugify(text),
              level: node.attrs?.level || 1,
            });
          }
        }
      });
      setHeadings(extracted);
    } catch (e) {
      console.warn('Could not parse ToC headings from JSON content:', e);
    }
  }, [blog?.content]);

  // Set up Scroll Spy to highlight current ToC heading
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const headingElements = headings
        .map((h) => document.getElementById(h.slug))
        .filter(Boolean);

      const scrollPosition = window.scrollY + 200;

      let currentActive = '';
      for (const el of headingElements) {
        if (el.offsetTop <= scrollPosition) {
          currentActive = el.id;
        } else {
          break;
        }
      }
      
      // Fallback to first heading if scrolled above all of them
      if (!currentActive && headingElements[0]) {
        currentActive = headingElements[0].id;
      }
      setActiveHeading(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentVal.trim()) return;
    commentMutation.mutate(commentVal);
  };

  if (blogLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-6 w-32 bg-secondary/50 rounded mb-6" />
        <div className="h-10 bg-secondary/50 rounded w-4/5 mb-6" />
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-secondary/50" />
          <div className="h-4 w-32 bg-secondary/50 rounded" />
        </div>
        <div className="w-full aspect-[21/9] bg-secondary/50 rounded-2xl mb-12" />
        <div className="space-y-4">
          <div className="h-4 bg-secondary/50 rounded w-full" />
          <div className="h-4 bg-secondary/50 rounded w-full" />
          <div className="h-4 bg-secondary/50 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (blogError || !blog) {
    return (
      <div className="max-w-lg mx-auto py-24 text-center px-4">
        <h2 className="font-heading font-extrabold text-2xl mb-2 text-foreground">Article not found</h2>
        <p className="text-sm text-muted-foreground mb-6">
          The blog post you are looking for might have been removed or unpublished.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 bg-secondary border border-border rounded-lg text-foreground transition-all hover:bg-secondary/70">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const readTime = calculateReadingTime(blog.content);

  return (
    <article ref={articleRef} className="relative w-full bg-background pt-8 pb-16">
      
      {/* Container header info */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to explore
        </Link>

        {/* Category & Tags pills */}
        {blog.category && (
          <span className="inline-block text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 rounded-md mb-4">
            {blog.category.name}
          </span>
        )}

        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight leading-[1.15] mb-6">
          {blog.title}
        </h1>

        {/* Author metadata & share metrics row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-y border-border/50 mb-10">
          <div className="flex items-center gap-3">
            <img
              src={blog.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={blog.author?.name}
              className="w-10 h-10 rounded-full object-cover border border-border"
            />
            <div>
              <p className="text-sm font-bold">{blog.author?.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formattedDate}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {readTime} min read
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1" title="Views">
              <Eye className="w-4 h-4" />
              {blog._count?.views || 0} views
            </span>
            <button
              onClick={() => likeMutation.mutate()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                hasLiked
                  ? 'bg-red-500/10 border-red-500/30 text-red-500'
                  : 'bg-secondary/30 border-border/40 hover:bg-secondary/60 hover:text-foreground'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-red-500' : ''}`} />
              <span>{blog._count?.likes || 0}</span>
            </button>
            <a href="#comments" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-secondary/30 border-border/40 hover:bg-secondary/60 hover:text-foreground transition-all">
              <MessageSquare className="w-4 h-4" />
              <span>{blog._count?.comments || 0}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Large cover image */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
        <div className="aspect-[21/9] w-full rounded-3xl border border-border/50 overflow-hidden bg-secondary/20 shadow-lg">
          <img
            src={blog.coverImage || 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?w=1200'}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Article body with Sidebar widgets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Floating Share Actions & Interactive Table of Contents */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 space-y-8 max-h-[calc(100vh-120px)] overflow-y-auto pr-4 scrollbar-thin">
            {/* Table of Contents */}
            {headings.length > 0 && (
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Table of Contents</h4>
                <nav className="flex flex-col gap-2.5 border-l border-border/60">
                  {headings.map((h, i) => (
                    <a
                      key={i}
                      href={`#${h.slug}`}
                      className={`text-xs pl-4 py-0.5 border-l -ml-px transition-all block ${
                        activeHeading === h.slug
                          ? 'border-indigo-500 text-indigo-400 font-bold'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                      style={{ paddingLeft: `${(h.level - 1) * 12 + 16}px` }}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Share Post Panel */}
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
          </div>
        </aside>

        {/* Center: Main text body content */}
        <main className="col-span-1 lg:col-span-6 flex flex-col">
          {/* TipTap Renderer */}
          <div className="article-body">
            <TipTapRenderer content={blog.content} />
          </div>

          {/* Social Share Actions (Mobile View visible under post body) */}
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

          {/* Related Articles Carousel at footer details */}
          {relatedBlogs.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border/50">
              <h4 className="font-heading font-extrabold text-xl mb-6">More from {blog.category?.name}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedBlogs.map((b) => (
                  <div key={b.id} className="group flex flex-col gap-3">
                    <Link href={`/blogs/${b.slug}`} className="aspect-[16/10] bg-secondary/30 border border-border/40 rounded-xl overflow-hidden block">
                      <img src={b.coverImage} alt={b.title} className="object-cover w-full h-full group-hover:scale-103 transition-transform duration-300" />
                    </Link>
                    <h5 className="font-bold text-sm text-foreground group-hover:text-indigo-400 transition-colors line-clamp-2">
                      <Link href={`/blogs/${b.slug}`}>{b.title}</Link>
                    </h5>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Widget */}
          <section id="comments" className="mt-16 pt-8 border-t border-border/50">
            <div className="flex items-center gap-2 mb-8">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              <h3 className="font-heading font-extrabold text-2xl">Discussion ({comments.length})</h3>
            </div>

            {/* Comment Form */}
            {user ? (
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
                    Post Comment
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 text-center border border-border/40 rounded-2xl bg-secondary/15 mb-8 flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-4">Sign in to join the conversation and share your feedback.</p>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-lg transition-all"
                >
                  Sign In to Comment
                </Link>
              </div>
            )}

            {/* Comments list thread */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-6">No comments posted yet. Be the first to start the conversation!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4 p-4 border border-border/40 rounded-2xl bg-secondary/10">
                    <img
                      src={comment.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={comment.author?.name}
                      className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0"
                    />
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-xs font-bold truncate">{comment.author?.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
        </main>

        {/* Right Side: Author Profile Details */}
        <aside className="col-span-1 lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About the Author</h4>
            <div className="p-6 border border-border/40 bg-secondary/15 rounded-2xl text-center flex flex-col items-center">
              <img
                src={blog.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt={blog.author?.name}
                className="w-16 h-16 rounded-full object-cover border border-border mb-4"
              />
              <h5 className="font-bold text-sm mb-1">{blog.author?.name}</h5>
              <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded mb-4">
                {blog.author?.role}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Platform contributor focusing on modern software development architectures and web design systems.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
