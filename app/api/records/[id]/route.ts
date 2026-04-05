 import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/middleware';
import { UpdateRecordSchema } from '@/lib/validators';
import { ValidationError, NotFoundError, AuthorizationError, formatErrorResponse } from '@/lib/errors';

const prisma = new PrismaClient();

/**
 * GET /api/records/[id] - Get a specific financial record
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response } = await withAuth(request);
    if (response) return response;

    const { id } = await params;

    const record = await prisma.financialRecord.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!record) {
      throw new NotFoundError('Financial record');
    }

    // Check authorization - Viewer can only see their own
    if (record.userId !== user!.userId && user!.role === 'VIEWER') {
      throw new AuthorizationError();
    }

    // Convert Decimal to number
    const formattedRecord = {
      ...record,
      amount: Number(record.amount),
    };

    return NextResponse.json(
      {
        status: 200,
        message: 'Record retrieved successfully',
        data: { record: formattedRecord },
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
 * PUT /api/records/[id] - Update a financial record (Full update)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response } = await withAuth(request);
    if (response) return response;

    const { id } = await params;

    const record = await prisma.financialRecord.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!record) {
      throw new NotFoundError('Financial record');
    }

    // Check authorization - Owner or ADMIN can update
    if (record.userId !== user!.userId && user!.role !== 'ADMIN') {
      throw new AuthorizationError('You do not have permission to update this record');
    }

    const body = await request.json();
    // console.log('📝 Update request body:', body);

    // Validate input
    const validation = UpdateRecordSchema.safeParse(body);
    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      throw new ValidationError('Validation failed', errors);
    }

    const { amount, type, category, description, date, status } = validation.data;

    // Build update data
    const updateData: any = {};
    if (amount !== undefined) updateData.amount = amount;
    if (type) updateData.type = type;
    if (category) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (date) updateData.date = new Date(date);
    if (status) updateData.status = status;

    // console.log('📝 Update data:', updateData);

    // Update record
    const updatedRecord = await prisma.financialRecord.update({
      where: { id: id },
      data: updateData,
    });

    // Convert Decimal to number
    const formattedRecord = {
      ...updatedRecord,
      amount: Number(updatedRecord.amount),
    };

    // console.log('✅ Record updated:', formattedRecord);

    return NextResponse.json(
      {
        status: 200,
        message: 'Record updated successfully',
        data: { record: formattedRecord },
      },
      { status: 200 }
    );
  } catch (error) {
    // console.error('❌ Update error:', error);
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * PATCH /api/records/[id] - Partial update a financial record
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response } = await withAuth(request);
    if (response) return response;

    const { id } = await params;

    const record = await prisma.financialRecord.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!record) {
      throw new NotFoundError('Financial record');
    }

    // Check authorization
    if (record.userId !== user!.userId && user!.role !== 'ADMIN') {
      throw new AuthorizationError();
    }

    const body = await request.json();

    // Validate input
    const validation = UpdateRecordSchema.safeParse(body);
    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      throw new ValidationError('Validation failed', errors);
    }

    const { amount, type, category, description, date, status } = validation.data;

    // Build update data (only include provided fields)
    const updateData: any = {};
    if (amount !== undefined) updateData.amount = amount;
    if (type) updateData.type = type;
    if (category) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (date) updateData.date = new Date(date);
    if (status) updateData.status = status;

    // Update record
    const updatedRecord = await prisma.financialRecord.update({
      where: { id: id },
      data: updateData,
    });

    // Convert Decimal to number
    const formattedRecord = {
      ...updatedRecord,
      amount: Number(updatedRecord.amount),
    };

    return NextResponse.json(
      {
        status: 200,
        message: 'Record updated successfully',
        data: { record: formattedRecord },
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
 * DELETE /api/records/[id] - Delete a financial record (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, response } = await withAuth(request);
    if (response) return response;

    const { id } = await params;

    const record = await prisma.financialRecord.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!record) {
      throw new NotFoundError('Financial record');
    }

    // Check authorization - Only ADMIN or owner
    if (record.userId !== user!.userId && user!.role !== 'ADMIN') {
      throw new AuthorizationError('You do not have permission to delete this record');
    }

    // Soft delete
    await prisma.financialRecord.update({
      where: { id: id },
      data: { deletedAt: new Date() },
    });

    // console.log('✅ Record deleted:', id);

    return NextResponse.json(
      {
        status: 200,
        message: 'Record deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    // console.error(' Delete error:', error);
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  } finally {
    await prisma.$disconnect();
  }
}