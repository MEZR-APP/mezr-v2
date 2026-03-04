/**
 * Mezr App - App Store
 * Main application state using Zustand
 */

import { create } from 'zustand';
import type { CategoryId, ModuleId, ToastState } from '../types';
import { ALL_MODULES } from '../constants/modules';

// ============================================
// STORE INTERFACE
// ============================================

export type MainTabId = 'main' | 'stats' | 'settings' | 'profile';

interface AppStore {
  // Navigation State
  currentCategory: CategoryId;
  currentModule: ModuleId;
  currentTab: MainTabId;
  
  // UI State
  showSettings: boolean;
  showPrivacyDashboard: boolean;
  showPrivacyPolicy: boolean;
  showModulePicker: boolean;
  isMuted: boolean;
  isActive: boolean;
  
  // Cloud Backup (PR-007: Default OFF, opt-in via Settings)
  cloudBackupEnabled: boolean;
  
  // Toast State
  toast: ToastState;
  
  // Navigation Actions
  setCategory: (category: CategoryId) => void;
  setModule: (module: ModuleId) => void;
  setCurrentTab: (tab: MainTabId) => void;
  
  // UI Actions
  setShowSettings: (show: boolean) => void;
  setShowPrivacyDashboard: (show: boolean) => void;
  setShowPrivacyPolicy: (show: boolean) => void;
  setShowModulePicker: (show: boolean) => void;
  toggleMuted: () => void;
  setMuted: (muted: boolean) => void;
  setIsActive: (active: boolean) => void;
  setCloudBackupEnabled: (enabled: boolean) => void;
  
  // Toast Actions
  showToast: (message: string, duration?: number) => void;
  hideToast: () => void;
  
  // Category/Module Navigation
  switchCategory: (category: CategoryId) => void;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial State
  currentCategory: 'health',
  currentModule: 'breath',
  currentTab: 'main',
  showSettings: false,
  showPrivacyDashboard: false,
  showPrivacyPolicy: false,
  showModulePicker: false,
  isMuted: false,
  isActive: false,
  cloudBackupEnabled: false,
  toast: {
    show: false,
    message: '',
  },
  
  // Navigation Actions
  setCategory: (category) => set({ currentCategory: category }),
  
  setModule: (module) => set({ currentModule: module }),
  
  setCurrentTab: (tab) => set({ currentTab: tab }),
  
  // UI Actions
  setShowSettings: (show) => set({ showSettings: show }),

  setShowPrivacyDashboard: (show) => set({ showPrivacyDashboard: show }),

  setShowPrivacyPolicy: (show) => set({ showPrivacyPolicy: show }),

  setShowModulePicker: (show) => set({ showModulePicker: show }),
  
  toggleMuted: () => set((state) => ({ isMuted: !state.isMuted })),
  
  setMuted: (muted) => set({ isMuted: muted }),
  
  setIsActive: (active) => set({ isActive: active }),
  
  setCloudBackupEnabled: (enabled) => set({ cloudBackupEnabled: enabled }),
  
  // Toast Actions
  showToast: (message, duration = 2000) => {
    set({ toast: { show: true, message } });
    
    // Auto-hide after duration
    setTimeout(() => {
      set({ toast: { show: false, message: '' } });
    }, duration);
  },
  
  hideToast: () => set({ toast: { show: false, message: '' } }),
  
  // Combined Category/Module Navigation
  // When switching category, also switch to first module in that category
  switchCategory: (category) => {
    const { isActive } = get();
    
    // Don't allow category switch while active
    if (isActive) return;
    
    const firstModule = ALL_MODULES.find((m) => m.category === category);
    
    set({
      currentCategory: category,
      currentModule: firstModule?.id || 'breath',
    });
  },
}));

// ============================================
// SELECTORS
// ============================================

/**
 * Get modules filtered by current category
 */
export const useFilteredModules = () => {
  const currentCategory = useAppStore((state) => state.currentCategory);
  return ALL_MODULES.filter((m) => m.category === currentCategory);
};

/**
 * Get current module object
 */
export const useCurrentModule = () => {
  const currentModule = useAppStore((state) => state.currentModule);
  return ALL_MODULES.find((m) => m.id === currentModule);
};

/**
 * Check if a specific module is active
 */
export const useIsModuleActive = (moduleId: ModuleId) => {
  const currentModule = useAppStore((state) => state.currentModule);
  const isActive = useAppStore((state) => state.isActive);
  return currentModule === moduleId && isActive;
};
