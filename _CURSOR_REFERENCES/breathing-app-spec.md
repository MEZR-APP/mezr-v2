# BreathFlow - Breathing Exercise App
## Complete Technical Specification v1.0

---

# Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Design System](#4-design-system)
5. [Screen Specifications](#5-screen-specifications)
6. [Core Features](#6-core-features)
7. [State Management](#7-state-management)
8. [Data Models](#8-data-models)
9. [Audio System](#9-audio-system)
10. [Animation Specifications](#10-animation-specifications)
11. [File Structure](#11-file-structure)
12. [API & Services](#12-api--services)
13. [Edge Cases & Error Handling](#13-edge-cases--error-handling)
14. [Testing Requirements](#14-testing-requirements)
15. [Future Scalability](#15-future-scalability)
16. [Acceptance Criteria](#16-acceptance-criteria)
17. [Prompt Snippets for AI Tools](#17-prompt-snippets-for-ai-tools)

---

# 1. Project Overview

## 1.1 App Name
**BreathFlow**

## 1.2 Purpose
A minimalist mobile application for guided breathing exercises and breath-hold training. Users complete breathing sessions consisting of rhythmic inhale/exhale cycles followed by timed breath holds.

## 1.3 Target Platforms
- iOS 13.0+
- Android 8.0+ (API level 26+)

## 1.4 Core User Journey
```
Open App â†’ Login â†’ Landing Page â†’ Start Session â†’ Complete Breathing Cycles 
â†’ Breath Hold â†’ Repeat Sessions â†’ View Stats â†’ Logout
```

## 1.5 Key Constraints
- Minimalist UI: Black, white, and gray only
- Must work offline (sync when online)
- Must support background audio (driving mode)
- Free tools only for development

---

# 2. Tech Stack

## 2.1 Primary Framework
```
Framework: React Native with Expo (SDK 51+)
Language: TypeScript (strict mode)
```

### Why Expo?
- Single codebase for iOS and Android
- Expo Go for rapid testing
- EAS Build for production (free tier available)
- Built-in libraries for audio, haptics, notifications

## 2.2 Complete Dependencies

### Core
```json
{
  "expo": "~51.0.0",
  "react": "18.2.0",
  "react-native": "0.74.0",
  "typescript": "~5.3.0"
}
```

### Navigation
```json
{
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/bottom-tabs": "^6.5.0",
  "@react-navigation/native-stack": "^6.9.0",
  "react-native-screens": "~3.31.0",
  "react-native-safe-area-context": "4.10.0"
}
```

### State Management
```json
{
  "zustand": "^4.5.0",
  "immer": "^10.0.0",
  "@tanstack/react-query": "^5.0.0"
}
```

### Backend & Auth
```json
{
  "firebase": "^10.12.0",
  "@react-native-google-signin/google-signin": "^12.0.0",
  "@react-native-async-storage/async-storage": "1.23.1"
}
```

### UI & Animation
```json
{
  "react-native-reanimated": "~3.10.0",
  "react-native-gesture-handler": "~2.16.0",
  "lottie-react-native": "^6.7.0",
  "react-native-svg": "^15.2.0"
}
```

### Audio
```json
{
  "expo-av": "~14.0.0"
}
```

### Charts & Analytics
```json
{
  "react-native-chart-kit": "^6.12.0",
  "react-native-gifted-charts": "^1.4.0"
}
```

### Utilities
```json
{
  "date-fns": "^3.6.0",
  "uuid": "^9.0.0",
  "expo-haptics": "~13.0.0",
  "expo-keep-awake": "~13.0.0",
  "expo-notifications": "~0.28.0"
}
```

## 2.3 Development Tools
```json
{
  "devDependencies": {
    "@types/react": "~18.2.0",
    "@types/uuid": "^9.0.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.4.0"
  }
}
```

## 2.4 Backend Services (Firebase - Free Tier)
```
- Firebase Authentication (Email/Password + Google)
- Cloud Firestore (Database)
- Firebase Analytics (Optional)
```

### Firebase Free Tier Limits (Sufficient for MVP)
- 50K authentications/month
- 1GB Firestore storage
- 50K reads/day, 20K writes/day

---

# 3. Architecture

## 3.1 High-Level Architecture
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      PRESENTATION LAYER                      â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚  Login  â”‚ â”‚ Landing â”‚ â”‚Settings â”‚ â”‚  Stats  â”‚ â”‚Profile â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”¬â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”˜
        â”‚          â”‚          â”‚          â”‚           â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      COMPONENT LAYER                        â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚BreathingOrb  â”‚ â”‚ SessionTimer â”‚ â”‚ StatsChart           â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                       HOOKS LAYER                           â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚useBreathing  â”‚ â”‚ useAudio     â”‚ â”‚ useSession           â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    STATE MANAGEMENT (Zustand)               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚ authStore    â”‚ â”‚sessionStore  â”‚ â”‚ settingsStore        â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      SERVICE LAYER                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚ AuthService  â”‚ â”‚ FirebaseDB   â”‚ â”‚ AudioService         â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                              â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    EXTERNAL SERVICES                        â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚  â”‚    Firebase Auth       â”‚ â”‚     Cloud Firestore         â”‚â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## 3.2 State Flow Diagram
```
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚     IDLE     â”‚
                    â”‚ (App Start)  â”‚
                    â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                           â”‚ User taps "Start"
                           â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
            â”Œâ”€â”€â”€â”€â”€â”€â–¶â”‚   INHALE     â”‚â—€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
            â”‚       â”‚  (2 seconds) â”‚          â”‚
            â”‚       â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜          â”‚
            â”‚              â”‚ Timer complete   â”‚
            â”‚              â–¼                  â”‚
            â”‚       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”          â”‚
            â”‚       â”‚   EXHALE     â”‚          â”‚
            â”‚       â”‚(2.25 seconds)â”‚          â”‚
            â”‚       â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜          â”‚
            â”‚              â”‚                  â”‚
            â”‚              â–¼                  â”‚
            â”‚       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”          â”‚
            â”‚       â”‚ cycleCount   â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
            â”‚       â”‚    < max?    â”‚  Yes (increment cycle)
            â”‚       â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
            â”‚              â”‚ No (cycles complete)
            â”‚              â–¼
            â”‚       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
            â”‚       â”‚ BREATH_HOLD  â”‚
            â”‚       â”‚ (N seconds)  â”‚
            â”‚       â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
            â”‚              â”‚ Timer complete
            â”‚              â–¼
            â”‚       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
            â”‚       â”‚sessionCount  â”‚
            â”‚       â”‚    < max?    â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
            â”‚       â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜          â”‚
            â”‚              â”‚ No               â”‚ Yes (increment session)
            â”‚              â–¼                  â”‚
            â”‚       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”          â”‚
            â”‚       â”‚  COMPLETE    â”‚          â”‚
            â”‚       â”‚ (Save Stats) â”‚          â”‚
            â”‚       â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜          â”‚
            â”‚              â”‚                  â”‚
            â”‚              â–¼                  â”‚
            â”‚       â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”          â”‚
            â””â”€â”€â”€â”€â”€â”€â”€â”‚     IDLE     â”‚â—€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

# 4. Design System

## 4.1 Color Palette
```typescript
export const colors = {
  // Primary
  background: '#000000',      // Pure black
  surface: '#0A0A0A',         // Slightly lighter black for cards
  
  // Text
  textPrimary: '#FFFFFF',     // Pure white
  textSecondary: '#B3B3B3',   // Light gray
  textTertiary: '#666666',    // Medium gray
  
  // Interactive
  accent: '#FFFFFF',          // White for buttons/focus
  accentDim: '#333333',       // Dark gray for inactive
  
  // Borders
  borderLight: '#333333',     // Subtle borders
  borderMedium: '#4D4D4D',    // More visible borders
  
  // States
  success: '#4ADE80',         // Green (for completion)
  error: '#EF4444',           // Red (for errors only)
  warning: '#FBBF24',         // Yellow (for warnings only)
  
  // Breathing Animation
  orbPrimary: '#FFFFFF',      // Main circle
  orbSecondary: '#808080',    // Secondary circles
  orbGlow: 'rgba(255, 255, 255, 0.15)', // Glow effect
} as const;
```

## 4.2 Typography
```typescript
export const typography = {
  // Font Family (System fonts for performance)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    hero: 48,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;
```

## 4.3 Spacing System
```typescript
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;
```

## 4.4 Component Dimensions
```typescript
export const dimensions = {
  // Buttons
  buttonHeight: 56,
  buttonRadius: 28,
  
  // Cards
  cardRadius: 16,
  cardPadding: 20,
  
  // Icons
  iconSm: 20,
  iconMd: 24,
  iconLg: 32,
  
  // Bottom Tab
  tabBarHeight: 80,
  
  // Breathing Orb
  orbMinSize: 100,
  orbMaxSize: 180,
  orbSecondarySize: 30,
  orbSecondaryCount: 8,
  orbSecondaryOrbitRadius: 120,
  orbSecondaryMovement: 20,
} as const;
```

## 4.5 Shadows (Subtle)
```typescript
export const shadows = {
  small: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;
```

---

# 5. Screen Specifications

## 5.1 Login Screen

### Layout
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                 â”‚
â”‚         [App Logo]              â”‚
â”‚        "BreathFlow"             â”‚
â”‚                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Email                     â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Password              ðŸ‘  â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚        Sign In            â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                 â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ or â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€   â”‚
â”‚                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ [G] Continue with Google  â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                 â”‚
â”‚       Don't have account?       â”‚
â”‚          Sign Up                â”‚
â”‚                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Component Specifications
```typescript
interface LoginScreenSpec {
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  title: {
    text: 'BreathFlow',
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 48,
  },
  input: {
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
    placeholderColor: colors.textTertiary,
    marginBottom: 16,
  },
  primaryButton: {
    height: 56,
    backgroundColor: colors.accent,
    borderRadius: 28,
    marginTop: 8,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 24,
    color: colors.textTertiary,
  },
  googleButton: {
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  googleButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  linkText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  linkTextBold: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
}
```

### Validation Rules
```typescript
const loginValidation = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: 'Please enter a valid email address',
  },
  password: {
    required: true,
    minLength: 8,
    errorMessage: 'Password must be at least 8 characters',
  },
};
```

### States
```typescript
type LoginScreenState = 
  | 'idle'           // Initial state
  | 'validating'     // Checking input
  | 'authenticating' // Firebase request in progress
  | 'error'          // Show error message
  | 'success';       // Navigate to Landing
```

---

## 5.2 Landing Screen (Main Breathing Screen)

### Layout - Idle State
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                 â”‚
â”‚                                 â”‚
â”‚           â—‹     â—‹               â”‚
â”‚         â—‹         â—‹             â”‚
â”‚        â—‹    â—‰     â—‹            â”‚
â”‚         â—‹         â—‹             â”‚
â”‚           â—‹     â—‹               â”‚
â”‚                                 â”‚
â”‚          "Breathe"              â”‚
â”‚                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚         START             â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                 â”‚
â”‚                                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  [Profile]  [Settings]  [Stats] â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Layout - Active Breathing State
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                 â”‚
â”‚     Session 1 of 3              â”‚
â”‚     Breath 12 of 25             â”‚
â”‚                                 â”‚
â”‚           â—‹     â—‹               â”‚
â”‚         â—‹         â—‹             â”‚
â”‚        â—‹    â—‰     â—‹   â† EXPANDING
â”‚         â—‹         â—‹             â”‚
â”‚           â—‹     â—‹               â”‚
â”‚                                 â”‚
â”‚          "Inhale"               â”‚
â”‚                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚          PAUSE            â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                 â”‚
â”‚                                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  [Profile]  [Settings]  [Stats] â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Layout - Breath Hold State
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                 â”‚
â”‚     Session 1 of 3              â”‚
â”‚                                 â”‚
â”‚                                 â”‚
â”‚           â—‹     â—‹               â”‚
â”‚         â—‹         â—‹             â”‚
â”‚        â—‹    â—‰     â—‹   â† FROZEN + GLOW
â”‚         â—‹         â—‹             â”‚
â”‚           â—‹     â—‹               â”‚
â”‚                                 â”‚
â”‚           "Hold"                â”‚
â”‚            0:12                 â”‚
â”‚                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚       END HOLD            â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  [Profile]  [Settings]  [Stats] â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Component Specifications
```typescript
interface LandingScreenSpec {
  header: {
    sessionText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    breathText: {
      fontSize: 14,
      color: colors.textTertiary,
    },
  },
  orb: {
    container: {
      width: 280,
      height: 280,
      justifyContent: 'center',
      alignItems: 'center',
    },
    primary: {
      minSize: 100,
      maxSize: 180,
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.orbPrimary,
    },
    secondary: {
      count: 8,
      size: 30,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.orbSecondary,
      orbitRadius: 120,
      movementDistance: 20,
    },
  },
  statusText: {
    fontSize: 24,
    fontWeight: '300',
    color: colors.textPrimary,
    marginTop: 32,
    letterSpacing: 4,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '200',
    color: colors.textPrimary,
    marginTop: 8,
  },
  actionButton: {
    width: '80%',
    maxWidth: 280,
    height: 56,
    borderRadius: 28,
    marginTop: 48,
  },
  bottomTab: {
    height: 80,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
}
```

---

## 5.3 Settings Screen

### Layout
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  â†  Settings                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                 â”‚
â”‚  Sound                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€[â—‹]â”€â”€â”‚  â† Toggle ON
â”‚                                 â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚                                 â”‚
â”‚  Breath Hold Duration           â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚          15 sec           â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚  5s â”€â”€â”€â”€â”€â”€â”€â”€â”€â—â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ 120sâ”‚
â”‚                                 â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚                                 â”‚
â”‚  Breaths Per Session            â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚            25             â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚  5 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â—â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ 50â”‚
â”‚                                 â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚                                 â”‚
â”‚  Number of Sessions             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚             3             â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚  1 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â—â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ 10â”‚
â”‚                                 â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚                                 â”‚
â”‚  Driving Mode                   â”‚
â”‚  Screen stays off, audio only   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€[â—‹]â”€â”€â”‚  â† Toggle OFF
â”‚                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Component Specifications
```typescript
interface SettingsScreenSpec {
  header: {
    title: 'Settings',
    backButton: true,
    backgroundColor: colors.background,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 4,
  },
  toggle: {
    trackColorOff: colors.borderLight,
    trackColorOn: colors.textPrimary,
    thumbColor: colors.background,
  },
  slider: {
    minimumTrackTintColor: colors.textPrimary,
    maximumTrackTintColor: colors.borderLight,
    thumbTintColor: colors.textPrimary,
  },
  valueDisplay: {
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  valueText: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  rangeLabels: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 8,
  },
}
```

### Settings Constraints
```typescript
interface SettingsConstraints {
  sound: {
    type: 'boolean',
    default: true,
  },
  breathHoldDuration: {
    type: 'number',
    min: 5,
    max: 120,
    step: 5,
    default: 15,
    unit: 'seconds',
  },
  breathsPerSession: {
    type: 'number',
    min: 5,
    max: 50,
    step: 1,
    default: 25,
    unit: 'breaths',
  },
  numberOfSessions: {
    type: 'number',
    min: 1,
    max: 10,
    step: 1,
    default: 3,
    unit: 'sessions',
  },
  drivingMode: {
    type: 'boolean',
    default: false,
  },
}
```

---

## 5.4 Stats Screen

### Layout
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  â†  Statistics                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                 â”‚
â”‚  Total Sessions                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚          127              â”‚  â”‚
â”‚  â”‚    lifetime sessions      â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                 â”‚
â”‚  Total Breath Holds             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚        32 min             â”‚  â”‚
â”‚  â”‚     cumulative hold       â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                 â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚                                 â”‚
â”‚  Breath Hold History            â”‚
â”‚  [Week] [Month] [Year]          â”‚
â”‚                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚   â–ˆ                       â”‚  â”‚
â”‚  â”‚   â–ˆ â–ˆ   â–ˆ     â”€â”€ avg      â”‚  â”‚
â”‚  â”‚   â–ˆ â–ˆ â–ˆ â–ˆ   â–ˆ             â”‚  â”‚
â”‚  â”‚ â–ˆ â–ˆ â–ˆ â–ˆ â–ˆ â–ˆ â–ˆ             â”‚  â”‚
â”‚  â”‚ M T W T F S S             â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                 â”‚
â”‚  Average: 15.2 sec              â”‚
â”‚  Best: 45 sec                   â”‚
â”‚                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Component Specifications
```typescript
interface StatsScreenSpec {
  header: {
    title: 'Statistics',
    backButton: true,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  tabTextActive: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  tabIndicator: {
    height: 2,
    backgroundColor: colors.textPrimary,
    marginTop: 8,
  },
  chart: {
    height: 220,
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  chartConfig: {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(179, 179, 179, ${opacity})`,
    barPercentage: 0.6,
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: colors.borderLight,
    },
  },
  averageLine: {
    stroke: colors.textSecondary,
    strokeWidth: 1,
    strokeDasharray: '5,5',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
}
```

### Chart Data Structure
```typescript
interface ChartDataPoint {
  label: string;      // "Mon", "Jan", "2024"
  value: number;      // Average hold time in seconds
  count: number;      // Number of sessions
}

interface ChartData {
  period: 'week' | 'month' | 'year';
  data: ChartDataPoint[];
  average: number;
  best: number;
}
```

---

## 5.5 Profile Screen

### Layout
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  â†  Profile                     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                 â”‚
â”‚         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”             â”‚
â”‚         â”‚   ðŸ‘¤    â”‚             â”‚
â”‚         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜             â”‚
â”‚        user@email.com           â”‚
â”‚                                 â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚                                 â”‚
â”‚  Account                        â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Edit Profile           â†’  â”‚  â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤  â”‚
â”‚  â”‚ Change Password        â†’  â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                 â”‚
â”‚  Data                           â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Export Data            â†’  â”‚  â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤  â”‚
â”‚  â”‚ Delete Account         â†’  â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚        Sign Out           â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                 â”‚
â”‚        Version 1.0.0            â”‚
â”‚                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

# 6. Core Features

## 6.1 Breathing Session Flow

### Complete State Machine
```typescript
type BreathingState = 
  | { type: 'IDLE' }
  | { type: 'COUNTDOWN'; secondsRemaining: number }
  | { type: 'INHALE'; cycleNumber: number; sessionNumber: number }
  | { type: 'EXHALE'; cycleNumber: number; sessionNumber: number }
  | { type: 'BREATH_HOLD'; secondsRemaining: number; sessionNumber: number }
  | { type: 'SESSION_REST'; sessionNumber: number }
  | { type: 'COMPLETE'; stats: SessionStats }
  | { type: 'PAUSED'; previousState: BreathingState };

type BreathingAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'TICK' }
  | { type: 'PHASE_COMPLETE' }
  | { type: 'END_HOLD_EARLY' };
```

### Timing Configuration
```typescript
const breathingConfig = {
  countdown: {
    duration: 3,  // 3 second countdown before start
    interval: 1000,
  },
  inhale: {
    duration: 2000,  // 2 seconds
    easing: 'easeInOut',
  },
  exhale: {
    duration: 2250,  // 2.25 seconds
    easing: 'easeOut',
  },
  breathHold: {
    defaultDuration: 15000,  // 15 seconds (configurable)
    interval: 1000,
  },
  sessionRest: {
    duration: 5000,  // 5 seconds between sessions
  },
};
```

### Session Logic (Pseudocode)
```typescript
function runBreathingSession(settings: Settings): void {
  for (let session = 1; session <= settings.numberOfSessions; session++) {
    // Breathing cycles
    for (let cycle = 1; cycle <= settings.breathsPerSession; cycle++) {
      await runInhale(settings.inhaleDuration);
      await runExhale(settings.exhaleDuration);
      // Note: Always ends on exhale (no partial cycles)
    }
    
    // Breath hold
    await runBreathHold(settings.breathHoldDuration);
    
    // Rest between sessions (not after last one)
    if (session < settings.numberOfSessions) {
      await showSessionComplete(session);
      await wait(sessionRestDuration);
    }
  }
  
  // Save and show results
  await saveSession(sessionData);
  showComplete();
}
```

## 6.2 Driving Mode Specification

### Behavior
```typescript
interface DrivingModeSpec {
  // Screen behavior
  screenBehavior: 'keep_awake_but_dim',  // Not actual screen off
  dimLevel: 0.1,  // 10% brightness
  
  // Audio behavior
  audioInBackground: true,
  audioInterruptionHandling: 'duck_and_resume',
  
  // Session handling
  autoSaveOnInterrupt: true,
  autoSaveOnAppClose: true,
  
  // Visual feedback
  showMinimalUI: true,  // Just "Tap to exit" text
  
  // Haptics
  useHapticsForPhaseChange: true,
}
```

### Implementation Notes
```typescript
// Driving mode uses:
// - expo-keep-awake to prevent screen sleep
// - expo-brightness to dim screen
// - Background audio continues via expo-av
// - AppState listener for app close detection
// - Auto-saves incomplete session to AsyncStorage
```

---

# 7. State Management

## 7.1 Store Structure (Zustand)

### Auth Store
```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signOut: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      
      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
      }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      signOut: () => set({ 
        user: null, 
        isAuthenticated: false,
        error: null,
      }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

### Settings Store
```typescript
// stores/settingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  soundEnabled: boolean;
  breathHoldDuration: number;  // in seconds
  breathsPerSession: number;
  numberOfSessions: number;
  drivingMode: boolean;
  
  // Computed (not persisted)
  inhaleDuration: number;  // Always 2000ms
  exhaleDuration: number;  // Always 2250ms
}

interface SettingsActions {
  setSoundEnabled: (enabled: boolean) => void;
  setBreathHoldDuration: (seconds: number) => void;
  setBreathsPerSession: (count: number) => void;
  setNumberOfSessions: (count: number) => void;
  setDrivingMode: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const defaultSettings: SettingsState = {
  soundEnabled: true,
  breathHoldDuration: 15,
  breathsPerSession: 25,
  numberOfSessions: 3,
  drivingMode: false,
  inhaleDuration: 2000,
  exhaleDuration: 2250,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setBreathHoldDuration: (breathHoldDuration) => 
        set({ breathHoldDuration: Math.min(120, Math.max(5, breathHoldDuration)) }),
      setBreathsPerSession: (breathsPerSession) => 
        set({ breathsPerSession: Math.min(50, Math.max(5, breathsPerSession)) }),
      setNumberOfSessions: (numberOfSessions) => 
        set({ numberOfSessions: Math.min(10, Math.max(1, numberOfSessions)) }),
      setDrivingMode: (drivingMode) => set({ drivingMode }),
      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        breathHoldDuration: state.breathHoldDuration,
        breathsPerSession: state.breathsPerSession,
        numberOfSessions: state.numberOfSessions,
        drivingMode: state.drivingMode,
      }),
    }
  )
);
```

### Session Store (Active Session)
```typescript
// stores/sessionStore.ts
import { create } from 'zustand';

type BreathingPhase = 'idle' | 'countdown' | 'inhale' | 'exhale' | 'hold' | 'rest' | 'complete' | 'paused';

interface SessionState {
  // Current state
  phase: BreathingPhase;
  previousPhase: BreathingPhase | null;  // For pause/resume
  
  // Progress
  currentSession: number;
  totalSessions: number;
  currentCycle: number;
  totalCycles: number;
  
  // Timers
  holdTimeRemaining: number;
  holdTimeElapsed: number;
  countdownRemaining: number;
  
  // Session data for saving
  sessionStartTime: string | null;
  actualHoldTimes: number[];  // Array of actual hold durations
  
  // Flags
  isActive: boolean;
  isDrivingMode: boolean;
}

interface SessionActions {
  // Lifecycle
  startSession: (settings: SessionSettings) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  
  // Phase transitions
  setPhase: (phase: BreathingPhase) => void;
  completeInhale: () => void;
  completeExhale: () => void;
  startHold: () => void;
  endHold: (actualDuration: number) => void;
  completeSession: () => void;
  
  // Timer updates
  decrementHoldTime: () => void;
  decrementCountdown: () => void;
  
  // Reset
  reset: () => void;
}

interface SessionSettings {
  breathHoldDuration: number;
  breathsPerSession: number;
  numberOfSessions: number;
  drivingMode: boolean;
}

const initialState: SessionState = {
  phase: 'idle',
  previousPhase: null,
  currentSession: 0,
  totalSessions: 0,
  currentCycle: 0,
  totalCycles: 0,
  holdTimeRemaining: 0,
  holdTimeElapsed: 0,
  countdownRemaining: 3,
  sessionStartTime: null,
  actualHoldTimes: [],
  isActive: false,
  isDrivingMode: false,
};

export const useSessionStore = create<SessionState & SessionActions>((set, get) => ({
  ...initialState,
  
  startSession: (settings) => set({
    phase: 'countdown',
    currentSession: 1,
    totalSessions: settings.numberOfSessions,
    currentCycle: 1,
    totalCycles: settings.breathsPerSession,
    holdTimeRemaining: settings.breathHoldDuration,
    countdownRemaining: 3,
    sessionStartTime: new Date().toISOString(),
    actualHoldTimes: [],
    isActive: true,
    isDrivingMode: settings.drivingMode,
  }),
  
  pauseSession: () => {
    const { phase } = get();
    set({ 
      previousPhase: phase,
      phase: 'paused',
    });
  },
  
  resumeSession: () => {
    const { previousPhase } = get();
    if (previousPhase) {
      set({ 
        phase: previousPhase,
        previousPhase: null,
      });
    }
  },
  
  stopSession: () => set(initialState),
  
  setPhase: (phase) => set({ phase }),
  
  completeInhale: () => set({ phase: 'exhale' }),
  
  completeExhale: () => {
    const { currentCycle, totalCycles, currentSession, totalSessions } = get();
    
    if (currentCycle < totalCycles) {
      // More cycles to go
      set({ 
        phase: 'inhale',
        currentCycle: currentCycle + 1,
      });
    } else {
      // Cycles complete, start hold
      set({ phase: 'hold' });
    }
  },
  
  startHold: () => {
    const state = get();
    set({ 
      phase: 'hold',
      holdTimeElapsed: 0,
    });
  },
  
  endHold: (actualDuration) => {
    const { currentSession, totalSessions, actualHoldTimes } = get();
    
    const newHoldTimes = [...actualHoldTimes, actualDuration];
    
    if (currentSession < totalSessions) {
      // More sessions to go
      set({
        phase: 'rest',
        actualHoldTimes: newHoldTimes,
      });
    } else {
      // All sessions complete
      set({
        phase: 'complete',
        actualHoldTimes: newHoldTimes,
        isActive: false,
      });
    }
  },
  
  completeSession: () => {
    const { currentSession, totalSessions, totalCycles } = get();
    const settings = useSettingsStore.getState();
    
    set({
      phase: 'inhale',
      currentSession: currentSession + 1,
      currentCycle: 1,
      holdTimeRemaining: settings.breathHoldDuration,
      holdTimeElapsed: 0,
    });
  },
  
  decrementHoldTime: () => {
    const { holdTimeRemaining, holdTimeElapsed } = get();
    set({
      holdTimeRemaining: Math.max(0, holdTimeRemaining - 1),
      holdTimeElapsed: holdTimeElapsed + 1,
    });
  },
  
  decrementCountdown: () => {
    const { countdownRemaining } = get();
    if (countdownRemaining > 1) {
      set({ countdownRemaining: countdownRemaining - 1 });
    } else {
      set({ 
        phase: 'inhale',
        countdownRemaining: 0,
      });
    }
  },
  
  reset: () => set(initialState),
}));
```

### Stats Store
```typescript
// stores/statsStore.ts
import { create } from 'zustand';

interface SessionRecord {
  id: string;
  date: string;  // ISO string
  breathCycles: number;
  holdDuration: number;  // Target duration
  actualHoldTimes: number[];  // Actual durations per session
  sessionsCompleted: number;
  totalSessions: number;
  drivingMode: boolean;
}

interface StatsState {
  sessions: SessionRecord[];
  isLoading: boolean;
  error: string | null;
}

interface StatsActions {
  setSessions: (sessions: SessionRecord[]) => void;
  addSession: (session: SessionRecord) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface ComputedStats {
  totalSessions: number;
  totalHoldTime: number;  // In seconds
  averageHoldTime: number;
  bestHoldTime: number;
  weeklyData: ChartData;
  monthlyData: ChartData;
  yearlyData: ChartData;
}

export const useStatsStore = create<StatsState & StatsActions>((set) => ({
  sessions: [],
  isLoading: false,
  error: null,
  
  setSessions: (sessions) => set({ sessions, isLoading: false }),
  addSession: (session) => set((state) => ({ 
    sessions: [session, ...state.sessions] 
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}));

// Selector for computed stats
export const selectComputedStats = (state: StatsState): ComputedStats => {
  const { sessions } = state;
  
  // Calculate aggregates
  const allHoldTimes = sessions.flatMap(s => s.actualHoldTimes);
  const totalHoldTime = allHoldTimes.reduce((sum, t) => sum + t, 0);
  const averageHoldTime = allHoldTimes.length > 0 
    ? totalHoldTime / allHoldTimes.length 
    : 0;
  const bestHoldTime = allHoldTimes.length > 0 
    ? Math.max(...allHoldTimes) 
    : 0;
  
  return {
    totalSessions: sessions.length,
    totalHoldTime,
    averageHoldTime,
    bestHoldTime,
    weeklyData: calculateWeeklyData(sessions),
    monthlyData: calculateMonthlyData(sessions),
    yearlyData: calculateYearlyData(sessions),
  };
};
```

---

# 8. Data Models

## 8.1 Firebase Schema

### Firestore Collections
```
/users
  /{userId}
    - email: string
    - displayName: string | null
    - photoURL: string | null
    - createdAt: timestamp
    - updatedAt: timestamp
    - settings: {
        soundEnabled: boolean
        breathHoldDuration: number
        breathsPerSession: number
        numberOfSessions: number
        drivingMode: boolean
      }

/users/{userId}/sessions
  /{sessionId}
    - id: string
    - date: timestamp
    - breathCycles: number
    - holdDurationTarget: number
    - actualHoldTimes: number[]
    - sessionsCompleted: number
    - totalSessions: number
    - drivingMode: boolean
    - createdAt: timestamp
```

### TypeScript Interfaces
```typescript
// types/database.ts

export interface DBUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  settings: DBUserSettings;
}

export interface DBUserSettings {
  soundEnabled: boolean;
  breathHoldDuration: number;
  breathsPerSession: number;
  numberOfSessions: number;
  drivingMode: boolean;
}

export interface DBSession {
  id: string;
  date: FirebaseFirestore.Timestamp;
  breathCycles: number;
  holdDurationTarget: number;
  actualHoldTimes: number[];
  sessionsCompleted: number;
  totalSessions: number;
  drivingMode: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

// Firestore converters
export const sessionConverter = {
  toFirestore(session: SessionRecord): DBSession {
    return {
      id: session.id,
      date: Timestamp.fromDate(new Date(session.date)),
      breathCycles: session.breathCycles,
      holdDurationTarget: session.holdDuration,
      actualHoldTimes: session.actualHoldTimes,
      sessionsCompleted: session.sessionsCompleted,
      totalSessions: session.totalSessions,
      drivingMode: session.drivingMode,
      createdAt: Timestamp.now(),
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): SessionRecord {
    const data = snapshot.data() as DBSession;
    return {
      id: data.id,
      date: data.date.toDate().toISOString(),
      breathCycles: data.breathCycles,
      holdDuration: data.holdDurationTarget,
      actualHoldTimes: data.actualHoldTimes,
      sessionsCompleted: data.sessionsCompleted,
      totalSessions: data.totalSessions,
      drivingMode: data.drivingMode,
    };
  },
};
```

## 8.2 Local Storage Schema (AsyncStorage)

```typescript
// Keys for AsyncStorage
const STORAGE_KEYS = {
  AUTH: 'auth-storage',
  SETTINGS: 'settings-storage',
  PENDING_SESSIONS: 'pending-sessions',  // For offline support
  INCOMPLETE_SESSION: 'incomplete-session',  // For crash recovery
} as const;

// Incomplete session (for crash recovery)
interface IncompleteSession {
  startTime: string;
  settings: {
    breathHoldDuration: number;
    breathsPerSession: number;
    numberOfSessions: number;
    drivingMode: boolean;
  };
  progress: {
    completedSessions: number;
    completedCycles: number;
    actualHoldTimes: number[];
  };
  savedAt: string;
}
```

---

# 9. Audio System

## 9.1 Audio Files Required

### File Specifications
```typescript
const audioFiles = {
  inhale: {
    filename: 'inhale.mp3',
    duration: 2000,  // Must match inhale duration
    description: 'Soft breath-in sound, gradual intensity increase',
    volume: 0.7,
  },
  exhale: {
    filename: 'exhale.mp3', 
    duration: 2250,  // Must match exhale duration
    description: 'Soft breath-out sound, gradual fade',
    volume: 0.7,
  },
  holdStart: {
    filename: 'hold_start.mp3',
    duration: 500,
    description: 'Subtle chime indicating hold phase',
    volume: 0.5,
    optional: true,
  },
  holdEnd: {
    filename: 'hold_end.mp3',
    duration: 500,
    description: 'Gentle tone indicating hold complete',
    volume: 0.5,
    optional: true,
  },
  sessionComplete: {
    filename: 'session_complete.mp3',
    duration: 1500,
    description: 'Peaceful completion sound',
    volume: 0.6,
    optional: true,
  },
  countdown: {
    filename: 'countdown_tick.mp3',
    duration: 200,
    description: 'Soft tick for countdown',
    volume: 0.4,
    optional: true,
  },
};
```

### Recommended Sources (Free)
```
1. Freesound.org - Search "breathing", "ambient breath"
2. Pixabay.com - Royalty-free sounds
3. Zapsplat.com - Free with attribution
4. Generate with AI - ElevenLabs sound effects (free tier)
```

## 9.2 Audio Service Implementation

```typescript
// services/audioService.ts
import { Audio, AVPlaybackStatus } from 'expo-av';
import { useSettingsStore } from '../stores/settingsStore';

class AudioService {
  private sounds: Map<string, Audio.Sound> = new Map();
  private isInitialized = false;
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Configure audio mode for background playback
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,  // Critical for driving mode
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    
    // Preload sounds
    await this.preloadSounds();
    this.isInitialized = true;
  }
  
  private async preloadSounds(): Promise<void> {
    const soundFiles = {
      inhale: require('../assets/sounds/inhale.mp3'),
      exhale: require('../assets/sounds/exhale.mp3'),
      holdStart: require('../assets/sounds/hold_start.mp3'),
      holdEnd: require('../assets/sounds/hold_end.mp3'),
      sessionComplete: require('../assets/sounds/session_complete.mp3'),
    };
    
    for (const [key, source] of Object.entries(soundFiles)) {
      try {
        const { sound } = await Audio.Sound.createAsync(source, {
          shouldPlay: false,
          volume: 0.7,
        });
        this.sounds.set(key, sound);
      } catch (error) {
        console.warn(`Failed to load sound: ${key}`, error);
      }
    }
  }
  
  async playSound(soundKey: 'inhale' | 'exhale' | 'holdStart' | 'holdEnd' | 'sessionComplete'): Promise<void> {
    const { soundEnabled } = useSettingsStore.getState();
    if (!soundEnabled) return;
    
    const sound = this.sounds.get(soundKey);
    if (!sound) return;
    
    try {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      console.warn(`Failed to play sound: ${soundKey}`, error);
    }
  }
  
  async stopSound(soundKey: string): Promise<void> {
    const sound = this.sounds.get(soundKey);
    if (!sound) return;
    
    try {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
    } catch (error) {
      console.warn(`Failed to stop sound: ${soundKey}`, error);
    }
  }
  
  async stopAllSounds(): Promise<void> {
    for (const sound of this.sounds.values()) {
      try {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
  }
  
  async cleanup(): Promise<void> {
    for (const sound of this.sounds.values()) {
      await sound.unloadAsync();
    }
    this.sounds.clear();
    this.isInitialized = false;
  }
}

export const audioService = new AudioService();
```

---

# 10. Animation Specifications

## 10.1 Breathing Orb Animation

### Visual Design
```
REST STATE (Contracted):
         â—‹     â—‹
       â—‹         â—‹
      â—‹    â—‰     â—‹    <- Central orb: 100px, white stroke
       â—‹         â—‹    <- Secondary orbs: 30px, gray stroke
         â—‹     â—‹         8 orbs at 120px radius from center

INHALE STATE (Expanded):
       â—‹         â—‹
     â—‹             â—‹
    â—‹      â—‰       â—‹   <- Central orb: 180px
     â—‹             â—‹   <- Secondary orbs move outward 20px
       â—‹         â—‹
       
BREATH HOLD STATE (Frozen + Glow):
       â—‹         â—‹
     â—‹             â—‹
    â—‹      â—‰       â—‹   <- Frozen at expanded size
     â—‹     âœ§       â—‹   <- Subtle pulsing glow on center
       â—‹         â—‹
```

### Animation Parameters
```typescript
const orbAnimationConfig = {
  // Central orb
  center: {
    restSize: 100,
    expandedSize: 180,
    strokeWidth: 2,
    strokeColor: '#FFFFFF',
    fillColor: 'transparent',
  },
  
  // Secondary orbs
  secondary: {
    count: 8,
    size: 30,
    strokeWidth: 1,
    strokeColor: '#808080',
    fillColor: 'transparent',
    orbitRadius: 120,
    expandDistance: 20,  // How far they move outward on inhale
  },
  
  // Timing (must match audio)
  inhale: {
    duration: 2000,
    easing: Easing.bezier(0.4, 0, 0.2, 1),  // ease-in-out
  },
  exhale: {
    duration: 2250,
    easing: Easing.bezier(0.0, 0, 0.2, 1),  // ease-out
  },
  
  // Hold state glow
  holdGlow: {
    minOpacity: 0.15,
    maxOpacity: 0.35,
    pulseDuration: 1500,
    blurRadius: 20,
  },
};
```

### React Native Reanimated Implementation
```typescript
// components/BreathingOrb/useOrbAnimation.ts
import { useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing } from 'react-native-reanimated';
import { useSessionStore } from '../../stores/sessionStore';
import { useEffect } from 'react';

export function useOrbAnimation() {
  const phase = useSessionStore((s) => s.phase);
  
  // Shared values
  const centerScale = useSharedValue(1);
  const secondaryOffset = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  
  useEffect(() => {
    switch (phase) {
      case 'inhale':
        // Expand
        centerScale.value = withTiming(1.8, {
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        });
        secondaryOffset.value = withTiming(20, {
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        });
        glowOpacity.value = withTiming(0, { duration: 200 });
        break;
        
      case 'exhale':
        // Contract
        centerScale.value = withTiming(1, {
          duration: 2250,
          easing: Easing.bezier(0.0, 0, 0.2, 1),
        });
        secondaryOffset.value = withTiming(0, {
          duration: 2250,
          easing: Easing.bezier(0.0, 0, 0.2, 1),
        });
        break;
        
      case 'hold':
        // Freeze at current position, add glow
        glowOpacity.value = withRepeat(
          withTiming(0.35, { duration: 750 }),
          -1,  // Infinite
          true  // Reverse
        );
        break;
        
      case 'idle':
      case 'complete':
        // Reset
        centerScale.value = withTiming(1, { duration: 500 });
        secondaryOffset.value = withTiming(0, { duration: 500 });
        glowOpacity.value = withTiming(0, { duration: 200 });
        break;
    }
  }, [phase]);
  
  // Animated styles
  const centerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: centerScale.value }],
  }));
  
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));
  
  return {
    centerScale,
    secondaryOffset,
    centerStyle,
    glowStyle,
  };
}
```

### Secondary Orb Positioning
```typescript
// Calculate positions for 8 orbs around center
function calculateSecondaryPositions(
  count: number,
  radius: number,
  offset: number
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  const angleStep = (2 * Math.PI) / count;
  
  for (let i = 0; i < count; i++) {
    const angle = i * angleStep - Math.PI / 2;  // Start from top
    const actualRadius = radius + offset;
    positions.push({
      x: Math.cos(angle) * actualRadius,
      y: Math.sin(angle) * actualRadius,
    });
  }
  
  return positions;
}

// Positions for 8 orbs (like octopus tentacles):
// Top: 0Â°, Top-Right: 45Â°, Right: 90Â°, etc.
```

---

# 11. File Structure

```
/breathflow
â”œâ”€â”€ app.json
â”œâ”€â”€ App.tsx
â”œâ”€â”€ babel.config.js
â”œâ”€â”€ tsconfig.json
â”œâ”€â”€ package.json
â”œâ”€â”€ .env
â”œâ”€â”€ .env.example
â”œâ”€â”€ .gitignore
â”‚
â”œâ”€â”€ /src
â”‚   â”œâ”€â”€ /app                      # Navigation & Entry
â”‚   â”‚   â”œâ”€â”€ _layout.tsx           # Root layout with providers
â”‚   â”‚   â”œâ”€â”€ index.tsx             # Entry redirect
â”‚   â”‚   â”œâ”€â”€ /auth
â”‚   â”‚   â”‚   â”œâ”€â”€ _layout.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ login.tsx
â”‚   â”‚   â”‚   â””â”€â”€ register.tsx
â”‚   â”‚   â””â”€â”€ /(tabs)
â”‚   â”‚       â”œâ”€â”€ _layout.tsx       # Tab navigator
â”‚   â”‚       â”œâ”€â”€ index.tsx         # Landing/Breathing screen
â”‚   â”‚       â”œâ”€â”€ settings.tsx
â”‚   â”‚       â”œâ”€â”€ stats.tsx
â”‚   â”‚       â””â”€â”€ profile.tsx
â”‚   â”‚
â”‚   â”œâ”€â”€ /components
â”‚   â”‚   â”œâ”€â”€ /ui                   # Base UI components
â”‚   â”‚   â”‚   â”œâ”€â”€ Button.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Input.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Toggle.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Slider.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Card.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ Text.tsx
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ /breathing            # Breathing-specific components
â”‚   â”‚   â”‚   â”œâ”€â”€ BreathingOrb.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ SecondaryOrb.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ OrbGlow.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ SessionHeader.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ PhaseLabel.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ HoldTimer.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ ActionButton.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ CountdownOverlay.tsx
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ /stats                # Stats components
â”‚   â”‚   â”‚   â”œâ”€â”€ SummaryCard.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ BarChart.tsx
â”‚   â”‚   â”‚   â”œâ”€â”€ PeriodTabs.tsx
â”‚   â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚   â”‚
â”‚   â”‚   â””â”€â”€ /auth                 # Auth components
â”‚   â”‚       â”œâ”€â”€ GoogleSignInButton.tsx
â”‚   â”‚       â”œâ”€â”€ AuthForm.tsx
â”‚   â”‚       â””â”€â”€ index.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ /hooks
â”‚   â”‚   â”œâ”€â”€ useBreathingSession.ts    # Main session orchestrator
â”‚   â”‚   â”œâ”€â”€ useOrbAnimation.ts        # Animation control
â”‚   â”‚   â”œâ”€â”€ useAudio.ts               # Audio playback
â”‚   â”‚   â”œâ”€â”€ useTimer.ts               # Generic timer hook
â”‚   â”‚   â”œâ”€â”€ useAuth.ts                # Auth state & actions
â”‚   â”‚   â”œâ”€â”€ useStats.ts               # Stats fetching & computation
â”‚   â”‚   â”œâ”€â”€ useDrivingMode.ts         # Driving mode handling
â”‚   â”‚   â””â”€â”€ useAppState.ts            # App lifecycle handling
â”‚   â”‚
â”‚   â”œâ”€â”€ /stores
â”‚   â”‚   â”œâ”€â”€ authStore.ts
â”‚   â”‚   â”œâ”€â”€ settingsStore.ts
â”‚   â”‚   â”œâ”€â”€ sessionStore.ts
â”‚   â”‚   â”œâ”€â”€ statsStore.ts
â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ /services
â”‚   â”‚   â”œâ”€â”€ firebase.ts               # Firebase init & config
â”‚   â”‚   â”œâ”€â”€ authService.ts            # Auth operations
â”‚   â”‚   â”œâ”€â”€ sessionService.ts         # Session CRUD
â”‚   â”‚   â”œâ”€â”€ audioService.ts           # Audio playback
â”‚   â”‚   â”œâ”€â”€ storageService.ts         # AsyncStorage wrapper
â”‚   â”‚   â””â”€â”€ analyticsService.ts       # Optional analytics
â”‚   â”‚
â”‚   â”œâ”€â”€ /utils
â”‚   â”‚   â”œâ”€â”€ formatters.ts             # Time, number formatters
â”‚   â”‚   â”œâ”€â”€ validators.ts             # Input validation
â”‚   â”‚   â”œâ”€â”€ statsCalculations.ts      # Chart data processing
â”‚   â”‚   â”œâ”€â”€ constants.ts              # App-wide constants
â”‚   â”‚   â””â”€â”€ helpers.ts                # General utilities
â”‚   â”‚
â”‚   â”œâ”€â”€ /types
â”‚   â”‚   â”œâ”€â”€ database.ts               # Firebase types
â”‚   â”‚   â”œâ”€â”€ navigation.ts             # Navigation param types
â”‚   â”‚   â”œâ”€â”€ session.ts                # Session types
â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ /theme
â”‚   â”‚   â”œâ”€â”€ colors.ts
â”‚   â”‚   â”œâ”€â”€ typography.ts
â”‚   â”‚   â”œâ”€â”€ spacing.ts
â”‚   â”‚   â”œâ”€â”€ dimensions.ts
â”‚   â”‚   â””â”€â”€ index.ts
â”‚   â”‚
â”‚   â””â”€â”€ /assets
â”‚       â”œâ”€â”€ /sounds
â”‚       â”‚   â”œâ”€â”€ inhale.mp3
â”‚       â”‚   â”œâ”€â”€ exhale.mp3
â”‚       â”‚   â”œâ”€â”€ hold_start.mp3
â”‚       â”‚   â”œâ”€â”€ hold_end.mp3
â”‚       â”‚   â””â”€â”€ session_complete.mp3
â”‚       â”‚
â”‚       â”œâ”€â”€ /images
â”‚       â”‚   â”œâ”€â”€ logo.png
â”‚       â”‚   â””â”€â”€ icon.png
â”‚       â”‚
â”‚       â””â”€â”€ /fonts                    # If using custom fonts
â”‚
â”œâ”€â”€ /tests
â”‚   â”œâ”€â”€ /unit
â”‚   â”‚   â”œâ”€â”€ stores.test.ts
â”‚   â”‚   â”œâ”€â”€ hooks.test.ts
â”‚   â”‚   â””â”€â”€ utils.test.ts
â”‚   â”‚
â”‚   â””â”€â”€ /integration
â”‚       â””â”€â”€ breathing-session.test.ts
â”‚
â””â”€â”€ /docs
    â”œâ”€â”€ SETUP.md
    â”œâ”€â”€ ARCHITECTURE.md
    â””â”€â”€ CONTRIBUTING.md
```

---

# 12. API & Services

## 12.1 Firebase Configuration

```typescript
// services/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
  getReactNativePersistence,
  Auth 
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    db = getFirestore(app);
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }
  
  return { app, auth, db };
}

export { app, auth, db };
```

## 12.2 Auth Service

```typescript
// services/authService.ts
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth, db } from './firebase';
import { useAuthStore } from '../stores/authStore';

// Initialize Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export const authService = {
  // Email/Password Sign In
  async signInWithEmail(email: string, password: string): Promise<void> {
    const { setLoading, setUser, setError } = useAuthStore.getState();
    
    try {
      setLoading(true);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await this.getUserData(credential.user);
      setUser(userData);
    } catch (error: any) {
      setError(this.getErrorMessage(error.code));
      throw error;
    }
  },
  
  // Email/Password Sign Up
  async signUpWithEmail(email: string, password: string): Promise<void> {
    const { setLoading, setUser, setError } = useAuthStore.getState();
    
    try {
      setLoading(true);
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await this.createUserDocument(credential.user);
      const userData = await this.getUserData(credential.user);
      setUser(userData);
    } catch (error: any) {
      setError(this.getErrorMessage(error.code));
      throw error;
    }
  },
  
  // Google Sign In
  async signInWithGoogle(): Promise<void> {
    const { setLoading, setUser, setError } = useAuthStore.getState();
    
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const credential = await signInWithCredential(auth, googleCredential);
      
      // Create user doc if first time
      const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
      if (!userDoc.exists()) {
        await this.createUserDocument(credential.user);
      }
      
      const userData = await this.getUserData(credential.user);
      setUser(userData);
    } catch (error: any) {
      setError(this.getErrorMessage(error.code));
      throw error;
    }
  },
  
  // Sign Out
  async signOut(): Promise<void> {
    const { signOut } = useAuthStore.getState();
    
    try {
      await GoogleSignin.signOut().catch(() => {});  // Ignore if not Google user
      await firebaseSignOut(auth);
      signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },
  
  // Listen to auth state changes
  subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await this.getUserData(firebaseUser);
        callback(userData);
      } else {
        callback(null);
      }
    });
  },
  
  // Helper: Get user data from Firestore
  async getUserData(firebaseUser: FirebaseUser): Promise<User> {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const userData = userDoc.data();
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || userData?.displayName || null,
      photoURL: firebaseUser.photoURL || userData?.photoURL || null,
      createdAt: userData?.createdAt?.toDate().toISOString() || new Date().toISOString(),
    };
  },
  
  // Helper: Create user document
  async createUserDocument(firebaseUser: FirebaseUser): Promise<void> {
    const defaultSettings = {
      soundEnabled: true,
      breathHoldDuration: 15,
      breathsPerSession: 25,
      numberOfSessions: 3,
      drivingMode: false,
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      settings: defaultSettings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },
  
  // Helper: Get error message
  getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      'auth/invalid-email': 'Invalid email address',
      'auth/user-disabled': 'This account has been disabled',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'An account already exists with this email',
      'auth/weak-password': 'Password is too weak',
      'auth/network-request-failed': 'Network error. Please check your connection.',
    };
    return messages[code] || 'An unexpected error occurred';
  },
};
```

## 12.3 Session Service

```typescript
// services/sessionService.ts
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { useAuthStore } from '../stores/authStore';
import { useStatsStore } from '../stores/statsStore';
import { v4 as uuidv4 } from 'uuid';

export interface SaveSessionParams {
  breathCycles: number;
  holdDurationTarget: number;
  actualHoldTimes: number[];
  sessionsCompleted: number;
  totalSessions: number;
  drivingMode: boolean;
}

export const sessionService = {
  // Save a completed session
  async saveSession(params: SaveSessionParams): Promise<string> {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('User not authenticated');
    
    const sessionId = uuidv4();
    const sessionData = {
      id: sessionId,
      date: Timestamp.now(),
      ...params,
      createdAt: Timestamp.now(),
    };
    
    await addDoc(
      collection(db, 'users', user.uid, 'sessions'),
      sessionData
    );
    
    // Update local store
    const { addSession } = useStatsStore.getState();
    addSession({
      id: sessionId,
      date: new Date().toISOString(),
      breathCycles: params.breathCycles,
      holdDuration: params.holdDurationTarget,
      actualHoldTimes: params.actualHoldTimes,
      sessionsCompleted: params.sessionsCompleted,
      totalSessions: params.totalSessions,
      drivingMode: params.drivingMode,
    });
    
    return sessionId;
  },
  
  // Fetch user's sessions
  async fetchSessions(limitCount: number = 100): Promise<SessionRecord[]> {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('User not authenticated');
    
    const { setLoading, setSessions, setError } = useStatsStore.getState();
    
    try {
      setLoading(true);
      
      const q = query(
        collection(db, 'users', user.uid, 'sessions'),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      const sessions: SessionRecord[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: data.id,
          date: data.date.toDate().toISOString(),
          breathCycles: data.breathCycles,
          holdDuration: data.holdDurationTarget,
          actualHoldTimes: data.actualHoldTimes,
          sessionsCompleted: data.sessionsCompleted,
          totalSessions: data.totalSessions,
          drivingMode: data.drivingMode,
        };
      });
      
      setSessions(sessions);
      return sessions;
    } catch (error) {
      setError('Failed to fetch sessions');
      throw error;
    }
  },
  
  // Fetch sessions for a specific date range
  async fetchSessionsInRange(
    startDate: Date,
    endDate: Date
  ): Promise<SessionRecord[]> {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('User not authenticated');
    
    const q = query(
      collection(db, 'users', user.uid, 'sessions'),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        date: data.date.toDate().toISOString(),
        breathCycles: data.breathCycles,
        holdDuration: data.holdDurationTarget,
        actualHoldTimes: data.actualHoldTimes,
        sessionsCompleted: data.sessionsCompleted,
        totalSessions: data.totalSessions,
        drivingMode: data.drivingMode,
      };
    });
  },
};
```

---

# 13. Edge Cases & Error Handling

## 13.1 Session Interruptions

```typescript
// hooks/useAppState.ts
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSessionStore } from '../stores/sessionStore';
import { audioService } from '../services/audioService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAppState() {
  const appState = useRef(AppState.currentState);
  const { 
    phase, 
    isActive, 
    isDrivingMode,
    pauseSession,
    currentSession,
    currentCycle,
    actualHoldTimes,
  } = useSessionStore();
  
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        // App going to background
        if (
          appState.current.match(/active/) &&
          nextAppState.match(/inactive|background/)
        ) {
          if (isActive) {
            if (isDrivingMode) {
              // Driving mode: Continue audio in background
              // Audio is already configured for background playback
            } else {
              // Normal mode: Pause and save state
              pauseSession();
              await saveIncompleteSession();
            }
          }
        }
        
        // App coming to foreground
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // Check for incomplete session to resume
          const incomplete = await getIncompleteSession();
          if (incomplete && !isActive) {
            // Offer to resume (handled by UI)
          }
        }
        
        appState.current = nextAppState;
      }
    );
    
    return () => subscription.remove();
  }, [isActive, isDrivingMode]);
  
  // Save incomplete session for crash recovery
  async function saveIncompleteSession() {
    const sessionData = useSessionStore.getState();
    const settings = useSettingsStore.getState();
    
    const incompleteSession = {
      startTime: sessionData.sessionStartTime,
      settings: {
        breathHoldDuration: settings.breathHoldDuration,
        breathsPerSession: settings.breathsPerSession,
        numberOfSessions: settings.numberOfSessions,
        drivingMode: settings.drivingMode,
      },
      progress: {
        completedSessions: sessionData.currentSession - 1,
        completedCycles: sessionData.currentCycle - 1,
        actualHoldTimes: sessionData.actualHoldTimes,
      },
      savedAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(
      'incomplete-session',
      JSON.stringify(incompleteSession)
    );
  }
}
```

## 13.2 Error Boundaries

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Could send to error reporting service here
  }
  
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };
  
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  message: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 28,
  },
  buttonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.background,
  },
});
```

