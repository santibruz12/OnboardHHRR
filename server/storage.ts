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
  type EmployeeWithRelations,
  type DashboardStats,
  type LoginData
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

    return {
      totalEmployees,
      probationEmployees,
      newCandidates,
      expiringContracts,
      totalContracts,
      activeContracts,
      indefiniteContracts
    };
  }
}

export const storage = new MemStorage();
