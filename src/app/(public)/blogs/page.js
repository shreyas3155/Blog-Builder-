import { prisma } from '@/lib/db';
import { BlogsFeedClient } from './BlogsFeedClient';

// ─── Dynamic Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({ searchParams }) {
  const { category, search } = await searchParams;
  const description =
    category || search
      ? `Browse InkFlow articles filtered by ${category ? `category: ${category}` : ''}${search ? ` search: ${search}` : ''}.`
      : 'Discover articles, tutorials, and insights written by top contributors across development, design, and product engineering.';

  return {
    title: 'Explore Articles | InkFlow',
    description,
    openGraph: {
      title: 'Explore Articles | InkFlow',
      description,
      type: 'website',
    },
  };
}

// ─── Server Component Page ────────────────────────────────────────────────────
export default async function BlogsPage({ searchParams }) {
  const { category, search } = await searchParams;

  // Build initial Prisma filter matching any URL params (e.g. /blogs?category=react)
  const where = { published: true };
  if (category) where.category = { slug: category };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Fetch both in parallel — direct DB query, no API round-trip
  const [blogsResult, categoriesResult] = await Promise.all([
    prisma.blog.findMany({
      where,
      take: 12,
      orderBy: { publishedAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } },
        _count: { select: { comments: true, likes: true, views: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { blogs: true } } },
    }),
  ]);

  // Serialize Dates for client boundary
  const initialBlogs = JSON.parse(JSON.stringify(blogsResult));
  const initialCategories = JSON.parse(JSON.stringify(categoriesResult));

  return (
    <div className="w-full min-h-screen bg-background py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header — server-rendered, SEO-indexed */}
        <div className="mb-10 text-left">
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight mb-2">
            Explore Articles
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Discover articles, tutorials, and insights written by top contributors across development,
            design, and product engineering.
          </p>
        </div>

        {/* ── CLIENT ISLAND: interactive filter + blog grid ── */}
        <BlogsFeedClient
          initialBlogs={initialBlogs}
          initialCategories={initialCategories}
          initialCategory={category || null}
          initialSearch={search || ''}
        />
      </div>
    </div>
  );
}
