/**
 * Mezr App - Root Entry Point
 * Main application wrapper with authentication
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './src/services/firebase';
import { useAuthStore } from './src/stores/authStore';
import { useAppStore } from './src/stores/appStore';
import MainScreen from './src/screens/index';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import PrivacyPolicy from './src/screens/PrivacyPolicy';

type AuthScreen = 'login' | 'signup';

export default function App() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const showPrivacyPolicy = useAppStore((state) => state.showPrivacyPolicy);
  const setShowPrivacyPolicy = useAppStore((state) => state.setShowPrivacyPolicy);

  // Auth screen navigation state
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');

  // Set up Firebase auth state listener
  // PR-001: Extract only uid + email - no displayName, photoURL, metadata
  // PR-020: Only email in Firestore (for account recovery); settings/sessions stay local
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(
        fbUser
          ? { uid: fbUser.uid, email: fbUser.email ?? null }
          : null
      );
      // PR-020: Create/update user doc with ONLY email (for account recovery)
      if (fbUser) {
        try {
          await setDoc(doc(db, 'users', fbUser.uid), {
            email: fbUser.email ?? null,
          });
        } catch (err) {
          console.error('User doc save error:', err);
        }
      }
      // Reset to login screen when user logs out
      if (!fbUser) {
        setAuthScreen('login');
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [setUser]);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#FFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // PR-013: Privacy Policy (from Settings or Signup link)
  if (showPrivacyPolicy) {
    return (
      <>
        <StatusBar style="light" />
        <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />
      </>
    );
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <StatusBar style="light" />
        {authScreen === 'login' ? (
          <LoginScreen onSignUpPress={() => setAuthScreen('signup')} />
        ) : (
          <SignupScreen onSignInPress={() => setAuthScreen('login')} />
        )}
      </>
    );
  }

  // Show main app if authenticated
  return (
    <>
      <StatusBar style="light" />
      <MainScreen />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 16,
    letterSpacing: 1,
  },
});
