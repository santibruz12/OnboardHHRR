import {
  type Usuario,
  type InsertUsuario,
  type Empleado,
  type InsertEmpleado,
  type Gerencia,
  type InsertGerencia,
  type Departamento,
  type InsertDepartamento,
  type Cargo,
  type InsertCargo,
  type Contrato,
  type InsertContrato,
  type Candidato,
  type CandidatoConRelaciones,
  type PeriodoPrueba,
  type PeriodoPruebaConRelaciones,
  type Egreso,
  type EgresoConRelaciones,
  type OfertaTrabajo,
  type OfertaTrabajoConRelaciones,
  type Postulacion,
  type PostulacionConRelaciones,
  type EmpleadoConRelaciones,
  type EstadisticasTablero,
  type DatosLogin,
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import type { IStorage } from "./storage";

export class DatosPruebaStorage implements IStorage {
  private usuarios: Usuario[] = [];
  private empleados: Empleado[] = [];
  private gerencias: Gerencia[] = [];
  private departamentos: Departamento[] = [];
  private cargos: Cargo[] = [];
  private contratos: Contrato[] = [];
  private candidatos: Candidato[] = [];
  private periodosPrueba: PeriodoPrueba[] = [];
  private egresos: Egreso[] = [];
  private ofertasTrabajo: OfertaTrabajo[] = [];
  private postulaciones: Postulacion[] = [];

  constructor() {
    this.inicializarDatosPrueba();
  }

  private async inicializarDatosPrueba() {
    // Crear usuarios base
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const adminUser: Usuario = {
      id: "admin-1",
      cedula: "V-12345678",
      contraseña: hashedPassword,
      rol: "admin",
      estaActivo: true,
      ultimoLogin: new Date(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };

    const rrhhUser: Usuario = {
      id: "rrhh-1",
      cedula: "V-87654321",
      contraseña: hashedPassword,
      rol: "rrhh",
      estaActivo: true,
      ultimoLogin: new Date(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };

    this.usuarios = [adminUser, rrhhUser];

    // Crear gerencias
    this.gerencias = [
      {
        id: "ger-1",
        nombre: "Gerencia de Tecnología",
        descripcion: "Gestión de desarrollo tecnológico",
        gerenteId: adminUser.id,
        estaActivo: true,
        fechaCreacion: new Date()
      },
      {
        id: "ger-2",
        nombre: "Gerencia de Recursos Humanos",
        descripcion: "Gestión del talento humano",
        gerenteId: rrhhUser.id,
        estaActivo: true,
        fechaCreacion: new Date()
      }
    ];

    // Crear departamentos
    this.departamentos = [
      {
        id: "dep-1",
        nombre: "Desarrollo de Software",
        descripcion: "Desarrollo de aplicaciones",
        gerenciaId: "ger-1",
        jefeId: adminUser.id,
        estaActivo: true,
        fechaCreacion: new Date()
      },
      {
        id: "dep-2",
        nombre: "Selección y Reclutamiento",
        descripcion: "Búsqueda y selección de personal",
        gerenciaId: "ger-2",
        jefeId: rrhhUser.id,
        estaActivo: true,
        fechaCreacion: new Date()
      }
    ];

    // Crear cargos
    this.cargos = [
      {
        id: "car-1",
        nombre: "Desarrollador Senior",
        descripcion: "Desarrollo de aplicaciones web",
        departamentoId: "dep-1",
        salarioBase: 45000,
        nivelJerarquico: 3,
        requiereSupervision: false,
        estaActivo: true,
        fechaCreacion: new Date()
      },
      {
        id: "car-2",
        nombre: "Analista de RRHH",
        descripcion: "Análisis y gestión de recursos humanos",
        departamentoId: "dep-2",
        salarioBase: 35000,
        nivelJerarquico: 2,
        requiereSupervision: true,
        estaActivo: true,
        fechaCreacion: new Date()
      }
    ];

    // Crear empleados
    this.empleados = [
      {
        id: "emp-1",
        usuarioId: adminUser.id,
        nombres: "Juan Carlos",
        apellidos: "González Pérez",
        email: "juan.gonzalez@empresa.com",
        telefono: "0424-1234567",
        fechaNacimiento: "1985-03-15",
        fechaIngreso: "2020-01-15",
        cargoId: "car-1",
        supervisorId: null,
        salario: 45000,
        estaActivo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      },
      {
        id: "emp-2",
        usuarioId: rrhhUser.id,
        nombres: "María Elena",
        apellidos: "Rodríguez Martínez",
        email: "maria.rodriguez@empresa.com",
        telefono: "0414-7654321",
        fechaNacimiento: "1990-07-22",
        fechaIngreso: "2021-06-01",
        cargoId: "car-2",
        supervisorId: "emp-1",
        salario: 35000,
        estaActivo: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      }
    ];

    // Crear contratos
    this.contratos = [
      {
        id: "cont-1",
        empleadoId: "emp-1",
        tipoContrato: "indefinido",
        fechaInicio: "2020-01-15",
        fechaFin: null,
        salario: 45000,
        clausulasEspeciales: "Trabajo remoto permitido",
        estado: "activo",
        creadoPor: adminUser.id,
        fechaCreacion: new Date()
      },
      {
        id: "cont-2",
        empleadoId: "emp-2",
        tipoContrato: "determinado",
        fechaInicio: "2021-06-01",
        fechaFin: "2024-06-01",
        salario: 35000,
        clausulasEspeciales: "Evaluación anual obligatoria",
        estado: "activo",
        creadoPor: adminUser.id,
        fechaCreacion: new Date()
      }
    ];

    // Crear candidatos
    this.candidatos = [
      {
        id: "cand-1",
        cedula: "V-11223344",
        nombreCompleto: "Carlos Alberto Méndez",
        email: "carlos.mendez@email.com",
        telefono: "0426-9876543",
        fechaNacimiento: "1992-11-10",
        cargoId: "car-1",
        urlCV: "https://ejemplo.com/cv-carlos.pdf",
        notas: "Candidato con experiencia en React",
        estado: "en_evaluacion",
        presentadoPor: rrhhUser.id,
        evaluadoPor: null,
        notasEvaluacion: null,
        fechaEvaluacion: null,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      }
    ];

    // Crear períodos de prueba
    this.periodosPrueba = [
      {
        id: "pp-1",
        empleadoId: "emp-2",
        fechaInicio: "2021-06-01",
        fechaFin: "2021-09-01",
        fechaEvaluacion: "2021-08-25",
        evaluadoPor: adminUser.id,
        estado: "aprobado",
        calificacionRendimiento: 4,
        recomendacionSupervisor: "Empleado dedicado y proactivo",
        notasRRHH: "Cumple con todos los objetivos",
        aprobado: true,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      }
    ];
  }

  // Implementar métodos de autenticación
  async login(credenciales: DatosLogin): Promise<{ usuario: Usuario; empleado?: EmpleadoConRelaciones } | null> {
    const usuario = this.usuarios.find(u => u.cedula === credenciales.cedula && u.estaActivo);
    if (!usuario) return null;

    const contraseñaValida = await bcrypt.compare(credenciales.password, usuario.contraseña);
    if (!contraseñaValida) return null;

    const empleado = await this.obtenerEmpleadoPorUsuarioId(usuario.id);
    return { usuario, empleado };
  }

  // Métodos de usuarios
  async obtenerUsuario(id: string): Promise<Usuario | undefined> {
    return this.usuarios.find(u => u.id === id);
  }

  async obtenerUsuarioPorCedula(cedula: string): Promise<Usuario | undefined> {
    return this.usuarios.find(u => u.cedula === cedula);
  }

  async crearUsuario(usuario: InsertUsuario): Promise<Usuario> {
    const nuevoUsuario: Usuario = {
      id: randomUUID(),
      ...usuario,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };
    this.usuarios.push(nuevoUsuario);
    return nuevoUsuario;
  }

  async actualizarUsuario(id: string, usuario: Partial<InsertUsuario>): Promise<Usuario | undefined> {
    const indice = this.usuarios.findIndex(u => u.id === id);
    if (indice === -1) return undefined;

    this.usuarios[indice] = {
      ...this.usuarios[indice],
      ...usuario,
      fechaActualizacion: new Date()
    };
    return this.usuarios[indice];
  }

  // Métodos de empleados
  async obtenerEmpleados(): Promise<EmpleadoConRelaciones[]> {
    return this.empleados.map(emp => this.construirEmpleadoConRelaciones(emp));
  }

  async obtenerEmpleado(id: string): Promise<EmpleadoConRelaciones | undefined> {
    const empleado = this.empleados.find(e => e.id === id);
    return empleado ? this.construirEmpleadoConRelaciones(empleado) : undefined;
  }

  async obtenerEmpleadoPorUsuarioId(usuarioId: string): Promise<EmpleadoConRelaciones | undefined> {
    const empleado = this.empleados.find(e => e.usuarioId === usuarioId);
    return empleado ? this.construirEmpleadoConRelaciones(empleado) : undefined;
  }

  async crearEmpleado(empleado: InsertEmpleado): Promise<Empleado> {
    const nuevoEmpleado: Empleado = {
      id: randomUUID(),
      ...empleado,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };
    this.empleados.push(nuevoEmpleado);
    return nuevoEmpleado;
  }

  async actualizarEmpleado(id: string, empleado: Partial<InsertEmpleado>): Promise<Empleado | undefined> {
    const indice = this.empleados.findIndex(e => e.id === id);
    if (indice === -1) return undefined;

    this.empleados[indice] = {
      ...this.empleados[indice],
      ...empleado,
      fechaActualizacion: new Date()
    };
    return this.empleados[indice];
  }

  // Métodos de estructura organizacional
  async obtenerGerencias(): Promise<Gerencia[]> {
    return this.gerencias.filter(g => g.estaActivo);
  }

  async obtenerDepartamentosPorGerencia(gerenciaId: string): Promise<Departamento[]> {
    return this.departamentos.filter(d => d.gerenciaId === gerenciaId && d.estaActivo);
  }

  async obtenerCargosPorDepartamento(departamentoId: string): Promise<Cargo[]> {
    return this.cargos.filter(c => c.departamentoId === departamentoId && c.estaActivo);
  }

  async crearGerencia(gerencia: InsertGerencia): Promise<Gerencia> {
    const nuevaGerencia: Gerencia = {
      id: randomUUID(),
      ...gerencia,
      fechaCreacion: new Date()
    };
    this.gerencias.push(nuevaGerencia);
    return nuevaGerencia;
  }

  async crearDepartamento(departamento: InsertDepartamento): Promise<Departamento> {
    const nuevoDepartamento: Departamento = {
      id: randomUUID(),
      ...departamento,
      fechaCreacion: new Date()
    };
    this.departamentos.push(nuevoDepartamento);
    return nuevoDepartamento;
  }

  async crearCargo(cargo: InsertCargo): Promise<Cargo> {
    const nuevoCargo: Cargo = {
      id: randomUUID(),
      ...cargo,
      fechaCreacion: new Date()
    };
    this.cargos.push(nuevoCargo);
    return nuevoCargo;
  }

  // Métodos de contratos
  async obtenerContratos(): Promise<Contrato[]> {
    return this.contratos;
  }

  async obtenerContrato(id: string): Promise<Contrato | undefined> {
    return this.contratos.find(c => c.id === id);
  }

  async obtenerContratosPorEmpleado(empleadoId: string): Promise<Contrato[]> {
    return this.contratos.filter(c => c.empleadoId === empleadoId);
  }

  async crearContrato(contrato: InsertContrato): Promise<Contrato> {
    const nuevoContrato: Contrato = {
      id: randomUUID(),
      ...contrato,
      fechaCreacion: new Date()
    };
    this.contratos.push(nuevoContrato);
    return nuevoContrato;
  }

  async actualizarContrato(id: string, contrato: Partial<InsertContrato>): Promise<Contrato | undefined> {
    const indice = this.contratos.findIndex(c => c.id === id);
    if (indice === -1) return undefined;

    this.contratos[indice] = { ...this.contratos[indice], ...contrato };
    return this.contratos[indice];
  }

  async eliminarContrato(id: string): Promise<boolean> {
    const indice = this.contratos.findIndex(c => c.id === id);
    if (indice === -1) return false;
    this.contratos.splice(indice, 1);
    return true;
  }

  async obtenerContratosVenciendo(): Promise<Contrato[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 30);
    
    return this.contratos.filter(c => 
      c.fechaFin && 
      new Date(c.fechaFin) <= fechaLimite && 
      c.estado === "activo"
    );
  }

  // Métodos de candidatos
  async obtenerCandidatos(): Promise<CandidatoConRelaciones[]> {
    return this.candidatos.map(cand => this.construirCandidatoConRelaciones(cand));
  }

  async obtenerCandidato(id: string): Promise<CandidatoConRelaciones | undefined> {
    const candidato = this.candidatos.find(c => c.id === id);
    return candidato ? this.construirCandidatoConRelaciones(candidato) : undefined;
  }

  async crearCandidato(candidato: Omit<Candidato, "id" | "fechaCreacion" | "fechaActualizacion">): Promise<Candidato> {
    const nuevoCandidato: Candidato = {
      id: randomUUID(),
      ...candidato,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };
    this.candidatos.push(nuevoCandidato);
    return nuevoCandidato;
  }

  async actualizarCandidato(id: string, candidato: Partial<Candidato>): Promise<Candidato | undefined> {
    const indice = this.candidatos.findIndex(c => c.id === id);
    if (indice === -1) return undefined;

    this.candidatos[indice] = {
      ...this.candidatos[indice],
      ...candidato,
      fechaActualizacion: new Date()
    };
    return this.candidatos[indice];
  }

  async eliminarCandidato(id: string): Promise<boolean> {
    const indice = this.candidatos.findIndex(c => c.id === id);
    if (indice === -1) return false;
    this.candidatos.splice(indice, 1);
    return true;
  }

  // Métodos de períodos de prueba
  async obtenerPeriodosPrueba(): Promise<PeriodoPruebaConRelaciones[]> {
    return this.periodosPrueba.map(pp => this.construirPeriodoPruebaConRelaciones(pp));
  }

  async obtenerPeriodoPrueba(id: string): Promise<PeriodoPruebaConRelaciones | undefined> {
    const periodo = this.periodosPrueba.find(p => p.id === id);
    return periodo ? this.construirPeriodoPruebaConRelaciones(periodo) : undefined;
  }

  async obtenerPeriodosPruebaPorEmpleado(empleadoId: string): Promise<PeriodoPruebaConRelaciones[]> {
    return this.periodosPrueba
      .filter(p => p.empleadoId === empleadoId)
      .map(pp => this.construirPeriodoPruebaConRelaciones(pp));
  }

  async crearPeriodoPrueba(periodo: Omit<PeriodoPrueba, "id" | "fechaCreacion" | "fechaActualizacion">): Promise<PeriodoPrueba> {
    const nuevoPeriodo: PeriodoPrueba = {
      id: randomUUID(),
      ...periodo,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };
    this.periodosPrueba.push(nuevoPeriodo);
    return nuevoPeriodo;
  }

  async actualizarPeriodoPrueba(id: string, periodo: Partial<PeriodoPrueba>): Promise<PeriodoPrueba | undefined> {
    const indice = this.periodosPrueba.findIndex(p => p.id === id);
    if (indice === -1) return undefined;

    this.periodosPrueba[indice] = {
      ...this.periodosPrueba[indice],
      ...periodo,
      fechaActualizacion: new Date()
    };
    return this.periodosPrueba[indice];
  }

  async eliminarPeriodoPrueba(id: string): Promise<boolean> {
    const indice = this.periodosPrueba.findIndex(p => p.id === id);
    if (indice === -1) return false;
    this.periodosPrueba.splice(indice, 1);
    return true;
  }

  async obtenerPeriodosPruebaVenciendo(): Promise<PeriodoPruebaConRelaciones[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 7);
    
    return this.periodosPrueba
      .filter(p => 
        new Date(p.fechaFin) <= fechaLimite && 
        p.estado === "activo"
      )
      .map(pp => this.construirPeriodoPruebaConRelaciones(pp));
  }

  // Métodos de egresos - implementación básica
  async obtenerEgresos(): Promise<EgresoConRelaciones[]> {
    return [];
  }

  async obtenerEgreso(id: string): Promise<EgresoConRelaciones | undefined> {
    return undefined;
  }

  async obtenerEgresosPorEmpleado(empleadoId: string): Promise<EgresoConRelaciones[]> {
    return [];
  }

  async crearEgreso(egreso: Omit<Egreso, "id" | "fechaCreacion" | "fechaActualizacion">): Promise<Egreso> {
    throw new Error("Método no implementado en datos de prueba");
  }

  async actualizarEgreso(id: string, egreso: Partial<Egreso>): Promise<Egreso | undefined> {
    return undefined;
  }

  async eliminarEgreso(id: string): Promise<boolean> {
    return false;
  }

  // Métodos de ofertas de trabajo - implementación básica
  async obtenerOfertasTrabajo(): Promise<OfertaTrabajoConRelaciones[]> {
    return [];
  }

  async obtenerOfertaTrabajo(id: string): Promise<OfertaTrabajoConRelaciones | undefined> {
    return undefined;
  }

  async crearOfertaTrabajo(oferta: Omit<OfertaTrabajo, "id" | "fechaCreacion" | "fechaActualizacion">): Promise<OfertaTrabajo> {
    throw new Error("Método no implementado en datos de prueba");
  }

  async actualizarOfertaTrabajo(id: string, oferta: Partial<OfertaTrabajo>): Promise<OfertaTrabajo | undefined> {
    return undefined;
  }

  async eliminarOfertaTrabajo(id: string): Promise<boolean> {
    return false;
  }

  // Métodos de postulaciones - implementación básica
  async obtenerPostulaciones(): Promise<PostulacionConRelaciones[]> {
    return [];
  }

  async obtenerPostulacion(id: string): Promise<PostulacionConRelaciones | undefined> {
    return undefined;
  }

  async obtenerPostulacionesPorOferta(ofertaId: string): Promise<PostulacionConRelaciones[]> {
    return [];
  }

  async obtenerPostulacionesPorCandidato(candidatoId: string): Promise<PostulacionConRelaciones[]> {
    return [];
  }

  async crearPostulacion(postulacion: Omit<Postulacion, "id" | "fechaCreacion" | "fechaActualizacion">): Promise<Postulacion> {
    throw new Error("Método no implementado en datos de prueba");
  }

  async actualizarPostulacion(id: string, postulacion: Partial<Postulacion>): Promise<Postulacion | undefined> {
    return undefined;
  }

  async eliminarPostulacion(id: string): Promise<boolean> {
    return false;
  }

  // Método de estadísticas del tablero
  async obtenerEstadisticasTablero(): Promise<EstadisticasTablero> {
    return {
      totalEmpleados: this.empleados.filter(e => e.estaActivo).length,
      empleadosEnPrueba: this.periodosPrueba.filter(p => p.estado === "activo").length,
      candidatosNuevos: this.candidatos.filter(c => c.estado === "en_evaluacion").length,
      contratosVenciendo: await this.obtenerContratosVenciendo().then(c => c.length),
      totalContratos: this.contratos.length,
      contratosActivos: this.contratos.filter(c => c.estado === "activo").length,
      contratosIndefinidos: this.contratos.filter(c => c.tipoContrato === "indefinido").length,
      totalCandidatos: this.candidatos.length,
      candidatosEnEvaluacion: this.candidatos.filter(c => c.estado === "en_evaluacion").length,
      candidatosAprobados: this.candidatos.filter(c => c.estado === "aprobado").length,
      periodosPruebaActivos: this.periodosPrueba.filter(p => p.estado === "activo").length,
      periodosPruebaVenciendo: await this.obtenerPeriodosPruebaVenciendo().then(p => p.length),
    };
  }

  // Métodos auxiliares para construir relaciones
  private construirEmpleadoConRelaciones(empleado: Empleado): EmpleadoConRelaciones {
    const usuario = this.usuarios.find(u => u.id === empleado.usuarioId)!;
    const cargo = this.cargos.find(c => c.id === empleado.cargoId)!;
    const departamento = this.departamentos.find(d => d.id === cargo.departamentoId)!;
    const gerencia = this.gerencias.find(g => g.id === departamento.gerenciaId)!;
    const supervisor = empleado.supervisorId ? this.empleados.find(e => e.id === empleado.supervisorId) : undefined;
    const contrato = this.contratos.find(c => c.empleadoId === empleado.id && c.estado === "activo");

    return {
      ...empleado,
      usuario,
      cargo: {
        ...cargo,
        departamento: {
          ...departamento,
          gerencia
        }
      },
      supervisor,
      contrato
    };
  }

  private construirCandidatoConRelaciones(candidato: Candidato): CandidatoConRelaciones {
    const cargo = this.cargos.find(c => c.id === candidato.cargoId)!;
    const departamento = this.departamentos.find(d => d.id === cargo.departamentoId)!;
    const gerencia = this.gerencias.find(g => g.id === departamento.gerenciaId)!;
    const presentadoPorUsuario = this.usuarios.find(u => u.id === candidato.presentadoPor)!;
    const evaluadoPorUsuario = candidato.evaluadoPor ? this.usuarios.find(u => u.id === candidato.evaluadoPor) : undefined;

    return {
      ...candidato,
      cargo: {
        ...cargo,
        departamento: {
          ...departamento,
          gerencia
        }
      },
      presentadoPorUsuario,
      evaluadoPorUsuario
    };
  }

  private construirPeriodoPruebaConRelaciones(periodo: PeriodoPrueba): PeriodoPruebaConRelaciones {
    const empleado = this.empleados.find(e => e.id === periodo.empleadoId)!;
    const empleadoConRelaciones = this.construirEmpleadoConRelaciones(empleado);
    const evaluadoPorUsuario = periodo.evaluadoPor ? this.usuarios.find(u => u.id === periodo.evaluadoPor) : undefined;

    return {
      ...periodo,
      empleado: empleadoConRelaciones,
      evaluadoPorUsuario
    };
  }
}