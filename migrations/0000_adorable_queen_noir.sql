CREATE TYPE "public"."candidate_status" AS ENUM('en_evaluacion', 'aprobado', 'rechazado', 'contratado');--> statement-breakpoint
CREATE TYPE "public"."probation_status" AS ENUM('activo', 'completado', 'extendido', 'terminado');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('indefinido', 'determinado', 'obra', 'pasantia');--> statement-breakpoint
CREATE TYPE "public"."egreso_motivo" AS ENUM('renuncia_voluntaria', 'despido_causa_justificada', 'despido_sin_causa', 'jubilacion', 'vencimiento_contrato', 'periodo_prueba_no_superado', 'reestructuracion', 'abandono_trabajo', 'incapacidad_permanente', 'fallecimiento');--> statement-breakpoint
CREATE TYPE "public"."egreso_status" AS ENUM('solicitado', 'en_revision', 'aprobado', 'rechazado', 'procesado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."employee_status" AS ENUM('activo', 'inactivo', 'periodo_prueba');--> statement-breakpoint
CREATE TYPE "public"."job_application_status" AS ENUM('aplicado', 'en_revision', 'preseleccionado', 'entrevista_programada', 'entrevista_realizada', 'finalista', 'seleccionado', 'rechazado', 'retirado');--> statement-breakpoint
CREATE TYPE "public"."job_offer_priority" AS ENUM('baja', 'media', 'alta', 'urgente');--> statement-breakpoint
CREATE TYPE "public"."job_offer_status" AS ENUM('borrador', 'publicada', 'pausada', 'cerrada', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'gerente_rrhh', 'admin_rrhh', 'supervisor', 'empleado_captacion', 'empleado');--> statement-breakpoint
CREATE TABLE "audit_logs" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" varchar NOT NULL,
        "action" varchar(50) NOT NULL,
        "table_name" varchar(50) NOT NULL,
        "record_id" varchar NOT NULL,
        "old_values" text,
        "new_values" text,
        "ip_address" varchar(45),
        "user_agent" text,
        "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidates" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "cedula" varchar(12) NOT NULL,
        "full_name" varchar(200) NOT NULL,
        "email" varchar(150) NOT NULL,
        "phone" varchar(20),
        "birth_date" date,
        "cargo_id" varchar NOT NULL,
        "cv_url" text,
        "notes" text,
        "status" "candidate_status" DEFAULT 'en_evaluacion' NOT NULL,
        "submitted_by" varchar NOT NULL,
        "evaluated_by" varchar,
        "evaluation_notes" text,
        "evaluation_date" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "candidates_cedula_unique" UNIQUE("cedula")
);
--> statement-breakpoint
CREATE TABLE "cargos" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" varchar(100) NOT NULL,
        "departamento_id" varchar NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contracts" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "employee_id" varchar NOT NULL,
        "type" "contract_type" NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departamentos" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" varchar(100) NOT NULL,
        "gerencia_id" varchar NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "egresos" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "employee_id" varchar NOT NULL,
        "motivo" "egreso_motivo" NOT NULL,
        "fecha_solicitud" date NOT NULL,
        "fecha_efectiva" date,
        "solicitado_por" varchar NOT NULL,
        "aprobado_por" varchar,
        "observaciones" text,
        "documentos_entregados" text,
        "activos_entregados" text,
        "liquidacion_calculada" text,
        "status" "egreso_status" DEFAULT 'solicitado' NOT NULL,
        "motivo_rechazo" text,
        "fecha_aprobacion" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" varchar NOT NULL,
        "full_name" varchar(200) NOT NULL,
        "email" varchar(150) NOT NULL,
        "phone" varchar(20),
        "birth_date" date,
        "cargo_id" varchar NOT NULL,
        "supervisor_id" varchar,
        "start_date" date NOT NULL,
        "status" "employee_status" DEFAULT 'activo' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "employees_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "gerencias" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" varchar(100) NOT NULL,
        "description" text,
        "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "job_offer_id" varchar NOT NULL,
        "candidate_id" varchar NOT NULL,
        "fecha_aplicacion" timestamp DEFAULT now() NOT NULL,
        "carta_presentacion" text,
        "status" "job_application_status" DEFAULT 'aplicado' NOT NULL,
        "puntuacion" integer,
        "notas_entrevista" text,
        "fecha_entrevista" timestamp,
        "entrevistado_por" varchar,
        "motivo_rechazo" text,
        "evaluado_por" varchar,
        "fecha_evaluacion" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_offers" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "titulo" varchar(200) NOT NULL,
        "descripcion" text NOT NULL,
        "cargo_id" varchar NOT NULL,
        "experiencia_requerida" text,
        "educacion_requerida" text,
        "habilidades_requeridas" text,
        "salario_minimo" integer,
        "salario_maximo" integer,
        "tipo_contrato" "contract_type" NOT NULL,
        "modalidad_trabajo" varchar(50),
        "ubicacion" varchar(100),
        "fecha_inicio_publicacion" date,
        "fecha_cierre_publicacion" date,
        "vacantes_disponibles" integer DEFAULT 1 NOT NULL,
        "status" "job_offer_status" DEFAULT 'borrador' NOT NULL,
        "prioridad" "job_offer_priority" DEFAULT 'media' NOT NULL,
        "creado_por" varchar NOT NULL,
        "supervisor_asignado" varchar,
        "notas" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "probation_periods" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "employee_id" varchar NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "status" "probation_status" DEFAULT 'activo' NOT NULL,
        "evaluation_notes" text,
        "final_evaluation" text,
        "evaluated_by" varchar,
        "evaluation_date" date,
        "extension_reason" text,
        "extension_date" date,
        "original_end_date" date,
        "supervisor_recommendation" text,
        "hr_notes" text,
        "approved" boolean,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "cedula" varchar(12) NOT NULL,
        "password" text NOT NULL,
        "role" "role" DEFAULT 'empleado' NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "users_cedula_unique" UNIQUE("cedula")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_cargo_id_cargos_id_fk" FOREIGN KEY ("cargo_id") REFERENCES "public"."cargos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_evaluated_by_users_id_fk" FOREIGN KEY ("evaluated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cargos" ADD CONSTRAINT "cargos_departamento_id_departamentos_id_fk" FOREIGN KEY ("departamento_id") REFERENCES "public"."departamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departamentos" ADD CONSTRAINT "departamentos_gerencia_id_gerencias_id_fk" FOREIGN KEY ("gerencia_id") REFERENCES "public"."gerencias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "egresos" ADD CONSTRAINT "egresos_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "egresos" ADD CONSTRAINT "egresos_solicitado_por_users_id_fk" FOREIGN KEY ("solicitado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "egresos" ADD CONSTRAINT "egresos_aprobado_por_users_id_fk" FOREIGN KEY ("aprobado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_cargo_id_cargos_id_fk" FOREIGN KEY ("cargo_id") REFERENCES "public"."cargos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_supervisor_id_employees_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_offer_id_job_offers_id_fk" FOREIGN KEY ("job_offer_id") REFERENCES "public"."job_offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_entrevistado_por_users_id_fk" FOREIGN KEY ("entrevistado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_evaluado_por_users_id_fk" FOREIGN KEY ("evaluado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_cargo_id_cargos_id_fk" FOREIGN KEY ("cargo_id") REFERENCES "public"."cargos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_creado_por_users_id_fk" FOREIGN KEY ("creado_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_supervisor_asignado_users_id_fk" FOREIGN KEY ("supervisor_asignado") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "probation_periods" ADD CONSTRAINT "probation_periods_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "probation_periods" ADD CONSTRAINT "probation_periods_evaluated_by_users_id_fk" FOREIGN KEY ("evaluated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;