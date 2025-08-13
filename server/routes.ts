import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertEmployeeSchema, insertUserSchema, insertContractSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

const MemoryStoreConstructor = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    store: new MemoryStoreConstructor({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'hr-system-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Datos inválidos", 
          details: validation.error.errors 
        });
      }

      const result = await storage.login(validation.data);
      if (!result) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      // Store user session
      (req.session as any).user = result.user;
      (req.session as any).employee = result.employee;

      res.json({ 
        success: true, 
        user: result.user,
        employee: result.employee
      });
    } catch (error) {
      console.error("[LOGIN_ERROR]", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Error al cerrar sesión" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    const user = (req.session as any)?.user;
    const employee = (req.session as any)?.employee;
    
    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    res.json({ user, employee });
  });

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!(req.session as any)?.user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    next();
  };

  // Dashboard routes
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("[DASHBOARD_STATS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener estadísticas" });
    }
  });

  // Employee routes
  app.get("/api/employees", requireAuth, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("[GET_EMPLOYEES_ERROR]", error);
      res.status(500).json({ error: "Error al obtener empleados" });
    }
  });

  app.get("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
      res.json(employee);
    } catch (error) {
      console.error("[GET_EMPLOYEE_ERROR]", error);
      res.status(500).json({ error: "Error al obtener empleado" });
    }
  });

  app.post("/api/employees", requireAuth, async (req, res) => {
    try {
      // Validate employee data
      const employeeValidation = insertEmployeeSchema.safeParse({
        userId: req.body.userId,
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        birthDate: req.body.birthDate,
        cargoId: req.body.cargoId,
        supervisorId: req.body.supervisorId,
        startDate: req.body.startDate,
        status: req.body.status || "activo"
      });

      if (!employeeValidation.success) {
        return res.status(400).json({ 
          error: "Datos de empleado inválidos", 
          details: employeeValidation.error.errors 
        });
      }

      // If creating new user as well
      let userId = req.body.userId;
      if (!userId && req.body.cedula) {
        const userValidation = insertUserSchema.safeParse({
          cedula: req.body.cedula,
          password: req.body.password || "temporal123",
          role: req.body.role || "empleado",
          isActive: true
        });

        if (!userValidation.success) {
          return res.status(400).json({
            error: "Datos de usuario inválidos",
            details: userValidation.error.errors
          });
        }

        // Check if cedula already exists
        const existingUser = await storage.getUserByCedula(req.body.cedula);
        if (existingUser) {
          return res.status(409).json({ error: "La cédula ya está registrada" });
        }

        const newUser = await storage.createUser(userValidation.data);
        userId = newUser.id;
      }

      const employee = await storage.createEmployee({
        ...employeeValidation.data,
        userId
      });

      // Create contract if provided
      if (req.body.contractType) {
        await storage.createContract({
          employeeId: employee.id,
          type: req.body.contractType,
          startDate: req.body.contractStartDate || req.body.startDate,
          endDate: req.body.contractEndDate || null,
          isActive: true
        });
      }

      const fullEmployee = await storage.getEmployee(employee.id);
      res.status(201).json({ success: true, employee: fullEmployee });
    } catch (error) {
      console.error("[CREATE_EMPLOYEE_ERROR]", error);
      res.status(500).json({ error: "Error al crear empleado" });
    }
  });

  app.get("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
      res.json(employee);
    } catch (error) {
      console.error("[GET_EMPLOYEE_ERROR]", error);
      res.status(500).json({ error: "Error al obtener empleado" });
    }
  });

  app.patch("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      const validation = insertEmployeeSchema.omit({ userId: true }).partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Datos inválidos", 
          details: validation.error.errors 
        });
      }

      const employee = await storage.updateEmployee(req.params.id, validation.data);
      if (!employee) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
      res.json({ success: true, employee });
    } catch (error) {
      console.error("[UPDATE_EMPLOYEE_ERROR]", error);
      res.status(500).json({ error: "Error al actualizar empleado" });
    }
  });

  app.delete("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteEmployee(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("[DELETE_EMPLOYEE_ERROR]", error);
      res.status(500).json({ error: "Error al eliminar empleado" });
    }
  });

  // Organizational structure routes
  app.get("/api/gerencias", requireAuth, async (req, res) => {
    try {
      const gerencias = await storage.getGerencias();
      res.json(gerencias);
    } catch (error) {
      console.error("[GET_GERENCIAS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener gerencias" });
    }
  });

  app.get("/api/departamentos/:gerenciaId", requireAuth, async (req, res) => {
    try {
      const departamentos = await storage.getDepartamentosByGerencia(req.params.gerenciaId);
      res.json(departamentos);
    } catch (error) {
      console.error("[GET_DEPARTAMENTOS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener departamentos" });
    }
  });

  app.get("/api/cargos/:departamentoId", requireAuth, async (req, res) => {
    try {
      const cargos = await storage.getCargosByDepartamento(req.params.departamentoId);
      res.json(cargos);
    } catch (error) {
      console.error("[GET_CARGOS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener cargos" });
    }
  });

  // Contract routes
  app.get("/api/contracts", requireAuth, async (req, res) => {
    try {
      const contracts = await storage.getContracts();
      res.json(contracts);
    } catch (error) {
      console.error("[GET_CONTRACTS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener contratos" });
    }
  });

  app.get("/api/contracts/:id", requireAuth, async (req, res) => {
    try {
      const contract = await storage.getContract(req.params.id);
      if (!contract) {
        return res.status(404).json({ error: "Contrato no encontrado" });
      }
      res.json(contract);
    } catch (error) {
      console.error("[GET_CONTRACT_ERROR]", error);
      res.status(500).json({ error: "Error al obtener contrato" });
    }
  });

  app.get("/api/contracts/expiring-soon", requireAuth, async (req, res) => {
    try {
      const contracts = await storage.getExpiringContracts();
      res.json(contracts);
    } catch (error) {
      console.error("[GET_EXPIRING_CONTRACTS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener contratos por vencer" });
    }
  });

  app.get("/api/employees/:employeeId/contracts", requireAuth, async (req, res) => {
    try {
      const contracts = await storage.getContractsByEmployee(req.params.employeeId);
      res.json(contracts);
    } catch (error) {
      console.error("[GET_EMPLOYEE_CONTRACTS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener contratos del empleado" });
    }
  });

  app.post("/api/contracts", requireAuth, async (req, res) => {
    try {
      const validation = insertContractSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Datos inválidos", 
          details: validation.error.errors 
        });
      }

      const contract = await storage.createContract(validation.data);
      res.status(201).json({ success: true, contract });
    } catch (error) {
      console.error("[CREATE_CONTRACT_ERROR]", error);
      res.status(500).json({ error: "Error al crear contrato" });
    }
  });

  app.put("/api/contracts/:id", requireAuth, async (req, res) => {
    try {
      const validation = insertContractSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Datos inválidos", 
          details: validation.error.errors 
        });
      }

      const contract = await storage.updateContract(req.params.id, validation.data);
      if (!contract) {
        return res.status(404).json({ error: "Contrato no encontrado" });
      }
      res.json({ success: true, contract });
    } catch (error) {
      console.error("[UPDATE_CONTRACT_ERROR]", error);
      res.status(500).json({ error: "Error al actualizar contrato" });
    }
  });

  app.delete("/api/contracts/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteContract(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Contrato no encontrado" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("[DELETE_CONTRACT_ERROR]", error);
      res.status(500).json({ error: "Error al eliminar contrato" });
    }
  });

  app.get("/api/contracts/expiring-soon", requireAuth, async (req, res) => {
    try {
      const expiringContracts = await storage.getExpiringContracts();
      res.json(expiringContracts);
    } catch (error) {
      console.error("[GET_EXPIRING_CONTRACTS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener contratos por vencer" });
    }
  });

  app.get("/api/contracts/expiring-soon", requireAuth, async (req, res) => {
    try {
      const contracts = await storage.getExpiringContracts();
      res.json(contracts);
    } catch (error) {
      console.error("[GET_EXPIRING_CONTRACTS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener contratos por vencer" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
