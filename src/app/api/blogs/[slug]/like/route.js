import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function POST(request, { params }) {
  try {
    const { slug } = await params;

    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { message: 'You must be logged in to like posts.' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { message: 'Invalid or expired session.' },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    // Find the blog post by slug
    const blog = await prisma.blog.findUnique({
      where: { slug },
    });

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog post not found.' },
        { status: 404 }
      );
    }

    const blogId = blog.id;

    // Check for existing like
    const existingLike = await prisma.like.findUnique({
      where: {
        blogId_userId: {
          blogId,
          userId,
        },
      },
    });

    let liked = false;

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          blogId_userId: {
            blogId,
            userId,
          },
        },
      });
      liked = false;
    } else {
      // Like
      await prisma.like.create({
        data: {
          blogId,
          userId,
        },
      });
      liked = true;
    }

    // Get updated total likes count
    const likesCount = await prisma.like.count({
      where: { blogId },
    });

    return NextResponse.json(
      {
        message: liked ? 'Post liked.' : 'Post unliked.',
        liked,
        likesCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Like toggle error:', error);
    return NextResponse.json(
      { message: 'Something went wrong.' },
      { status: 500 }
    );
  }
}
