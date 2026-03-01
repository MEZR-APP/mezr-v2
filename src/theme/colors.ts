/**
 * Mezr App - Color Palette
 * Extracted from old-app.js StyleSheet
 */

export const colors = {
  // Backgrounds
  background: '#000',
  backgroundDark: '#0A0A0A',
  backgroundCard: '#111',
  backgroundElevated: '#1A1A1A',
  
  // Text
  textPrimary: '#FFF',
  textSecondary: '#888',
  textMuted: '#666',
  textDark: '#444',
  textDarker: '#333',
  
  // Borders
  borderLight: '#333',
  borderDark: '#222',
  borderDarker: '#111',
  
  // Buttons
  buttonPrimary: '#FFF',
  buttonPrimaryText: '#000',
  buttonSecondary: '#1A1A1A',
  buttonSecondaryText: '#666',
  
  // Danger/Delete
  dangerBackground: '#1A0000',
  dangerText: '#FF4444',
  
  // Accents
  activeAccent: '#FFF',
  inactiveAccent: '#444',
  
  // Overlay
  modalOverlay: 'rgba(0,0,0,0.95)',
  
  // Input
  inputBackground: '#111',
  inputBorder: '#222',
  inputPlaceholder: '#333',
} as const;

export type ColorKey = keyof typeof colors;
