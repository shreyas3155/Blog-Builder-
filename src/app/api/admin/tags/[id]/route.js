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

// DELETE: Remove a tag globally
export async function DELETE(request, { params }) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { id: tagId } = await params;

    const existing = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Tag not found.' }, { status: 404 });
    }

    // Delete tag
    await prisma.tag.delete({
      where: { id: tagId },
    });

    return NextResponse.json(
      { message: 'Tag deleted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete tag error:', error);
    return NextResponse.json(
      { message: 'Something went wrong deleting the tag.' },
      { status: 500 }
    );
  }
}
