import { getCurrentDateForInput } from '@/lib/date-utils';

export function CurrentDate() {
  return getCurrentDateForInput();
}

// Componente para mostrar fecha actual formateada
export function FormattedCurrentDate() {
  const today = new Date();
  return today.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}