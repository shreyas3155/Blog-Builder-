import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            blogs: {
              where: {
                published: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ tags }, { status: 200 });
  } catch (error) {
    console.error('Fetch tags error:', error);
    return NextResponse.json(
      { message: 'Something went wrong fetching tags.' },
      { status: 500 }
    );
  }
}
