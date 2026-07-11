import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
  try {
    // 1. Authenticate user
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'EMPLOYEE' && decoded.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Forbidden.' }, { status: 403 });
    }

    const authorId = decoded.id;

    // 2. Compute statistics
    const totalBlogs = await prisma.blog.count({
      where: { authorId },
    });

    const publishedBlogs = await prisma.blog.count({
      where: { authorId, published: true },
    });

    const draftBlogs = await prisma.blog.count({
      where: { authorId, published: false },
    });

    // Sum of views across all of the author's blogs
    const totalViews = await prisma.view.count({
      where: {
        blog: {
          authorId,
        },
      },
    });

    // 3. Fetch recent activities (e.g., recent comments on the author's blogs)
    const recentComments = await prisma.comment.findMany({
      where: {
        blog: {
          authorId,
        },
      },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
          },
        },
        blog: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    // Map comments to a generic activity format
    const activities = recentComments.map((comment) => ({
      id: comment.id,
      type: 'comment',
      message: `${comment.author?.name} commented on "${comment.blog?.title}"`,
      detail: comment.content,
      createdAt: comment.createdAt,
      avatar: comment.author?.avatar,
      link: `/blogs/${comment.blog?.slug}`,
    }));

    return NextResponse.json(
      {
        stats: {
          total: totalBlogs,
          published: publishedBlogs,
          drafts: draftBlogs,
          views: totalViews,
        },
        activities,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch employee dashboard stats error:', error);
    return NextResponse.json(
      { message: 'Something went wrong fetching dashboard stats.' },
      { status: 500 }
    );
  }
}
