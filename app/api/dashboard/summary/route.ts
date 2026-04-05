import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/middleware';
import { formatErrorResponse } from '@/lib/errors';

const prisma = new PrismaClient();

/**
 * GET /api/dashboard/summary - Get financial summary
 */
export async function GET(request: NextRequest) {
  try {
    const { user, response } = await withAuth(request);
    if (response) return response;

    // Get income and expense totals
    const records = await prisma.financialRecord.findMany({
      where: {
        userId: user!.userId,
        deletedAt: null,
      },
    });

    const income = records
      .filter((r) => r.type === 'INCOME' && r.status === 'COMPLETED')
      .reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0);

    const expenses = records
      .filter((r) => r.type === 'EXPENSE' && r.status === 'COMPLETED')
      .reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0);

    const pending = records
      .filter((r) => r.status === 'PENDING')
      .reduce((sum, r) => {
        if (r.type === 'INCOME') return sum + parseFloat(r.amount.toString());
        return sum - parseFloat(r.amount.toString());
      }, 0);

    const balance = income - expenses;

    return NextResponse.json(
      {
        status: 200,
        message: 'Summary retrieved successfully',
        data: {
          summary: {
            totalIncome: parseFloat(income.toFixed(2)),
            totalExpenses: parseFloat(expenses.toFixed(2)),
            balance: parseFloat(balance.toFixed(2)),
            pendingAmount: parseFloat(pending.toFixed(2)),
            completedRecords: records.filter((r) => r.status === 'COMPLETED').length,
            pendingRecords: records.filter((r) => r.status === 'PENDING').length,
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
