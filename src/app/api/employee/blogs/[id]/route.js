import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { slugify } from '@/components/editor/TipTapRenderer';

async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded || (decoded.role !== 'EMPLOYEE' && decoded.role !== 'ADMIN')) return null;

  return decoded;
}

// GET: Fetch a single blog post by its database ID
export async function GET(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { id: blogId } = await params;
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        tags: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!blog) {
      return NextResponse.json({ message: 'Article not found.' }, { status: 404 });
    }

    if (blog.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden. You do not own this post.' }, { status: 403 });
    }

    return NextResponse.json({ blog }, { status: 200 });
  } catch (error) {
    console.error('Fetch employee blog by ID error:', error);
    return NextResponse.json(
      { message: 'Something went wrong fetching the blog.' },
      { status: 500 }
    );
  }
}

// PATCH: Update a blog post
export async function PATCH(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { id: blogId } = await params;
    const body = await request.json();
    const { title, slug, excerpt, coverImage, categoryId, content, tags, published } = body;

    // Check if blog exists and belongs to the user
    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!existingBlog) {
      return NextResponse.json({ message: 'Article not found.' }, { status: 404 });
    }

    // Guard: Only the author or an admin can modify this post
    if (existingBlog.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden. You do not own this post.' }, { status: 403 });
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (content !== undefined) updateData.content = content;
    
    if (published !== undefined) {
      updateData.published = published;
      // Set publish timestamp if newly published
      if (published && !existingBlog.published) {
        updateData.publishedAt = new Date();
      }
    }

    // Handle slug updates and check duplicates
    if (slug) {
      const generatedSlug = slugify(slug);
      if (generatedSlug !== existingBlog.slug) {
        const slugConflict = await prisma.blog.findUnique({
          where: { slug: generatedSlug },
        });
        if (slugConflict) {
          return NextResponse.json(
            { message: 'An article with this slug already exists.' },
            { status: 409 }
          );
        }
        updateData.slug = generatedSlug;
      }
    }

    // Handle tags update (clear old connections and reconnect new tags)
    if (Array.isArray(tags)) {
      updateData.tags = {
        set: [], // Clear all existing tag relations
        connectOrCreate: tags.map((t) => ({
          where: { name: t.trim().toLowerCase() },
          create: { name: t.trim().toLowerCase(), slug: slugify(t) },
        })),
      };
    }

    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: updateData,
    });

    return NextResponse.json(
      { message: 'Article updated successfully.', blog: updatedBlog },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update blog API error:', error);
    return NextResponse.json(
      { message: 'Something went wrong updating the blog.' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a blog post
export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { id: blogId } = await params;

    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!existingBlog) {
      return NextResponse.json({ message: 'Article not found.' }, { status: 404 });
    }

    // Guard: Only the author or an admin can delete this post
    if (existingBlog.authorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden. You do not own this post.' }, { status: 403 });
    }

    await prisma.blog.delete({
      where: { id: blogId },
    });

    return NextResponse.json(
      { message: 'Article deleted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete blog API error:', error);
    return NextResponse.json(
      { message: 'Something went wrong deleting the blog.' },
      { status: 500 }
    );
  }
}
