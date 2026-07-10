import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import { RegisterSchema } from '@/schemas/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate request data
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    const { name, email, password, role } = validation.data;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists.' },
        { status: 409 }
      );
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create new user (Role defaults to READER if not provided)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'READER',
      },
    });
    
    // Sign JWT token
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Set HttpOnly cookie (Next.js 15: cookies() is async)
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Something went wrong during registration.' },
      { status: 500 }
    );
  }
}
