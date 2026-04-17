/**
 * Mezr App - Signup Screen
 * Account creation screen with email/password registration
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
  ScrollView,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { colors } from '../theme/colors';
import { useAppStore } from '../stores/appStore';
import { Button } from '../components/ui/Button';

interface SignupScreenProps {
  onSignupSuccess?: () => void;
  onSignInPress?: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({
  onSignupSuccess,
  onSignInPress,
}) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const setShowPrivacyPolicy = useAppStore((state) => state.setShowPrivacyPolicy);

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
   * Validate password (minimum 8 characters)
   */
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  /**
   * Validate confirm password matches password
   */
  const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError(null);
    return true;
  };

  /**
   * Clear all errors
   */
  const clearErrors = () => {
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
  };

  /**
   * Handle account creation
   */
  const handleCreateAccount = async () => {
    clearErrors();

    // Validate all inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(password, confirmPassword);

    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // Account creation successful - user is automatically signed in
      onSignupSuccess?.();
    } catch (err: any) {
      // Handle Firebase auth errors
      let errorMessage = 'An error occurred. Please try again.';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use a stronger password.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
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
   * Handle sign in link press
   */
  const handleSignInPress = () => {
    onSignInPress?.();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
                // Re-validate confirm password if it has a value
                if (confirmPassword && text !== confirmPassword) {
                  setConfirmPasswordError('Passwords do not match');
                } else if (confirmPassword && text === confirmPassword) {
                  setConfirmPasswordError(null);
                }
              }}
              placeholder="Create a password (min 8 characters)"
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

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
            <TextInput
              style={[styles.input, confirmPasswordError && styles.inputError]}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) {
                  // Clear error if passwords now match
                  if (text === password) {
                    setConfirmPasswordError(null);
                  }
                }
              }}
              placeholder="Confirm your password"
              placeholderTextColor={colors.inputPlaceholder}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {confirmPasswordError && (
              <Text style={styles.fieldError}>{confirmPasswordError}</Text>
            )}
          </View>

          {/* PR-013: Must agree to Privacy Policy */}
          <TouchableOpacity
            style={styles.agreementRow}
            onPress={() => setAgreedToPrivacy((a) => !a)}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <View style={[styles.checkbox, agreedToPrivacy && styles.checkboxChecked]}>
              {agreedToPrivacy && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
            <Text style={styles.agreementText}>
              I agree to the{' '}
              <Text
                style={styles.agreementLink}
                onPress={(e) => {
                  e.stopPropagation();
                  setShowPrivacyPolicy(true);
                }}
              >
                Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Create Account Button */}
          <View style={styles.buttonContainer}>
            {isLoading ? (
              <View style={styles.loadingButton}>
                <ActivityIndicator color={colors.buttonPrimaryText} size="small" />
                <Text style={styles.loadingText}>CREATING ACCOUNT...</Text>
              </View>
            ) : (
              <Button
                title="CREATE ACCOUNT"
                onPress={handleCreateAccount}
                variant="primary"
                size="large"
                disabled={isLoading || !agreedToPrivacy}
              />
            )}
          </View>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleSignInPress} disabled={isLoading}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    paddingVertical: 60,
  },
  
  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
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

  // PR-013: Privacy Policy agreement
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.backgroundElevated,
  },
  checkboxCheck: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  agreementText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  agreementLink: {
    color: colors.textPrimary,
    textDecorationLine: 'underline',
    fontWeight: '600',
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
  
  // Sign In
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  signInText: {
    color: colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  signInLink: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default SignupScreen;
