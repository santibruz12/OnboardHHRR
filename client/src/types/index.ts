export type { 
  User, 
  Employee, 
  EmployeeWithRelations,
  Gerencia,
  Departamento, 
  Cargo,
  Contract,
  DashboardStats,
  LoginData 
} from "@shared/schema";

import type { User, EmployeeWithRelations } from "@shared/schema";

export interface AuthState {
  user: User | null;
  employee: EmployeeWithRelations | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SidebarState {
  isCollapsed: boolean;
  isMobile: boolean;
  isOpen: boolean;
}
