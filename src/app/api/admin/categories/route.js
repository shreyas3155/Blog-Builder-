import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { slugify } from '@/components/editor/TipTapRenderer';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return false;

  const decoded = verifyToken(token);
  return decoded && decoded.role === 'ADMIN';
}

// POST: Add a new category
export async function POST(request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Category name is required.' }, { status: 400 });
    }

    const generatedSlug = slugify(name);

    // Check uniqueness
    const existing = await prisma.category.findUnique({
      where: { slug: generatedSlug },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'A category with this name or slug already exists.' },
        { status: 409 }
      );
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
      },
    });

    return NextResponse.json(
      { message: 'Category created successfully.', category: newCategory },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { message: 'Something went wrong creating the category.' },
      { status: 500 }
    );
  }
}
