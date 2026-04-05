import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/middleware';
import { formatErrorResponse, NotFoundError, AuthorizationError } from '@/lib/errors';

const prisma = new PrismaClient();

/**
 * DELETE /api/users/[id] - Permanently delete a user and all their records
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response } = await withAuth(request);
    if (response) return response;

    // Only ADMIN can delete users
    if (user!.role !== 'ADMIN') {
      throw new AuthorizationError('Admin access required');
    }

    const { id } = await params;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError('User');
    }

    // Prevent admin from deleting themselves
    if (existingUser.id === user!.userId) {
      return NextResponse.json(
        {
          status: 400,
          message: 'You cannot delete your own account',
        },
        { status: 400 }
      );
    }

    // 🔥 HARD DELETE - Remove user AND all their records
    // Prisma will automatically delete related records due to onDelete: Cascade in schema
    await prisma.user.delete({
      where: { id },
    });

    console.log('✅ User and all their records permanently deleted:', id);

    return NextResponse.json(
      {
        status: 200,
        message: 'User and all their records permanently deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Delete user error:', error);
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * PUT /api/users/[id] - Update a user (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response } = await withAuth(request);
    if (response) return response;

    // Only ADMIN can update users
    if (user!.role !== 'ADMIN') {
      throw new AuthorizationError('Admin access required');
    }

    const { id } = await params;

    const existingUser = await prisma.user.findFirst({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError('User');
    }

    const body = await request.json();
    const { name, role, isActive } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        status: 200,
        message: 'User updated successfully',
        data: { user: updatedUser },
      },
      { status: 200 }
    );
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/users/[id] - Get a specific user (Admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response } = await withAuth(request);
    if (response) return response;

    if (user!.role !== 'ADMIN') {
      throw new AuthorizationError('Admin access required');
    }

    const { id } = await params;

    const targetUser = await prisma.user.findFirst({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundError('User');
    }

    return NextResponse.json(
      {
        status: 200,
        message: 'User retrieved successfully',
        data: { user: targetUser },
      },
      { status: 200 }
    );
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  } finally {
    await prisma.$disconnect();
  }
}