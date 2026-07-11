import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return false;

  const decoded = verifyToken(token);
  return decoded && decoded.role === 'ADMIN';
}

// PATCH: Admin updates post status globally
export async function PATCH(request, { params }) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { id: blogId } = await params;
    const body = await request.json();
    const { published } = body;

    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!existingBlog) {
      return NextResponse.json({ message: 'Article not found.' }, { status: 404 });
    }

    const updateData = {};
    if (published !== undefined) {
      updateData.published = published;
      if (published && !existingBlog.published) {
        updateData.publishedAt = new Date();
      }
    }

    const updated = await prisma.blog.update({
      where: { id: blogId },
      data: updateData,
    });

    return NextResponse.json(
      { message: 'Article status updated successfully.', blog: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin update blog error:', error);
    return NextResponse.json(
      { message: 'Something went wrong updating the article.' },
      { status: 500 }
    );
  }
}

// DELETE: Admin deletes any post
export async function DELETE(request, { params }) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { id: blogId } = await params;

    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!existingBlog) {
      return NextResponse.json({ message: 'Article not found.' }, { status: 404 });
    }

    await prisma.blog.delete({
      where: { id: blogId },
    });

    return NextResponse.json(
      { message: 'Article deleted permanently.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin delete blog error:', error);
    return NextResponse.json(
      { message: 'Something went wrong deleting the article.' },
      { status: 500 }
    );
  }
}
