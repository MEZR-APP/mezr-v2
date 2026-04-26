/**
 * Mezr App - Shared Styles
 * Extracted from old-app.js StyleSheet
 */

import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const styles = StyleSheet.create({
  // ============================================
  // LAYOUT
  // ============================================
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // ============================================
  // TOAST
  // ============================================
  toast: {
    position: 'absolute',
    top: 100,
    left: '10%',
    right: '10%',
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 20,
    borderRadius: 15,
    zIndex: 1000,
    alignItems: 'center',
  },
  toastText: {
    color: colors.textPrimary,
    fontSize: 14,
    letterSpacing: 1,
  },
  
  // ============================================
  // CATEGORY BAR
  // ============================================
  categoryBar: {
    marginTop: 50,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDarker,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: colors.backgroundDark,
  },
  categoryTabActive: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    color: colors.textDark,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: colors.textPrimary,
  },
  
  // ============================================
  // HEADER
  // ============================================
  topHeader: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  activeModuleButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeModuleText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '200',
    letterSpacing: 4,
  },
  dropdownArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.textDark,
    marginLeft: 10,
    marginTop: 4,
  },
  soundToggle: {
    marginLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: colors.inputBorder,
    paddingLeft: 15,
  },
  settingsIcon: {
    padding: 5,
  },
  gearCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
  },
  gearInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textPrimary,
    position: 'absolute',
    top: 6.5,
    left: 6.5,
  },
  
  // ============================================
  // MAIN DISPLAY
  // ============================================
  mainDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
  },
  largeNum: {
    color: colors.textPrimary,
    fontSize: 90,
    fontWeight: '100',
  },
  phaseText: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '200',
    letterSpacing: 8,
    marginTop: 50,
    minHeight: 30,
    textAlign: 'center',
  },
  counterText: {
    color: colors.textDark,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 15,
    fontWeight: '600',
  },
  patternLabel: {
    color: colors.textDarker,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 25,
    fontStyle: 'italic',
  },
  swimZone: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  label: {
    color: colors.textDark,
    fontSize: 14,
    letterSpacing: 4,
  },
  subLabel: {
    color: colors.textMuted,
    fontSize: 18,
    marginTop: 10,
  },
  
  // ============================================
  // BUTTONS
  // ============================================
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.buttonPrimary,
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderRadius: 40,
    minWidth: 220,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.buttonPrimaryText,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  
  // ============================================
  // MODAL
  // ============================================
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // ============================================
  // MODULE PICKER
  // ============================================
  pickerContainer: {
    width: '80%',
    height: '70%',
    alignItems: 'center',
  },
  pickerTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    letterSpacing: 5,
    marginBottom: 40,
    fontWeight: '600',
  },
  pickerItem: {
    paddingVertical: 20,
    width: '100%',
    alignItems: 'center',
  },
  pickerText: {
    color: colors.textDarker,
    fontSize: 28,
    fontWeight: '200',
    letterSpacing: 4,
  },
  activePickerText: {
    color: colors.textPrimary,
  },
  closePicker: {
    marginTop: 40,
    padding: 20,
  },
  closePickerText: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 2,
  },
  
  // ============================================
  // DELETE CONFIRM MODAL
  // ============================================
  deleteConfirmContainer: {
    width: '85%',
    backgroundColor: colors.backgroundDark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    padding: 30,
    alignItems: 'center',
  },
  deleteConfirmTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 20,
  },
  deleteConfirmMessage: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  deleteConfirmButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  deleteConfirmBtnCancel: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    paddingVertical: 16,
    borderRadius: 25,
    marginRight: 10,
    alignItems: 'center',
  },
  deleteConfirmBtnCancelText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  deleteConfirmBtnDelete: {
    flex: 1,
    backgroundColor: colors.dangerBackground,
    paddingVertical: 16,
    borderRadius: 25,
    marginLeft: 10,
    alignItems: 'center',
  },
  deleteConfirmBtnDeleteText: {
    color: colors.dangerText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  
  // ============================================
  // PATTERN BUILDER
  // ============================================
  builderContainer: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: colors.backgroundDark,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  builderScroll: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  builderTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    letterSpacing: 4,
    fontWeight: '700',
    marginBottom: 30,
  },
  builderSection: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '700',
    marginTop: 25,
    marginBottom: 15,
  },
  builderItem: {
    width: '100%',
    marginBottom: 18,
  },
  builderLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 8,
    letterSpacing: 1,
  },
  builderInput: {
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    fontSize: 18,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  builderButtons: {
    flexDirection: 'row',
    marginTop: 30,
    width: '100%',
    justifyContent: 'space-between',
  },
  builderBtnSecondary: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    paddingVertical: 16,
    borderRadius: 25,
    marginRight: 10,
    alignItems: 'center',
  },
  builderBtnSecondaryText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  builderBtnPrimary: {
    flex: 1,
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 25,
    marginLeft: 10,
    alignItems: 'center',
  },
  builderBtnPrimaryText: {
    color: colors.buttonPrimaryText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  
  // ============================================
  // SETTINGS SCREEN
  // ============================================
  settingsScroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 80,
    paddingBottom: 120,
  },
  settingsTitle: {
    color: colors.textDark,
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 25,
    fontWeight: '700',
  },
  settingItem: {
    width: '85%',
    marginBottom: 20,
  },
  settingLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    fontSize: 22,
    textAlign: 'center',
    padding: 15,
    borderRadius: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statBox: {
    width: '30%',
    backgroundColor: colors.inputBackground,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNum: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '300',
  },
  statLabel: {
    color: colors.textDarker,
    fontSize: 8,
    marginTop: 4,
  },
  
  // ============================================
  // PATTERN CARDS
  // ============================================
  patternCard: {
    width: '90%',
    backgroundColor: colors.inputBackground,
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  patternName: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: 2,
  },
  patternNameActive: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  patternDetails: {
    color: colors.textDark,
    fontSize: 11,
    marginTop: 8,
    letterSpacing: 1,
  },
  activeIndicator: {
    color: colors.textPrimary,
    fontSize: 20,
    marginLeft: 10,
  },
  miniButton: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  miniButtonText: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  
  // ============================================
  // MISC
  // ============================================
  emptyText: {
    color: colors.textDark,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  comingSoonText: {
    color: colors.textDark,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
