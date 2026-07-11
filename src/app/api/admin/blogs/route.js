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

export async function GET(request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // all, draft, published
    const categoryId = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Filters
    const where = {};

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (status === 'published') {
      where.published = true;
    } else if (status === 'draft') {
      where.published = false;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
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
      }),
      prisma.blog.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      blogs,
      pagination: {
        total,
        totalPages,
        page,
        limit,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Admin blogs list error:', error);
    return NextResponse.json(
      { message: 'Something went wrong fetching blogs.' },
      { status: 500 }
    );
  }
}
