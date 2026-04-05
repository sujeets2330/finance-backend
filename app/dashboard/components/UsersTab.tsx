 'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '../types';

interface UsersTabProps {
  users: User[];
  currentUser: User;
  onRefresh: () => Promise<void>;
}

export default function UsersTab({ users, currentUser, onRefresh }: UsersTabProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'VIEWER' as 'VIEWER' | 'ANALYST' | 'ADMIN',
    password: '',
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userFormData),
      });

      const contentType = response.headers.get('content-type');
      let data = null;
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text) {
          data = JSON.parse(text);
        }
      }

      // Handle 409 Conflict (Duplicate Email)
      if (response.status === 409) {
        setError('User with this email already exists. Please use a different email address.');
        toast.error('Email already exists!');
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to create user');
      }

      toast.success('User created successfully!');
      setUserFormData({ name: '', email: '', role: 'VIEWER', password: '' });
      setError('');
      await onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete user');
      }

      toast.success(`User "${userName}" deleted successfully!`);
      await onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update user status');

      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}!`);
      await onRefresh();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  // Check if email already exists in the users list
  const isEmailDuplicate = (email: string) => {
    return users.some(u => u.email.toLowerCase() === email.toLowerCase());
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
          <CardDescription>Add a new user to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Full Name"
                value={userFormData.name}
                onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                required
                disabled={loading}
              />
              <Input
                type="email"
                placeholder="Email"
                value={userFormData.email}
                onChange={(e) => {
                  setUserFormData({ ...userFormData, email: e.target.value });
                  setError('');
                }}
                required
                disabled={loading}
                className={isEmailDuplicate(userFormData.email) && userFormData.email ? 'border-red-500 focus:ring-red-500' : ''}
              />
            </div>
            
            {/* Show duplicate email warning in real-time */}
            {isEmailDuplicate(userFormData.email) && userFormData.email && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-md">
                <AlertCircle className="w-4 h-4" />
                <span>This email is already registered. Please use a different email.</span>
              </div>
            )}
            
            {/* Show error from API response */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-md">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="password"
                placeholder="Password"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                required
                disabled={loading}
              />
              <select
                value={userFormData.role}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as 'VIEWER' | 'ANALYST' | 'ADMIN' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                disabled={loading}
              >
                <option value="VIEWER">Viewer (View Only)</option>
                <option value="ANALYST">Analyst (Can Create Records)</option>
                <option value="ADMIN">Admin (Full Access)</option>
              </select>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading || (isEmailDuplicate(userFormData.email) && !!userFormData.email)} 
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>{users.length} total users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-slate-600 text-center py-8">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Name</th>
                    <th className="text-left py-2 px-4">Email</th>
                    <th className="text-left py-2 px-4">Role</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-center py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{u.name}</td>
                      <td className="py-3 px-4">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'ANALYST' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleUserStatus(u.id, u.isActive !== false)}
                          className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                            u.isActive !== false
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {u.isActive !== false ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                        {u.id === currentUser?.id && (
                          <span className="text-xs text-slate-400">Current</span>
                        )}
                      </td>
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