/**
 * Mezr App - Login Screen
 * Authentication screen with email/password sign in
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { colors } from '../theme/colors';
import { Button } from '../components/ui/Button';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
  onSignUpPress?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onSignUpPress,
}) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  /**
   * Validate email format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  /**
   * Validate password
   */
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  /**
   * Clear all errors
   */
  const clearErrors = () => {
    setError(null);
    setEmailError(null);
    setPasswordError(null);
  };

  /**
   * Handle sign in
   */
  const handleSignIn = async () => {
    clearErrors();

    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // Sign in successful
      onLoginSuccess?.();
    } catch (err: any) {
      // Handle Firebase auth errors
      let errorMessage = 'An error occurred. Please try again.';
      
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. If you deleted your account, please sign up again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle sign up link press
   */
  const handleSignUpPress = () => {
    onSignUpPress?.();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo/Title */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>MEZR</Text>
          <View style={styles.logoUnderline} />
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>EMAIL</Text>
          <TextInput
            style={[styles.input, emailError && styles.inputError]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError(null);
            }}
            placeholder="Enter your email"
            placeholderTextColor={colors.inputPlaceholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          {emailError && (
            <Text style={styles.fieldError}>{emailError}</Text>
          )}
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>PASSWORD</Text>
          <TextInput
            style={[styles.input, passwordError && styles.inputError]}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError(null);
            }}
            placeholder="Enter your password"
            placeholderTextColor={colors.inputPlaceholder}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          {passwordError && (
            <Text style={styles.fieldError}>{passwordError}</Text>
          )}
        </View>

        {/* Sign In Button */}
        <View style={styles.buttonContainer}>
          {isLoading ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator color={colors.buttonPrimaryText} size="small" />
              <Text style={styles.loadingText}>SIGNING IN...</Text>
            </View>
          ) : (
            <Button
              title="SIGN IN"
              onPress={handleSignIn}
              variant="primary"
              size="large"
              disabled={isLoading}
            />
          )}
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleSignUpPress} disabled={isLoading}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  
  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    color: colors.textPrimary,
    fontSize: 48,
    fontWeight: '100',
    letterSpacing: 20,
  },
  logoUnderline: {
    width: 60,
    height: 1,
    backgroundColor: colors.borderLight,
    marginTop: 15,
  },
  
  // Error
  errorContainer: {
    backgroundColor: colors.dangerBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.dangerText,
  },
  errorText: {
    color: colors.dangerText,
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  // Input
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 10,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: colors.textPrimary,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  inputError: {
    borderColor: colors.dangerText,
  },
  fieldError: {
    color: colors.dangerText,
    fontSize: 11,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  
  // Button
  buttonContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  loadingButton: {
    backgroundColor: colors.buttonPrimary,
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderRadius: 40,
    minWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.buttonPrimaryText,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  
  // Sign Up
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  signUpText: {
    color: colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  signUpLink: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default LoginScreen;
