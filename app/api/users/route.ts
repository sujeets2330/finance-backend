import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth, requireRole, getUnauthorizedResponse } from '@/lib/middleware';
import { CreateUserSchema } from '@/lib/validators';
import { ValidationError, formatErrorResponse } from '@/lib/errors';
import { hashPassword } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * GET /api/users - Get all users (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { user, response } = await withAuth(request);
    if (response) return response;

    // Check authorization
    if (!requireRole('ADMIN')(user!.role)) {
      return getUnauthorizedResponse();
    }

    const users = await prisma.user.findMany({
      where: { deletedAt: null },
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      {
        status: 200,
        message: 'Users retrieved successfully',
        data: { users },
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
 * POST /api/users - Create a new user (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const { user, response } = await withAuth(request);
    if (response) return response;

    // Check authorization
    if (!requireRole('ADMIN')(user!.role)) {
      return getUnauthorizedResponse();
    }

    const body = await request.json();
    // console.log('📝 Admin creating user:', body);

    // Validate input
    const validation = CreateUserSchema.safeParse(body);
    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      throw new ValidationError('Validation failed', errors);
    }

    const { email, name, password, role } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          status: 409,
          message: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: role || 'VIEWER',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // console.log('✅ Admin created user with role:', newUser.role);

    return NextResponse.json(
      {
        status: 201,
        message: 'User created successfully',
        data: { user: newUser },
      },
      { status: 201 }
    );
  } catch (error) {
    // console.error('❌ Admin create user error:', error);
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  } finally {
    await prisma.$disconnect();
  }
}