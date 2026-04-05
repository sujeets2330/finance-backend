 'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import FilterBar from './FilterBar';
import AddRecordForm from './AddRecordForm';
import { FinancialRecord, User } from '../types';

interface RecordsTabProps {
  user: User;
  records: FinancialRecord[];
  filteredRecords: FinancialRecord[];
  setFilteredRecords: (records: FinancialRecord[]) => void;
  onRefresh: () => Promise<void>;
  formatAmount: (amount: number | string) => number;
}

export default function RecordsTab({
  user,
  records,
  filteredRecords,
  setFilteredRecords,
  onRefresh,
  formatAmount,
}: RecordsTabProps) {
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const defaultFormState = useMemo(() => ({
    amount: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  }), []);

  const [formData, setFormData] = useState(defaultFormState);

  if (!user) return null;

  //  Filters 
  useEffect(() => {
    let filtered = [...records];
    let count = 0;

    if (filterType) {
      filtered = filtered.filter(r => r.type === filterType);
      count++;
    }
    if (filterCategory) {
      filtered = filtered.filter(r => r.category === filterCategory);
      count++;
    }
    if (filterDate) {
      filtered = filtered.filter(r => r.date.split('T')[0] === filterDate);
      count++;
    }

    setFilteredRecords(filtered);
    setActiveFilterCount(count);
  }, [filterType, filterCategory, filterDate, records, setFilteredRecords]);

  const clearFilters = useCallback(() => {
    setFilterType('');
    setFilterCategory('');
    setFilterDate('');
    setFilteredRecords([...records]);
    setActiveFilterCount(0);
  }, [records, setFilteredRecords]);

  const resetForm = useCallback(() => {
    setFormData(defaultFormState);
    setEditingId(null);
    setSelectedRole('');
    setShowAddRecord(false);
  }, [defaultFormState]);

  const scrollToEditForm = () => {
    requestAnimationFrame(() => {
      document.getElementById('edit-record-form')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    setLoading(true);

    try {
      const endpoint = editingId ? `/api/records/${editingId}` : '/api/records';
      const method = editingId ? 'PUT' : 'POST';

      const payload: any = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        description: formData.notes || '',
        date: new Date(formData.date).toISOString(),
        status: 'COMPLETED',
      };

      if (user.role === 'ADMIN' && selectedRole) {
        payload.assignToRole = selectedRole;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to save record');
      }

      toast.success(editingId ? 'Record updated!' : 'Record added!');
      resetForm();
      await onRefresh();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Delete failed');
      }

      toast.success('Record deleted!');
      await onRefresh();

    } catch {
      toast.error('Failed to delete record');
    }
  };

  const handleEditRecord = (record: FinancialRecord) => {
    setFormData({
      amount: formatAmount(record.amount).toString(),
      type: record.type,
      category: record.category,
      date: record.date.split('T')[0],
      notes: record.notes || record.description || '',
    });

    setEditingId(record.id);
    setShowAddRecord(true);
    scrollToEditForm();
  };

  return (
    <div className="space-y-6">
      {(user.role === 'ANALYST' || user.role === 'ADMIN') && (
        <Button
          onClick={() => setShowAddRecord(prev => !prev)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showAddRecord ? 'Cancel' : 'Add Record'}
        </Button>
      )}

      <FilterBar
        filterType={filterType}
        setFilterType={setFilterType}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        onApplyFilters={() => {}}
        onClearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
        recordsCount={filteredRecords.length}
        totalRecords={records.length}
      />

      {showAddRecord && (user.role === 'ANALYST' || user.role === 'ADMIN') && (
        <div id="edit-record-form">
          <AddRecordForm
            editingId={editingId}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleAddRecord}
            onCancel={resetForm}
            loading={loading}
            isAdmin={user.role === 'ADMIN'}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Financial Records</CardTitle>
          <CardDescription>
            {filteredRecords.length} total records
            {filteredRecords.length !== records.length &&
              ` (filtered from ${records.length})`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600">
                {records.length === 0
                  ? 'No records found. Click "Add Record" to get started.'
                  : 'No records match your filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-left py-2 px-4">Category</th>
                    <th className="text-right py-2 px-4">Amount</th>
                    <th className="text-left py-2 px-4">Notes</th>
                    {user.role === 'ADMIN' && <th className="px-4">Created By</th>}
                    {(user.role === 'ANALYST' || user.role === 'ADMIN') && (
                      <th className="text-center px-4">Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map(record => (
                    <tr key={record.id} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-3">
                        {new Date(record.date).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          record.type === 'INCOME'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.type}
                        </span>
                      </td>

                      <td className="px-4 py-3">{record.category}</td>

                      <td className="px-4 py-3 text-right font-semibold">
                        <span className={
                          record.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                        }>
                          {record.type === 'INCOME' ? '+' : '-'}$
                          {formatAmount(record.amount).toFixed(2)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {record.notes || record.description || '-'}
                      </td>

                      {user.role === 'ADMIN' && (
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {(record as any).user?.name || 'Unknown'}
                        </td>
                      )}

                      {(user.role === 'ANALYST' || user.role === 'ADMIN') && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEditRecord(record)}
                              className="p-1 hover:bg-blue-100 rounded"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>

                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="p-1 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}