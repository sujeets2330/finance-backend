'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilterX } from 'lucide-react';

interface FilterBarProps {
  filterType: string;
  setFilterType: (value: string) => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  filterDate: string;
  setFilterDate: (value: string) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  recordsCount: number;
  totalRecords: number;
}

export default function FilterBar({
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  filterDate,
  setFilterDate,
  onApplyFilters,
  onClearFilters,
  activeFilterCount,
  recordsCount,
  totalRecords,
}: FilterBarProps) {
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    setTimeout(() => onApplyFilters(), 50);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterCategory(e.target.value);
    setTimeout(() => onApplyFilters(), 50);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterDate(e.target.value);
    setTimeout(() => onApplyFilters(), 50);
  };

  return (
    <div className="flex flex-wrap gap-3 items-center p-4 bg-white rounded-xl border shadow-sm">
      <FilterX className="w-4 h-4 text-slate-400" />
      
      <select
        value={filterType}
        onChange={handleTypeChange}
        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">All Types</option>
        <option value="INCOME">Income</option>
        <option value="EXPENSE">Expense</option>
      </select>
      
      <select
        value={filterCategory}
        onChange={handleCategoryChange}
        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">All Categories</option>
        <option value="Food">Food</option>
        <option value="Transport">Transport</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Utilities">Utilities</option>
        <option value="Healthcare">Healthcare</option>
        <option value="Salary">Salary</option>
        <option value="Bonus">Bonus</option>
        <option value="Other">Other</option>
      </select>
      
      <Input
        type="date"
        value={filterDate}
        onChange={handleDateChange}
        className="w-auto py-1.5"
      />
      
      {activeFilterCount > 0 && (
        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
          {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
        </span>
      )}
      
      {(filterType || filterCategory || filterDate) ? (
        <Button onClick={onClearFilters} variant="ghost" size="sm" className="text-slate-500 hover:text-red-500">
          Clear All
        </Button>
      ) : null}
      
      <span className="text-xs text-slate-400 ml-auto">
        Showing {recordsCount} of {totalRecords} records
      </span>
    </div>
  );
}