## 13.3 Offline Support

```typescript
// hooks/useOfflineSync.ts
import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sessionService } from '../services/sessionService';

const PENDING_SESSIONS_KEY = 'pending-sessions';

export function useOfflineSync() {
  useEffect(() => {
    // Listen for network changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncPendingSessions();
      }
    });
    
    // Initial sync attempt
    syncPendingSessions();
    
    return () => unsubscribe();
  }, []);
}

async function syncPendingSessions() {
  try {
    const pendingJson = await AsyncStorage.getItem(PENDING_SESSIONS_KEY);
    if (!pendingJson) return;
    
    const pending: SaveSessionParams[] = JSON.parse(pendingJson);
    if (pending.length === 0) return;
    
    // Sync each pending session
    const remaining: SaveSessionParams[] = [];
    
    for (const session of pending) {
      try {
        await sessionService.saveSession(session);
      } catch (error) {
        // Keep in pending if sync fails
        remaining.push(session);
      }
    }
    
    // Update pending list
    if (remaining.length === 0) {
      await AsyncStorage.removeItem(PENDING_SESSIONS_KEY);
    } else {
      await AsyncStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(remaining));
    }
  } catch (error) {
    console.error('Failed to sync pending sessions:', error);
  }
}

// Call this when saving a session and offline
export async function queueSessionForSync(session: SaveSessionParams) {
  try {
    const pendingJson = await AsyncStorage.getItem(PENDING_SESSIONS_KEY);
    const pending: SaveSessionParams[] = pendingJson 
      ? JSON.parse(pendingJson) 
      : [];
    
    pending.push(session);
    
    await AsyncStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(pending));
  } catch (error) {
    console.error('Failed to queue session:', error);
  }
}
```

