import { pgTable, varchar, text, integer, boolean, timestamp, date, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "rrhh", "supervisor", "employee"]);
export const contractTypeEnum = pgEnum("contract_type", ["indefinido", "determinado", "temporal", "proyecto"]);
export const contractStatusEnum = pgEnum("contract_status", ["activo", "inactivo", "suspendido", "terminado"]);
export const candidateStatusEnum = pgEnum("candidate_status", ["en_evaluacion", "aprobado", "rechazado", "contratado"]);
export const probationStatusEnum = pgEnum("probation_status", ["activo", "aprobado", "extension_requerida", "terminado"]);
export const egresoMotivoEnum = pgEnum("egreso_motivo", ["renuncia", "despido", "mutual_acuerdo", "vencimiento_contrato", "jubilacion", "otro"]);
export const egresoStatusEnum = pgEnum("egreso_status", ["solicitado", "en_proceso", "aprobado", "rechazado", "completado"]);
export const jobOfferStatusEnum = pgEnum("job_offer_status", ["borrador", "publicada", "pausada", "cerrada", "cancelada"]);
export const jobOfferPriorityEnum = pgEnum("job_offer_priority", ["baja", "media", "alta", "urgente"]);
export const jobApplicationStatusEnum = pgEnum("job_application_status", ["postulado", "en_revision", "entrevistado", "seleccionado", "rechazado"]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cedula: varchar("cedula", { length: 12 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("employee"),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Gerencias (Management Areas)
export const gerencias = pgTable("gerencias", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  descripcion: text("descripcion"),
  gerenteId: varchar("gerente_id").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Departamentos
export const departamentos = pgTable("departamentos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  descripcion: text("descripcion"),
  gerenciaId: varchar("gerencia_id").notNull().references(() => gerencias.id),
  jefeId: varchar("jefe_id").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Cargos (Positions)
export const cargos = pgTable("cargos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  descripcion: text("descripcion"),
  departamentoId: varchar("departamento_id").notNull().references(() => departamentos.id),
  salarioBase: integer("salario_base"),
  nivelJerarquico: integer("nivel_jerarquico").notNull().default(1),
  requiereSupervision: boolean("requiere_supervision").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Employees
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  birthDate: date("birth_date"),
  hireDate: date("hire_date").notNull(),
  cargoId: varchar("cargo_id").notNull().references(() => cargos.id),
  supervisorId: varchar("supervisor_id").references(() => employees.id),
  salario: integer("salario"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Contracts
export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  contratoAnterior: varchar("contrato_anterior").references(() => contracts.id),
  tipoContrato: contractTypeEnum("tipo_contrato").notNull(),
  fechaInicio: date("fecha_inicio").notNull(),
  fechaFin: date("fecha_fin"),
  salario: integer("salario").notNull(),
  clausulasEspeciales: text("clausulas_especiales"),
  motivoRenovacion: text("motivo_renovacion"),
  numeroRenovacion: integer("numero_renovacion").notNull().default(0),
  status: contractStatusEnum("status").notNull().default("activo"),
  creadoPor: varchar("creado_por").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Probation Periods
export const probationPeriods = pgTable("probation_periods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  evaluationDate: date("evaluation_date"),
  evaluatedBy: varchar("evaluated_by").references(() => users.id),
  status: probationStatusEnum("status").notNull().default("activo"),
  performanceRating: integer("performance_rating"), // 1-5 scale
  supervisorRecommendation: text("supervisor_recommendation"),
  hrNotes: text("hr_notes"),
  approved: boolean("approved"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const candidates = pgTable("candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cedula: varchar("cedula", { length: 12 }).notNull().unique(),
  fullName: varchar("full_name", { length: 200 }).notNull(),
  email: varchar("email", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  birthDate: date("birth_date"),
  cargoId: varchar("cargo_id").notNull().references(() => cargos.id),
  cvUrl: text("cv_url"),
  notes: text("notes"),
  status: candidateStatusEnum("status").notNull().default("en_evaluacion"),
  submittedBy: varchar("submitted_by").notNull().references(() => users.id),
  evaluatedBy: varchar("evaluated_by").references(() => users.id),
  evaluationNotes: text("evaluation_notes"),
  evaluationDate: timestamp("evaluation_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Egresos (Employee Departures)
export const egresos = pgTable("egresos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  motivo: egresoMotivoEnum("motivo").notNull(),
  fechaSolicitud: date("fecha_solicitud").notNull(),
  fechaEfectiva: date("fecha_efectiva"),
  solicitadoPor: varchar("solicitado_por").notNull().references(() => users.id),
  aprobadoPor: varchar("aprobado_por").references(() => users.id),
  observaciones: text("observaciones"),
  documentosEntregados: text("documentos_entregados"),
  activosEntregados: text("activos_entregados"),
  liquidacionCalculada: text("liquidacion_calculada"),
  status: egresoStatusEnum("status").notNull().default("solicitado"),
  motivoRechazo: text("motivo_rechazo"),
  fechaAprobacion: timestamp("fecha_aprobacion"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Job Offers (Ofertas de Trabajo)
export const jobOffers = pgTable("job_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titulo: varchar("titulo", { length: 200 }).notNull(),
  descripcion: text("descripcion").notNull(),
  cargoId: varchar("cargo_id").notNull().references(() => cargos.id),
  experienciaRequerida: text("experiencia_requerida"),
  educacionRequerida: text("educacion_requerida"),
  habilidadesRequeridas: text("habilidades_requeridas"),
  salarioMinimo: integer("salario_minimo"),
  salarioMaximo: integer("salario_maximo"),
  tipoContrato: contractTypeEnum("tipo_contrato").notNull(),
  modalidadTrabajo: varchar("modalidad_trabajo", { length: 50 }), // presencial, remoto, hibrido
  ubicacion: varchar("ubicacion", { length: 100 }),
  fechaInicioPublicacion: date("fecha_inicio_publicacion"),
  fechaCierrePublicacion: date("fecha_cierre_publicacion"),
  vacantesDisponibles: integer("vacantes_disponibles").notNull().default(1),
  status: jobOfferStatusEnum("status").notNull().default("borrador"),
  prioridad: jobOfferPriorityEnum("prioridad").notNull().default("media"),
  creadoPor: varchar("creado_por").notNull().references(() => users.id),
  supervisorAsignado: varchar("supervisor_asignado").references(() => users.id),
  notas: text("notas"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Job Applications (Aplicaciones a Ofertas)
export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobOfferId: varchar("job_offer_id").notNull().references(() => jobOffers.id),
  candidateId: varchar("candidate_id").notNull().references(() => candidates.id),
  fechaAplicacion: timestamp("fecha_aplicacion").notNull().defaultNow(),
  cartaPresentacion: text("carta_presentacion"),
  status: jobApplicationStatusEnum("status").notNull().default("postulado"),
  puntuacion: integer("puntuacion"), // 1-100
  notasEntrevista: text("notas_entrevista"),
  fechaEntrevista: timestamp("fecha_entrevista"),
  entrevistadoPor: varchar("entrevistado_por").references(() => users.id),
  motivoRechazo: text("motivo_rechazo"),
  evaluadoPor: varchar("evaluado_por").references(() => users.id),
  fechaEvaluacion: timestamp("fecha_evaluacion"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(),
  tableName: varchar("table_name", { length: 50 }).notNull(),
  recordId: varchar("record_id").notNull(),
  oldValues: text("old_values"),
  newValues: text("new_values"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true
});

export const insertGerenciaSchema = createInsertSchema(gerencias).omit({
  id: true,
  createdAt: true
});

export const insertDepartamentoSchema = createInsertSchema(departamentos).omit({
  id: true,
  createdAt: true
});

export const insertCargoSchema = createInsertSchema(cargos).omit({
  id: true,
  createdAt: true
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertProbationPeriodSchema = createInsertSchema(probationPeriods).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertEgresoSchema = createInsertSchema(egresos).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertJobOfferSchema = createInsertSchema(jobOffers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Login Schema
export const loginSchema = z.object({
  cedula: z.string().regex(/^[VE]-\d{7,8}$/, "Formato de cédula inválido (V-12345678 o E-12345678)"),
  password: z.string().min(1, "Contraseña requerida")
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type InsertGerencia = z.infer<typeof insertGerenciaSchema>;
export type InsertDepartamento = z.infer<typeof insertDepartamentoSchema>;
export type InsertCargo = z.infer<typeof insertCargoSchema>;
export type InsertProbationPeriod = z.infer<typeof insertProbationPeriodSchema>;
export type InsertEgreso = z.infer<typeof insertEgresoSchema>;
export type InsertJobOffer = z.infer<typeof insertJobOfferSchema>;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type LoginData = z.infer<typeof loginSchema>;

export type User = typeof users.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type Contract = typeof contracts.$inferSelect;
export type Gerencia = typeof gerencias.$inferSelect;
export type Departamento = typeof departamentos.$inferSelect;
export type Cargo = typeof cargos.$inferSelect;
export type ProbationPeriod = typeof probationPeriods.$inferSelect;
export type Egreso = typeof egresos.$inferSelect;
export type JobOffer = typeof jobOffers.$inferSelect;
export type JobApplication = typeof jobApplications.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Candidate = typeof candidates.$inferSelect;

// Extended types for relations
export type EmployeeWithRelations = Employee & {
  user: User;
  cargo: Cargo & {
    departamento: Departamento & {
      gerencia: Gerencia;
    };
  };
  supervisor?: Employee;
  contract?: Contract;
};

export type CandidateWithRelations = Candidate & {
  cargo: Cargo & {
    departamento: Departamento & {
      gerencia: Gerencia;
    };
  };
  submittedByUser: User;
  evaluatedByUser?: User;
};

export type ProbationPeriodWithRelations = ProbationPeriod & {
  employee: Employee & {
    user: User;
    cargo: Cargo & {
      departamento: Departamento & {
        gerencia: Gerencia;
      };
    };
  };
  evaluatedByUser?: User;
};

export type EgresoWithRelations = Egreso & {
  employee: Employee & {
    user: User;
    cargo: Cargo & {
      departamento: Departamento & {
        gerencia: Gerencia;
      };
    };
  };
  solicitadoPorUser: User;
  aprobadoPorUser?: User;
};

export type JobOfferWithRelations = JobOffer & {
  cargo: Cargo & {
    departamento: Departamento & {
      gerencia: Gerencia;
    };
  };
  creadoPorUser: User;
  supervisorAsignadoUser?: User;
  applicationsCount?: number;
};

export type JobApplicationWithRelations = JobApplication & {
  jobOffer: JobOffer & {
    cargo: Cargo & {
      departamento: Departamento & {
        gerencia: Gerencia;
      };
    };
  };
  candidate: Candidate;
  entrevistadoPorUser?: User;
  evaluadoPorUser?: User;
};

export type DashboardStats = {
  totalEmployees: number;
  probationEmployees: number;
  newCandidates: number;
  expiringContracts: number;
  totalContracts: number;
  activeContracts: number;
  indefiniteContracts: number;
  totalCandidates: number;
  candidatesInEvaluation: number;
  approvedCandidates: number;
  activeProbationPeriods: number;
  expiringProbationPeriods: number;
};