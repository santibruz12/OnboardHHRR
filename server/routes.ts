import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertEmployeeSchema, insertUserSchema, insertContractSchema, insertCandidateSchema, insertProbationPeriodSchema, insertEgresoSchema, insertJobOfferSchema, insertJobApplicationSchema } from "@shared/schema";
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
      console.log("[CREATE_EMPLOYEE_REQUEST]", JSON.stringify(req.body, null, 2));
      
      // If creating new user as well (most common case)
      let userId = req.body.userId;
      if (!userId && req.body.cedula) {
        const userValidation = insertUserSchema.safeParse({
          cedula: req.body.cedula,
          password: req.body.password || "temporal123",
          role: req.body.role || "empleado",
          isActive: true
        });

        if (!userValidation.success) {
          console.log("[USER_VALIDATION_ERROR]", userValidation.error.errors);
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

      // Now validate employee data with the userId
      const employeeValidation = insertEmployeeSchema.safeParse({
        userId: userId,
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
        console.log("[EMPLOYEE_VALIDATION_ERROR]", employeeValidation.error.errors);
        return res.status(400).json({ 
          error: "Datos de empleado inválidos", 
          details: employeeValidation.error.errors 
        });
      }

      const employee = await storage.createEmployee(employeeValidation.data);

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

  // Candidate routes
  app.get("/api/candidates", requireAuth, async (req, res) => {
    try {
      const candidates = await storage.getCandidates();
      res.json(candidates);
    } catch (error) {
      console.error("[GET_CANDIDATES_ERROR]", error);
      res.status(500).json({ error: "Error al obtener candidatos" });
    }
  });

  app.get("/api/candidates/:id", requireAuth, async (req, res) => {
    try {
      const candidate = await storage.getCandidate(req.params.id);
      if (!candidate) {
        return res.status(404).json({ error: "Candidato no encontrado" });
      }
      res.json(candidate);
    } catch (error) {
      console.error("[GET_CANDIDATE_ERROR]", error);
      res.status(500).json({ error: "Error al obtener candidato" });
    }
  });

  app.post("/api/candidates", requireAuth, async (req, res) => {
    try {
      console.log("[CREATE_CANDIDATE_REQUEST]", JSON.stringify(req.body, null, 2));
      
      const validation = insertCandidateSchema.safeParse({
        cedula: req.body.cedula,
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        birthDate: req.body.birthDate,
        cargoId: req.body.cargoId,
        cvUrl: req.body.cvUrl,
        notes: req.body.notes,
        status: req.body.status || "en_evaluacion",
        submittedBy: (req as any).user.id,
        evaluatedBy: req.body.evaluatedBy || null,
        evaluationNotes: req.body.evaluationNotes || null,
        evaluationDate: req.body.evaluationDate || null
      });

      if (!validation.success) {
        console.log("[CANDIDATE_VALIDATION_ERROR]", validation.error.errors);
        return res.status(400).json({ 
          error: "Datos de candidato inválidos", 
          details: validation.error.errors 
        });
      }

      const candidate = await storage.createCandidate(validation.data);
      const fullCandidate = await storage.getCandidate(candidate.id);
      res.status(201).json({ success: true, candidate: fullCandidate });
    } catch (error) {
      console.error("[CREATE_CANDIDATE_ERROR]", error);
      res.status(500).json({ error: "Error al crear candidato" });
    }
  });

  app.patch("/api/candidates/:id", requireAuth, async (req, res) => {
    try {
      const validation = insertCandidateSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Datos inválidos", 
          details: validation.error.errors 
        });
      }

      const candidate = await storage.updateCandidate(req.params.id, validation.data);
      if (!candidate) {
        return res.status(404).json({ error: "Candidato no encontrado" });
      }
      res.json({ success: true, candidate });
    } catch (error) {
      console.error("[UPDATE_CANDIDATE_ERROR]", error);
      res.status(500).json({ error: "Error al actualizar candidato" });
    }
  });

  app.delete("/api/candidates/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteCandidate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Candidato no encontrado" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("[DELETE_CANDIDATE_ERROR]", error);
      res.status(500).json({ error: "Error al eliminar candidato" });
    }
  });

  // Probation Periods routes
  app.get("/api/probation-periods", requireAuth, async (req, res) => {
    try {
      const probationPeriods = await storage.getProbationPeriods();
      res.json(probationPeriods);
    } catch (error) {
      console.error("[GET_PROBATION_PERIODS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener períodos de prueba" });
    }
  });

  app.get("/api/probation-periods/:id", requireAuth, async (req, res) => {
    try {
      const probationPeriod = await storage.getProbationPeriod(req.params.id);
      if (!probationPeriod) {
        return res.status(404).json({ error: "Período de prueba no encontrado" });
      }
      res.json(probationPeriod);
    } catch (error) {
      console.error("[GET_PROBATION_PERIOD_ERROR]", error);
      res.status(500).json({ error: "Error al obtener período de prueba" });
    }
  });

  app.get("/api/probation-periods-expiring-soon", requireAuth, async (req, res) => {
    try {
      const expiringProbationPeriods = await storage.getExpiringProbationPeriods();
      res.json(expiringProbationPeriods);
    } catch (error) {
      console.error("[GET_EXPIRING_PROBATION_PERIODS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener períodos de prueba por vencer" });
    }
  });

  app.get("/api/employees/:employeeId/probation-periods", requireAuth, async (req, res) => {
    try {
      const probationPeriods = await storage.getProbationPeriodsByEmployee(req.params.employeeId);
      res.json(probationPeriods);
    } catch (error) {
      console.error("[GET_EMPLOYEE_PROBATION_PERIODS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener períodos de prueba del empleado" });
    }
  });

  app.post("/api/probation-periods", requireAuth, async (req, res) => {
    try {
      console.log("[CREATE_PROBATION_PERIOD_REQUEST]", JSON.stringify(req.body, null, 2));
      
      const validation = insertProbationPeriodSchema.safeParse({
        ...req.body,
        status: req.body.status || "activo",
        evaluatedBy: req.body.evaluatedBy || null,
        evaluationNotes: req.body.evaluationNotes || null,
        evaluationDate: req.body.evaluationDate || null,
        extensionReason: req.body.extensionReason || null,
        approved: req.body.approved !== undefined ? req.body.approved : null
      });
      if (!validation.success) {
        console.log("[PROBATION_PERIOD_VALIDATION_ERROR]", validation.error.errors);
        return res.status(400).json({ 
          error: "Datos de período de prueba inválidos", 
          details: validation.error.errors 
        });
      }

      const probationPeriod = await storage.createProbationPeriod(validation.data);
      const fullProbationPeriod = await storage.getProbationPeriod(probationPeriod.id);
      res.status(201).json({ success: true, probationPeriod: fullProbationPeriod });
    } catch (error) {
      console.error("[CREATE_PROBATION_PERIOD_ERROR]", error);
      res.status(500).json({ error: "Error al crear período de prueba" });
    }
  });

  app.patch("/api/probation-periods/:id", requireAuth, async (req, res) => {
    try {
      const validation = insertProbationPeriodSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Datos inválidos", 
          details: validation.error.errors 
        });
      }

      const probationPeriod = await storage.updateProbationPeriod(req.params.id, validation.data);
      if (!probationPeriod) {
        return res.status(404).json({ error: "Período de prueba no encontrado" });
      }
      res.json({ success: true, probationPeriod });
    } catch (error) {
      console.error("[UPDATE_PROBATION_PERIOD_ERROR]", error);
      res.status(500).json({ error: "Error al actualizar período de prueba" });
    }
  });

  app.delete("/api/probation-periods/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteProbationPeriod(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Período de prueba no encontrado" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("[DELETE_PROBATION_PERIOD_ERROR]", error);
      res.status(500).json({ error: "Error al eliminar período de prueba" });
    }
  });

  // Egresos routes
  app.get("/api/egresos", requireAuth, async (req, res) => {
    try {
      const egresos = await storage.getEgresos();
      res.json(egresos);
    } catch (error) {
      console.error("[GET_EGRESOS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener egresos" });
    }
  });

  app.get("/api/egresos/:id", requireAuth, async (req, res) => {
    try {
      const egreso = await storage.getEgreso(req.params.id);
      if (!egreso) {
        return res.status(404).json({ error: "Egreso no encontrado" });
      }
      res.json(egreso);
    } catch (error) {
      console.error("[GET_EGRESO_ERROR]", error);
      res.status(500).json({ error: "Error al obtener egreso" });
    }
  });

  app.post("/api/egresos", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const validation = insertEgresoSchema.safeParse({
        ...req.body,
        status: req.body.status || "solicitado",
        solicitadoPor: user.id,
        aprobadoPor: req.body.aprobadoPor || null,
        fechaAprobacion: req.body.fechaAprobacion || null,
        fechaEfectiva: req.body.fechaEfectiva || null,
        motivoRechazo: req.body.motivoRechazo || null,
        observaciones: req.body.observaciones || null,
        documentosEntregados: req.body.documentosEntregados || null,
        activosEntregados: req.body.activosEntregados || null,
        liquidacionCalculada: req.body.liquidacionCalculada || null
      });

      if (!validation.success) {
        return res.status(400).json({ 
          error: "Datos de egreso inválidos", 
          details: validation.error.errors 
        });
      }

      const egreso = await storage.createEgreso(validation.data);
      const fullEgreso = await storage.getEgreso(egreso.id);
      res.status(201).json({ success: true, egreso: fullEgreso });
    } catch (error) {
      console.error("[CREATE_EGRESO_ERROR]", error);
      res.status(500).json({ error: "Error al crear egreso" });
    }
  });

  app.patch("/api/egresos/:id", requireAuth, async (req, res) => {
    try {
      const validation = insertEgresoSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Datos inválidos", 
          details: validation.error.errors 
        });
      }

      const egreso = await storage.updateEgreso(req.params.id, validation.data);
      if (!egreso) {
        return res.status(404).json({ error: "Egreso no encontrado" });
      }
      res.json({ success: true, egreso });
    } catch (error) {
      console.error("[UPDATE_EGRESO_ERROR]", error);
      res.status(500).json({ error: "Error al actualizar egreso" });
    }
  });

  // Job Offers routes
  app.get("/api/job-offers", requireAuth, async (req, res) => {
    try {
      const jobOffers = await storage.getJobOffers();
      res.json(jobOffers);
    } catch (error) {
      console.error("[GET_JOB_OFFERS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener ofertas de trabajo" });
    }
  });

  app.get("/api/job-offers/:id", requireAuth, async (req, res) => {
    try {
      const jobOffer = await storage.getJobOffer(req.params.id);
      if (!jobOffer) {
        return res.status(404).json({ error: "Oferta de trabajo no encontrada" });
      }
      res.json(jobOffer);
    } catch (error) {
      console.error("[GET_JOB_OFFER_ERROR]", error);
      res.status(500).json({ error: "Error al obtener oferta de trabajo" });
    }
  });

  app.post("/api/job-offers", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user || !user.id) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const validation = insertJobOfferSchema.safeParse({
        ...req.body,
        status: req.body.status || "borrador",
        creadoPor: user.id,
        experienciaRequerida: req.body.experienciaRequerida || null,
        educacionRequerida: req.body.educacionRequerida || null,
        habilidadesRequeridas: req.body.habilidadesRequeridas || null,
        modalidadTrabajo: req.body.modalidadTrabajo || null,
        ubicacion: req.body.ubicacion || null,
        fechaInicioPublicacion: req.body.fechaInicioPublicacion || null,
        fechaCierrePublicacion: req.body.fechaCierrePublicacion || null,
        supervisorAsignado: req.body.supervisorAsignado || null,
        notas: req.body.notas || null
      });

      if (!validation.success) {
        return res.status(400).json({ 
          error: "Datos de oferta inválidos", 
          details: validation.error.errors 
        });
      }

      const jobOffer = await storage.createJobOffer(validation.data);
      const fullJobOffer = await storage.getJobOffer(jobOffer.id);
      res.status(201).json({ success: true, jobOffer: fullJobOffer });
    } catch (error) {
      console.error("[CREATE_JOB_OFFER_ERROR]", error);
      res.status(500).json({ error: "Error al crear oferta de trabajo" });
    }
  });

  app.patch("/api/job-offers/:id", requireAuth, async (req, res) => {
    try {
      const validation = insertJobOfferSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Datos inválidos", 
          details: validation.error.errors 
        });
      }

      const jobOffer = await storage.updateJobOffer(req.params.id, validation.data);
      if (!jobOffer) {
        return res.status(404).json({ error: "Oferta de trabajo no encontrada" });
      }
      res.json({ success: true, jobOffer });
    } catch (error) {
      console.error("[UPDATE_JOB_OFFER_ERROR]", error);
      res.status(500).json({ error: "Error al actualizar oferta de trabajo" });
    }
  });

  // Job Applications routes
  app.get("/api/job-applications", requireAuth, async (req, res) => {
    try {
      const applications = await storage.getJobApplications();
      res.json(applications);
    } catch (error) {
      console.error("[GET_JOB_APPLICATIONS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener aplicaciones" });
    }
  });

  app.get("/api/job-offers/:jobOfferId/applications", requireAuth, async (req, res) => {
    try {
      const applications = await storage.getJobApplicationsByOffer(req.params.jobOfferId);
      res.json(applications);
    } catch (error) {
      console.error("[GET_JOB_OFFER_APPLICATIONS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener aplicaciones de la oferta" });
    }
  });

  app.post("/api/job-applications", requireAuth, async (req, res) => {
    try {
      const validation = insertJobApplicationSchema.safeParse({
        ...req.body,
        status: req.body.status || "aplicado",
        fechaAplicacion: req.body.fechaAplicacion || new Date().toISOString(),
        fechaEntrevista: req.body.fechaEntrevista || null,
        entrevistadoPor: req.body.entrevistadoPor || null,
        notasEntrevista: req.body.notasEntrevista || null,
        evaluadoPor: req.body.evaluadoPor || null,
        notasEvaluacion: req.body.notasEvaluacion || null,
        fechaEvaluacion: req.body.fechaEvaluacion || null
      });
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Datos de aplicación inválidos", 
          details: validation.error.errors 
        });
      }

      const application = await storage.createJobApplication(validation.data);
      const fullApplication = await storage.getJobApplication(application.id);
      res.status(201).json({ success: true, application: fullApplication });
    } catch (error) {
      console.error("[CREATE_JOB_APPLICATION_ERROR]", error);
      res.status(500).json({ error: "Error al crear aplicación" });
    }
  });

  app.patch("/api/job-applications/:id", requireAuth, async (req, res) => {
    try {
      const validation = insertJobApplicationSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Datos inválidos", 
          details: validation.error.errors 
        });
      }

      const application = await storage.updateJobApplication(req.params.id, validation.data);
      if (!application) {
        return res.status(404).json({ error: "Aplicación no encontrada" });
      }
      res.json({ success: true, application });
    } catch (error) {
      console.error("[UPDATE_JOB_APPLICATION_ERROR]", error);
      res.status(500).json({ error: "Error al actualizar aplicación" });
    }
  });

  // Dashboard route
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("[GET_DASHBOARD_STATS_ERROR]", error);
      res.status(500).json({ error: "Error al obtener estadísticas" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
