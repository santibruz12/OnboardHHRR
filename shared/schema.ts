import { pgTable, varchar, text, integer, boolean, timestamp, date, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const rolUsuarioEnum = pgEnum("rol_usuario", ["admin", "rrhh", "supervisor", "empleado"]);
export const tipoContratoEnum = pgEnum("tipo_contrato", ["indefinido", "determinado", "temporal", "proyecto"]);
export const estadoContratoEnum = pgEnum("estado_contrato", ["activo", "inactivo", "suspendido", "terminado"]);
export const estadoCandidatoEnum = pgEnum("estado_candidato", ["en_evaluacion", "aprobado", "rechazado", "contratado"]);
export const estadoPruebaEnum = pgEnum("estado_prueba", ["activo", "aprobado", "extension_requerida", "terminado"]);
export const egresoMotivoEnum = pgEnum("egreso_motivo", ["renuncia", "despido", "mutual_acuerdo", "vencimiento_contrato", "jubilacion", "otro"]);
export const egresoStatusEnum = pgEnum("egreso_status", ["solicitado", "en_proceso", "aprobado", "rechazado", "completado"]);
export const estadoOfertaTrabajoEnum = pgEnum("estado_oferta_trabajo", ["borrador", "publicada", "pausada", "cerrada", "cancelada"]);
export const prioridadOfertaTrabajoEnum = pgEnum("prioridad_oferta_trabajo", ["baja", "media", "alta", "urgente"]);
export const estadoPostulacionEnum = pgEnum("estado_postulacion", ["postulado", "en_revision", "entrevistado", "seleccionado", "rechazado"]);

// Users table
export const usuarios = pgTable("usuarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cedula: varchar("cedula", { length: 12 }).notNull().unique(),
  contraseña: varchar("contraseña", { length: 255 }).notNull(),
  rol: rolUsuarioEnum("rol").notNull().default("empleado"),
  estaActivo: boolean("esta_activo").notNull().default(true),
  ultimoLogin: timestamp("ultimo_login"),
  fechaCreacion: timestamp("fecha_creacion").notNull().defaultNow(),
  fechaActualizacion: timestamp("fecha_actualizacion").notNull().defaultNow()
});

// Gerencias (Management Areas)
export const gerencias = pgTable("gerencias", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  descripcion: text("descripcion"),
  gerenteId: varchar("gerente_id").references(() => usuarios.id),
  estaActivo: boolean("esta_activo").notNull().default(true),
  fechaCreacion: timestamp("fecha_creacion").notNull().defaultNow()
});

// Departamentos
export const departamentos = pgTable("departamentos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  descripcion: text("descripcion"),
  gerenciaId: varchar("gerencia_id").notNull().references(() => gerencias.id),
  jefeId: varchar("jefe_id").references(() => usuarios.id),
  estaActivo: boolean("esta_activo").notNull().default(true),
  fechaCreacion: timestamp("fecha_creacion").notNull().defaultNow()
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
  estaActivo: boolean("esta_activo").notNull().default(true),
  fechaCreacion: timestamp("fecha_creacion").notNull().defaultNow()
});

// Empleados
export const empleados = pgTable("empleados", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  usuarioId: varchar("usuario_id").notNull().references(() => usuarios.id),
  nombres: varchar("nombres", { length: 50 }).notNull(),
  apellidos: varchar("apellidos", { length: 50 }).notNull(),
  email: varchar("email", { length: 150 }).notNull(),
  telefono: varchar("telefono", { length: 20 }),
  fechaNacimiento: date("fecha_nacimiento"),
  fechaIngreso: date("fecha_ingreso").notNull(),
  cargoId: varchar("cargo_id").notNull().references(() => cargos.id),
  supervisorId: varchar("supervisor_id"),
  salario: integer("salario"),
  estaActivo: boolean("esta_activo").notNull().default(true),
  fechaCreacion: timestamp("fecha_creacion").notNull().defaultNow(),
  fechaActualizacion: timestamp("fecha_actualizacion").notNull().defaultNow()
});

