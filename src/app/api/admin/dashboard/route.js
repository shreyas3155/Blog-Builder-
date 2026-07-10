import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'ADMIN') return null;

  return decoded;
}

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    // 1. Core Global Stats
    const totalBlogs = await prisma.blog.count();
    const publishedBlogs = await prisma.blog.count({ where: { published: true } });
    const draftBlogs = await prisma.blog.count({ where: { published: false } });
    const totalViews = await prisma.view.count();
    const totalEmployees = await prisma.user.count({
      where: {
        role: { in: ['ADMIN', 'EMPLOYEE'] },
      },
    });

    const activeStaff = await prisma.user.findFirst({
      where: {
        role: { in: ['ADMIN', 'EMPLOYEE'] },
      },
      orderBy: {
        blogs: {
          _count: 'desc',
        },
      },
      select: {
        name: true,
        _count: {
          select: {
            blogs: true,
          },
        },
      },
    });
    const mostActive = activeStaff && activeStaff._count.blogs > 0
      ? `${activeStaff.name} (${activeStaff._count.blogs} posts)`
      : 'None yet';

    // 2. Views by Category (for charts or stats layout)
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            blogs: true,
          },
        },
      },
    });

    const viewsByCategory = await Promise.all(
      categories.map(async (cat) => {
        const count = await prisma.view.count({
          where: {
            blog: {
              categoryId: cat.id,
            },
          },
        });
        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          views: count,
          blogsCount: cat._count.blogs,
        };
      })
    );

    // 3. Top 5 Most Read Articles
    const topArticles = await prisma.blog.findMany({
      take: 5,
      orderBy: {
        views: {
          _count: 'desc',
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        author: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            views: true,
            likes: true,
            comments: true,
          },
        },
      },
    });

    // 4. Compile Global Activity Timeline Log (Recent 5 Actions)
    const [recentPublishes, recentComments, recentLikes] = await Promise.all([
      prisma.blog.findMany({
        where: { published: true },
        take: 5,
        orderBy: { publishedAt: 'desc' },
        include: { author: { select: { name: true, avatar: true } } },
      }),
      prisma.comment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true, avatar: true } }, blog: { select: { title: true } } },
      }),
      prisma.like.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, avatar: true } }, blog: { select: { title: true } } },
      }),
    ]);

    const activities = [
      ...recentPublishes.map((blog) => ({
        id: `pub-${blog.id}`,
        type: 'publish',
        message: `${blog.author?.name} published an article: "${blog.title}"`,
        avatar: blog.author?.avatar,
        createdAt: blog.publishedAt,
      })),
      ...recentComments.map((comment) => ({
        id: `com-${comment.id}`,
        type: 'comment',
        message: `${comment.author?.name} commented on "${comment.blog?.title}"`,
        avatar: comment.author?.avatar,
        createdAt: comment.createdAt,
      })),
      ...recentLikes.map((like) => ({
        id: `like-${like.id}`,
        type: 'like',
        message: `${like.user?.name} liked "${like.blog?.title}"`,
        avatar: like.user?.avatar,
        createdAt: like.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8); // Top 8 items

    return NextResponse.json(
      {
        stats: {
          blogs: totalBlogs,
          published: publishedBlogs,
          drafts: draftBlogs,
          views: totalViews,
          employees: totalEmployees,
          mostActive,
        },
        viewsByCategory,
        topArticles,
        activities,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch global admin stats error:', error);
    return NextResponse.json(
      { message: 'Something went wrong fetching admin dashboard stats.' },
      { status: 500 }
    );
  }
}
