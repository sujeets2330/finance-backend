import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword, generateToken } from '@/lib/auth';
import { RegisterSchema } from '@/lib/validators';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // LOG EVERYTHING
    // console.log('========== REGISTER REQUEST ==========');
    // console.log('Body:', JSON.stringify(body, null, 2));
    
    // Check what fields are coming
    // console.log('Fields present:', Object.keys(body));
    // console.log('Email:', body.email);
    // console.log('Name field:', body.name);
    // console.log('FullName field:', body.fullName);
    // console.log('Password:', body.password ? '***' : 'MISSING');
    // console.log('ConfirmPassword:', body.confirmPassword ? '***' : 'MISSING');

    const validation = RegisterSchema.safeParse(body);
    
    if (!validation.success) {
      console.log('VALIDATION ERRORS:');
      validation.error.errors.forEach((err) => {
        console.log(`  - ${err.path.join('.')}: ${err.message}`);
      });
      
      return NextResponse.json(
        {
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          errors: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    // console.log('VALIDATION PASSED:', validation.data);

    const { email, name, password } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          status: 409,
          code: 'CONFLICT',
          message: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'VIEWER',
        isActive: true,
      },
    });

    const token = generateToken(user.id, user.email, user.role);

    // console.log('USER CREATED SUCCESSFULLY:', user.id);

    return NextResponse.json(
      {
        status: 201,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // console.error('CATCH BLOCK ERROR:', error);
    return NextResponse.json(
      {
        status: 500,
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Something went wrong',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}