import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { z } from 'zod';

const CommentSchema = z.object({
  content: z.string().trim().min(1, { message: 'Comment cannot be empty.' }).max(1000, { message: 'Comment is too long.' }),
});

// GET: Fetch all comments for a blog post by its slug
export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const comments = await prisma.comment.findMany({
      where: {
        blog: {
          slug,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error('Fetch comments error:', error);
    return NextResponse.json(
      { message: 'Something went wrong fetching comments.' },
      { status: 500 }
    );
  }
}

// POST: Add a comment to a blog post by its slug
export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { message: 'You must be logged in to comment.' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { message: 'Invalid or expired session. Please log in again.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = CommentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.flatten().fieldErrors.content?.[0] || 'Invalid content' },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Check if the blog post exists
    const blog = await prisma.blog.findUnique({
      where: { slug },
    });

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog post not found.' },
        { status: 404 }
      );
    }

    // Insert comment
    const comment = await prisma.comment.create({
      data: {
        content,
        blogId: blog.id,
        authorId: decoded.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Comment posted successfully.', comment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { message: 'Something went wrong while posting comment.' },
      { status: 500 }
    );
  }
}
