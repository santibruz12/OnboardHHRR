import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SidebarState } from "../types";

interface SidebarStore extends SidebarState {
  toggle: () => void;
  setMobile: (isMobile: boolean) => void;
  setOpen: (isOpen: boolean) => void;
}

export const useSidebar = create<SidebarStore>()(
  persist(
    (set, get) => ({
      isCollapsed: false,
      isMobile: false,
      isOpen: false,

      toggle: () => {
        const { isMobile } = get();
        if (isMobile) {
          set((state) => ({ isOpen: !state.isOpen }));
        } else {
          set((state) => ({ isCollapsed: !state.isCollapsed }));
        }
      },

      setMobile: (isMobile: boolean) => {
        set({ isMobile });
        if (!isMobile) {
          set({ isOpen: false });
        }
      },

      setOpen: (isOpen: boolean) => {
        set({ isOpen });
      }
    }),
    {
      name: "sidebar-storage",
      partialize: (state) => ({
        isCollapsed: state.isCollapsed
      })
    }
  )
);
