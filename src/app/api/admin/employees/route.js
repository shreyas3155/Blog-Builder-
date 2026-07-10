import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { RegisterSchema } from '@/schemas/auth';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return false;

  const decoded = verifyToken(token);
  return decoded && decoded.role === 'ADMIN';
}

// GET: List all authors/employees on the platform
export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const employees = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'EMPLOYEE'],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            blogs: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ employees }, { status: 200 });
  } catch (error) {
    console.error('Fetch employees list error:', error);
    return NextResponse.json(
      { message: 'Something went wrong fetching employees.' },
      { status: 500 }
    );
  }
}

// POST: Add a new employee account directly
export async function POST(request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;

    if (role !== 'ADMIN' && role !== 'EMPLOYEE') {
      return NextResponse.json(
        { message: 'Employees must have the role ADMIN or EMPLOYEE.' },
        { status: 400 }
      );
    }

    // Check if email unique
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'A user with this email address already exists.' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const newEmployee = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`, // Default avatar
      },
    });

    return NextResponse.json(
      {
        message: 'Employee registered successfully.',
        employee: {
          id: newEmployee.id,
          name: newEmployee.name,
          email: newEmployee.email,
          role: newEmployee.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register employee error:', error);
    return NextResponse.json(
      { message: 'Something went wrong creating employee account.' },
      { status: 500 }
    );
  }
}
