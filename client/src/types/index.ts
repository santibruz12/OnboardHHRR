export type { 
  Usuario, 
  Empleado, 
  EmpleadoConRelaciones,
  Gerencia,
  Departamento, 
  Cargo,
  Contrato,
  Candidato,
  CandidatoConRelaciones,
  PeriodoPrueba,
  PeriodoPruebaConRelaciones,
  EstadisticasTablero,
  DatosLogin 
} from "@shared/schema";

import type { Usuario, EmpleadoConRelaciones } from "@shared/schema";

export interface AuthState {
  user: Usuario | null;
  employee: EmpleadoConRelaciones | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SidebarState {
  isCollapsed: boolean;
  isMobile: boolean;
  isOpen: boolean;
}
