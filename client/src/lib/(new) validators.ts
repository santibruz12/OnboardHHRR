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
}).refine((data) => {
  // Solo validar si contractEndDate tiene valor y hay una fecha de referencia
  if (!data.contractEndDate) {
    return true; // Permitir campo vacío durante edición
  }
  
  // No validar si no hay fecha de referencia disponible
  if (!data.contractStartDate && !data.startDate) {
    return true;
  }

  const endDate = new Date(data.contractEndDate);
  
  // Priorizar contractStartDate sobre startDate como referencia
  const referenceDate = data.contractStartDate 
    ? new Date(data.contractStartDate)
    : new Date(data.startDate);
  
  return endDate >= referenceDate;
}, {
  message: "La fecha de fin del contrato no puede ser anterior a la fecha de inicio",
  path: ["contractEndDate"]
})
.refine((data) => {
  // Validar que contractStartDate no sea anterior a startDate (fecha de ingreso)
  if (!data.contractStartDate || !data.startDate) {
    return true; // Permitir campos vacíos durante edición
  }
  
  const ingressDate = new Date(data.startDate);
  const contractStart = new Date(data.contractStartDate);
  
  return contractStart >= ingressDate;
}, {
  message: "La fecha de inicio del contrato no puede ser anterior a la fecha de ingreso",
  path: ["contractStartDate"]
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