// Contratos
export const contratos = pgTable("contratos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  empleadoId: varchar("empleado_id").notNull().references(() => empleados.id),
  tipoContrato: tipoContratoEnum("tipo_contrato").notNull(),
  fechaInicio: date("fecha_inicio").notNull(),
  fechaFin: date("fecha_fin"),
  salario: integer("salario").notNull(),
  clausulasEspeciales: text("clausulas_especiales"),
  estado: estadoContratoEnum("estado").notNull().default("activo"),
  creadoPor: varchar("creado_por").notNull().references(() => usuarios.id),
  fechaCreacion: timestamp("fecha_creacion").notNull().defaultNow()
});

// Períodos de Prueba
export const periodosPrueba = pgTable("periodos_prueba", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  empleadoId: varchar("empleado_id").notNull().references(() => empleados.id),
  fechaInicio: date("fecha_inicio").notNull(),
  fechaFin: date("fecha_fin").notNull(),
  fechaEvaluacion: date("fecha_evaluacion"),
  evaluadoPor: varchar("evaluado_por").references(() => usuarios.id),
  estado: estadoPruebaEnum("estado").notNull().default("activo"),
  calificacionRendimiento: integer("calificacion_rendimiento"), // 1-5 scale
  recomendacionSupervisor: text("recomendacion_supervisor"),
  notasRRHH: text("notas_rrhh"),
  aprobado: boolean("aprobado"),
  fechaCreacion: timestamp("fecha_creacion").notNull().defaultNow(),
  fechaActualizacion: timestamp("fecha_actualizacion").notNull().defaultNow()
});

export const candidatos = pgTable("candidatos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cedula: varchar("cedula", { length: 12 }).notNull().unique(),
  nombreCompleto: varchar("nombre_completo", { length: 200 }).notNull(),
  email: varchar("email", { length: 150 }).notNull(),
  telefono: varchar("telefono", { length: 20 }),
  fechaNacimiento: date("fecha_nacimiento"),
  cargoId: varchar("cargo_id").notNull().references(() => cargos.id),
  urlCV: text("url_cv"),
  notas: text("notas"),
  estado: estadoCandidatoEnum("estado").notNull().default("en_evaluacion"),
  presentadoPor: varchar("presentado_por").notNull().references(() => usuarios.id),
  evaluadoPor: varchar("evaluado_por").references(() => usuarios.id),
  notasEvaluacion: text("notas_evaluacion"),
  fechaEvaluacion: timestamp("fecha_evaluacion"),
  fechaCreacion: timestamp("fecha_creacion").notNull().defaultNow(),
  fechaActualizacion: timestamp("fecha_actualizacion").notNull().defaultNow()
});

// Egresos (Employee Departures)
export const egresos = pgTable("egresos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  empleadoId: varchar("empleado_id").notNull().references(() => empleados.id),
  motivo: egresoMotivoEnum("motivo").notNull(),
  fechaSolicitud: date("fecha_solicitud").notNull(),
  fechaEfectiva: date("fecha_efectiva"),
  solicitadoPor: varchar("solicitado_por").notNull().references(() => usuarios.id),
  aprobadoPor: varchar("aprobado_por").references(() => usuarios.id),
  observaciones: text("observaciones"),
  documentosEntregados: text("documentos_entregados"),
  activosEntregados: text("activos_entregados"),
  liquidacionCalculada: text("liquidacion_calculada"),
  estado: egresoStatusEnum("estado").notNull().default("solicitado"),
  motivoRechazo: text("motivo_rechazo"),
  fechaAprobacion: timestamp("fecha_aprobacion"),
  fechaCreacion: timestamp("fecha_creacion").notNull().defaultNow(),
  fechaActualizacion: timestamp("fecha_actualizacion").notNull().defaultNow()
});