## 13.4 All Edge Cases Checklist

```typescript
const edgeCases = {
  // Session interruptions
  'app_backgrounded': 'Pause session, save state, resume on foreground',
  'phone_call': 'Pause audio, pause session, resume after call',
  'notification': 'Brief audio duck, continue session',
  'app_killed': 'Auto-save to AsyncStorage, offer resume on next open',
  'low_battery': 'Save session, warn user',
  
  // Audio issues
  'audio_load_fail': 'Continue without sound, show warning',
  'headphones_disconnected': 'Pause if driving mode, continue otherwise',
  'volume_at_zero': 'Show visual indicator that sound is muted',
  
  // Network issues
  'offline_session_save': 'Queue for sync, save locally',
  'sync_fail': 'Retry with exponential backoff',
  'auth_token_expired': 'Silent refresh, or prompt re-login',
  
  // User actions
  'pause_mid_inhale': 'Freeze animation at current state',
  'end_hold_early': 'Save actual hold time, continue to next session',
  'stop_mid_session': 'Save partial session, mark as incomplete',
  'settings_change_mid_session': 'Apply to next session, not current',
  
  // Device states
  'screen_rotation': 'Lock to portrait, or adapt layout',
  'accessibility_mode': 'Announce phases with VoiceOver/TalkBack',
  'reduced_motion': 'Disable animations, use simple indicators',
  
  // Data edge cases
  'no_sessions_for_stats': 'Show empty state with encouragement',
  'corrupted_local_data': 'Clear and re-sync from Firebase',
  'very_long_hold_time': 'Cap at 120 seconds',
};
```

