# MEZR v1.1.0 Release Notes

**Release Date:** May 18, 2026  
**Version:** 1.1.0  
**Build System:** Expo SDK 54 with EAS  
**Branch:** `release/v1.1.0`

---

## 🎯 Major Features

### 1. **Gaze Module** ✨ (NEW)
A meditation experience with visual guidance and customizable audio themes.

**Key Features:**
- **Visual Themes:**
  - Candle: Realistic flame animation with flicker physics (intensity, frequency control)
  - Cosmos: Galaxy meditation with 75+ animated stars (parallax, twinkling)
  - Extensible registry pattern for unlimited future themes

- **Audio Themes:**
  - Silence (default)
  - Crackling fire sounds
  - Ambient space background
  - Customizable per-session via UI registry

- **Session Control:**
  - Duration: Short (3m), Default (5m), Medium (7m), Long (10m)
  - Guided breathing: 4s inhale / 4s exhale pattern
  - Pause/Resume mid-session
  - Session completion logging

- **Streak Tracking:**
  - Automatic consecutive session counting
  - Last session date persistence
  - Total sessions completed analytics

**Technical Implementation:**
- New Zustand store: `gazeStore` (session state machine)
- New service: `gazeService` (Firestore persistence, streak logic)
- Custom hook: `useGazeSession` (animation & timing)
- Visual/audio registry pattern (scalable architecture)
- React Native Reanimated 4.3.0 (smooth 60fps animations)

---

## 📋 Core Updates

### Store Updates
- **gazeStore.ts** (NEW)
  - Session state: `currentSession`, `isActive`, `isPaused`
  - Settings: `defaultDuration`, `visualId`, `audioId`
  - Streak: `currentStreak`, `lastSessionDate`, `totalSessionsCompleted`
  - Actions: `startSession()`, `pauseSession()`, `resumeSession()`, `endSession()`

- **activityStore.ts** (UPDATED)
  - Activity logging includes gaze sessions
  - Stats helper includes gaze counts

- **appStore.ts** (UPDATED)
  - Activity logging delegate calls gazeStore on gaze completion

### Component Updates
- **SettingsScreen.tsx** (UPDATED)
  - New "Gaze Settings" section
  - Duration picker (3m, 5m, 7m, 10m)
  - Visual theme selector (Candle, Cosmos)
  - Audio theme selector (Silence, Crackling, Ambient Space)

- **MainScreen** (UPDATED)
  - Integrated Gaze module rendering
  - Module picker supports 6 modules (+ Run/Cycle coming soon)

### Type System
- **src/types/gaze.ts** (NEW)
  - GazeSession, GazeSettings, GazeSessionStatus types
  - Visual/Audio metadata types

- **src/types/index.ts** (UPDATED)
  - Extended ModuleId union: 'gaze' added
  - GazeActivityEntry in ActivityEntry union

### Constants & Configuration
- **src/constants/gazeConfig.ts** (NEW)
  - Duration presets, breathing pattern, animation config
  - Default settings

- **src/constants/gazeVisualsConfig.ts** (NEW)
  - Visual registry: Candle, Cosmos metadata

- **src/constants/gazeAudioConfig.ts** (NEW)
  - Audio registry: Silence, Crackling, Ambient Space

- **src/constants/modules.ts** (UPDATED)
  - Added 'gaze' to module registry

### Services
- **src/services/gazeService.ts** (NEW)
  - Firestore session persistence
  - Streak calculation logic
  - Session recovery from cloud

### Hooks
- **src/hooks/useGazeSession.ts** (NEW)
  - Timer state machine (elapsed time, progress)
  - Animation frame scheduling
  - Breathing guide synchronization

### Components
- **src/components/modules/GazeModule.tsx** (NEW, v6)
  - Main module UI with dual-pane layout
  - Breathing guide panel
  - Visual animation panel
  - Control buttons (Start, Pause, Resume, End)
  - Real-time progress tracking

- **src/components/modules/GazeCandleAnimation.tsx** (NEW)
  - Multi-layer flame rendering (base, flicker, glow)
  - Physics-based animation
  - Responsive to breathing guide timing
  - Customizable intensity & frequency

- **src/components/modules/GazeCosmosAnimation.tsx** (NEW)
  - Galaxy background with stars
  - 75+ individual star elements
  - Parallax scrolling effect
  - Twinkling animation
  - Breathing-synchronized opacity

- **src/components/modules/GazeBreathingGuide.tsx** (NEW)
  - "Inhale" / "Exhale" text guide
  - Animated font size changes
  - Countdown display
  - Synchronized with visual animation

- **src/components/modules/visuals/index.ts** (NEW)
  - Dynamic visual loader
  - Registry pattern for extensibility

---

## 🔧 Technical Improvements

### Dependencies Added
- `react-native-reanimated@^4.3.0` - Smooth 60fps animations

### State Management
- Dual-store synchronization pattern (appStore ↔ gazeStore)
- Activity logging with module-specific metadata
- Cloud persistence via gazeService (Firestore)

### Architecture Patterns
- **Registry Pattern:** Visuals and audio loaded from configuration
- **State Machine:** Session transitions (idle → active → paused → completed)
- **Custom Hooks:** Complex animation/timing logic extracted to `useGazeSession`

---

## 📊 Activity Tracking

New activity entry type:
```typescript
{
  type: 'gaze',
  date: ISO timestamp,
  duration: number (seconds elapsed),
  targetDuration: number (intended duration)
}
```

Updated stats calculation: 6 module types now tracked

---

## 🔐 Privacy & Data

- Cloud backup still **opt-in** (default OFF per PR-007)
- Gaze sessions stored locally in AsyncStorage
- Optional Firestore sync if user enables cloud backup
- Streak data persisted per-user in Firestore (requires auth)

---

## 📱 Platform Support

- **iOS:** Support for iPad (supportsTablet: true)
- **Android:** Edge-to-edge enabled, adaptive icons
- **Web:** Basic support (animations may vary)

---

## ✅ Testing Checklist

- [ ] Gaze module renders without errors
- [ ] Candle animation smooth at 60fps
- [ ] Cosmos animation with 75+ stars performs well
- [ ] Breathing guide timing matches visual animations
- [ ] Pause/Resume transitions correctly
- [ ] Session completion logs to AsyncStorage
- [ ] Cloud sync works when enabled
- [ ] Streak tracking increments correctly
- [ ] SettingsScreen shows Gaze options
- [ ] Module picker includes Gaze

---

## 🚀 Deployment

**Build Process:**
1. Version updated to 1.1.0 in package.json & app.json
2. EAS auto-increments build numbers:
   - iOS: Build #24 (previous #23)
   - Android: Version Code 60 (previous 59)
3. EAS builds native apps
4. Submission to app stores:
   - iOS: Manual submission to App Store
   - Android: Auto-submit to Google Play internal track

**Branch Strategy:**
- Release branch: `release/v1.1.0`
- After testing: merge to `main` → triggers production builds
- Tag: `v1.1.0`
- Fallback: `production/v1.0.2` remains available

---

## 📝 Migration Notes

For users upgrading from v1.0.2:
- New Gaze module available in wellness category
- No breaking changes to existing modules
- Activity history preserved
- Cloud backup setting unchanged (still OFF by default)
- Streak data starts fresh (first gaze session = streak 1)

---

## 🔗 Related Documentation

- `IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- `CLAUDE.md` - Development guide
- `docs/design-system.html` - UI/UX specifications
- `CODEMAGIC_SETUP.md` - CI/CD configuration

---

## 👤 Release Owner

**Version:** 1.1.0  
**Release Date:** May 18, 2026  
**Status:** Ready for Production Testing
