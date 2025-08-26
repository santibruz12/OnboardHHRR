import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, Usuario, EmpleadoConRelaciones } from "../types";
import * as authApi from "../lib/auth";

interface AuthStore extends AuthState {
  login: (credentials: { cedula: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      employee: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (credentials) => {
        try {
          set({ isLoading: true });
          const response = await authApi.login(credentials);
          
          set({
            user: response.user,
            employee: response.employee || null,
            isAuthenticated: true,
            isLoading: false
          });
          
          return true;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            employee: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const authData = await authApi.getCurrentUser();
          
          if (authData) {
            set({
              user: authData.user,
              employee: authData.employee || null,
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            set({
              user: null,
              employee: null,
              isAuthenticated: false,
              isLoading: false
            });
          }
        } catch (error) {
          set({
            user: null,
            employee: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },

      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        employee: state.employee,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