---

# 14. Testing Requirements

## 14.1 Unit Tests

```typescript
// tests/unit/sessionStore.test.ts
import { useSessionStore } from '../../src/stores/sessionStore';

describe('SessionStore', () => {
  beforeEach(() => {
    useSessionStore.getState().reset();
  });
  
  describe('startSession', () => {
    it('should initialize session with correct settings', () => {
      const settings = {
        breathHoldDuration: 20,
        breathsPerSession: 30,
        numberOfSessions: 4,
        drivingMode: false,
      };
      
      useSessionStore.getState().startSession(settings);
      const state = useSessionStore.getState();
      
      expect(state.phase).toBe('countdown');
      expect(state.totalSessions).toBe(4);
      expect(state.totalCycles).toBe(30);
      expect(state.holdTimeRemaining).toBe(20);
      expect(state.isActive).toBe(true);
    });
  });
  
  describe('phase transitions', () => {
    it('should cycle through inhale -> exhale correctly', () => {
      useSessionStore.getState().startSession({
        breathHoldDuration: 15,
        breathsPerSession: 25,
        numberOfSessions: 3,
        drivingMode: false,
      });
      
      // Skip countdown
      useSessionStore.getState().setPhase('inhale');
      expect(useSessionStore.getState().phase).toBe('inhale');
      
      useSessionStore.getState().completeInhale();
      expect(useSessionStore.getState().phase).toBe('exhale');
    });
    
    it('should start hold after all cycles complete', () => {
      useSessionStore.setState({
        phase: 'exhale',
        currentCycle: 25,
        totalCycles: 25,
        isActive: true,
      });
      
      useSessionStore.getState().completeExhale();
      expect(useSessionStore.getState().phase).toBe('hold');
    });
  });
});
```

