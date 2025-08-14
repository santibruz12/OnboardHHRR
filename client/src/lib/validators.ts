import { z } from "zod";

export const cedulaRegex = /^[VE]-\d{7,8}$/;

export function validateCedula(cedula: string): boolean {
  return cedulaRegex.test(cedula);
}

export const employeeFormSchema = z.object({
  // Personal Information
  cedula: z.string().regex(cedulaRegex, "Formato de cédula inválido (V-12345678 o E-12345678)"),
  fullName: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  
  // Organizational Structure
  gerenciaId: z.string().min(1, "Seleccionar gerencia"),
  departamentoId: z.string().min(1, "Seleccionar departamento"),
  cargoId: z.string().min(1, "Seleccionar cargo"),
  supervisorId: z.string().optional(),
  startDate: z.string().min(1, "Fecha de ingreso requerida"),
  status: z.enum(["activo", "inactivo", "periodo_prueba"]).optional(),
  
  // Contract Information
  contractType: z.enum(["indefinido", "determinado", "obra", "pasantia"]),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  generateProbation: z.boolean().default(false),
  
  // System fields
  role: z.enum(["admin", "gerente_rrhh", "admin_rrhh", "supervisor", "empleado_captacion", "empleado"]).default("empleado")
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

export const candidateFormSchema = z.object({
  // Personal Information
  cedula: z.string().regex(cedulaRegex, "Formato de cédula inválido (V-12345678 o E-12345678)"),
  fullName: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Teléfono es requerido"),
  birthDate: z.string().optional(),
  
  // Position Information
  gerenciaId: z.string().min(1, "Seleccionar gerencia"),
  departamentoId: z.string().min(1, "Seleccionar departamento"),
  cargoId: z.string().min(1, "Seleccionar cargo"),
  
  // CV and Additional Information
  cvUrl: z.string().optional(),
  notes: z.string().optional(),
  
  // Evaluation Information (for editing)
  status: z.enum(["en_evaluacion", "aprobado", "rechazado", "contratado"]).optional(),
  evaluationNotes: z.string().optional(),
});

export type CandidateFormData = z.infer<typeof candidateFormSchema>;
