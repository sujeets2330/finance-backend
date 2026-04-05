'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface MonthlyTrendsChartProps {
  data: Array<{ month: string; income: number; expenses: number }>;
}

export default function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Monthly Trends</CardTitle>
            <CardDescription>Income vs Expenses over time</CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-slate-600">Income</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span className="text-slate-600">Expenses</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} tickFormatter={(value) => `$${value.toLocaleString()}`} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [`$${value.toLocaleString()}`, '']} labelFormatter={(label) => `Month: ${label}`} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="income" stroke="#10b981" name="Income" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#10b981', stroke: 'white', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#ef4444', stroke: 'white', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[320px] text-slate-500 bg-slate-50 rounded-lg">
            <TrendingUp className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-medium">No data available</p>
            <p className="text-xs text-slate-400 mt-1">Add some records to see charts!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}