## 14.2 Integration Tests

```typescript
// tests/integration/breathing-session.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useBreathingSession } from '../../src/hooks/useBreathingSession';

describe('Breathing Session Flow', () => {
  jest.useFakeTimers();
  
  it('should complete a full session', async () => {
    const { result } = renderHook(() => useBreathingSession());
    
    // Start session
    act(() => {
      result.current.start({
        breathHoldDuration: 5,
        breathsPerSession: 2,
        numberOfSessions: 1,
        drivingMode: false,
      });
    });
    
    // Wait for countdown
    act(() => jest.advanceTimersByTime(3000));
    expect(result.current.phase).toBe('inhale');
    
    // Cycle 1: inhale
    act(() => jest.advanceTimersByTime(2000));
    expect(result.current.phase).toBe('exhale');
    
    // Cycle 1: exhale
    act(() => jest.advanceTimersByTime(2250));
    expect(result.current.phase).toBe('inhale');
    expect(result.current.currentCycle).toBe(2);
    
    // Cycle 2: inhale
    act(() => jest.advanceTimersByTime(2000));
    expect(result.current.phase).toBe('exhale');
    
    // Cycle 2: exhale -> hold
    act(() => jest.advanceTimersByTime(2250));
    expect(result.current.phase).toBe('hold');
    
    // Hold complete
    act(() => jest.advanceTimersByTime(5000));
    expect(result.current.phase).toBe('complete');
  });
});
```

