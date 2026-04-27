/**
 * Mezr App - Privacy Policy (PR-013)
 * Plain English privacy policy, in-app view
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const LAST_UPDATED = 'February 6, 2025';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export default function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backLabel}>← CLOSE</Text>
        </TouchableOpacity>
        <Text style={styles.title}>PRIVACY POLICY</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>

        <Text style={styles.h2}>What We Collect</Text>
        <Text style={styles.p}>
          We only collect what is essential to run your account and improve your
          experience. That means your email address (for account login and
          recovery) and breathing session times—such as when you did a session
          and how long you breathed. We do not need more than that.
        </Text>
        <Text style={styles.p}>
          We do not collect your location, device information, health data from
          your device, behavior tracking, or advertising IDs. We do not build a
          profile of you for ads or analytics. What you do in the app stays
          between you and the app unless you choose to back it up to the cloud.
        </Text>

        <Text style={styles.h2}>Where Your Data Lives</Text>
        <Text style={styles.p}>
          By default, everything stays on your device. Your sessions are saved
          locally, you keep full control of your data, and the app works
          offline. We believe you should own your data and decide where it goes.
        </Text>
        <Text style={styles.p}>
          Cloud backup is optional. You choose whether to enable it in Settings.
          If you do, your session data is encrypted during transit and stored
          securely in Firebase so you can access it from multiple devices. We do
          not use your cloud data for anything other than giving you access to
          it when you want it.
        </Text>

        <Text style={styles.h2}>Your Rights</Text>
        <Text style={styles.p}>
          You can view all your data in the Privacy Dashboard (Settings →
          Privacy Dashboard). You can download a copy of your data using the
          Export button. You can delete everything—your account and all
          associated data—using the Delete Account option. We do not make it
          hard to leave or to take your data with you.
        </Text>

        <Text style={styles.h2}>No Tracking</Text>
        <Text style={styles.p}>
          We do not track your behavior inside or outside the app. We do not
          show ads, and we do not sell your data to anyone. We do not share your
          data with third parties for marketing or advertising. Our business
          is not built on your personal information.
        </Text>

        <Text style={styles.h2}>Contact</Text>
        <Text style={styles.p}>
          If you have questions about this policy or your data, email us at
          privacy@mezr.com. We will respond to privacy-related requests
          promptly.
        </Text>

        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backLabel: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    letterSpacing: 4,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 80,
  },
  updated: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 28,
  },
  h2: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  p: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.3,
    marginBottom: 16,
  },
  footer: {
    height: 40,
  },
});
