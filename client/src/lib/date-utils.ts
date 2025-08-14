import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha para mostrar en la interfaz
 * Evita el problema de mostrar fechas con un día anterior
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'dd/MM/yyyy', { locale: es });
  } catch (error) {
    console.warn('Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
}

/**
 * Formatea una fecha para mostrar con texto descriptivo
 */
export function formatDateLong(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es });
  } catch (error) {
    console.warn('Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
}

/**
 * Convierte una fecha para envío al servidor en formato ISO
 */
export function formatDateForInput(dateString: string | Date | null | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.warn('Error al formatear fecha para input:', error);
    return '';
  }
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD para inputs
 */
export function getCurrentDateForInput(): string {
  return format(new Date(), 'yyyy-MM-dd');
}