## 14.3 E2E Test Scenarios

```typescript
// Detox or Maestro test scenarios
const e2eScenarios = [
  {
    name: 'Complete onboarding flow',
    steps: [
      'Launch app',
      'See login screen',
      'Enter email and password',
      'Tap Sign In',
      'See landing page',
      'Verify orb animation is visible',
    ],
  },
  {
    name: 'Complete one breathing session',
    steps: [
      'Login',
      'Tap START button',
      'Wait for countdown (3 seconds)',
      'Observe 25 breathing cycles',
      'Observe 15 second hold',
      'See session complete message',
      'Verify stats updated',
    ],
  },
  {
    name: 'Change settings',
    steps: [
      'Login',
      'Navigate to Settings',
      'Adjust breath hold to 20 seconds',
      'Set breaths per session to 30',
      'Navigate back',
      'Start session',
      'Verify new settings applied',
    ],
  },
  {
    name: 'Pause and resume',
    steps: [
      'Start session',
      'Tap PAUSE during breathing',
      'Verify animation frozen',
      'Tap RESUME',
      'Verify session continues',
    ],
  },
  {
    name: 'Background and foreground',
    steps: [
      'Start session',
      'Background app',
      'Wait 5 seconds',
      'Foreground app',
      'Verify session paused',
      'Resume session',
    ],
  },
];
```