// Ofertas de Trabajo
export const ofertasTrabajo = pgTable("ofertas_trabajo", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titulo: varchar("titulo", { length: 200 }).notNull(),
  descripcion: text("descripcion").notNull(),
  cargoId: varchar("cargo_id").notNull().references(() => cargos.id),
  experienciaRequerida: text("experiencia_requerida"),
  educacionRequerida: text("educacion_requerida"),
  habilidadesRequeridas: text("habilidades_requeridas"),
  salarioMinimo: integer("salario_minimo"),
  salarioMaximo: integer("salario_maximo"),
  tipoContrato: tipoContratoEnum("tipo_contrato").notNull(),
  modalidadTrabajo: varchar("modalidad_trabajo", { length: 50 }), // presencial, remoto, hibrido
  ubicacion: varchar("ubicacion", { length: 100 }),
  fechaInicioPublicacion: date("fecha_inicio_publicacion"),
  fechaCierrePublicacion: date("fecha_cierre_publicacion"),
  vacantesDisponibles: integer("vacantes_disponibles").notNull().default(1),
  estado: estadoOfertaTrabajoEnum("estado").notNull().default("borrador"),
  prioridad: prioridadOfertaTrabajoEnum("prioridad").notNull().default("media"),
  creadoPor: varchar("creado_por").notNull().references(() => usuarios.id),
  supervisorAsignado: varchar("supervisor_asignado").references(() => usuarios.id),
  notas: text("notas"),
  fechaCreacion: timestamp("fecha_creacion").notNull().defaultNow(),
  fechaActualizacion: timestamp("fecha_actualizacion").notNull().defaultNow()
});

// Postulaciones a Ofertas
export const postulaciones = pgTable("postulaciones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ofertaTrabajoId: varchar("oferta_trabajo_id").notNull().references(() => ofertasTrabajo.id),
  candidatoId: varchar("candidato_id").notNull().references(() => candidatos.id),
  fechaAplicacion: timestamp("fecha_aplicacion").notNull().defaultNow(),
  cartaPresentacion: text("carta_presentacion"),
  estado: estadoPostulacionEnum("estado").notNull().default("postulado"),
  puntuacion: integer("puntuacion"), // 1-100
  notasEntrevista: text("notas_entrevista"),
  fechaEntrevista: timestamp("fecha_entrevista"),
  entrevistadoPor: varchar("entrevistado_por").references(() => usuarios.id),
  motivoRechazo: text("motivo_rechazo"),
  evaluadoPor: varchar("evaluado_por").references(() => usuarios.id),
  fechaEvaluacion: timestamp("fecha_evaluacion"),
  fechaCreacion: timestamp("fecha_creacion").notNull().defaultNow(),
  fechaActualizacion: timestamp("fecha_actualizacion").notNull().defaultNow()
});

export const registrosAuditoria = pgTable("registros_auditoria", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  usuarioId: varchar("usuario_id").notNull().references(() => usuarios.id),
  accion: varchar("accion", { length: 50 }).notNull(),
  nombreTabla: varchar("nombre_tabla", { length: 50 }).notNull(),
  registroId: varchar("registro_id").notNull(),
  valoresAnteriores: text("valores_anteriores"),
  valoresNuevos: text("valores_nuevos"),
  direccionIP: varchar("direccion_ip", { length: 45 }),
  agenteUsuario: text("agente_usuario"),
  fechaCreacion: timestamp("fecha_creacion").notNull().defaultNow()
});

// Insert Schemas
export const insertUsuarioSchema = createInsertSchema(usuarios).omit({
  id: true,
  fechaCreacion: true,
  fechaActualizacion: true
});

export const insertEmpleadoSchema = createInsertSchema(empleados).omit({
  id: true,
  fechaCreacion: true,
  fechaActualizacion: true
});

export const insertContratoSchema = createInsertSchema(contratos).omit({
  id: true,
  fechaCreacion: true
});

export const insertGerenciaSchema = createInsertSchema(gerencias).omit({
  id: true,
  fechaCreacion: true
});

export const insertDepartamentoSchema = createInsertSchema(departamentos).omit({
  id: true,
  fechaCreacion: true
});

export const insertCargoSchema = createInsertSchema(cargos).omit({
  id: true,
  fechaCreacion: true
});

export const insertCandidatoSchema = createInsertSchema(candidatos).omit({
  id: true,
  fechaCreacion: true,
  fechaActualizacion: true
});

export const insertPeriodoPruebaSchema = createInsertSchema(periodosPrueba).omit({
  id: true,
  fechaCreacion: true,
  fechaActualizacion: true
});

export const insertEgresoSchema = createInsertSchema(egresos).omit({
  id: true,
  fechaCreacion: true,
  fechaActualizacion: true
});

export const insertOfertaTrabajoSchema = createInsertSchema(ofertasTrabajo).omit({
  id: true,
  fechaCreacion: true,
  fechaActualizacion: true
});

