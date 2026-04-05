'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface AddRecordFormProps {
  editingId: string | null;
  formData: {
    amount: string;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    date: string;
    notes: string;
  };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  isAdmin: boolean;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
}

export default function AddRecordForm({
  editingId,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  loading,
  isAdmin,
  selectedRole,
  setSelectedRole,
}: AddRecordFormProps) {
  return (
    <Card className="bg-slate-50">
      <CardHeader>
        <CardTitle>{editingId ? 'Edit Record' : 'Add New Record'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount ($)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'INCOME' | 'EXPENSE' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                disabled={loading}
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                disabled={loading}
              >
                <option>Food</option>
                <option>Transport</option>
                <option>Entertainment</option>
                <option>Utilities</option>
                <option>Healthcare</option>
                <option>Salary</option>
                <option>Bonus</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          {isAdmin && !editingId && (
            <div>
              <label className="block text-sm font-medium mb-1">Assign to Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                disabled={loading}
              >
                <option value="">-- Create for Myself (ADMIN) --</option>
                <option value="ANALYST">All Analysts</option>
                <option value="VIEWER">All Viewers</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                All users with selected role will see this record in their dashboard
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Input
              placeholder="Optional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : editingId ? 'Update Record' : 'Add Record'}
            </Button>
            <Button type="button" onClick={onCancel} variant="outline" disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}