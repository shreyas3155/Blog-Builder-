import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { calculateReadingTime } from '@/utils/readingTime';
import { TipTapRenderer } from '@/components/editor/TipTapRenderer';
import { BlogInteractionsClient } from './BlogInteractionsClient';
import { TableOfContentsClient } from './TableOfContentsClient';
import { CommentsClient } from './CommentsClient';
import { SharePanelClient } from './BlogInteractionsClient';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// ─── Dynamic SEO Metadata ────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await prisma.blog.findUnique({
    where: { slug, published: true },
    select: {
      title: true,
      excerpt: true,
      coverImage: true,
      author: { select: { name: true } },
    },
  });

  if (!blog) return { title: 'Article Not Found | InkFlow' };

  return {
    title: `${blog.title} | InkFlow`,
    description: blog.excerpt || `Read ${blog.title} on InkFlow.`,
    openGraph: {
      title: blog.title,
      description: blog.excerpt || '',
      images: blog.coverImage ? [{ url: blog.coverImage }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.excerpt || '',
      images: blog.coverImage ? [blog.coverImage] : [],
    },
  };
}

// ─── Server Component Page ───────────────────────────────────────────────────
export default async function BlogDetailsPage({ params }) {
  const { slug } = await params;

  // 1. Fetch blog from DB directly — no HTTP round-trip
  const blog = await prisma.blog.findUnique({
    where: { slug, published: true },
    include: {
      author: {
        select: { id: true, name: true, avatar: true, role: true },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
      tags: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: { comments: true, likes: true, views: true },
      },
    },
  });

  if (!blog) notFound();

  // 2. Fetch initial comments from DB
  const commentsRaw = await prisma.comment.findMany({
    where: { blogId: blog.id },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });

  // 3. Fetch related blogs in the same category (exclude current)
  const relatedBlogs = blog.category
    ? await prisma.blog.findMany({
        where: {
          published: true,
          categoryId: blog.category.id,
          id: { not: blog.id },
        },
        take: 2,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
        },
      })
    : [];

  // 4. Check if the current user has liked this post (from cookie)
  let hasLiked = false;
  let currentUser = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded?.id) {
        currentUser = decoded;
        const likeRecord = await prisma.like.findUnique({
          where: { blogId_userId: { blogId: blog.id, userId: decoded.id } },
        });
        hasLiked = !!likeRecord;
      }
    }
  } catch {
    // Non-blocking — public page is visible even if auth check fails
  }

  const formattedDate = new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const readTime = calculateReadingTime(blog.content);

  // Serialize comments for client (Date objects → strings)
  const comments = JSON.parse(JSON.stringify(commentsRaw));

  return (
    <article className="relative w-full bg-background pt-8 pb-16">

      {/* ── Header Block ─────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to explore
        </Link>

        {/* Category badge */}
        {blog.category && (
          <span className="inline-block text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 rounded-md mb-4">
            {blog.category.name}
          </span>
        )}

        {/* Article title — rendered on server → indexed by Google */}
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight leading-[1.15] mb-6">
          {blog.title}
        </h1>

        {/* Author row + interactive metrics (like, views, share) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-y border-border/50 mb-10">
          {/* Author info — pure server HTML */}
          <div className="flex items-center gap-3">
            <img
              src={blog.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={blog.author?.name}
              className="w-10 h-10 rounded-full object-cover border border-border"
            />
            <div>
              <p className="text-sm font-bold">{blog.author?.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {readTime} min read
                </span>
              </div>
            </div>
          </div>

          {/* ── CLIENT ISLAND: Like button, view count, share ── */}
          <BlogInteractionsClient
            blogSlug={slug}
            initialLikes={blog._count?.likes || 0}
            initialViews={blog._count?.views || 0}
            initialComments={blog._count?.comments || 0}
            initialHasLiked={hasLiked}
          />
        </div>
      </div>

      {/* ── Cover Image (static server HTML) ─────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
        <div className="aspect-[21/9] w-full rounded-3xl border border-border/50 overflow-hidden bg-secondary/20 shadow-lg">
          <img
            src={blog.coverImage || 'https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?w=1200'}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ── Article Body + Sidebars ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Left Sidebar: ToC + Share (both interactive → Client islands) */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 space-y-8 max-h-[calc(100vh-120px)] overflow-y-auto pr-4 scrollbar-thin">
            {/* ── CLIENT ISLAND: scroll-spy Table of Contents ── */}
            <TableOfContentsClient content={blog.content} />
            {/* ── CLIENT ISLAND: copy-link share panel ── */}
            <SharePanelClient blogSlug={slug} />
          </div>
        </aside>

        {/* Center: Article content (Server rendered HTML) */}
        <main className="col-span-1 lg:col-span-6 flex flex-col">

          {/* TipTap rich-text renderer — pure server component */}
          <div className="article-body">
            <TipTapRenderer content={blog.content} />
          </div>

          {/* Mobile share (rendered inside BlogInteractionsClient) */}

          {/* Related Articles */}
          {relatedBlogs.length > 0 && (
            <div className="mt-16 pt-8 border-t border-border/50">
              <h4 className="font-heading font-extrabold text-xl mb-6">
                More from {blog.category?.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedBlogs.map((b) => (
                  <div key={b.id} className="group flex flex-col gap-3">
                    <Link
                      href={`/blogs/${b.slug}`}
                      className="aspect-[16/10] bg-secondary/30 border border-border/40 rounded-xl overflow-hidden block"
                    >
                      <img
                        src={b.coverImage}
                        alt={b.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <h5 className="font-bold text-sm text-foreground group-hover:text-indigo-400 transition-colors line-clamp-2">
                      <Link href={`/blogs/${b.slug}`}>{b.title}</Link>
                    </h5>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CLIENT ISLAND: Comments section ── */}
          <CommentsClient
            blogSlug={slug}
            blogId={blog.id}
            initialComments={comments}
            currentUser={currentUser}
          />
        </main>

        {/* Right Sidebar: Author card (pure server HTML) */}
        <aside className="col-span-1 lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              About the Author
            </h4>
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
