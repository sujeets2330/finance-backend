export interface User {
  id: string;
  name: string;
  email: string;
  role: 'VIEWER' | 'ANALYST' | 'ADMIN';
  isActive?: boolean;
}

export interface FinancialRecord {
  id: string;
  amount: number | string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  notes: string;
  description?: string;
  userId: string;
}

export interface DashboardData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netBalance: number;
    transactionCount: number;
  };
  analytics: {
    byCategory: Array<{ category: string; amount: number }>;
    byMonth: Array<{ month: string; income: number; expenses: number }>;
  };
  records: FinancialRecord[];
}