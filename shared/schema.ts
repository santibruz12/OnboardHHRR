import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum("role", [
  "admin",
  "gerente_rrhh", 
  "admin_rrhh",
  "supervisor",
  "empleado_captacion",
  "empleado"
]);

export const contractTypeEnum = pgEnum("contract_type", [
  "indefinido",
  "determinado", 
  "obra",
  "pasantia"
]);

export const employeeStatusEnum = pgEnum("employee_status", [
  "activo",
  "inactivo",
  "periodo_prueba"
]);

// Core Tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cedula: varchar("cedula", { length: 12 }).notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("empleado"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const gerencias = pgTable("gerencias", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const departamentos = pgTable("departamentos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  gerenciaId: varchar("gerencia_id").notNull().references(() => gerencias.id),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const cargos = pgTable("cargos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  departamentoId: varchar("departamento_id").notNull().references(() => departamentos.id),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fullName: varchar("full_name", { length: 200 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  birthDate: date("birth_date"),
  cargoId: varchar("cargo_id").notNull().references(() => cargos.id),
  supervisorId: varchar("supervisor_id").references((): any => employees.id),
  startDate: date("start_date").notNull(),
  status: employeeStatusEnum("status").notNull().default("activo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  type: contractTypeEnum("type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

const probationStatusEnum = pgEnum("probation_status", [
  "activo",
  "completado", 
  "extendido",
  "terminado"
]);

export const probationPeriods = pgTable("probation_periods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: probationStatusEnum("status").notNull().default("activo"),
  evaluationNotes: text("evaluation_notes"),
  finalEvaluation: text("final_evaluation"),
  evaluatedBy: varchar("evaluated_by").references(() => users.id),
  evaluationDate: date("evaluation_date"),
  extensionReason: text("extension_reason"),
  extensionDate: date("extension_date"),
  originalEndDate: date("original_end_date"),
  supervisorRecommendation: text("supervisor_recommendation"),
  hrNotes: text("hr_notes"),
  approved: boolean("approved"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const candidateStatusEnum = pgEnum("candidate_status", [
  "en_evaluacion",
  "aprobado", 
  "rechazado",
  "contratado"
]);

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
export type LoginData = z.infer<typeof loginSchema>;

export type User = typeof users.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type Contract = typeof contracts.$inferSelect;
export type Gerencia = typeof gerencias.$inferSelect;
export type Departamento = typeof departamentos.$inferSelect;
export type Cargo = typeof cargos.$inferSelect;
export type ProbationPeriod = typeof probationPeriods.$inferSelect;
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
