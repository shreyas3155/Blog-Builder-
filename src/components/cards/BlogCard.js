'use client';

import Link from 'next/link';
import { calculateReadingTime } from '@/utils/readingTime';
import { Calendar, Clock, Eye, Heart, MessageSquare, ArrowRight } from 'lucide-react';

export function BlogCard({ blog }) {
  const readTime = calculateReadingTime(blog.content);
  
  // Format published date
  const formattedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Draft';

  return (
    <article className="group relative flex flex-col h-full bg-card rounded-2xl border border-border/50 hover:border-indigo-500/40 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 overflow-hidden transition-all duration-300">
      {/* Cover Image */}
      <Link href={`/blogs/${blog.slug}`} className="relative block aspect-video overflow-hidden bg-secondary/20">
        <img
          src={blog.coverImage || 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?w=600'}
          alt={blog.title}
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {blog.category && (
          <span className="absolute top-3 left-3 text-[10px] font-bold tracking-wide uppercase px-2 py-1 bg-background/90 backdrop-blur-md text-foreground border border-border/40 rounded-md">
            {blog.category.name}
          </span>
        )}
      </Link>

      {/* Body Content */}
      <div className="flex flex-col flex-grow p-6">
        {/* Date & Read Time */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {readTime} min read
          </span>
        </div>

        {/* Title */}
        <h3 className="font-heading font-bold text-lg md:text-xl text-foreground mb-2 group-hover:text-indigo-500 transition-colors line-clamp-2 leading-snug">
          <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-6">
          {blog.excerpt || 'No summary available for this blog post.'}
        </p>

        {/* Footer info (Author & Stats) */}
        <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between gap-4">
          {/* Author avatar */}
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={blog.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={blog.author?.name}
              className="w-7 h-7 rounded-full object-cover border border-border flex-shrink-0"
            />
            <span className="text-xs font-semibold text-foreground truncate">
              {blog.author?.name}
            </span>
          </div>

          {/* Interaction Counts */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
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
        </div>
      </div>
    </article>
  );
}

// Skeleton Component for loading states
export function BlogCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-video bg-secondary/40 w-full" />
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-4 mb-3">
          <div className="h-3 w-20 bg-secondary/50 rounded" />
          <div className="h-3 w-16 bg-secondary/50 rounded" />
        </div>
        <div className="h-5 bg-secondary/50 rounded w-5/6 mb-2" />
        <div className="h-5 bg-secondary/50 rounded w-2/3 mb-4" />
        <div className="h-3 bg-secondary/50 rounded w-full mb-2" />
        <div className="h-3 bg-secondary/50 rounded w-full mb-2" />
        <div className="h-3 bg-secondary/50 rounded w-4/5 mb-6" />
        <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-secondary/50" />
            <div className="h-3 w-16 bg-secondary/50 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-3 bg-secondary/50 rounded" />
            <div className="w-8 h-3 bg-secondary/50 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
