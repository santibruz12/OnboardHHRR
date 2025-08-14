import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SortableTableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

export function SortableTableHeader({ 
  label, 
  sortKey, 
  currentSort, 
  onSort, 
  className = ""
}: SortableTableHeaderProps) {
  const handleSort = () => {
    if (currentSort?.key === sortKey) {
      // Si ya está ordenado por esta columna, cambia la dirección
      const newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
      onSort(sortKey, newDirection);
    } else {
      // Si no está ordenado por esta columna, empieza con ascendente
      onSort(sortKey, 'asc');
    }
  };

  const getSortIcon = () => {
    if (currentSort?.key !== sortKey) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    
    return currentSort.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-primary" />
      : <ChevronDown className="h-4 w-4 text-primary" />;
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSort}
      className={`h-auto p-2 justify-start text-left font-medium hover:bg-accent ${className}`}
    >
      <span className="flex-1">{label}</span>
      {getSortIcon()}
    </Button>
  );
}