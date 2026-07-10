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

// PATCH: Update employee info
export async function PATCH(request, { params }) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { id: employeeId } = await params;
    const body = await request.json();
    const { name, role } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id: employeeId },
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (role && (role === 'ADMIN' || role === 'EMPLOYEE' || role === 'READER')) {
      updateData.role = role;
    }

    const updated = await prisma.user.update({
      where: { id: employeeId },
      data: updateData,
    });

    return NextResponse.json(
      { message: 'Employee info updated successfully.', employee: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update employee error:', error);
    return NextResponse.json(
      { message: 'Something went wrong updating employee info.' },
      { status: 500 }
    );
  }
}

// DELETE: Delete employee account
export async function DELETE(request, { params }) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    const { id: employeeId } = await params;

    const existingUser = await prisma.user.findUnique({
      where: { id: employeeId },
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    // Guard: Prevent the admin from deleting themselves
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const decoded = verifyToken(token);
    if (decoded && decoded.id === employeeId) {
      return NextResponse.json(
        { message: 'Self-deletion is not allowed. You cannot delete your own admin account.' },
        { status: 400 }
      );
    }

    // Cascade deletion of employee's blogs is handled automatically by PostgreSQL due to schema cascades
    await prisma.user.delete({
      where: { id: employeeId },
    });

    return NextResponse.json(
      { message: 'Employee account and all associated articles deleted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete employee error:', error);
    return NextResponse.json(
      { message: 'Something went wrong deleting the employee.' },
      { status: 500 }
    );
  }
}
