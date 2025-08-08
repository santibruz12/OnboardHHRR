import { apiRequest } from "./queryClient";
import type { LoginData, User, EmployeeWithRelations } from "@shared/schema";

export interface AuthResponse {
  success: boolean;
  user: User;
  employee?: EmployeeWithRelations;
}

export async function login(credentials: LoginData): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  return response.json();
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
}

export async function getCurrentUser(): Promise<{ user: User; employee?: EmployeeWithRelations } | null> {
  try {
    const response = await apiRequest("GET", "/api/auth/me");
    return response.json();
  } catch (error) {
    return null;
  }
}