---

# 15. Future Scalability

## 15.1 Planned Features (Phase 2+)

```typescript
const futureFeatures = {
  phase2: {
    'custom_breathing_patterns': {
      description: 'User-defined inhale/exhale/hold durations',
      schema_change: 'Add breathingPattern field to sessions',
      ui_change: 'New Pattern Editor screen',
    },
    'achievements': {
      description: 'Gamification with badges',
      new_collection: '/users/{userId}/achievements',
      ui_change: 'Achievement toast notifications',
    },
    'reminders': {
      description: 'Daily breathing reminders',
      requires: 'expo-notifications',
      new_settings: 'reminderTime, reminderDays',
    },
  },
  
  phase3: {
    'social_features': {
      description: 'Share sessions, friends list',
      new_collections: '/friendships, /sharedSessions',
      privacy: 'Opt-in only',
    },
    'guided_sessions': {
      description: 'Voice-guided breathing with instructor',
      requires: 'Audio file hosting, streaming',
      monetization: 'Premium feature',
    },
    'health_integration': {
      description: 'Apple Health / Google Fit sync',
      requires: 'expo-apple-health-kit, expo-google-fit',
    },
    'wearable_support': {
      description: 'Apple Watch / Wear OS companion',
      requires: 'Separate native apps',
    },
  },
};
```

## 15.2 Schema Evolution Strategy

```typescript
// Database versioning approach
const schemaVersions = {
  v1: {
    // Current schema
    sessions: 'Basic session with single hold time',
  },
  v2: {
    // Planned
    sessions: {
      add: 'breathingPattern: { inhale, hold1, exhale, hold2 }',
      migrate: 'Set default pattern for existing sessions',
    },
  },
  v3: {
    // Future
    sessions: {
      add: 'guidedSessionId?: string',
      add: 'instructor?: string',
    },
  },
};

// Migration function template
async function migrateToV2(userId: string) {
  const sessions = await fetchAllSessions(userId);
  const batch = writeBatch(db);
  
  for (const session of sessions) {
    if (!session.breathingPattern) {
      batch.update(doc(db, `users/${userId}/sessions/${session.id}`), {
        breathingPattern: {
          inhale: 2000,
          hold1: 0,
          exhale: 2250,
          hold2: session.holdDurationTarget * 1000,
        },
        schemaVersion: 2,
      });
    }
  }
  
  await batch.commit();
}
```

