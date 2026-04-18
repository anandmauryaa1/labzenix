import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isAdminSidebarCollapsed: boolean;
  toggleAdminSidebar: () => void;
  setAdminSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  isAdminSidebarCollapsed: false,
  toggleAdminSidebar: () => set((state) => ({ isAdminSidebarCollapsed: !state.isAdminSidebarCollapsed })),
  setAdminSidebarCollapsed: (collapsed) => set({ isAdminSidebarCollapsed: collapsed }),
}));