import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { slug } = await params;

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

    // Capture IP and User-Agent from request headers
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    // Create View record
    await prisma.view.create({
      data: {
        blogId,
        ip,
        userAgent,
      },
    });

    // Get updated views count
    const viewsCount = await prisma.view.count({
      where: { blogId },
    });

    return NextResponse.json(
      {
        message: 'View registered successfully.',
        viewsCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Record view error:', error);
    return NextResponse.json(
      { message: 'Something went wrong while recording view.' },
      { status: 500 }
    );
  }
}
