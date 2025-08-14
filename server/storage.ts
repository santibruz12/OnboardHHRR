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
  type EmployeeWithRelations,
  type DashboardStats,
  type LoginData,
  insertCandidateSchema,
  insertProbationPeriodSchema
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Auth
  login(credentials: LoginData): Promise<{ user: User; employee?: EmployeeWithRelations } | null>;
  
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByCedula(cedula: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Employees
  getEmployees(): Promise<EmployeeWithRelations[]>;
  getEmployee(id: string): Promise<EmployeeWithRelations | undefined>;
  getEmployeeByUserId(userId: string): Promise<EmployeeWithRelations | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;

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
  updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract | undefined>;
  deleteContract(id: string): Promise<boolean>;
  getExpiringContracts(): Promise<Contract[]>;

  // Candidates
  getCandidates(): Promise<CandidateWithRelations[]>;
  getCandidate(id: string): Promise<CandidateWithRelations | undefined>;
  createCandidate(candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Candidate>;
  updateCandidate(id: string, candidate: Partial<Candidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: string): Promise<boolean>;

  // Probation Periods
  getProbationPeriods(): Promise<ProbationPeriodWithRelations[]>;
  getProbationPeriod(id: string): Promise<ProbationPeriodWithRelations | undefined>;
  getProbationPeriodsByEmployee(employeeId: string): Promise<ProbationPeriodWithRelations[]>;
  createProbationPeriod(probationPeriod: Omit<ProbationPeriod, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProbationPeriod>;
  updateProbationPeriod(id: string, probationPeriod: Partial<ProbationPeriod>): Promise<ProbationPeriod | undefined>;
  deleteProbationPeriod(id: string): Promise<boolean>;
  getExpiringProbationPeriods(): Promise<ProbationPeriodWithRelations[]>;

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
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

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    // Create default organizational structure
    const gerenciaRRHH = await this.createGerencia({
      name: "Gerencia de RRHH",
      description: "Gestión de Recursos Humanos"
    });

    const gerenciaOps = await this.createGerencia({
      name: "Gerencia de Operaciones", 
      description: "Operaciones y Producción"
    });

    const deptRRHH = await this.createDepartamento({
      name: "Administración de Personal",
      gerenciaId: gerenciaRRHH.id
    });

    const deptReclutamiento = await this.createDepartamento({
      name: "Reclutamiento y Selección",
      gerenciaId: gerenciaRRHH.id
    });

    const cargoGerente = await this.createCargo({
      name: "Gerente RRHH",
      departamentoId: deptRRHH.id
    });

    const cargoAnalista = await this.createCargo({
      name: "Analista RRHH",
      departamentoId: deptRRHH.id
    });

    // Create default admin user
    const adminUser = await this.createUser({
      cedula: "V-12345678",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
      isActive: true
    });

    // Create admin employee
    const adminEmployee = await this.createEmployee({
      userId: adminUser.id,
      fullName: "María Pérez",
      email: "maria.perez@empresa.com",
      phone: "+58 412-1234567",
      cargoId: cargoGerente.id,
      startDate: new Date().toISOString().split('T')[0] as any,
      status: "activo"
    });

    // Create some sample contracts
    await this.createContract({
      employeeId: adminEmployee.id,
      type: "indefinido",
      startDate: new Date().toISOString().split('T')[0] as any,
      endDate: null,
      isActive: true
    });

    // Create a contract expiring soon for demo
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 20);
    
    await this.createContract({
      employeeId: adminEmployee.id,
      type: "determinado",
      startDate: new Date().toISOString().split('T')[0] as any,
      endDate: futureDate.toISOString().split('T')[0] as any,
      isActive: true
    });

    // Create some sample candidates
    await this.createCandidate({
      cedula: "V-23456789",
      fullName: "Carlos Rodríguez",
      email: "carlos.rodriguez@example.com",
      phone: "+58 414-2345678",
      birthDate: "1990-05-15",
      cargoId: cargoAnalista.id,
      status: "en_evaluacion",
      submittedBy: adminUser.id,
      notes: "Candidato con experiencia en análisis de datos"
    });

    await this.createCandidate({
      cedula: "V-34567890",
      fullName: "Ana García",
      email: "ana.garcia@example.com",
      phone: "+58 412-3456789",
      birthDate: "1985-08-22",
      cargoId: cargoAnalista.id,
      status: "entrevista",
      submittedBy: adminUser.id,
      evaluatedBy: adminUser.id,
      evaluationDate: new Date().toISOString().split('T')[0],
      evaluationNotes: "Candidato con excelentes referencias",
      notes: "Experiencia previa en recursos humanos"
    });

    // Create sample probation periods
    const probationStartDate = new Date();
    probationStartDate.setDate(probationStartDate.getDate() - 60); // Started 60 days ago
    const probationEndDate = new Date();
    probationEndDate.setDate(probationEndDate.getDate() + 30); // Ends in 30 days

    await this.createProbationPeriod({
      employeeId: adminEmployee.id,
      startDate: probationStartDate.toISOString().split('T')[0] as any,
      endDate: probationEndDate.toISOString().split('T')[0] as any,
      status: "activo",
      evaluationNotes: "Empleado muestra buen desempeño durante el período de prueba",
      supervisorRecommendation: "Recomiendo la confirmación del empleado",
      hrNotes: "Cumple con los objetivos establecidos para el período de prueba"
    });

    // Create another probation period that expires soon
    const urgentProbationEnd = new Date();
    urgentProbationEnd.setDate(urgentProbationEnd.getDate() + 15); // Expires in 15 days

    const urgentProbationStart = new Date();
    urgentProbationStart.setDate(urgentProbationStart.getDate() - 75); // Started 75 days ago

    await this.createProbationPeriod({
      employeeId: adminEmployee.id,
      startDate: urgentProbationStart.toISOString().split('T')[0] as any,
      endDate: urgentProbationEnd.toISOString().split('T')[0] as any,
      status: "activo",
      evaluationNotes: "Período de prueba próximo a vencer, requiere evaluación",
      supervisorRecommendation: "Pendiente de evaluación final"
    });
  }

  async login(credentials: LoginData): Promise<{ user: User; employee?: EmployeeWithRelations } | null> {
    const user = await this.getUserByCedula(credentials.cedula);
    if (!user || !user.isActive) return null;

    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) return null;

    const employee = await this.getEmployeeByUserId(user.id);
    return { user, employee };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByCedula(cedula: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.cedula === cedula);
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
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
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
      const gerencia = departamento ? this.gerencias.get(departamento.gerenciaId) : undefined;
      
      if (!departamento || !gerencia) continue;

      const supervisor = employee.supervisorId ? this.employees.get(employee.supervisorId) : undefined;
      const contracts = await this.getContractsByEmployee(employee.id);
      const activeContract = contracts.find(c => c.isActive);

      result.push({
        ...employee,
        user,
        cargo: {
          ...cargo,
          departamento: {
            ...departamento,
            gerencia
          }
        },
        supervisor,
        contract: activeContract
      });
    }

    return result;
  }

  async getEmployee(id: string): Promise<EmployeeWithRelations | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;

    const employees = await this.getEmployees();
    return employees.find(e => e.id === id);
  }

  async getEmployeeByUserId(userId: string): Promise<EmployeeWithRelations | undefined> {
    const employees = await this.getEmployees();
    return employees.find(e => e.userId === userId);
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
      updatedAt: new Date()
    };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: string, updateData: Partial<InsertEmployee>): Promise<EmployeeWithRelations | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;

    const updatedEmployee = { 
      ...employee, 
      ...updateData, 
      id: employee.id,
      userId: employee.userId,
      createdAt: employee.createdAt,
      updatedAt: new Date() 
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

  async getDepartamentosByGerencia(gerenciaId: string): Promise<Departamento[]> {
    return Array.from(this.departamentos.values()).filter(dept => dept.gerenciaId === gerenciaId);
  }

  async getCargosByDepartamento(departamentoId: string): Promise<Cargo[]> {
    return Array.from(this.cargos.values()).filter(cargo => cargo.departamentoId === departamentoId);
  }

  async createGerencia(insertGerencia: InsertGerencia): Promise<Gerencia> {
    const id = randomUUID();
    const gerencia: Gerencia = {
      id,
      name: insertGerencia.name,
      description: insertGerencia.description || null,
      createdAt: new Date()
    };
    this.gerencias.set(id, gerencia);
    return gerencia;
  }

  async createDepartamento(insertDepartamento: InsertDepartamento): Promise<Departamento> {
    const id = randomUUID();
    const departamento: Departamento = {
      id,
      name: insertDepartamento.name,

      gerenciaId: insertDepartamento.gerenciaId,
      createdAt: new Date()
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
      createdAt: new Date()
    };
    this.cargos.set(id, cargo);
    return cargo;
  }

  async getContractsByEmployee(employeeId: string): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(contract => contract.employeeId === employeeId);
  }

  async getContracts(): Promise<Contract[]> {
    return Array.from(this.contracts.values());
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
      createdAt: new Date()
    };
    this.contracts.set(id, contract);
    return contract;
  }

  async updateContract(id: string, updates: Partial<InsertContract>): Promise<Contract | undefined> {
    const contract = this.contracts.get(id);
    if (!contract) return undefined;
    
    const updatedContract: Contract = {
      ...contract,
      ...updates,
      id: contract.id,
      createdAt: contract.createdAt
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

      const evaluatedByUser = candidate.evaluatedBy ? this.users.get(candidate.evaluatedBy) : undefined;

      results.push({
        ...candidate,
        cargo: {
          ...cargo,
          departamento: {
            ...departamento,
            gerencia
          }
        },
        submittedByUser,
        evaluatedByUser
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

    const evaluatedByUser = candidate.evaluatedBy ? this.users.get(candidate.evaluatedBy) : undefined;

    return {
      ...candidate,
      cargo: {
        ...cargo,
        departamento: {
          ...departamento,
          gerencia
        }
      },
      submittedByUser,
      evaluatedByUser
    };
  }

  async createCandidate(candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>): Promise<Candidate> {
    const id = randomUUID();
    const now = new Date().toISOString() as any;
    const candidate: Candidate = {
      id,
      ...candidateData,
      createdAt: now,
      updatedAt: now
    };
    this.candidates.set(id, candidate);
    return candidate;
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate | undefined> {
    const candidate = this.candidates.get(id);
    if (!candidate) return undefined;
    
    const updatedCandidate: Candidate = {
      ...candidate,
      ...updates,
      id: candidate.id,
      createdAt: candidate.createdAt,
      updatedAt: new Date().toISOString() as any
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

      const evaluatedByUser = probationPeriod.evaluatedBy ? this.users.get(probationPeriod.evaluatedBy) : undefined;

      results.push({
        ...probationPeriod,
        employee: {
          ...employee,
          user,
          cargo: {
            ...cargo,
            departamento: {
              ...departamento,
              gerencia
            }
          }
        },
        evaluatedByUser
      });
    }

    return results;
  }

  async getProbationPeriod(id: string): Promise<ProbationPeriodWithRelations | undefined> {
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

    const evaluatedByUser = probationPeriod.evaluatedBy ? this.users.get(probationPeriod.evaluatedBy) : undefined;

    return {
      ...probationPeriod,
      employee: {
        ...employee,
        user,
        cargo: {
          ...cargo,
          departamento: {
            ...departamento,
            gerencia
          }
        }
      },
      evaluatedByUser
    };
  }

  async getProbationPeriodsByEmployee(employeeId: string): Promise<ProbationPeriodWithRelations[]> {
    const allProbationPeriods = await this.getProbationPeriods();
    return allProbationPeriods.filter(pp => pp.employeeId === employeeId);
  }

  async createProbationPeriod(probationPeriodData: Omit<ProbationPeriod, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProbationPeriod> {
    const id = randomUUID();
    const now = new Date().toISOString() as any;
    const probationPeriod: ProbationPeriod = {
      id,
      ...probationPeriodData,
      createdAt: now,
      updatedAt: now
    };
    this.probationPeriods.set(id, probationPeriod);
    return probationPeriod;
  }

  async updateProbationPeriod(id: string, updates: Partial<ProbationPeriod>): Promise<ProbationPeriod | undefined> {
    const probationPeriod = this.probationPeriods.get(id);
    if (!probationPeriod) return undefined;
    
    const updatedProbationPeriod: ProbationPeriod = {
      ...probationPeriod,
      ...updates,
      id: probationPeriod.id,
      createdAt: probationPeriod.createdAt,
      updatedAt: new Date().toISOString() as any
    };
    this.probationPeriods.set(id, updatedProbationPeriod);
    return updatedProbationPeriod;
  }

  async deleteProbationPeriod(id: string): Promise<boolean> {
    return this.probationPeriods.delete(id);
  }

  async getExpiringProbationPeriods(): Promise<ProbationPeriodWithRelations[]> {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    const allProbationPeriods = await this.getProbationPeriods();
    return allProbationPeriods.filter(probationPeriod => {
      if (probationPeriod.status !== "activo") return false;
      const endDate = new Date(probationPeriod.endDate);
      return endDate >= today && endDate <= thirtyDaysFromNow;
    });
  }

  async getExpiringContracts(): Promise<Contract[]> {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    return Array.from(this.contracts.values()).filter(contract => {
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
    const probationEmployees = employees.filter(e => e.status === "periodo_prueba").length;
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(c => c.isActive).length;
    const indefiniteContracts = contracts.filter(c => c.type === "indefinido").length;
    const expiringContracts = expiringContractsList.length;
    
    // Mock data for demo
    const newCandidates = 15;

    const candidates = await this.getCandidates();
    const totalCandidates = candidates.length;
    const candidatesInEvaluation = candidates.filter(c => c.status === "en_evaluacion").length;
    const approvedCandidates = candidates.filter(c => c.status === "aprobado").length;

    const probationPeriods = await this.getProbationPeriods();
    const activeProbationPeriods = probationPeriods.filter(pp => pp.status === "activo").length;
    const expiringProbationPeriods = (await this.getExpiringProbationPeriods()).length;

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
      expiringProbationPeriods
    };
  }
}

export const storage = new MemStorage();
