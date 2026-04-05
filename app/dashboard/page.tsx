 'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useDashboardData } from './hooks/useDashboardData';
import Header from './components/Header';
import KPICards from './components/KPICards';
import MonthlyTrendsChart from './components/MonthlyTrendsChart';
import CategoryChart from './components/CategoryChart';
import RecordsTab from './components/RecordsTab';
import UsersTab from './components/UsersTab';
import { FinancialRecord } from './types';

export default function Dashboard() {
  const router = useRouter();
  const { user, dashboardData, records, users, loading, refreshData } = useDashboardData();
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'users'>('overview');
  const [filteredRecords, setFilteredRecords] = useState<FinancialRecord[]>([]);

  // Initialize filteredRecords when records load
  useEffect(() => {
    if (records.length > 0) {
      setFilteredRecords(records);
    } else {
      setFilteredRecords([]);
    }
  }, [records]);

  const formatAmount = (amount: number | string): number => {
    return typeof amount === 'string' ? parseFloat(amount) : amount;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleRefresh = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await refreshData(token);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`pb-3 px-4 font-medium transition-colors ${
              activeTab === 'records'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Records
          </button>
          {user.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Users
            </button>
          )}
        </div>

        {activeTab === 'overview' && dashboardData && (
          <div className="space-y-6">
            <KPICards
              totalIncome={dashboardData.summary?.totalIncome || 0}
              totalExpenses={dashboardData.summary?.totalExpenses || 0}
              netBalance={dashboardData.summary?.netBalance || 0}
              transactionCount={dashboardData.summary?.transactionCount || 0}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyTrendsChart data={dashboardData.analytics?.byMonth || []} />
              <CategoryChart data={dashboardData.analytics?.byCategory || []} />
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <RecordsTab
            user={user}
            records={records}
            filteredRecords={filteredRecords}
            setFilteredRecords={setFilteredRecords}
            onRefresh={handleRefresh}
            formatAmount={formatAmount}
          />
        )}

        {activeTab === 'users' && user.role === 'ADMIN' && (
          <UsersTab users={users} currentUser={user} onRefresh={handleRefresh} />
        )}
      </main>
    </div>
  );
}