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
import { DatosPruebaStorage } from "./datos-prueba";

export interface IStorage {
  // Auth
  login(
    credenciales: DatosLogin,
  ): Promise<{ usuario: Usuario; empleado?: EmpleadoConRelaciones } | null>;

  // Usuarios
  obtenerUsuario(id: string): Promise<Usuario | undefined>;
  obtenerUsuarioPorCedula(cedula: string): Promise<Usuario | undefined>;
  crearUsuario(usuario: InsertUsuario): Promise<Usuario>;
  actualizarUsuario(id: string, usuario: Partial<InsertUsuario>): Promise<Usuario | undefined>;

  // Empleados
  obtenerEmpleados(): Promise<EmpleadoConRelaciones[]>;
  obtenerEmpleado(id: string): Promise<EmpleadoConRelaciones | undefined>;
  obtenerEmpleadoPorUsuarioId(
    usuarioId: string,
  ): Promise<EmpleadoConRelaciones | undefined>;
  crearEmpleado(empleado: InsertEmpleado): Promise<Empleado>;
  actualizarEmpleado(
    id: string,
    empleado: Partial<InsertEmpleado>,
  ): Promise<Empleado | undefined>;

  // Estructura Organizacional
  obtenerGerencias(): Promise<Gerencia[]>;
  obtenerDepartamentosPorGerencia(gerenciaId: string): Promise<Departamento[]>;
  obtenerCargosPorDepartamento(departamentoId: string): Promise<Cargo[]>;
  crearGerencia(gerencia: InsertGerencia): Promise<Gerencia>;
  crearDepartamento(departamento: InsertDepartamento): Promise<Departamento>;
  crearCargo(cargo: InsertCargo): Promise<Cargo>;

  // Contratos
  obtenerContratos(): Promise<Contrato[]>;
  obtenerContrato(id: string): Promise<Contrato | undefined>;
  obtenerContratosPorEmpleado(empleadoId: string): Promise<Contrato[]>;
  crearContrato(contrato: InsertContrato): Promise<Contrato>;
  actualizarContrato(
    id: string,
    contrato: Partial<InsertContrato>,
  ): Promise<Contrato | undefined>;
  eliminarContrato(id: string): Promise<boolean>;
  obtenerContratosVenciendo(): Promise<Contrato[]>;

  // Candidatos
  obtenerCandidatos(): Promise<CandidatoConRelaciones[]>;
  obtenerCandidato(id: string): Promise<CandidatoConRelaciones | undefined>;
  crearCandidato(
    candidato: Omit<Candidato, "id" | "fechaCreacion" | "fechaActualizacion">,
  ): Promise<Candidato>;
  actualizarCandidato(
    id: string,
    candidato: Partial<Candidato>,
  ): Promise<Candidato | undefined>;
  eliminarCandidato(id: string): Promise<boolean>;

  // Períodos de Prueba
  obtenerPeriodosPrueba(): Promise<PeriodoPruebaConRelaciones[]>;
  obtenerPeriodoPrueba(
    id: string,
  ): Promise<PeriodoPruebaConRelaciones | undefined>;
  obtenerPeriodosPruebaPorEmpleado(
    empleadoId: string,
  ): Promise<PeriodoPruebaConRelaciones[]>;
  crearPeriodoPrueba(
    periodoPrueba: Omit<PeriodoPrueba, "id" | "fechaCreacion" | "fechaActualizacion">,
  ): Promise<PeriodoPrueba>;
  actualizarPeriodoPrueba(
    id: string,
    periodoPrueba: Partial<PeriodoPrueba>,
  ): Promise<PeriodoPrueba | undefined>;
  eliminarPeriodoPrueba(id: string): Promise<boolean>;
  obtenerPeriodosPruebaVenciendo(): Promise<PeriodoPruebaConRelaciones[]>;

  // Egresos
  obtenerEgresos(): Promise<EgresoConRelaciones[]>;
  obtenerEgreso(id: string): Promise<EgresoConRelaciones | undefined>;
  obtenerEgresosPorEmpleado(empleadoId: string): Promise<EgresoConRelaciones[]>;
  crearEgreso(
    egreso: Omit<Egreso, "id" | "fechaCreacion" | "fechaActualizacion">,
  ): Promise<Egreso>;
  actualizarEgreso(
    id: string,
    egreso: Partial<Egreso>,
  ): Promise<Egreso | undefined>;
  eliminarEgreso(id: string): Promise<boolean>;

  // Ofertas de Trabajo
  obtenerOfertasTrabajo(): Promise<OfertaTrabajoConRelaciones[]>;
  obtenerOfertaTrabajo(id: string): Promise<OfertaTrabajoConRelaciones | undefined>;
  crearOfertaTrabajo(
    ofertaTrabajo: Omit<OfertaTrabajo, "id" | "fechaCreacion" | "fechaActualizacion">,
  ): Promise<OfertaTrabajo>;
  actualizarOfertaTrabajo(
    id: string,
    ofertaTrabajo: Partial<OfertaTrabajo>,
  ): Promise<OfertaTrabajo | undefined>;
  eliminarOfertaTrabajo(id: string): Promise<boolean>;

  // Postulaciones
  obtenerPostulaciones(): Promise<PostulacionConRelaciones[]>;
  obtenerPostulacion(
    id: string,
  ): Promise<PostulacionConRelaciones | undefined>;
  obtenerPostulacionesPorOferta(
    ofertaId: string,
  ): Promise<PostulacionConRelaciones[]>;
  obtenerPostulacionesPorCandidato(
    candidatoId: string,
  ): Promise<PostulacionConRelaciones[]>;
  crearPostulacion(
    postulacion: Omit<Postulacion, "id" | "fechaCreacion" | "fechaActualizacion">,
  ): Promise<Postulacion>;
  actualizarPostulacion(
    id: string,
    postulacion: Partial<Postulacion>,
  ): Promise<Postulacion | undefined>;
  eliminarPostulacion(id: string): Promise<boolean>;

  // Tablero
  obtenerEstadisticasTablero(): Promise<EstadisticasTablero>;
}

// Usar implementación de datos de prueba en lugar de PostgreSQL
export const storage = new DatosPruebaStorage();