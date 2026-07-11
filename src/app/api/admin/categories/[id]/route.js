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

// DELETE: Remove a category
export async function DELETE(request, { params }) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { id: categoryId } = await params;

    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
    }

    // Delete the category
    // Note: Due to onDelete: SetNull in schema, blogs connected to this category will have categoryId set to Null
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json(
      { message: 'Category deleted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { message: 'Something went wrong deleting the category.' },
      { status: 500 }
    );
  }
}