export const insertPostulacionSchema = createInsertSchema(postulaciones).omit({
  id: true,
  fechaCreacion: true,
  fechaActualizacion: true
});

// Login Schema
export const loginSchema = z.object({
  cedula: z.string().regex(/^[VE]-\d{7,8}$/, "Formato de cédula inválido (V-12345678 o E-12345678)"),
  password: z.string().min(1, "Contraseña requerida")
});

// Types
export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;
export type InsertEmpleado = z.infer<typeof insertEmpleadoSchema>;
export type InsertContrato = z.infer<typeof insertContratoSchema>;
export type InsertGerencia = z.infer<typeof insertGerenciaSchema>;
export type InsertDepartamento = z.infer<typeof insertDepartamentoSchema>;
export type InsertCargo = z.infer<typeof insertCargoSchema>;
export type InsertPeriodoPrueba = z.infer<typeof insertPeriodoPruebaSchema>;
export type InsertEgreso = z.infer<typeof insertEgresoSchema>;
export type InsertOfertaTrabajo = z.infer<typeof insertOfertaTrabajoSchema>;
export type InsertPostulacion = z.infer<typeof insertPostulacionSchema>;
export type DatosLogin = z.infer<typeof loginSchema>;

export type Usuario = typeof usuarios.$inferSelect;
export type Empleado = typeof empleados.$inferSelect;
export type Contrato = typeof contratos.$inferSelect;
export type Gerencia = typeof gerencias.$inferSelect;
export type Departamento = typeof departamentos.$inferSelect;
export type Cargo = typeof cargos.$inferSelect;
export type PeriodoPrueba = typeof periodosPrueba.$inferSelect;
export type Egreso = typeof egresos.$inferSelect;
export type OfertaTrabajo = typeof ofertasTrabajo.$inferSelect;
export type Postulacion = typeof postulaciones.$inferSelect;
export type RegistroAuditoria = typeof registrosAuditoria.$inferSelect;
export type Candidato = typeof candidatos.$inferSelect;

// Extended types for relations
export type EmpleadoConRelaciones = Empleado & {
  usuario: Usuario;
  cargo: Cargo & {
    departamento: Departamento & {
      gerencia: Gerencia;
    };
  };
  supervisor?: Empleado;
  contrato?: Contrato;
};

export type CandidatoConRelaciones = Candidato & {
  cargo: Cargo & {
    departamento: Departamento & {
      gerencia: Gerencia;
    };
  };
  presentadoPorUsuario: Usuario;
  evaluadoPorUsuario?: Usuario;
};

export type PeriodoPruebaConRelaciones = PeriodoPrueba & {
  empleado: Empleado & {
    usuario: Usuario;
    cargo: Cargo & {
      departamento: Departamento & {
        gerencia: Gerencia;
      };
    };
  };
  evaluadoPorUsuario?: Usuario;
};

export type EgresoConRelaciones = Egreso & {
  empleado: Empleado & {
    usuario: Usuario;
    cargo: Cargo & {
      departamento: Departamento & {
        gerencia: Gerencia;
      };
    };
  };
  solicitadoPorUsuario: Usuario;
  aprobadoPorUsuario?: Usuario;
};

export type OfertaTrabajoConRelaciones = OfertaTrabajo & {
  cargo: Cargo & {
    departamento: Departamento & {
      gerencia: Gerencia;
    };
  };
  creadoPorUsuario: Usuario;
  supervisorAsignadoUsuario?: Usuario;
  conteoPostulaciones?: number;
};

export type PostulacionConRelaciones = Postulacion & {
  ofertaTrabajo: OfertaTrabajo & {
    cargo: Cargo & {
      departamento: Departamento & {
        gerencia: Gerencia;
      };
    };
  };
  candidato: Candidato;
  entrevistadoPorUsuario?: Usuario;
  evaluadoPorUsuario?: Usuario;
};

export type EstadisticasTablero = {
  totalEmpleados: number;
  empleadosEnPrueba: number;
  candidatosNuevos: number;
  contratosVenciendo: number;
  totalContratos: number;
  contratosActivos: number;
  contratosIndefinidos: number;
  totalCandidatos: number;
  candidatosEnEvaluacion: number;
  candidatosAprobados: number;
  periodosPruebaActivos: number;
  periodosPruebaVenciendo: number;
};