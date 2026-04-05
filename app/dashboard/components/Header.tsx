'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">FinanceHub Dashboard</h1>
          <p className="text-sm text-slate-600">Welcome, {user.name} ({user.role})</p>
        </div>
        <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}