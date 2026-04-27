/**
 * Mezr App - Auth Store
 * Authentication state using Zustand
 */

import { create } from 'zustand';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { deleteAccountAndAllData } from '../services/authService';

// ============================================
// TYPES - PR-001: Email only for auth (no displayName, photoURL, metadata)
// ============================================

/** Minimal user object - uid and email only per PR-001 */
export interface MezrUser {
  uid: string;
  email: string | null;
}

// ============================================
// STORE INTERFACE
// ============================================

interface AuthStore {
  // Auth State
  user: MezrUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSigningOut: boolean;
  
  // Actions
  setUser: (user: MezrUser | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  signOut: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial State
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isSigningOut: false,
  
  // Actions
  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
    isLoading: false,
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  clearAuth: () => set({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
  
  signOut: async () => {
    set({ isSigningOut: true });
    try {
      await firebaseSignOut(auth);
      // Firebase auth listener will handle clearing state
    } catch (error) {
      set({ isSigningOut: false });
      throw error;
    }
  },

  deleteAccount: async (password: string) => {
    set({ isSigningOut: true });
    try {
      await deleteAccountAndAllData(password);
      set({ user: null, isAuthenticated: false, isSigningOut: false });
    } catch (error) {
      set({ isSigningOut: false });
      throw error;
    }
  },
}));

// ============================================
// SELECTORS
// ============================================

/**
 * Get current user's email
 */
export const useUserEmail = () => {
  return useAuthStore((state) => state.user?.email);
};

/**
 * Get current user's UID
 */
export const useUserId = () => {
  return useAuthStore((state) => state.user?.uid);
};
