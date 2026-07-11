import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request, { params }) {
  try {
    // Next.js 15: params must be awaited or destructured if dynamic
    const { slug } = await params;

    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            views: true,
          },
        },
      },
    });

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog post not found.' },
        { status: 404 }
      );
    }

    // Check if the current reader has liked this blog post
    let hasLiked = false;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      if (token) {
        const decoded = verifyToken(token);
        if (decoded && decoded.id) {
          const likeRecord = await prisma.like.findUnique({
            where: {
              blogId_userId: {
                blogId: blog.id,
                userId: decoded.id,
              },
            },
          });
          hasLiked = !!likeRecord;
        }
      }
    } catch (cookieError) {
      // Non-blocking catch for edge contexts where cookies() is not fully readable
      console.warn('Could not read user token for like check:', cookieError.message);
    }

    return NextResponse.json({ blog, hasLiked }, { status: 200 });
  } catch (error) {
    console.error('Fetch blog by slug error:', error);
    return NextResponse.json(
      { message: 'Something went wrong fetching the blog.' },
      { status: 500 }
    );
  }
}
