'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

interface CategoryChartProps {
  data: Array<{ category: string; amount: number }>;
}

export default function CategoryChart({ data }: CategoryChartProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
          <CardDescription>Expense distribution by category</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
              <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '12px', paddingLeft: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[320px] text-slate-500 bg-slate-50 rounded-lg">
            <DollarSign className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-medium">No expense data available</p>
            <p className="text-xs text-slate-400 mt-1">Add some expense records to see distribution!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}