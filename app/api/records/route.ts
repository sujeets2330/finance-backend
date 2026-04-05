import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/middleware';
import { CreateRecordSchema, RecordFilterSchema } from '@/lib/validators';
import { ValidationError, formatErrorResponse, AuthorizationError } from '@/lib/errors';

const prisma = new PrismaClient();

/**
 * GET /api/records - Get financial records with role-based access
 * - ADMIN: sees all records from all users
 * - ANALYST/VIEWER: sees only their own records
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    const { user, response } = await withAuth(request);
    if (response) return response;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryData = {
      type: searchParams.get('type') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      minAmount: searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined,
      maxAmount: searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '100'),
    };

    // Validate filters
    const validation = RecordFilterSchema.safeParse(queryData);
    if (!validation.success) {
      throw new ValidationError('Invalid filter parameters');
    }

    const { type, category, status, startDate, endDate, minAmount, maxAmount, page, limit } = validation.data;

    // Build where clause - ADMIN sees all, others see only their own
    const where: any = {
      deletedAt: null,
    };

    // Only filter by userId if NOT ADMIN
    if (user!.role !== 'ADMIN') {
      where.userId = user!.userId;
    }

    if (type) where.type = type;
    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (status) where.status = status;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    // Get total count
    const total = await prisma.financialRecord.count({ where });

    // Get records - include user info for ADMIN
    const records = await prisma.financialRecord.findMany({
      where,
      include: user!.role === 'ADMIN' ? {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      } : undefined,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Convert Decimal to number for frontend
    const formattedRecords = records.map(record => ({
      ...record,
      amount: Number(record.amount),
    }));

    return NextResponse.json(
      {
        status: 200,
        message: 'Records retrieved successfully',
        data: {
          records: formattedRecords,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
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
 * POST /api/records - Create a new financial record
 * - ADMIN: can create record for a ROLE (Analyst/Viewer) - creates for ALL users with that role
 * - ANALYST: can only create record for themselves
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const { user, response } = await withAuth(request);
    if (response) return response;

    const body = await request.json();
    // console.log('📝 Create record request:', body);

    // Validate input
    const validation = CreateRecordSchema.safeParse(body);
    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      throw new ValidationError('Validation failed', errors);
    }

    const { amount, type, category, description, date, status, assignToRole } = validation.data;

    // Determine target users
    let targetUserIds: string[] = [];

    // ADMIN can create record for a ROLE (Analyst or Viewer)
    if (user!.role === 'ADMIN' && assignToRole) {
      // Get all users with the specified role
      const targetUsers = await prisma.user.findMany({
        where: {
          role: assignToRole,
          deletedAt: null,
          isActive: true,
        },
        select: { id: true },
      });
      targetUserIds = targetUsers.map(u => u.id);
      
      if (targetUserIds.length === 0) {
        throw new ValidationError(`No ${assignToRole} users found`);
      }
      
      // console.log(`📝 Creating record for ${targetUserIds.length} users with role: ${assignToRole}`);
    } else {
      // Regular user (Analyst) creates for themselves
      targetUserIds = [user!.userId];
    }

    // Create records for all target users
    const createdRecords = [];
    for (const targetUserId of targetUserIds) {
      const record = await prisma.financialRecord.create({
        data: {
          userId: targetUserId,
          amount: amount,
          type,
          category,
          description: description || '',
          date: new Date(date),
          status: status || 'COMPLETED',
        },
      });
      createdRecords.push(record);
    }

    // Convert Decimal to number for response
    const formattedRecords = createdRecords.map(record => ({
      ...record,
      amount: Number(record.amount),
    }));

    const message = user!.role === 'ADMIN' && assignToRole
      ? `Record created for ${targetUserIds.length} ${assignToRole} user(s)`
      : 'Record created successfully';

    return NextResponse.json(
      {
        status: 201,
        message: message,
        data: { records: formattedRecords },
      },
      { status: 201 }
    );
  } catch (error) {
    // console.error('❌ Create record error:', error);
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  } finally {
    await prisma.$disconnect();
  }
}