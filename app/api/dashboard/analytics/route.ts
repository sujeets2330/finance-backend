 import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth } from '@/lib/middleware';
import { formatErrorResponse } from '@/lib/errors';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await withAuth(request);
    if (response) return response;

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    // Only filter by userId if NOT ADMIN
    if (user!.role !== 'ADMIN') {
      where.userId = user!.userId;
    }

    // Get ALL records (not just COMPLETED)
    const records = await prisma.financialRecord.findMany({
      where,
    });

    // console.log('Dashboard API - Records found:', records.length);
    // console.log('Dashboard API - User role:', user!.role);

    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;

    records.forEach(record => {
      const amount = Number(record.amount);
      if (record.type === 'INCOME') {
        totalIncome += amount;
      } else {
        totalExpenses += amount;
      }
    });

    const netBalance = totalIncome - totalExpenses;
    const transactionCount = records.length;

    // Category-wise totals (only for expenses)
    const categoryMap = new Map<string, number>();
    records.forEach(record => {
      if (record.type === 'EXPENSE') {
        const current = categoryMap.get(record.category) || 0;
        categoryMap.set(record.category, current + Number(record.amount));
      }
    });

    const byCategory = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));

    // Monthly trends
    const monthMap = new Map<string, { income: number; expenses: number }>();
    
    records.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { income: 0, expenses: 0 });
      }
      
      const current = monthMap.get(monthKey)!;
      const amount = Number(record.amount);
      
      if (record.type === 'INCOME') {
        current.income += amount;
      } else {
        current.expenses += amount;
      }
      
      monthMap.set(monthKey, current);
    });

    const byMonth = Array.from(monthMap.entries())
      .sort()
      .map(([key, values]) => ({
        month: key,
        income: values.income,
        expenses: values.expenses,
      }));

    const responseData = {
      summary: {
        totalIncome,
        totalExpenses,
        netBalance,
        transactionCount,
      },
      analytics: {
        byCategory,
        byMonth,
      },
    };

    // console.log('Dashboard API - Response:', JSON.stringify(responseData, null, 2));

    return NextResponse.json(
      {
        status: 200,
        message: 'Dashboard data retrieved successfully',
        data: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    // console.error('Dashboard API Error:', error);
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  } finally {
    await prisma.$disconnect();
  }
}