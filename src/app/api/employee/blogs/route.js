import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { slugify } from '@/lib/utils';

// Helper to verify author identity
async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || (decoded.role !== 'EMPLOYEE' && decoded.role !== 'ADMIN')) return null;

  return decoded;
}

// GET: List all blogs created by the active authenticated employee
export async function GET(request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // all, draft, published

    // Build filters
    const where = {
      authorId: user.id,
    };

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

    const blogs = await prisma.blog.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
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
    });

    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    console.error('Fetch employee blogs API error:', error);
    return NextResponse.json(
      { message: 'Something went wrong fetching your blogs.' },
      { status: 500 }
    );
  }
}

// POST: Create a new blog post
export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, excerpt, coverImage, categoryId, content, tags, published } = body;

    if (!title) {
      return NextResponse.json({ message: 'Title is required.' }, { status: 400 });
    }

    // Check slug uniqueness
    const generatedSlug = slug ? slugify(slug) : slugify(title);
    const existingBlog = await prisma.blog.findUnique({
      where: { slug: generatedSlug },
    });

    if (existingBlog) {
      return NextResponse.json(
        { message: 'An article with this title or slug already exists.' },
        { status: 409 }
      );
    }

    // Process dynamic tags connectOrCreate
    const tagConnections = Array.isArray(tags)
      ? tags.map((t) => ({
          where: { name: t.trim().toLowerCase() },
          create: { name: t.trim().toLowerCase(), slug: slugify(t) },
        }))
      : [];

    const newBlog = await prisma.blog.create({
      data: {
        title,
        slug: generatedSlug,
        excerpt,
        coverImage,
        categoryId: categoryId || null,
        content: content || JSON.stringify({ type: 'doc', content: [] }),
        published,
        publishedAt: published ? new Date() : null,
        authorId: user.id,
        tags: {
          connectOrCreate: tagConnections,
        },
      },
    });

    return NextResponse.json(
      { message: 'Article created successfully.', blog: newBlog },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create blog API error:', error);
    return NextResponse.json(
      { message: 'Something went wrong creating the blog.' },
      { status: 500 }
    );
  }
}
