import { prisma } from '@/lib/db';
import { HomeFeedClient } from './HomeFeedClient';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// ─── Static Metadata ─────────────────────────────────────────────────────────
export const metadata = {
  title: 'InkFlow — Where Creative Minds Meet High-Quality Execution',
  description:
    'InkFlow is a modern SaaS blogging platform built for developer tools, design systems, and software engineering insights. Completely responsive, glassmorphic, and blazing fast.',
  openGraph: {
    title: 'InkFlow — Modern Developer Blog Platform',
    description: 'Discover articles by top contributors across development, design, and product engineering.',
    type: 'website',
  },
};

// ─── Server Component Page ────────────────────────────────────────────────────
export default async function LandingPage() {
  // Fetch initial data directly from DB — no HTTP round-trip
  const [blogsResult, categoriesResult] = await Promise.all([
    prisma.blog.findMany({
      where: { published: true },
      take: 9,
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

  // Serialize: Date objects → ISO strings (required to pass from Server → Client Component)
  const initialBlogs = JSON.parse(JSON.stringify(blogsResult));
  const initialCategories = JSON.parse(JSON.stringify(categoriesResult));

  return (
    <div className="relative w-full overflow-hidden bg-background">
      {/* Background ambient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />

      {/* ── Hero Section (pure server HTML → fast TTFB, indexed by Google) ── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          The future of developer insights is here
        </div>

        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight max-w-3xl leading-[1.1] mb-6">
          Where{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Creative Minds
          </span>{' '}
          Meet High-Quality Execution.
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10">
          InkFlow is a modern SaaS blogging platform built for developer tools, design systems, and software engineering
          insights. Completely responsive, glassmorphic, and blazing fast.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link
            href="/blogs"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            Explore Articles
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 border border-border/80 hover:bg-secondary/40 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5"
          >
            Join InkFlow
          </Link>
        </div>
      </section>

      {/* ── CLIENT ISLAND: Category filter + search + blog grid ── */}
      {/* Receives initial data from server — no loading flash, fully interactive after hydration */}
      <HomeFeedClient initialBlogs={initialBlogs} initialCategories={initialCategories} />
    </div>
  );
}
