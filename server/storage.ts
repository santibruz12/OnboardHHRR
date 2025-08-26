import {
  type User,
  type InsertUser,
  type Employee,
  type InsertEmployee,
  type Gerencia,
  type InsertGerencia,
  type Departamento,
  type InsertDepartamento,
  type Cargo,
  type InsertCargo,
  type Contract,
  type InsertContract,
  type Candidate,
  type CandidateWithRelations,
  type ProbationPeriod,
  type ProbationPeriodWithRelations,
  type Egreso,
  type EgresoWithRelations,
  type JobOffer,
  type JobOfferWithRelations,
  type JobApplication,
  type JobApplicationWithRelations,
  type EmployeeWithRelations,
  type DashboardStats,
  type LoginData,
  insertCandidateSchema,
  insertProbationPeriodSchema,
  insertEgresoSchema,
  insertJobOfferSchema,
  insertJobApplicationSchema,
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

export interface IStorage {
  // Auth
  login(
    credentials: LoginData,
  ): Promise<{ user: User; employee?: EmployeeWithRelations } | null>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByCedula(cedula: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Employees
  getEmployees(): Promise<EmployeeWithRelations[]>;
  getEmployee(id: string): Promise<EmployeeWithRelations | undefined>;
  getEmployeeByUserId(
    userId: string,
  ): Promise<EmployeeWithRelations | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(
    id: string,
    employee: Partial<InsertEmployee>,
  ): Promise<Employee | undefined>;

  // Organizational Structure
  getGerencias(): Promise<Gerencia[]>;
  getDepartamentosByGerencia(gerenciaId: string): Promise<Departamento[]>;
  getCargosByDepartamento(departamentoId: string): Promise<Cargo[]>;
  createGerencia(gerencia: InsertGerencia): Promise<Gerencia>;
  createDepartamento(departamento: InsertDepartamento): Promise<Departamento>;
  createCargo(cargo: InsertCargo): Promise<Cargo>;

  // Contracts
  getContracts(): Promise<Contract[]>;
  getContract(id: string): Promise<Contract | undefined>;
  getContractsByEmployee(employeeId: string): Promise<Contract[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(
    id: string,
    contract: Partial<InsertContract>,
  ): Promise<Contract | undefined>;
  deleteContract(id: string): Promise<boolean>;
  getExpiringContracts(): Promise<Contract[]>;

  // Candidates
  getCandidates(): Promise<CandidateWithRelations[]>;
  getCandidate(id: string): Promise<CandidateWithRelations | undefined>;
  createCandidate(
    candidate: Omit<Candidate, "id" | "createdAt" | "updatedAt">,
  ): Promise<Candidate>;
  updateCandidate(
    id: string,
    candidate: Partial<Candidate>,
  ): Promise<Candidate | undefined>;
  deleteCandidate(id: string): Promise<boolean>;

  // Probation Periods
  getProbationPeriods(): Promise<ProbationPeriodWithRelations[]>;
  getProbationPeriod(
    id: string,
  ): Promise<ProbationPeriodWithRelations | undefined>;
  getProbationPeriodsByEmployee(
    employeeId: string,
  ): Promise<ProbationPeriodWithRelations[]>;
  createProbationPeriod(
    probationPeriod: Omit<ProbationPeriod, "id" | "createdAt" | "updatedAt">,
  ): Promise<ProbationPeriod>;
  updateProbationPeriod(
    id: string,
    probationPeriod: Partial<ProbationPeriod>,
  ): Promise<ProbationPeriod | undefined>;
  deleteProbationPeriod(id: string): Promise<boolean>;
  getExpiringProbationPeriods(): Promise<ProbationPeriodWithRelations[]>;

  // Egresos
  getEgresos(): Promise<EgresoWithRelations[]>;
  getEgreso(id: string): Promise<EgresoWithRelations | undefined>;
  getEgresosByEmployee(employeeId: string): Promise<EgresoWithRelations[]>;
  createEgreso(
    egreso: Omit<Egreso, "id" | "createdAt" | "updatedAt">,
  ): Promise<Egreso>;
  updateEgreso(
    id: string,
    egreso: Partial<Egreso>,
  ): Promise<Egreso | undefined>;
  deleteEgreso(id: string): Promise<boolean>;

  // Job Offers
  getJobOffers(): Promise<JobOfferWithRelations[]>;
  getJobOffer(id: string): Promise<JobOfferWithRelations | undefined>;
  createJobOffer(
    jobOffer: Omit<JobOffer, "id" | "createdAt" | "updatedAt">,
  ): Promise<JobOffer>;
  updateJobOffer(
    id: string,
    jobOffer: Partial<JobOffer>,
  ): Promise<JobOffer | undefined>;
  deleteJobOffer(id: string): Promise<boolean>;

  // Job Applications
  getJobApplications(): Promise<JobApplicationWithRelations[]>;
  getJobApplication(
    id: string,
  ): Promise<JobApplicationWithRelations | undefined>;
  getJobApplicationsByOffer(
    jobOfferId: string,
  ): Promise<JobApplicationWithRelations[]>;
  getJobApplicationsByCandidate(
    candidateId: string,
  ): Promise<JobApplicationWithRelations[]>;
  createJobApplication(
    application: Omit<JobApplication, "id" | "createdAt" | "updatedAt">,
  ): Promise<JobApplication>;
  updateJobApplication(
    id: string,
    application: Partial<JobApplication>,
  ): Promise<JobApplication | undefined>;
  deleteJobApplication(id: string): Promise<boolean>;

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
}

export class PostgresStorage implements IStorage {
  private sql;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not found");
    }
    this.sql = neon(process.env.DATABASE_URL);
  }

  async login(
    credentials: LoginData,
  ): Promise<{ user: User; employee?: EmployeeWithRelations } | null> {
    const userResult = await this.sql`
      SELECT * FROM users WHERE cedula = ${credentials.cedula} AND is_active = true
    `;

    if (userResult.length === 0) return null;

    const user = userResult[0] as User;
    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.password,
    );
    if (!isValidPassword) return null;

    const employee = await this.getEmployeeByUserId(user.id);
    return { user, employee };
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.sql`SELECT * FROM users WHERE id = ${id}`;
    return (result[0] as User) || undefined;
  }

  async getUserByCedula(cedula: string): Promise<User | undefined> {
    const result = await this.sql`SELECT * FROM users WHERE cedula = ${cedula}`;
    return (result[0] as User) || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.sql`
      INSERT INTO users (cedula, password, role, is_active)
      VALUES (${user.cedula}, ${user.password}, ${user.role || "empleado"}, ${user.isActive ?? true})
      RETURNING *
    `;
    return result[0] as User;
  }

  async updateUser(
    id: string,
    user: Partial<InsertUser>,
  ): Promise<User | undefined> {
    const setClauses = [];
    const values = [];

    if (user.cedula !== undefined) {
      setClauses.push(`cedula = $${setClauses.length + 1}`);
      values.push(user.cedula);
    }
    if (user.password !== undefined) {
      setClauses.push(`password = $${setClauses.length + 1}`);
      values.push(user.password);
    }
    if (user.role !== undefined) {
      setClauses.push(`role = $${setClauses.length + 1}`);
      values.push(user.role);
    }
    if (user.isActive !== undefined) {
      setClauses.push(`is_active = $${setClauses.length + 1}`);
      values.push(user.isActive);
    }

    if (setClauses.length === 0) return this.getUser(id);

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const result = await this.sql`
      UPDATE users 
      SET ${this.sql.unsafe(setClauses.join(", "))}
      WHERE id = ${id}
      RETURNING *
    `;
    return (result[0] as User) || undefined;
  }

  async getEmployees(): Promise<EmployeeWithRelations[]> {
    const result = await this.sql`
      SELECT 
        e.*,
        u.cedula, u.role, u.is_active as user_is_active,
        c.nombre as cargo_name,
        d.nombre as departamento_name,
        g.nombre as gerencia_name,
        g.id as gerencia_id,
        d.id as departamento_id,
        c.id as cargo_id,
        CONCAT(s.first_name, ' ', s.last_name) as supervisor_name,
        ct.tipo_contrato as contract_type, ct.fecha_inicio as contract_start_date, ct.fecha_fin as contract_end_date
      FROM employees e
      JOIN users u ON e.user_id = u.id
      JOIN cargos c ON e.cargo_id = c.id
      JOIN departamentos d ON c.departamento_id = d.id
      JOIN gerencias g ON d.gerencia_id = g.id
      LEFT JOIN employees s ON e.supervisor_id = s.id
      LEFT JOIN contracts ct ON e.id = ct.employee_id AND ct.status = 'activo'
      ORDER BY CONCAT(e.first_name, ' ', e.last_name)
    `;

    return result.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      fullName: (row.first_name || '') + ' ' + (row.last_name || ''),
      email: row.email,
      phone: row.phone,
      birthDate: row.birth_date,
      cargoId: row.cargo_id,
      supervisorId: row.supervisor_id,
      startDate: row.start_date,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        id: row.user_id,
        cedula: row.cedula,
        password: "", // No enviar password
        role: row.role,
        isActive: row.user_is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      cargo: {
        id: row.cargo_id,
        name: row.cargo_name,
        departamentoId: row.departamento_id,
        createdAt: row.created_at,
        departamento: {
          id: row.departamento_id,
          name: row.departamento_name,
          gerenciaId: row.gerencia_id,
          createdAt: row.created_at,
          gerencia: {
            id: row.gerencia_id,
            name: row.gerencia_name,
            description: null,
            createdAt: row.created_at,
          },
        },
      },
      supervisor: row.supervisor_id
        ? {
            id: row.supervisor_id,
            fullName: row.supervisor_name || '',
            userId: "",
            email: "",
            phone: null,
            birthDate: null,
            cargoId: "",
            supervisorId: null,
            startDate: "",
            status: "activo",
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        : undefined,
      contract: row.contract_type
        ? {
            id: "",
            employeeId: row.id,
            type: row.contract_type,
            startDate: row.contract_start_date,
            endDate: row.contract_end_date,
            isActive: true,
            createdAt: new Date(),
          }
        : undefined,
    }));
  }

  async getEmployee(id: string): Promise<EmployeeWithRelations | undefined> {
    const employees = await this.getEmployees();
    return employees.find((e) => e.id === id);
  }

  async getEmployeeByUserId(
    userId: string,
  ): Promise<EmployeeWithRelations | undefined> {
    const employees = await this.getEmployees();
    return employees.find((e) => e.userId === userId);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const result = await this.sql`
      INSERT INTO employees (user_id, full_name, email, phone, birth_date, cargo_id, supervisor_id, start_date, status)
      VALUES (${employee.userId}, ${employee.fullName}, ${employee.email}, ${employee.phone}, 
              ${employee.birthDate}, ${employee.cargoId}, ${employee.supervisorId}, 
              ${employee.startDate}, ${employee.status || "activo"})
      RETURNING *
    `;
    return result[0] as Employee;
  }

  async updateEmployee(
    id: string,
    employee: Partial<InsertEmployee>,
  ): Promise<Employee | undefined> {
    if (Object.keys(employee).length === 0) {
      const result = await this.sql`SELECT * FROM employees WHERE id = ${id}`;
      return (result[0] as Employee) || undefined;
    }

    // Use individual conditional updates
    let result;

    if (
      employee.fullName !== undefined &&
      employee.email !== undefined &&
      employee.phone !== undefined
    ) {
      result = await this.sql`
        UPDATE employees 
        SET full_name = ${employee.fullName},
            email = ${employee.email}, 
            phone = ${employee.phone},
            birth_date = ${employee.birthDate || null},
            cargo_id = ${employee.cargoId || null},
            supervisor_id = ${employee.supervisorId || null},
            start_date = ${employee.startDate || null},
            status = ${employee.status || "activo"},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      // For partial updates, get current data first and merge
      const current = await this.sql`SELECT * FROM employees WHERE id = ${id}`;
      if (!current[0]) return undefined;

      const currentEmployee = current[0] as Employee;

      result = await this.sql`
        UPDATE employees 
        SET full_name = ${employee.fullName ?? currentEmployee.fullName},
            email = ${employee.email ?? currentEmployee.email}, 
            phone = ${employee.phone ?? currentEmployee.phone},
            birth_date = ${employee.birthDate ?? currentEmployee.birthDate},
            cargo_id = ${employee.cargoId ?? currentEmployee.cargoId},
            supervisor_id = ${employee.supervisorId ?? currentEmployee.supervisorId},
            start_date = ${employee.startDate ?? currentEmployee.startDate},
            status = ${employee.status ?? currentEmployee.status},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
    }

    return (result[0] as Employee) || undefined;
  }

  async getGerencias(): Promise<Gerencia[]> {
    const result = await this.sql`SELECT * FROM gerencias ORDER BY name`;
    return result as Gerencia[];
  }

  async getDepartamentosByGerencia(
    gerenciaId: string,
  ): Promise<Departamento[]> {
    const result = await this
      .sql`SELECT * FROM departamentos WHERE gerencia_id = ${gerenciaId} ORDER BY name`;
    return result as Departamento[];
  }

  async getCargosByDepartamento(departamentoId: string): Promise<Cargo[]> {
    const result = await this
      .sql`SELECT * FROM cargos WHERE departamento_id = ${departamentoId} ORDER BY name`;
    return result as Cargo[];
  }

  async createGerencia(gerencia: InsertGerencia): Promise<Gerencia> {
    const result = await this.sql`
      INSERT INTO gerencias (name, description)
      VALUES (${gerencia.name}, ${gerencia.description})
      RETURNING *
    `;
    return result[0] as Gerencia;
  }

  async createDepartamento(
    departamento: InsertDepartamento,
  ): Promise<Departamento> {
    const result = await this.sql`
      INSERT INTO departamentos (name, gerencia_id)
      VALUES (${departamento.name}, ${departamento.gerenciaId})
      RETURNING *
    `;
    return result[0] as Departamento;
  }

  async createCargo(cargo: InsertCargo): Promise<Cargo> {
    const result = await this.sql`
      INSERT INTO cargos (name, departamento_id)
      VALUES (${cargo.name}, ${cargo.departamentoId})
      RETURNING *
    `;
    return result[0] as Cargo;
  }

  async getContracts(): Promise<Contract[]> {
    const result = await this.sql`
      SELECT c.*, 
             e.full_name as employee_full_name,
             e.email as employee_email,
             car.name as cargo_name
      FROM contracts c
      LEFT JOIN employees e ON c.employee_id = e.id
      LEFT JOIN cargos car ON e.cargo_id = car.id
      ORDER BY c.created_at DESC
    `;
    return result.map((row: any) => ({
      ...row,
      employee: row.employee_full_name
        ? {
            id: row.employee_id,
            fullName: row.employee_full_name,
            email: row.employee_email,
            cargo: row.cargo_name ? { name: row.cargo_name } : null,
          }
        : null,
    })) as Contract[];
  }

  async getContract(id: string): Promise<Contract | undefined> {
    const result = await this.sql`SELECT * FROM contracts WHERE id = ${id}`;
    return (result[0] as Contract) || undefined;
  }

  async getContractsByEmployee(employeeId: string): Promise<Contract[]> {
    const result = await this
      .sql`SELECT * FROM contracts WHERE employee_id = ${employeeId} ORDER BY created_at DESC`;
    return result as Contract[];
  }

  async createContract(contract: InsertContract): Promise<Contract> {
    const result = await this.sql`
      INSERT INTO contracts (employee_id, tipo_contrato, fecha_inicio, fecha_fin, status, salario, creado_por)
      VALUES (${contract.employeeId}, ${contract.type || 'indefinido'}, ${contract.startDate}, 
              ${contract.endDate}, 'activo', ${contract.salary || 25000}, ${contract.createdBy})
      RETURNING *
    `;
    return result[0] as Contract;
  }

  async updateContract(
    id: string,
    contract: Partial<InsertContract>,
  ): Promise<Contract | undefined> {
    const setClauses = [];
    const values = [];

    if (contract.type !== undefined) {
      setClauses.push(`tipo_contrato = $${setClauses.length + 1}`);
      values.push(contract.type);
    }
    if (contract.startDate !== undefined) {
      setClauses.push(`fecha_inicio = $${setClauses.length + 1}`);
      values.push(contract.startDate);
    }
    if (contract.endDate !== undefined) {
      setClauses.push(`fecha_fin = $${setClauses.length + 1}`);
      values.push(contract.endDate);
    }
    if (contract.isActive !== undefined) {
      setClauses.push(`status = $${setClauses.length + 1}`);
      values.push(contract.isActive ? 'activo' : 'inactivo');
    }

    if (setClauses.length === 0) return this.getContract(id);

    values.push(id);

    const result = await this.sql`
      UPDATE contracts 
      SET ${this.sql.unsafe(setClauses.join(", "))}
      WHERE id = ${id}
      RETURNING *
    `;
    return (result[0] as Contract) || undefined;
  }

  async deleteContract(id: string): Promise<boolean> {
    const result = await this.sql`DELETE FROM contracts WHERE id = ${id}`;
    return result.count > 0;
  }

  async getExpiringContracts(): Promise<Contract[]> {
    const result = await this.sql`
      SELECT * FROM contracts 
      WHERE fecha_fin IS NOT NULL 
      AND fecha_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
      AND status = 'activo'
      ORDER BY fecha_fin
    `;
    return result as Contract[];
  }

  async getCandidates(): Promise<CandidateWithRelations[]> {
    const result = await this.sql`
      SELECT 
        c.*,
        u.cedula as submitted_by_cedula, u.role as submitted_by_role,
        ev.cedula as evaluated_by_cedula, ev.role as evaluated_by_role,
        ca.name as cargo_name,
        d.name as departamento_name, d.id as departamento_id,
        g.name as gerencia_name, g.id as gerencia_id
      FROM candidates c
      JOIN users u ON c.submitted_by = u.id
      LEFT JOIN users ev ON c.evaluated_by = ev.id
      JOIN cargos ca ON c.cargo_id = ca.id
      JOIN departamentos d ON ca.departamento_id = d.id
      JOIN gerencias g ON d.gerencia_id = g.id
      ORDER BY c.created_at DESC
    `;

    return result.map((row: any) => ({
      id: row.id,
      cedula: row.cedula,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      birthDate: row.birth_date,
      cargoId: row.cargo_id,
      cvUrl: row.cv_url,
      notes: row.notes,
      status: row.status,
      submittedBy: row.submitted_by,
      evaluatedBy: row.evaluated_by,
      evaluationNotes: row.evaluation_notes,
      evaluationDate: row.evaluation_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      cargo: {
        id: row.cargo_id,
        name: row.cargo_name,
        departamentoId: row.departamento_id,
        createdAt: row.created_at,
        departamento: {
          id: row.departamento_id,
          name: row.departamento_name,
          gerenciaId: row.gerencia_id,
          createdAt: row.created_at,
          gerencia: {
            id: row.gerencia_id,
            name: row.gerencia_name,
            description: null,
            createdAt: row.created_at,
          },
        },
      },
      submittedByUser: {
        id: row.submitted_by,
        cedula: row.submitted_by_cedula,
        password: "",
        role: row.submitted_by_role,
        isActive: true,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
      evaluatedByUser: row.evaluated_by
        ? {
            id: row.evaluated_by,
            cedula: row.evaluated_by_cedula,
            password: "",
            role: row.evaluated_by_role,
            isActive: true,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }
        : undefined,
    }));
  }

  async getCandidate(id: string): Promise<CandidateWithRelations | undefined> {
    const candidates = await this.getCandidates();
    return candidates.find((c) => c.id === id);
  }

  async createCandidate(
    candidate: Omit<Candidate, "id" | "createdAt" | "updatedAt">,
  ): Promise<Candidate> {
    const result = await this.sql`
      INSERT INTO candidates (cedula, full_name, email, phone, birth_date, cargo_id, cv_url, notes, status, submitted_by, evaluated_by, evaluation_notes, evaluation_date)
      VALUES (${candidate.cedula}, ${candidate.fullName}, ${candidate.email}, ${candidate.phone}, 
              ${candidate.birthDate}, ${candidate.cargoId}, ${candidate.cvUrl}, ${candidate.notes}, 
              ${candidate.status}, ${candidate.submittedBy}, ${candidate.evaluatedBy}, 
              ${candidate.evaluationNotes}, ${candidate.evaluationDate})
      RETURNING *
    `;
    return result[0] as Candidate;
  }

  async updateCandidate(
    id: string,
    candidate: Partial<Candidate>,
  ): Promise<Candidate | undefined> {
    const setClauses = [];
    const values = [];

    if (candidate.fullName !== undefined) {
      setClauses.push(`full_name = $${setClauses.length + 1}`);
      values.push(candidate.fullName);
    }
    if (candidate.email !== undefined) {
      setClauses.push(`email = $${setClauses.length + 1}`);
      values.push(candidate.email);
    }
    if (candidate.phone !== undefined) {
      setClauses.push(`phone = $${setClauses.length + 1}`);
      values.push(candidate.phone);
    }
    if (candidate.status !== undefined) {
      setClauses.push(`status = $${setClauses.length + 1}`);
      values.push(candidate.status);
    }
    if (candidate.evaluationNotes !== undefined) {
      setClauses.push(`evaluation_notes = $${setClauses.length + 1}`);
      values.push(candidate.evaluationNotes);
    }

    if (setClauses.length === 0) {
      const result = await this.sql`SELECT * FROM candidates WHERE id = ${id}`;
      return (result[0] as Candidate) || undefined;
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const result = await this.sql`
      UPDATE candidates 
      SET ${this.sql.unsafe(setClauses.join(", "))}
      WHERE id = ${id}
      RETURNING *
    `;
    return (result[0] as Candidate) || undefined;
  }

  async deleteCandidate(id: string): Promise<boolean> {
    const result = await this.sql`DELETE FROM candidates WHERE id = ${id}`;
    return result.count > 0;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [employeeStats, contractStats, candidateStats, probationStats] =
      await Promise.all([
        this
          .sql`SELECT COUNT(*) as total, status FROM employees GROUP BY status`,
        this
          .sql`SELECT COUNT(*) as expiring FROM contracts WHERE fecha_fin BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' AND status = 'activo'`,
        this.sql`SELECT COUNT(*) as total FROM candidates`,
        this
          .sql`SELECT COUNT(*) as active FROM probation_periods WHERE status = 'activo'`,
      ]);

    const totalEmployees = employeeStats.reduce(
      (sum: number, stat: any) => sum + parseInt(stat.total),
      0,
    );
    const probationEmployees =
      employeeStats.find((stat: any) => stat.status === "periodo_prueba")
        ?.total || 0;
    const expiringContracts = contractStats[0]?.expiring || 0;
    const totalCandidates = candidateStats[0]?.total || 0;
    const activeProbationPeriods = probationStats[0]?.active || 0;

    return {
      totalEmployees,
      probationEmployees: parseInt(probationEmployees),
      expiringContracts: parseInt(expiringContracts),
      totalCandidates: parseInt(totalCandidates),
      activeProbationPeriods: parseInt(activeProbationPeriods),
    };
  }

  // Métodos stub para completar la interfaz (implementar según sea necesario)
  async getProbationPeriods(): Promise<ProbationPeriodWithRelations[]> {
    return [];
  }
  async getProbationPeriod(
    id: string,
  ): Promise<ProbationPeriodWithRelations | undefined> {
    return undefined;
  }
  async getProbationPeriodsByEmployee(
    employeeId: string,
  ): Promise<ProbationPeriodWithRelations[]> {
    return [];
  }
  async createProbationPeriod(
    period: Omit<ProbationPeriod, "id" | "createdAt" | "updatedAt">,
  ): Promise<ProbationPeriod> {
    throw new Error("Not implemented");
  }
  async updateProbationPeriod(
    id: string,
    period: Partial<ProbationPeriod>,
  ): Promise<ProbationPeriod | undefined> {
    return undefined;
  }
  async deleteProbationPeriod(id: string): Promise<boolean> {
    return false;
  }
  async getEgresos(): Promise<EgresoWithRelations[]> {
    return [];
  }
  async getEgreso(id: string): Promise<EgresoWithRelations | undefined> {
    return undefined;
  }
  async getEgresosByEmployee(
    employeeId: string,
  ): Promise<EgresoWithRelations[]> {
    return [];
  }
  async createEgreso(
    egreso: Omit<Egreso, "id" | "createdAt" | "updatedAt">,
  ): Promise<Egreso> {
    throw new Error("Not implemented");
  }
  async updateEgreso(
    id: string,
    egreso: Partial<Egreso>,
  ): Promise<Egreso | undefined> {
    return undefined;
  }
  async deleteEgreso(id: string): Promise<boolean> {
    return false;
  }
  async getJobOffers(): Promise<JobOfferWithRelations[]> {
    return [];
  }
  async getJobOffer(id: string): Promise<JobOfferWithRelations | undefined> {
    return undefined;
  }
  async createJobOffer(
    jobOffer: Omit<JobOffer, "id" | "createdAt" | "updatedAt">,
  ): Promise<JobOffer> {
    throw new Error("Not implemented");
  }
  async updateJobOffer(
    id: string,
    jobOffer: Partial<JobOffer>,
  ): Promise<JobOffer | undefined> {
    return undefined;
  }
  async deleteJobOffer(id: string): Promise<boolean> {
    return false;
  }
  async getJobApplications(): Promise<JobApplicationWithRelations[]> {
    return [];
  }
  async getJobApplication(
    id: string,
  ): Promise<JobApplicationWithRelations | undefined> {
    return undefined;
  }
  async getJobApplicationsByOffer(
    jobOfferId: string,
  ): Promise<JobApplicationWithRelations[]> {
    return [];
  }
  async getJobApplicationsByCandidate(
    candidateId: string,
  ): Promise<JobApplicationWithRelations[]> {
    return [];
  }
  async createJobApplication(
    application: Omit<JobApplication, "id" | "createdAt" | "updatedAt">,
  ): Promise<JobApplication> {
    throw new Error("Not implemented");
  }
  async updateJobApplication(
    id: string,
    application: Partial<JobApplication>,
  ): Promise<JobApplication | undefined> {
    return undefined;
  }
  async deleteJobApplication(id: string): Promise<boolean> {
    return false;
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private employees: Map<string, Employee> = new Map();
  private gerencias: Map<string, Gerencia> = new Map();
  private departamentos: Map<string, Departamento> = new Map();
  private cargos: Map<string, Cargo> = new Map();
  private contracts: Map<string, Contract> = new Map();
  private candidates: Map<string, Candidate> = new Map();
  private probationPeriods: Map<string, ProbationPeriod> = new Map();
  private egresos: Map<string, Egreso> = new Map();
  private jobOffers: Map<string, JobOffer> = new Map();
  private jobApplications: Map<string, JobApplication> = new Map();

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    // Create default organizational structure
    const gerenciaRRHH = await this.createGerencia({
      name: "Gerencia de RRHH",
      description: "Gestión de Recursos Humanos",
    });

    const gerenciaOps = await this.createGerencia({
      name: "Gerencia de Operaciones",
      description: "Operaciones y Producción",
    });

    const gerenciaIT = await this.createGerencia({
      name: "Gerencia de Tecnología",
      description: "Sistemas y Tecnología",
    });

    // Departamentos
    const deptRRHH = await this.createDepartamento({
      name: "Administración de Personal",
      gerenciaId: gerenciaRRHH.id,
    });

    const deptReclutamiento = await this.createDepartamento({
      name: "Reclutamiento y Selección",
      gerenciaId: gerenciaRRHH.id,
    });

    const deptProduccion = await this.createDepartamento({
      name: "Producción",
      gerenciaId: gerenciaOps.id,
    });

    const deptCalidad = await this.createDepartamento({
      name: "Control de Calidad",
      gerenciaId: gerenciaOps.id,
    });

    const deptDesarrollo = await this.createDepartamento({
      name: "Desarrollo de Software",
      gerenciaId: gerenciaIT.id,
    });

    const deptSoporte = await this.createDepartamento({
      name: "Soporte Técnico",
      gerenciaId: gerenciaIT.id,
    });

    // Cargos
    const cargoGerente = await this.createCargo({
      name: "Gerente RRHH",
      departamentoId: deptRRHH.id,
    });

    const cargoAnalista = await this.createCargo({
      name: "Analista RRHH",
      departamentoId: deptRRHH.id,
    });

    const cargoReclutador = await this.createCargo({
      name: "Especialista en Reclutamiento",
      departamentoId: deptReclutamiento.id,
    });

    const cargoSupervisorProd = await this.createCargo({
      name: "Supervisor de Producción",
      departamentoId: deptProduccion.id,
    });

    const cargoOperario = await this.createCargo({
      name: "Operario de Producción",
      departamentoId: deptProduccion.id,
    });

    const cargoInspector = await this.createCargo({
      name: "Inspector de Calidad",
      departamentoId: deptCalidad.id,
    });

    const cargoDevSenior = await this.createCargo({
      name: "Desarrollador Senior",
      departamentoId: deptDesarrollo.id,
    });

    const cargoDevJunior = await this.createCargo({
      name: "Desarrollador Junior",
      departamentoId: deptDesarrollo.id,
    });

    const cargoTechLead = await this.createCargo({
      name: "Tech Lead",
      departamentoId: deptDesarrollo.id,
    });

    const cargoSoporte = await this.createCargo({
      name: "Técnico de Soporte",
      departamentoId: deptSoporte.id,
    });

    // Datos de empleados
    const empleadosData = [
      {
        cedula: "V-12345678",
        fullName: "María González",
        email: "maria.gonzalez@empresa.com",
        phone: "+58 414-1234567",
        birthDate: "1985-03-15",
        cargo: cargoGerente,
        role: "admin",
        status: "activo",
        startDate: "2024-01-15",
        probation: false,
      },
      {
        cedula: "V-23456789",
        fullName: "Carlos Rodríguez",
        email: "carlos.rodriguez@empresa.com",
        phone: "+58 424-2345678",
        birthDate: "1990-07-22",
        cargo: cargoAnalista,
        role: "admin_rrhh",
        status: "activo",
        startDate: "2021-05-10",
        probation: false,
      },
      {
        cedula: "V-34567890",
        fullName: "Ana Martínez",
        email: "ana.martinez@empresa.com",
        phone: "+58 416-3456789",
        birthDate: "1988-11-08",
        cargo: cargoReclutador,
        role: "empleado_captacion",
        status: "activo",
        startDate: "2022-02-14",
        probation: false,
      },
      {
        cedula: "V-45678901",
        fullName: "Luis Pérez",
        email: "luis.perez@empresa.com",
        phone: "+58 426-4567890",
        birthDate: "1982-12-03",
        cargo: cargoSupervisorProd,
        role: "supervisor",
        status: "activo",
        startDate: "2019-08-20",
        probation: false,
      },
      {
        cedula: "V-56789012",
        fullName: "Sandra López",
        email: "sandra.lopez@empresa.com",
        phone: "+58 414-5678901",
        birthDate: "1992-04-18",
        cargo: cargoDevSenior,
        role: "empleado",
        status: "activo",
        startDate: "2023-01-15",
        probation: false,
      },
      {
        cedula: "V-67890123",
        fullName: "Roberto Silva",
        email: "roberto.silva@empresa.com",
        phone: "+58 424-6789012",
        birthDate: "1995-09-25",
        cargo: cargoDevJunior,
        role: "empleado",
        status: "periodo_prueba",
        startDate: "2025-07-29",
        probation: true,
      },
      {
        cedula: "V-78901234",
        fullName: "Carmen Díaz",
        email: "carmen.diaz@empresa.com",
        phone: "+58 416-7890123",
        birthDate: "1987-06-12",
        cargo: cargoTechLead,
        role: "empleado",
        status: "activo",
        startDate: "2025-06-08",
        probation: false,
      },
      {
        cedula: "V-89012345",
        fullName: "Diego Morales",
        email: "diego.morales@empresa.com",
        phone: "+58 426-8901234",
        birthDate: "1991-01-30",
        cargo: cargoOperario,
        role: "empleado",
        status: "periodo_prueba",
        startDate: "2025-08-15",
        probation: true,
      },
      {
        cedula: "V-90123456",
        fullName: "Patricia Ruiz",
        email: "patricia.ruiz@empresa.com",
        phone: "+58 414-9012345",
        birthDate: "1989-08-07",
        cargo: cargoInspector,
        role: "empleado",
        status: "activo",
        startDate: "2025-07-03",
        probation: false,
      },
      {
        cedula: "V-01234567",
        fullName: "Fernando Castro",
        email: "fernando.castro@empresa.com",
        phone: "+58 424-0123456",
        birthDate: "1993-05-14",
        cargo: cargoSoporte,
        role: "empleado",
        status: "periodo_prueba",
        startDate: "2025-07-01",
        probation: true,
      },
    ];

    const employees = [];
    const users = [];

    // Create users and employees
    for (const empleado of empleadosData) {
      const user = await this.createUser({
        cedula: empleado.cedula,
        password: await bcrypt.hash("123456", 10),
        role: empleado.role as any,
        isActive: true,
      });
      users.push(user);

      const employee = await this.createEmployee({
        userId: user.id,
        fullName: empleado.fullName,
        email: empleado.email,
        phone: empleado.phone,
        birthDate: empleado.birthDate as any,
        cargoId: empleado.cargo.id,
        startDate: empleado.startDate as any,
        status: empleado.status as any,
      });
      employees.push({ ...employee, empleadoData: empleado });

      // Create contract for each employee
      const startDate = new Date(empleado.startDate);
      const contractType = empleado.probation
        ? "determinado"
        : Math.random() > 0.3
          ? "indefinido"
          : "determinado";
      let endDate = null;

      if (contractType === "determinado") {
        endDate = new Date(startDate);
        if (empleado.probation) {
          endDate.setMonth(endDate.getMonth() + 3); // 3 meses para periodo de prueba
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1); // 1 año para contratos determinados
        }
      }

      await this.createContract({
        employeeId: employee.id,
        type: contractType as any,
        startDate: empleado.startDate as any,
        endDate: endDate ? (endDate.toISOString().split("T")[0] as any) : null,
        isActive: true,
      });
    }

    // Create probation periods for employees with probation status
    for (const employee of employees) {
      if (employee.empleadoData.probation) {
        const startDate = new Date(employee.empleadoData.startDate);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 3); // 3 meses de periodo de prueba

        await this.createProbationPeriod({
          employeeId: employee.id,
          startDate: employee.empleadoData.startDate as any,
          endDate: endDate.toISOString().split("T")[0] as any,
          status: "activo",
          evaluationNotes:
            "Empleado en período de prueba, evaluación en progreso",
          supervisorRecommendation: "Pendiente de evaluación",
          hrNotes: "Seguimiento mensual programado",
        });
      }
    }

    // Create some sample candidates
    await this.createCandidate({
      cedula: "V-11111111",
      fullName: "Julia Fernández",
      email: "julia.fernandez@example.com",
      phone: "+58 414-1111111",
      birthDate: "1994-03-20",
      cargoId: cargoAnalista.id,
      status: "en_evaluacion",
      submittedBy: users[0].id,
      notes:
        "Candidata con experiencia en análisis de datos y gestión de personal",
    });

    await this.createCandidate({
      cedula: "V-22222222",
      fullName: "Miguel Herrera",
      email: "miguel.herrera@example.com",
      phone: "+58 424-2222222",
      birthDate: "1990-11-15",
      cargoId: cargoDevJunior.id,
      status: "entrevista",
      submittedBy: users[0].id,
      evaluatedBy: users[1].id,
      evaluationDate: new Date().toISOString().split("T")[0],
      evaluationNotes: "Candidato con sólidos conocimientos técnicos",
      notes: "Experiencia previa en desarrollo web",
    });
  }

  async login(
    credentials: LoginData,
  ): Promise<{ user: User; employee?: EmployeeWithRelations } | null> {
    const user = await this.getUserByCedula(credentials.cedula);
    if (!user || !user.isActive) return null;

    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.password,
    );
    if (!isValidPassword) return null;

    const employee = await this.getEmployeeByUserId(user.id);
    return { user, employee };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByCedula(cedula: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.cedula === cedula,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      cedula: insertUser.cedula,
      password: insertUser.password,
      role: insertUser.role || "empleado",
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(
    id: string,
    updateData: Partial<InsertUser>,
  ): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updateData, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getEmployees(): Promise<EmployeeWithRelations[]> {
    const employees = Array.from(this.employees.values());
    const result: EmployeeWithRelations[] = [];

    for (const employee of employees) {
      const user = await this.getUser(employee.userId);
      const cargo = this.cargos.get(employee.cargoId);
      if (!user || !cargo) continue;

      const departamento = this.departamentos.get(cargo.departamentoId);
      const gerencia = departamento
        ? this.gerencias.get(departamento.gerenciaId)
        : undefined;

      if (!departamento || !gerencia) continue;

      const supervisor = employee.supervisorId
        ? this.employees.get(employee.supervisorId)
        : undefined;
      const contracts = await this.getContractsByEmployee(employee.id);
      const activeContract = contracts.find((c) => c.isActive);

      result.push({
        ...employee,
        user,
        cargo: {
          ...cargo,
          departamento: {
            ...departamento,
            gerencia,
          },
        },
        supervisor,
        contract: activeContract,
      });
    }

    return result;
  }

  async getEmployee(id: string): Promise<EmployeeWithRelations | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;

    const employees = await this.getEmployees();
    return employees.find((e) => e.id === id);
  }

  async getEmployeeByUserId(
    userId: string,
  ): Promise<EmployeeWithRelations | undefined> {
    const employees = await this.getEmployees();
    return employees.find((e) => e.userId === userId);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employee: Employee = {
      id,
      userId: insertEmployee.userId,
      fullName: insertEmployee.fullName,
      email: insertEmployee.email,
      phone: insertEmployee.phone || null,
      birthDate: insertEmployee.birthDate || null,
      cargoId: insertEmployee.cargoId,
      supervisorId: insertEmployee.supervisorId || null,
      startDate: insertEmployee.startDate,
      status: insertEmployee.status ?? "activo",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(
    id: string,
    updateData: Partial<InsertEmployee>,
  ): Promise<EmployeeWithRelations | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;

    const updatedEmployee = {
      ...employee,
      ...updateData,
      id: employee.id,
      userId: employee.userId,
      createdAt: employee.createdAt,
      updatedAt: new Date(),
    };
    this.employees.set(id, updatedEmployee);

    // Return full employee with relations
    return await this.getEmployee(id);
  }

  async deleteEmployee(id: string): Promise<boolean> {
    return this.employees.delete(id);
  }

  async getGerencias(): Promise<Gerencia[]> {
    return Array.from(this.gerencias.values());
  }

  async getDepartamentosByGerencia(
    gerenciaId: string,
  ): Promise<Departamento[]> {
    return Array.from(this.departamentos.values()).filter(
      (dept) => dept.gerenciaId === gerenciaId,
    );
  }

  async getCargosByDepartamento(departamentoId: string): Promise<Cargo[]> {
    return Array.from(this.cargos.values()).filter(
      (cargo) => cargo.departamentoId === departamentoId,
    );
  }

  async createGerencia(insertGerencia: InsertGerencia): Promise<Gerencia> {
    const id = randomUUID();
    const gerencia: Gerencia = {
      id,
      name: insertGerencia.name,
      description: insertGerencia.description || null,
      createdAt: new Date(),
    };
    this.gerencias.set(id, gerencia);
    return gerencia;
  }

  async createDepartamento(
    insertDepartamento: InsertDepartamento,
  ): Promise<Departamento> {
    const id = randomUUID();
    const departamento: Departamento = {
      id,
      name: insertDepartamento.name,

      gerenciaId: insertDepartamento.gerenciaId,
      createdAt: new Date(),
    };
    this.departamentos.set(id, departamento);
    return departamento;
  }

  async createCargo(insertCargo: InsertCargo): Promise<Cargo> {
    const id = randomUUID();
    const cargo: Cargo = {
      id,
      name: insertCargo.name,

      departamentoId: insertCargo.departamentoId,
      createdAt: new Date(),
    };
    this.cargos.set(id, cargo);
    return cargo;
  }

  async getContracts(): Promise<ContractWithEmployee[]> {
    const contractsArray = Array.from(this.contracts.values());
    const results: ContractWithEmployee[] = [];

    for (const contract of contractsArray) {
      const employee = this.employees.get(contract.employeeId);
      if (!employee) continue;

      const cargo = this.cargos.get(employee.cargoId);
      if (!cargo) continue;

      const departamento = this.departamentos.get(cargo.departamentoId);
      if (!departamento) continue;

      const gerencia = this.gerencias.get(departamento.gerenciaId);
      if (!gerencia) continue;

      results.push({
        ...contract,
        employee: {
          ...employee,
          cargo: {
            ...cargo,
            departamento: {
              ...departamento,
              gerencia,
            },
          },
        },
      });
    }

    return results;
  }

  async getContractsByEmployee(employeeId: string): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(
      (contract) => contract.employeeId === employeeId,
    );
  }

  async getContract(id: string): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async createContract(insertContract: InsertContract): Promise<Contract> {
    const id = randomUUID();
    const contract: Contract = {
      id,
      employeeId: insertContract.employeeId,
      type: insertContract.type,
      startDate: insertContract.startDate,
      endDate: insertContract.endDate || null,
      isActive: insertContract.isActive ?? true,
      createdAt: new Date(),
    };
    this.contracts.set(id, contract);
    return contract;
  }

  async updateContract(
    id: string,
    updates: Partial<InsertContract>,
  ): Promise<Contract | undefined> {
    const contract = this.contracts.get(id);
    if (!contract) return undefined;

    const updatedContract: Contract = {
      ...contract,
      ...updates,
      id: contract.id,
      createdAt: contract.createdAt,
    };
    this.contracts.set(id, updatedContract);
    return updatedContract;
  }

  async deleteContract(id: string): Promise<boolean> {
    return this.contracts.delete(id);
  }

  // Candidates methods
  async getCandidates(): Promise<CandidateWithRelations[]> {
    const candidatesArray = Array.from(this.candidates.values());
    const results: CandidateWithRelations[] = [];

    for (const candidate of candidatesArray) {
      const cargo = this.cargos.get(candidate.cargoId);
      if (!cargo) continue;

      const departamento = this.departamentos.get(cargo.departamentoId);
      if (!departamento) continue;

      const gerencia = this.gerencias.get(departamento.gerenciaId);
      if (!gerencia) continue;

      const submittedByUser = this.users.get(candidate.submittedBy);
      if (!submittedByUser) continue;

      const evaluatedByUser = candidate.evaluatedBy
        ? this.users.get(candidate.evaluatedBy)
        : undefined;

      results.push({
        ...candidate,
        cargo: {
          ...cargo,
          departamento: {
            ...departamento,
            gerencia,
          },
        },
        submittedByUser,
        evaluatedByUser,
      });
    }

    return results;
  }

  async getCandidate(id: string): Promise<CandidateWithRelations | undefined> {
    const candidate = this.candidates.get(id);
    if (!candidate) return undefined;

    const cargo = this.cargos.get(candidate.cargoId);
    if (!cargo) return undefined;

    const departamento = this.departamentos.get(cargo.departamentoId);
    if (!departamento) return undefined;

    const gerencia = this.gerencias.get(departamento.gerenciaId);
    if (!gerencia) return undefined;

    const submittedByUser = this.users.get(candidate.submittedBy);
    if (!submittedByUser) return undefined;

    const evaluatedByUser = candidate.evaluatedBy
      ? this.users.get(candidate.evaluatedBy)
      : undefined;

    return {
      ...candidate,
      cargo: {
        ...cargo,
        departamento: {
          ...departamento,
          gerencia,
        },
      },
      submittedByUser,
      evaluatedByUser,
    };
  }

  async createCandidate(
    candidateData: Omit<Candidate, "id" | "createdAt" | "updatedAt">,
  ): Promise<Candidate> {
    const id = randomUUID();
    const now = new Date().toISOString() as any;
    const candidate: Candidate = {
      id,
      ...candidateData,
      createdAt: now,
      updatedAt: now,
    };
    this.candidates.set(id, candidate);
    return candidate;
  }

  async updateCandidate(
    id: string,
    updates: Partial<Candidate>,
  ): Promise<Candidate | undefined> {
    const candidate = this.candidates.get(id);
    if (!candidate) return undefined;

    const updatedCandidate: Candidate = {
      ...candidate,
      ...updates,
      id: candidate.id,
      createdAt: candidate.createdAt,
      updatedAt: new Date().toISOString() as any,
    };
    this.candidates.set(id, updatedCandidate);
    return updatedCandidate;
  }

  async deleteCandidate(id: string): Promise<boolean> {
    return this.candidates.delete(id);
  }

  // Probation Periods methods
  async getProbationPeriods(): Promise<ProbationPeriodWithRelations[]> {
    const probationPeriodsArray = Array.from(this.probationPeriods.values());
    const results: ProbationPeriodWithRelations[] = [];

    for (const probationPeriod of probationPeriodsArray) {
      const employee = this.employees.get(probationPeriod.employeeId);
      if (!employee) continue;

      const user = this.users.get(employee.userId);
      if (!user) continue;

      const cargo = this.cargos.get(employee.cargoId);
      if (!cargo) continue;

      const departamento = this.departamentos.get(cargo.departamentoId);
      if (!departamento) continue;

      const gerencia = this.gerencias.get(departamento.gerenciaId);
      if (!gerencia) continue;

      const evaluatedByUser = probationPeriod.evaluatedBy
        ? this.users.get(probationPeriod.evaluatedBy)
        : undefined;

      results.push({
        ...probationPeriod,
        employee: {
          ...employee,
          user,
          cargo: {
            ...cargo,
            departamento: {
              ...departamento,
              gerencia,
            },
          },
        },
        evaluatedByUser,
      });
    }

    return results;
  }

  async getProbationPeriod(
    id: string,
  ): Promise<ProbationPeriodWithRelations | undefined> {
    const probationPeriod = this.probationPeriods.get(id);
    if (!probationPeriod) return undefined;

    const employee = this.employees.get(probationPeriod.employeeId);
    if (!employee) return undefined;

    const user = this.users.get(employee.userId);
    if (!user) return undefined;

    const cargo = this.cargos.get(employee.cargoId);
    if (!cargo) return undefined;

    const departamento = this.departamentos.get(cargo.departamentoId);
    if (!departamento) return undefined;

    const gerencia = this.gerencias.get(departamento.gerenciaId);
    if (!gerencia) return undefined;

    const evaluatedByUser = probationPeriod.evaluatedBy
      ? this.users.get(probationPeriod.evaluatedBy)
      : undefined;

    return {
      ...probationPeriod,
      employee: {
        ...employee,
        user,
        cargo: {
          ...cargo,
          departamento: {
            ...departamento,
            gerencia,
          },
        },
      },
      evaluatedByUser,
    };
  }

  async getProbationPeriodsByEmployee(
    employeeId: string,
  ): Promise<ProbationPeriodWithRelations[]> {
    const allProbationPeriods = await this.getProbationPeriods();
    return allProbationPeriods.filter((pp) => pp.employeeId === employeeId);
  }

  async createProbationPeriod(
    probationPeriodData: Omit<
      ProbationPeriod,
      "id" | "createdAt" | "updatedAt"
    >,
  ): Promise<ProbationPeriod> {
    const id = randomUUID();
    const now = new Date().toISOString() as any;
    const probationPeriod: ProbationPeriod = {
      id,
      ...probationPeriodData,
      createdAt: now,
      updatedAt: now,
    };
    this.probationPeriods.set(id, probationPeriod);
    return probationPeriod;
  }

  async updateProbationPeriod(
    id: string,
    updates: Partial<ProbationPeriod>,
  ): Promise<ProbationPeriod | undefined> {
    const probationPeriod = this.probationPeriods.get(id);
    if (!probationPeriod) return undefined;

    const updatedProbationPeriod: ProbationPeriod = {
      ...probationPeriod,
      ...updates,
      id: probationPeriod.id,
      createdAt: probationPeriod.createdAt,
      updatedAt: new Date().toISOString() as any,
    };
    this.probationPeriods.set(id, updatedProbationPeriod);
    return updatedProbationPeriod;
  }

  async deleteProbationPeriod(id: string): Promise<boolean> {
    return this.probationPeriods.delete(id);
  }

  async getExpiringProbationPeriods(): Promise<ProbationPeriodWithRelations[]> {
    const today = new Date();
    const thirtyDaysFromNow = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    const allProbationPeriods = await this.getProbationPeriods();
    return allProbationPeriods.filter((probationPeriod) => {
      if (probationPeriod.status !== "activo") return false;
      const endDate = new Date(probationPeriod.endDate);
      return endDate >= today && endDate <= thirtyDaysFromNow;
    });
  }

  async getExpiringContracts(): Promise<Contract[]> {
    const today = new Date();
    const thirtyDaysFromNow = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    return Array.from(this.contracts.values()).filter((contract) => {
      if (!contract.endDate || !contract.isActive) return false;
      const endDate = new Date(contract.endDate);
      return endDate >= today && endDate <= thirtyDaysFromNow;
    });
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const employees = await this.getEmployees();
    const contracts = await this.getContracts();
    const expiringContractsList = await this.getExpiringContracts();

    const totalEmployees = employees.length;
    const probationEmployees = employees.filter(
      (e) => e.status === "periodo_prueba",
    ).length;
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter((c) => c.isActive).length;
    const indefiniteContracts = contracts.filter(
      (c) => c.type === "indefinido",
    ).length;
    const expiringContracts = expiringContractsList.length;

    // Mock data for demo
    const newCandidates = 15;

    const candidates = await this.getCandidates();
    const totalCandidates = candidates.length;
    const candidatesInEvaluation = candidates.filter(
      (c) => c.status === "en_evaluacion",
    ).length;
    const approvedCandidates = candidates.filter(
      (c) => c.status === "aprobado",
    ).length;

    const probationPeriods = await this.getProbationPeriods();
    const activeProbationPeriods = probationPeriods.filter(
      (pp) => pp.status === "activo",
    ).length;
    const expiringProbationPeriods = (await this.getExpiringProbationPeriods())
      .length;

    return {
      totalEmployees,
      probationEmployees,
      newCandidates: candidatesInEvaluation,
      expiringContracts,
      totalContracts,
      activeContracts,
      indefiniteContracts,
      totalCandidates,
      candidatesInEvaluation,
      approvedCandidates,
      activeProbationPeriods,
      expiringProbationPeriods,
    };
  }

  // Egresos methods
  async getEgresos(): Promise<EgresoWithRelations[]> {
    const allEgresos: EgresoWithRelations[] = [];

    for (const egreso of this.egresos.values()) {
      const employee = await this.getEmployee(egreso.employeeId);
      const solicitadoPorUser = await this.getUser(egreso.solicitadoPor);
      const aprobadoPorUser = egreso.aprobadoPor
        ? await this.getUser(egreso.aprobadoPor)
        : undefined;

      if (employee && solicitadoPorUser) {
        allEgresos.push({
          ...egreso,
          employee,
          solicitadoPorUser,
          aprobadoPorUser,
        });
      }
    }

    return allEgresos;
  }

  async getEgreso(id: string): Promise<EgresoWithRelations | undefined> {
    const egreso = this.egresos.get(id);
    if (!egreso) return undefined;

    const employee = await this.getEmployee(egreso.employeeId);
    const solicitadoPorUser = await this.getUser(egreso.solicitadoPor);
    const aprobadoPorUser = egreso.aprobadoPor
      ? await this.getUser(egreso.aprobadoPor)
      : undefined;

    if (!employee || !solicitadoPorUser) return undefined;

    return {
      ...egreso,
      employee,
      solicitadoPorUser,
      aprobadoPorUser,
    };
  }

  async getEgresosByEmployee(
    employeeId: string,
  ): Promise<EgresoWithRelations[]> {
    const allEgresos = await this.getEgresos();
    return allEgresos.filter((egreso) => egreso.employeeId === employeeId);
  }

  async createEgreso(
    egresoData: Omit<Egreso, "id" | "createdAt" | "updatedAt">,
  ): Promise<Egreso> {
    const id = randomUUID();
    const now = new Date().toISOString() as any;
    const egreso: Egreso = {
      id,
      ...egresoData,
      createdAt: now,
      updatedAt: now,
    };
    this.egresos.set(id, egreso);
    return egreso;
  }

  async updateEgreso(
    id: string,
    updates: Partial<Egreso>,
  ): Promise<Egreso | undefined> {
    const egreso = this.egresos.get(id);
    if (!egreso) return undefined;

    const updatedEgreso: Egreso = {
      ...egreso,
      ...updates,
      id: egreso.id,
      createdAt: egreso.createdAt,
      updatedAt: new Date().toISOString() as any,
    };
    this.egresos.set(id, updatedEgreso);
    return updatedEgreso;
  }

  async deleteEgreso(id: string): Promise<boolean> {
    return this.egresos.delete(id);
  }

  // Job Offers methods
  async getJobOffers(): Promise<JobOfferWithRelations[]> {
    const allJobOffers: JobOfferWithRelations[] = [];

    for (const jobOffer of this.jobOffers.values()) {
      const cargo = this.cargos.get(jobOffer.cargoId);
      const creadoPorUser = await this.getUser(jobOffer.creadoPor);
      const supervisorAsignadoUser = jobOffer.supervisorAsignado
        ? await this.getUser(jobOffer.supervisorAsignado)
        : undefined;

      if (cargo && creadoPorUser) {
        const departamento = this.departamentos.get(cargo.departamentoId);
        if (departamento) {
          const gerencia = this.gerencias.get(departamento.gerenciaId);
          if (gerencia) {
            // Calculate applications count
            const applicationsCount = Array.from(
              this.jobApplications.values(),
            ).filter((app) => app.jobOfferId === jobOffer.id).length;

            allJobOffers.push({
              ...jobOffer,
              cargo: {
                ...cargo,
                departamento: {
                  ...departamento,
                  gerencia,
                },
              },
              creadoPorUser,
              supervisorAsignadoUser,
              applicationsCount,
            });
          }
        }
      }
    }

    return allJobOffers;
  }

  async getJobOffer(id: string): Promise<JobOfferWithRelations | undefined> {
    const jobOffer = this.jobOffers.get(id);
    if (!jobOffer) return undefined;

    const cargo = this.cargos.get(jobOffer.cargoId);
    const creadoPorUser = await this.getUser(jobOffer.creadoPor);
    const supervisorAsignadoUser = jobOffer.supervisorAsignado
      ? await this.getUser(jobOffer.supervisorAsignado)
      : undefined;

    if (!cargo || !creadoPorUser) return undefined;

    const departamento = this.departamentos.get(cargo.departamentoId);
    if (!departamento) return undefined;

    const gerencia = this.gerencias.get(departamento.gerenciaId);
    if (!gerencia) return undefined;

    const applicationsCount = Array.from(this.jobApplications.values()).filter(
      (app) => app.jobOfferId === jobOffer.id,
    ).length;

    return {
      ...jobOffer,
      cargo: {
        ...cargo,
        departamento: {
          ...departamento,
          gerencia,
        },
      },
      creadoPorUser,
      supervisorAsignadoUser,
      applicationsCount,
    };
  }

  async createJobOffer(
    jobOfferData: Omit<JobOffer, "id" | "createdAt" | "updatedAt">,
  ): Promise<JobOffer> {
    const id = randomUUID();
    const now = new Date().toISOString() as any;
    const jobOffer: JobOffer = {
      id,
      ...jobOfferData,
      createdAt: now,
      updatedAt: now,
    };
    this.jobOffers.set(id, jobOffer);
    return jobOffer;
  }

  async updateJobOffer(
    id: string,
    updates: Partial<JobOffer>,
  ): Promise<JobOffer | undefined> {
    const jobOffer = this.jobOffers.get(id);
    if (!jobOffer) return undefined;

    const updatedJobOffer: JobOffer = {
      ...jobOffer,
      ...updates,
      id: jobOffer.id,
      createdAt: jobOffer.createdAt,
      updatedAt: new Date().toISOString() as any,
    };
    this.jobOffers.set(id, updatedJobOffer);
    return updatedJobOffer;
  }

  async deleteJobOffer(id: string): Promise<boolean> {
    return this.jobOffers.delete(id);
  }

  // Job Applications methods
  async getJobApplications(): Promise<JobApplicationWithRelations[]> {
    const allApplications: JobApplicationWithRelations[] = [];

    for (const application of this.jobApplications.values()) {
      const jobOffer = await this.getJobOffer(application.jobOfferId);
      const candidate = this.candidates.get(application.candidateId);
      const entrevistadoPorUser = application.entrevistadoPor
        ? await this.getUser(application.entrevistadoPor)
        : undefined;
      const evaluadoPorUser = application.evaluadoPor
        ? await this.getUser(application.evaluadoPor)
        : undefined;

      if (jobOffer && candidate) {
        allApplications.push({
          ...application,
          jobOffer,
          candidate,
          entrevistadoPorUser,
          evaluadoPorUser,
        });
      }
    }

    return allApplications;
  }

  async getJobApplication(
    id: string,
  ): Promise<JobApplicationWithRelations | undefined> {
    const application = this.jobApplications.get(id);
    if (!application) return undefined;

    const jobOffer = await this.getJobOffer(application.jobOfferId);
    const candidate = this.candidates.get(application.candidateId);
    const entrevistadoPorUser = application.entrevistadoPor
      ? await this.getUser(application.entrevistadoPor)
      : undefined;
    const evaluadoPorUser = application.evaluadoPor
      ? await this.getUser(application.evaluadoPor)
      : undefined;

    if (!jobOffer || !candidate) return undefined;

    return {
      ...application,
      jobOffer,
      candidate,
      entrevistadoPorUser,
      evaluadoPorUser,
    };
  }

  async getJobApplicationsByOffer(
    jobOfferId: string,
  ): Promise<JobApplicationWithRelations[]> {
    const allApplications = await this.getJobApplications();
    return allApplications.filter((app) => app.jobOfferId === jobOfferId);
  }

  async getJobApplicationsByCandidate(
    candidateId: string,
  ): Promise<JobApplicationWithRelations[]> {
    const allApplications = await this.getJobApplications();
    return allApplications.filter((app) => app.candidateId === candidateId);
  }

  async createJobApplication(
    applicationData: Omit<JobApplication, "id" | "createdAt" | "updatedAt">,
  ): Promise<JobApplication> {
    const id = randomUUID();
    const now = new Date().toISOString() as any;
    const application: JobApplication = {
      id,
      ...applicationData,
      createdAt: now,
      updatedAt: now,
    };
    this.jobApplications.set(id, application);
    return application;
  }

  async updateJobApplication(
    id: string,
    updates: Partial<JobApplication>,
  ): Promise<JobApplication | undefined> {
    const application = this.jobApplications.get(id);
    if (!application) return undefined;

    const updatedApplication: JobApplication = {
      ...application,
      ...updates,
      id: application.id,
      createdAt: application.createdAt,
      updatedAt: new Date().toISOString() as any,
    };
    this.jobApplications.set(id, updatedApplication);
    return updatedApplication;
  }

  async deleteJobApplication(id: string): Promise<boolean> {
    return this.jobApplications.delete(id);
  }
}

export const storage = process.env.DATABASE_URL
  ? new PostgresStorage()
  : new MemStorage();
