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

export const calculateSeniority = (startDate: string): string => {
  const start = new Date(startDate);
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  // Ajustar días negativos
  if (days < 0) {
    months--;
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonth.getDate();
  }

  // Ajustar meses negativos
  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} año${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} mes${months !== 1 ? 'es' : ''}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} día${days !== 1 ? 's' : ''}`);

  return parts.join(', ');
};

/**
 * Calcula la fecha de fin de contrato agregando 90 días a la fecha de inicio
 */
export function calculateContractEndDate(startDate: string): string {
  if (!startDate) return '';
  
  try {
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + 90); // Agregar 90 días
    
    return format(endDate, 'yyyy-MM-dd');
  } catch (error) {
    console.warn('Error al calcular fecha de fin de contrato:', error);
    return '';
  }
}

/**
 * Valida que la fecha de fin no sea anterior a la fecha de inicio
 */
export function validateContractDates(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return true;
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end >= start;
  } catch (error) {
    console.warn('Error al validar fechas de contrato:', error);
    return false;
  }
}