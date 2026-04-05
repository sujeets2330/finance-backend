import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardData, User, FinancialRecord } from '../types';

export function useDashboardData() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (token: string) => {
    try {
      const response = await fetch('/api/dashboard/analytics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          setDashboardData(data.data || data);
        }
      }
    } catch (error) {
      // Silent fail
    }
  };

  const fetchRecords = async (token: string) => {
    try {
      const response = await fetch('/api/records', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          const recordsData = data.data?.records || data.records || [];
          const formattedRecords = recordsData.map((record: any) => ({
            ...record,
            notes: record.description || record.notes || '',
          }));
          setRecords(formattedRecords);
        } else {
          setRecords([]);
        }
      }
    } catch (error) {
      setRecords([]);
    }
  };

  const fetchUsers = async (token: string) => {
    try {
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          setUsers(data.data?.users || data.users || []);
        } else {
          setUsers([]);
        }
      }
    } catch (error) {
      setUsers([]);
    }
  };

  const refreshData = async (token: string) => {
    await fetchDashboardData(token);
    await fetchRecords(token);
    if (user?.role === 'ADMIN') {
      await fetchUsers(token);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchDashboardData(token);
      fetchRecords(token);
      if (parsedUser.role === 'ADMIN') {
        fetchUsers(token);
      }
    } catch (error) {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);
  

  return {
    user,
    dashboardData,
    records,
    users,
    loading,
    fetchRecords,
    fetchDashboardData,
    fetchUsers,
    refreshData,
    setRecords,
    setUsers,
  };
}