## 15.3 Modular Architecture for Extensions

```typescript
// Breathing pattern plugin interface
interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  phases: Phase[];
  defaultCycles: number;
}

interface Phase {
  type: 'inhale' | 'exhale' | 'hold';
  duration: number;  // ms
  instruction?: string;  // For guided sessions
}

// Built-in patterns
const patterns: BreathingPattern[] = [
  {
    id: 'default',
    name: 'Basic Breath',
    description: 'Simple inhale-exhale pattern',
    phases: [
      { type: 'inhale', duration: 2000 },
      { type: 'exhale', duration: 2250 },
    ],
    defaultCycles: 25,
  },
  {
    id: 'box',
    name: 'Box Breathing',
    description: '4-4-4-4 pattern used by Navy SEALs',
    phases: [
      { type: 'inhale', duration: 4000 },
      { type: 'hold', duration: 4000 },
      { type: 'exhale', duration: 4000 },
      { type: 'hold', duration: 4000 },
    ],
    defaultCycles: 10,
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    description: 'Relaxation technique by Dr. Andrew Weil',
    phases: [
      { type: 'inhale', duration: 4000 },
      { type: 'hold', duration: 7000 },
      { type: 'exhale', duration: 8000 },
    ],
    defaultCycles: 4,
  },
];
```

---

# 16. Acceptance Criteria

## 16.1 MVP Checklist

### Authentication
- [ ] User can create account with email/password
- [ ] User can sign in with email/password
- [ ] User can sign in with Google
- [ ] User can sign out
- [ ] Auth state persists across app restarts

### Landing/Breathing Screen
- [ ] Orb animation displays correctly (8 secondary circles around center)
- [ ] START button initiates 3-second countdown
- [ ] Inhale expands orb over 2 seconds
- [ ] Exhale contracts orb over 2.25 seconds
- [ ] Cycles continue for configured number (default 25)
- [ ] Breath hold starts after cycles complete
- [ ] Hold timer counts down visibly
- [ ] Sound plays during inhale (when enabled)
- [ ] Sound plays during exhale (when enabled)
- [ ] Animation freezes during hold with glow effect
- [ ] Session/cycle counters display accurately
- [ ] PAUSE button pauses session
- [ ] RESUME button continues session
- [ ] Session completes after all cycles and hold

### Settings
- [ ] Sound toggle works
- [ ] Breath hold slider adjusts duration (5-120 sec)
- [ ] Breaths per session slider works (5-50)
- [ ] Number of sessions slider works (1-10)
- [ ] Driving mode toggle works
- [ ] Settings persist across app restarts

### Stats
- [ ] Total sessions count displays
- [ ] Total hold time displays
- [ ] Week/Month/Year tabs switch chart view
- [ ] Bar chart shows hold times by period
- [ ] Average line displays on chart
- [ ] Average and best hold times display

### Profile
- [ ] User email displays
- [ ] Sign out button works

### Driving Mode
- [ ] Screen dims but stays active
- [ ] Audio continues in background
- [ ] Session auto-saves on completion
- [ ] Minimal UI displays during session

### Offline Support
- [ ] Sessions save locally when offline
- [ ] Sessions sync when connection restored

### Edge Cases
- [ ] App pause saves session state
- [ ] App resume offers to continue session
- [ ] Early hold termination saves actual time
- [ ] Empty stats shows encouraging message

## 16.2 Performance Benchmarks

```typescript
const performanceTargets = {
  appLaunch: {
    coldStart: '< 2 seconds',
    warmStart: '< 1 second',
  },
  navigation: {
    screenTransition: '< 300ms',
  },
  animation: {
    frameRate: '60 fps during breathing',
    cpuUsage: '< 15% during animation',
  },
  audio: {
    latency: '< 50ms from phase change',
    gapless: 'No audible gaps between sounds',
  },
  battery: {
    sessionDrain: '< 5% per 15-minute session',
    drivingMode: '< 3% per 15-minute session',
  },
  memory: {
    baseline: '< 100MB',
    maxDuringSession: '< 150MB',
  },
};
```

---

# 17. Prompt Snippets for AI Tools

## 17.1 Initial Project Setup Prompt

```markdown
Create a new React Native Expo project for a breathing exercise app called BreathFlow.

Requirements:
- Use Expo SDK 51 with TypeScript
- Set up the following folder structure:
  /src
    /app (Expo Router)
    /components
    /hooks
    /stores
    /services
    /theme
    /types
    /utils
    /assets

Install these dependencies:
- Navigation: @react-navigation/native, @react-navigation/bottom-tabs
- State: zustand, @tanstack/react-query
- Animation: react-native-reanimated, react-native-gesture-handler
- Audio: expo-av
- Firebase: firebase, @react-native-google-signin/google-signin
- Charts: react-native-gifted-charts
- Utilities: date-fns, uuid

Create the theme files with this color palette:
- background: #000000
- surface: #0A0A0A  
- textPrimary: #FFFFFF
- textSecondary: #B3B3B3
- textTertiary: #666666
- borderLight: #333333
```

## 17.2 Component Generation Prompts

### Breathing Orb

```markdown
Create a BreathingOrb component for a breathing exercise app.

Visual requirements:
- Central circle: 100px at rest, 180px expanded, white 2px stroke, transparent fill
- 8 secondary circles: 30px, gray stroke, arranged in circle at 120px radius
- Secondary circles move outward 20px when expanding

Animation requirements:
- Inhale: Expand over 2000ms with ease-in-out
- Exhale: Contract over 2250ms with ease-out
- Hold: Freeze at expanded size, add pulsing glow (opacity 0.15 to 0.35)

Props:
- phase: 'idle' | 'inhale' | 'exhale' | 'hold' | 'paused'

Use react-native-reanimated for animations.
Use react-native-svg for the circles.
```

### Session Timer

```markdown
Create a useBreathingSession hook that orchestrates a complete breathing session.

State machine phases:
1. idle - Waiting to start
2. countdown - 3 second countdown before start
3. inhale - 2 second inhale
4. exhale - 2.25 second exhale (repeat for N cycles)
5. hold - N second breath hold
6. rest - 5 second rest between sessions
7. complete - All sessions done

Input settings:
- breathHoldDuration: number (seconds)
- breathsPerSession: number (default 25)
- numberOfSessions: number (default 3)

Return:
- phase: current phase
- currentSession: number
- totalSessions: number
- currentCycle: number
- totalCycles: number
- holdTimeRemaining: number
- start(): void
- pause(): void
- resume(): void
- stop(): void

Use Zustand for state management.
Trigger audio via audioService on phase changes.
```

## 17.3 Screen Implementation Prompts

### Settings Screen

```markdown
Create a Settings screen for BreathFlow breathing app.

Layout (top to bottom):
1. Header: "Settings" with back button
2. Sound toggle (on/off)
3. Breath Hold Duration slider (5-120 seconds, step 5)
4. Breaths Per Session slider (5-50, step 1)
5. Number of Sessions slider (1-10, step 1)
6. Driving Mode toggle with description

Design requirements:
- Black background (#000000)
- White text (#FFFFFF) for labels
- Gray text (#666666) for descriptions
- Each slider shows current value in a pill above it
- Use Zustand settingsStore for persistence

Components to use:
- Custom Toggle component
- Custom Slider component with value display
- Section dividers between groups
```

### Stats Screen

```markdown
Create a Stats screen for BreathFlow breathing app.

Layout:
1. Header: "Statistics" with back button
2. Summary cards:
   - Total Sessions (large number + "lifetime sessions" label)
   - Total Breath Holds (formatted as minutes + "cumulative hold" label)
3. Tab bar: Week | Month | Year
4. Bar chart showing average hold times per period
5. Horizontal average line across chart
6. Stats row: Average time | Best time

Chart requirements:
- Use react-native-gifted-charts
- Black background, white bars
- Gray average line (dashed)
- X-axis labels: M T W T F S S (week) or Jan, Feb... (month) or 2023, 2024 (year)
- Y-axis: seconds

Data comes from useStatsStore selector selectComputedStats.
```

## 17.4 Testing Prompts

```markdown
Write unit tests for the sessionStore using Jest.

Test cases:
1. startSession initializes all fields correctly
2. Phase transitions: inhale -> exhale -> inhale (cycle increment)
3. After all cycles complete, phase becomes 'hold'
4. After hold, if more sessions remain, phase becomes 'rest'
5. After final session hold, phase becomes 'complete'
6. pauseSession saves previous phase
7. resumeSession restores previous phase
8. stopSession resets to initial state
9. endHold with actual duration saves to actualHoldTimes array

Use beforeEach to reset store.
Test both happy path and edge cases.
```

---

# Appendix A: Environment Variables

```bash
# .env.example

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Sign-In
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
```

---

# Appendix B: Firebase Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Sessions subcollection
      match /sessions/{sessionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

# Appendix C: App Store Checklist

```markdown
## iOS App Store
- [ ] App icon (1024x1024)
- [ ] Screenshots (6.5", 5.5" iPhones)
- [ ] App description
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Age rating questionnaire
- [ ] App category: Health & Fitness

## Google Play Store
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (phone & tablet)
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] Target age group
- [ ] App category: Health & Fitness
```

---

**END OF SPECIFICATION**

*Version 1.0 - Created for AI-assisted development*
*Last updated: 2024*
