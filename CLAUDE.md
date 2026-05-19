# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Mezr** is a React Native breathing exercise & wellness app built with Expo (managed workflow). The app provides health modules (Breath, Meditate, Swim) and wellness modules (Gaze, Zen) with audio guidance and motion detection. Website: [mezr.org](https://mezr.org)

- **Current Version:** 1.1.0 (Gaze module in development)
- **Tech Stack:** React Native, TypeScript, Zustand (state), Firebase (auth/backend), Expo SDK 54
- **Platforms:** iOS (com.mezr.app) | Android (com.ashok.mezr)

### Current Build Status (May 4, 2026)

| Platform | Version | Build Number | Version Code | Status |
|----------|---------|--------------|--------------|--------|
| iOS | 1.1.0 | TBD | - | 🔄 In Development |
| Android | 1.1.0 | TBD | TBD | 🔄 In Development |

**Previous Release:** v1.0.2 (iOS Build #23, Android Version Code 59)

---

## Quick Commands

### Development

```bash
npm start                    # Start Expo dev server
npm start -- --android       # Android preview (Expo Go)
npm start -- --ios          # iOS preview (Expo Go)
npm start -- --web          # Web preview
```

### Production Builds (Codemagic CI/CD)

```bash
eas build --platform ios --profile production      # Trigger via git push
eas build --platform android --profile production  # Trigger via git push
```

**Note:** Do NOT run these locally. Builds are automated through Codemagic on git push to main. See `codemagic.yaml` and `CODEMAGIC_SETUP.md`.

---

## Architecture

### State Management (Zustand)

Five independent stores in `src/stores/`:

1. **authStore** - User auth state (uid, email only per PR-001)
   - Actions: `setUser`, `signOut`, `deleteAccount`
   - Selectors: `useUserEmail`, `useUserId`

2. **appStore** - App UI & navigation state
   - Navigation: `currentCategory`, `currentModule`, `currentTab` (main|stats|settings|profile)
   - Session control: `isActive` (START/PAUSE/RESUME/END button state)
   - Actions: `setCategory`, `setModule`, `setCurrentTab`, `setIsActive`
   - Toast system: `showToast`, `hideToast`
   - Activity logging: `logActivity(type, metadata)`
   - Cloud backup flag (opt-in, PR-007)

3. **breathStore** - Breathing session state (patterns, current exercise, history)

4. **gazeStore** - Gaze session state (v1.1.0+)
   - Session: `currentSession`, `isActive`, `isPaused`
   - Controls: `startSession`, `pauseSession`, `resumeSession`, `endSession`
   - Settings: `defaultDuration`, `autoEndOnCompletion`, `guidanceAudioEnabled`
   - Analytics: `streak`, `sessionHistory`
   - Selectors: `useGazeCurrentSession`, `useGazeElapsedTime`, `useGazeProgress`

5. **activityStore** - Activity tracking & logging
   - `logActivity(type: ModuleId, metadata)` - Records session completion
   - `getStats()` - Returns session count by module: `{ breath, swim, meditate, run, cycle, gaze }`
   - Storage: AsyncStorage (default) + Firestore (opt-in via PR-007)

**Key Pattern:** Stores are independent. Use selectors to subscribe to specific state slices.

---

## Design System & UI Development

### Living Design System

The design system is maintained in `docs/design-system.html` and kept in sync with code.

**Location:** `docs/`
- `design-system.html` - Complete UI reference (9 sections: colors, typography, modules, buttons, navigation, mockups, specs, reference, insights)
- `README.md` - How to use and maintain
- `DESIGN-SYSTEM-UPDATES.md` - Detailed checklist for updates

**Design System Sections:**
1. **Colors** (10 total) - Extracted from `src/theme/colors.ts`
2. **Typography** (6 scales) - Font sizes, weights, letter-spacing from components
3. **Modules** (4 active) - Breath, Swim, Zen, Gaze with specifications
4. **Buttons** (3 variants) - Primary, Secondary, Danger with sizing specs
5. **Navigation** - Tab bar (64px), category bar, header layout
6. **Screen Layouts** - Device mockups (iPhone 12 Pro)
7. **Specifications** - Technical specs for all UI elements
8. **Modules Reference** - Current status and implementation details
9. **Key Insights** - Critical patterns from source code

**Update Workflow:**
```
Code change → Update docs/design-system.html → Commit both
```
See `docs/DESIGN-SYSTEM-UPDATES.md` for exact checklist.

---

## UI Development Workflow

### Step-by-Step Process

**1. Reference Design System**
- Open `docs/design-system.html` in browser
- Find exact color hex, typography specs, spacing values

**2. Implement Component**
- Use colors from `src/theme/colors.ts` (never hardcode)
- Match typography: fontSize, fontWeight, letterSpacing
- Apply spacing from design system specifications
- Test in Expo Go (iOS and Android)

**3. Update Design System**
- If new element: add to appropriate section
- If modified: update specs and visual examples
- Update specifications table if dimensions changed

**4. Commit Together**
```bash
git add src/...
git add docs/design-system.html
git commit -m "Add/Modify: [feature description]"
```

### Color Selection
- Never use arbitrary hex codes
- Always reference `colors.ts`: `colors.textPrimary`, `colors.buttonPrimary`, etc.
- Design system section 01 has all 10 colors with hex codes

### Typography Standards
- **Headers/Labels:** 22px, 200 weight, 8px tracking
- **Large Numbers:** 90px, 100 weight
- **Body Text:** 11px-14px, 600 weight, 1-4px tracking
- **Small Text:** 10px or less, 2px tracking

### Spacing Rules
- **Padding:** 10px, 15px, 20px, 30px (multiples of 5)
- **Margins:** 20px (top), 30px (horizontal)
- **Gaps:** 12px (buttons), 15px (sections)
- **Border Radius:** 8px (cards), 25px (small buttons), 40px (large buttons)

---

## Component Creation Pattern

### Template

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, onPress, variant = 'primary' 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, styles[`container_${variant}`]]}
      onPress={onPress}
    >
      <Text style={[styles.text, styles[`text_${variant}`]]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  container_primary: {
    backgroundColor: colors.buttonPrimary,
  },
  container_secondary: {
    backgroundColor: colors.backgroundElevated,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  text_primary: {
    color: colors.buttonPrimaryText,
  },
  text_secondary: {
    color: colors.textMuted,
  },
});
```

### Best Practices
- Keep styles with component (StyleSheet.create())
- All colors reference `colors` import
- Props define variants (primary/secondary/danger)
- Use strict TypeScript

---

## Screen Development Checklist

### Before Building
- [ ] Review similar screens for patterns
- [ ] Check navigation setup in appStore
- [ ] Plan layout structure

### While Building
- [ ] SafeAreaView as top-level container
- [ ] flex: 1 on main container
- [ ] paddingBottom: 110px for content above tab bar
- [ ] Keyboard overlap test
- [ ] Status bar contrast

### Testing
- [ ] iOS (Expo Go)
- [ ] Android (Expo Go)
- [ ] Landscape orientation
- [ ] Tab navigation works
- [ ] Inputs respond correctly

---

## Module Development Pattern (Gaze is Reference)

### 8 Core Files

1. `src/types/[module].ts` - TypeScript interfaces
2. `src/constants/[module]Config.ts` - Configuration & constants
3. `src/stores/[module]Store.ts` - Zustand state management
4. `src/services/[module]Service.ts` - Firebase/persistence
5. `src/hooks/use[Module]Session.ts` - Timer & lifecycle
6. `src/components/modules/[Module]Module.tsx` - Main UI component
7. `src/components/modules/[Module]Animation.tsx` - Animations (optional)
8. `src/components/modules/[Module]Guide.tsx` - Helper text (optional)

### 4 Modified Files

- `src/screens/index.tsx` - Add module conditional render
- `src/components/SettingsScreen.tsx` - Add module settings
- `src/constants/modules.ts` - Register module
- `src/types/index.ts` - Add to ModuleId type

### Session Lifecycle Pattern
```
No Session
  ↓ [START]
Active Session (timer running)
  ↓ [PAUSE]
Paused Session
  ↓ [RESUME]
Active Session (timer resumes)
  ↓ [END] OR timer reaches 0
Completed (log activity, reset)
```

### State Synchronization (CRITICAL)
Dual-store pattern from Gaze:
- **appStore.isActive** - Button UI state
- **[module]Store.currentSession.status** - Source of truth
- **Sync effect** - appIsActive changes trigger module state updates

### Activity Logging (CRITICAL)
```typescript
logActivity('[moduleName]', {
  duration: sessionMs / 60000,        // MINUTES (not seconds!)
  targetDuration: targetMs / 60000,   // MINUTES (not seconds!)
});
```

### Stats Integration Checklist
- [ ] Module added to `ModuleId` type
- [ ] Activity entry interface created
- [ ] `ActivityStore.getStats()` counts module
- [ ] `statsHelpers.ts` MODULE_LABELS updated
- [ ] `statsHelpers.ts` MODULE_COLORS updated
- [ ] `statsHelpers.ts` getHabitStacks updated
- [ ] `statsHelpers.ts` getModulesWithData updated
- [ ] Design system updated with new module

---

## Design-to-Code Integration

### Workflow
1. Reference `docs/design-system.html` while coding
2. Copy exact hex codes, font sizes, spacing values
3. Implement buttons/circles/layouts exactly as shown
4. Test in Expo Go (iOS + Android)
5. Update design system
6. Commit code + design system changes together

### Code Review Checklist
- [ ] Colors from design system (no hardcoded hex)
- [ ] Typography matches (size, weight, tracking)
- [ ] Spacing follows specifications
- [ ] Border radius correct (8/25/40px)
- [ ] Design system updated
- [ ] Works iOS and Android
- [ ] SafeArea considerations applied

---

## Gaze Module Architecture (v1.1.0)

### State Synchronization Strategy (CRITICAL)

The Gaze module manages session lifecycle through **two stores with explicit synchronization**:

**appStore (MainScreen level)**
- `isActive` → Controls button UI (START vs PAUSE/RESUME/END)
- Changed by: User clicking buttons via `setAppIsActive()`
- Source: MainScreen START/STOP button logic

**gazeStore (Module level)**
- `currentSession.status` → Source of truth for session state
- Values: `'active'` | `'paused'` | `'completed'`
- Changed by: Sync effect in GazeModule

**Synchronization Effect (GazeModule.tsx)**
```javascript
useEffect(() => {
  if (appIsActive && (sessionCompleted || !currentSession)) {
    // User clicked START
    setSessionCompleted(false);
    startSession(gazeMinutes * 60 * 1000);
  } else if (!appIsActive && currentSession?.status === 'active') {
    // User clicked PAUSE
    pauseSession();
  } else if (appIsActive && currentSession?.status === 'paused') {
    // User clicked RESUME
    resumeSession();
  }
}, [appIsActive, currentSession?.status, sessionCompleted, gazeMinutes, startSession, pauseSession, resumeSession]);
```

**Key Insight:** Button handlers ONLY manage `appIsActive`. The sync effect detects state changes and updates `gazeStore` accordingly. This prevents race conditions and state mismatches.

### Files Structure

**Core Files (8 total):**
- `src/types/gaze.ts` - TypeScript interfaces (GazeSession, GazeSettings, StreakData)
- `src/constants/gazeConfig.ts` - Configuration (durations, breathing pattern, animation params)
- `src/stores/gazeStore.ts` - Zustand store for session & streak state
- `src/services/gazeService.ts` - Firestore persistence, streak calculation
- `src/hooks/useGazeSession.ts` - Timer lifecycle, app state monitoring
- `src/components/modules/GazeModule.tsx` - Main UI (v5 - Latest)
- `src/components/modules/GazeCandleAnimation.tsx` - Flame animation (v3 - Latest)
- `src/components/modules/GazeBreathingGuide.tsx` - Breathing text (v2 - Latest)

**Modified Files (4 total):**
- `src/screens/index.tsx` - Hide START/STOP button for Gaze module
- `src/components/SettingsScreen.tsx` - Gaze duration + object settings
- `src/constants/modules.ts` - Register Gaze module
- `src/types/index.ts` - Updated ModuleId type to include 'gaze'

### Key Features

✅ **Session Management**
- Start → Pause → Resume → End lifecycle
- Auto-end when timer reaches 0
- Session completion logging to activity store

✅ **Timer & Animation**
- Background timer (100ms updates via setInterval)
- Re-render via `setUpdateTrigger` (avoids lagging)
- Remaining time displayed above buttons (MM:SS format)
- Multi-layer sine wave flame animation

✅ **Audio Sync**
- 4-second breathing cycle (inhale 4s, exhale 4s)
- Phase-change detection at cycle transitions
- Breathing guide text synced with audio

✅ **User Experience**
- Breathing guide (Inhale/Exhale) appears below candle when running
- Disappears during pause (user sees timer + buttons)
- Settings allow duration customization (3/5/7/10 min)
- Grey text styling matches Breath module aesthetic

✅ **Activity Logging**
- Session logged on completion (manual END or timer auto-end)
- Logs duration & targetDuration to activity store
- Appears in Stats screen under Gaze module count

### Activity Store Integration

**FIXED BUG:** ModuleId type didn't include 'gaze'. Applied fixes:
- ✅ Added 'gaze' to `ModuleId` type in `src/types/index.ts`
- ✅ Added `GazeActivityEntry` interface
- ✅ Updated `ActivityStore.getStats()` to count gaze sessions

**Session Logging:**
```javascript
// In GazeModule.handleEnd() or auto-end effect
logActivity('gaze', {
  duration: currentSession.duration / 1000,
  targetDuration: currentSession.targetDuration / 1000,
});
```

---

## Scalable Visual & Audio Architecture (v1.1.0+)

### Overview

The Gaze module uses a **registry pattern** for managing multiple visual themes and audio effects. This architecture allows adding new visuals and sounds without modifying core GazeModule logic.

**Key Principle:** Configuration-driven design. Add new visuals/audio through registry entries, not code refactors.

### Registry Pattern

**Visual Registry** (`src/constants/gazeVisualsConfig.ts`)
```typescript
export const GAZE_VISUALS_REGISTRY: Record<GazeVisualId, GazeVisualConfig> = {
  candle: { id: 'candle', name: 'Candle', ... },
  cosmos: { id: 'cosmos', name: 'Cosmos', ... },
  // Add more: northern-lights, bonfire, etc.
};
```

**Audio Registry** (`src/constants/gazeAudioConfig.ts`)
```typescript
export const GAZE_AUDIO_REGISTRY: Record<GazeAudioId, GazeAudioConfig> = {
  crackling: { id: 'crackling', name: 'Crackling Fire', ... },
  ambient_space: { id: 'ambient-space', name: 'Cosmic Ambience', ... },
  silence: { id: 'silence', name: 'No Sound', ... },
};
```

**Visual Components Registry** (`src/components/modules/visuals/index.ts`)
```typescript
export const GAZE_VISUAL_COMPONENTS: Record<string, VisualComponentType> = {
  candle: GazeCandleAnimation,
  cosmos: GazeCosmosAnimation,
  // Add more component imports here
};
```

### Settings Architecture

**gazeStore** holds user preferences:
```typescript
interface GazeSettings {
  visualId: 'candle' | 'cosmos'; // User's selected visual
  audioId: 'crackling' | 'ambient-space' | 'silence'; // User's selected audio
  defaultDuration: number;
  autoEndOnCompletion: boolean;
  guidanceAudioEnabled: boolean;
}

// Store actions
setVisual(visualId) - Change selected visual
setAudio(audioId) - Change selected audio
updateSettings(partial) - Update any settings
```

### UI Components (SettingsScreen)

**GazeVisualPicker** - Carousel/grid of available visuals
- Displays thumbnail color + name + description
- Highlights selected visual
- Calls `setVisual()` on tap

**GazeAudioPicker** - Carousel/grid of available audio effects
- Displays name + description
- Highlights selected audio
- Calls `setAudio()` on tap

### Dynamic Visual Loading (GazeModule)

```typescript
const visualId = useGazeStore((state) => state.settings.visualId);
const VisualComponent = getVisualComponent(visualId);

return (
  <View>
    {VisualComponent && <VisualComponent isActive={isActive} size={320} />}
  </View>
);
```

### Adding a New Visual (Step-by-Step)

**1. Create animation component**
- File: `src/components/modules/visuals/GazeNewAnimation.tsx`
- Must export `React.FC<{ isActive: boolean; size: number }>`
- Use same animation patterns as GazeCandleAnimation or GazeCosmosAnimation

**2. Register visual component**
- Update `src/components/modules/visuals/index.ts`
- Add import and entry to `GAZE_VISUAL_COMPONENTS`

**3. Register visual config**
- Update `src/constants/gazeVisualsConfig.ts`
- Add entry to `GAZE_VISUALS_REGISTRY`
- Specify: name, category, description, thumbnailColor, minDuration, maxDuration, recommendedAudioId

**4. Update types** (if needed)
- Extend `GazeVisualId` type in `src/types/gaze.ts`
- Extend `GazeAudioId` type if adding new audio

**5. Done** - Visual automatically appears in SettingsScreen picker

### Adding New Audio (Step-by-Step)

**1. Add audio file**
- Place file in `assets/sounds/gaze/` directory
- Ensure it's importable by audio service

**2. Register audio config**
- Update `src/constants/gazeAudioConfig.ts`
- Add entry to `GAZE_AUDIO_REGISTRY`
- Specify: name, category, soundFile path, volume, loopable, fadeDuration

**3. Update types** (if needed)
- Extend `GazeAudioId` type in `src/types/gaze.ts`

**4. Done** - Audio automatically appears in SettingsScreen picker

### Current Visuals & Audio

**Visuals (2 available):**
- 🕯️ Candle - Warm flame animation with breathing guide
- 🌌 Cosmos - Galaxy background with layered animated stars

**Audio (3 available):**
- 🔥 Crackling Fire - Gentle fire sounds (40% volume, 2s fade)
- 🌌 Cosmic Ambience - Peaceful space background (30% volume, 3s fade)
- 🔇 Silence - No sound (default)

### Visual Design Principles

Based on design system review, all visuals should embody:
1. **Layered Motion** - Multiple animation layers at different speeds (parallax depth)
2. **Asymmetric Timing** - Not mechanical; randomized offsets per element
3. **Color + Opacity Changes** - Not just opacity variations; include color shifts
4. **Depth Perception** - Scale, brightness, or position changes suggesting distance
5. **Organic Feel** - Avoid perfect sine waves; add subtle randomness

**Example (Cosmos):**
- 3 star layers: background (slow, dim, blue), mid (medium, white), foreground (fast, bright)
- Each star has randomized twinkle cycle and drift amplitude
- Color shifts from blue → white with opacity changes
- Subtle parallax drift simulating cosmic wind

---

## Critical Lessons from Gaze Development

### 🔴 Bugs Fixed & Solutions

**1. Timer Freeze on START**
- **Problem:** Sync effect depended on function references (startSession, pauseSession) that changed frequently
- **Solution:** Removed function dependencies from effect. Use session.status as single source of truth.

**2. Second Session Won't Start After User END**
- **Problem:** Session marked 'completed' but not cleared. Sync condition checked `!currentSession`, missing 'completed' sessions.
- **Solution:** Added `sessionCompleted` flag. Condition: `(sessionCompleted || !currentSession)`

**3. appStore/gazeStore Out of Sync**
- **Problem:** Pause set `gazeStore.isActive=false` but `appStore.isActive` stayed true. Settings icon showed incorrectly.
- **Solution:** Centralized sync effect to manage both stores. appIsActive controls the effect; gazeStore reflects actual session state.

**4. ModuleId Type Missing 'gaze'**
- **Problem:** `ModuleId = 'breath' | 'swim' | ... 'meditate'` didn't include 'gaze', so activity logging failed silently.
- **Solution:** Added 'gaze' to ModuleId and ActivityStore.getStats().

### ⚠️ Critical Patterns

**Timer Implementation**
- Timer runs in hook (setInterval in useGazeSession)
- NEVER display countdown that lags UI
- Trigger re-renders via state setter (setUpdateTrigger)
- Update every 100ms for smooth 10 FPS

**Async Cleanup**
- Don't rely on `clearCurrentSession()` being async
- Use flags (`sessionCompleted`) for state management
- Race conditions occur when async cleanup overlaps with new session start

**Button State Machine**
```
No Session → [START] visible
START clicked → [PAUSE] [END] visible
PAUSE clicked → [RESUME] [END] visible
RESUME clicked → [PAUSE] [END] visible
END clicked → [START] visible
Timer ends → [START] visible (no restart)
```

**Breathing Guide Visibility**
```javascript
{isActive && !isPaused && (
  <GazeBreathingGuide />  // Only when running
)}
```
NOT visible during pause. User sees timer + buttons instead.

---

## Service Layer (`src/services/`)

- **firebase.ts** - Firebase init + Firestore cleanup
- **authService.ts** - Firebase Auth operations
- **audioService.ts** - Expo Audio management + preloading
- **storageService.ts** - AsyncStorage (local persistence)
- **gazeService.ts** - Gaze session persistence, streak calculation, Firestore sync

---

## Expo & Codemagic Integration

### Expo Configuration (`app.json` & `eas.json`)

- **New Architecture enabled** (Expo 54+)
- **Profiles:** development, preview, production
- **Managed workflow** - No native Android/iOS folders committed

### Codemagic Workflows (`codemagic.yaml`)

Two workflows triggered on git push:
1. **iOS** - Builds via EAS, submits to App Store
2. **Android** - Builds via EAS, submits to Google Play internal track

---

## Build & Deployment

### Local Development

```bash
npm start -- --android        # Test on Android device
npm start -- --ios           # Test on iOS device
```

**Never:**
- Modify native modules
- Use bare React Native packages (Expo-managed only)
- Commit `./android`, `./ios`

### Production (Via Codemagic)

1. Merge to `main`
2. Codemagic auto-triggers workflows
3. Check dashboard for build status
4. Android auto-submits to Google Play internal track

### Version Management

Current: **1.1.0** (synced across app.json, package.json, eas.json)

When bumping:
1. Update `app.json` → `expo.version`
2. Update `package.json` → `version`
3. Commit + push → Codemagic auto-increments build number

---

## TypeScript & Types

Key type files in `src/types/index.ts`:

```typescript
type ModuleId = 'breath' | 'swim' | 'run' | 'cycle' | 'meditate' | 'gaze';
type CategoryId = 'health' | 'wellness' | 'productivity' | 'finance';
type MainTabId = 'main' | 'stats' | 'settings' | 'profile';

interface ActivityEntry {
  type: ModuleId;
  date: string; // ISO string
  [metadata]: unknown;
}

interface GazeActivityEntry extends BaseActivityEntry {
  type: 'gaze';
  duration?: number;
  targetDuration?: number;
}
```

All components fully typed. Use strict mode.

---

## Activity Logging Integration (Critical for Stats Screen)

When adding a new wellness module, integrating with the activity logging system requires coordination across multiple files. **Failure to complete all steps causes silent logging failures.**

### Step 1: Module Actions (in your wellnessStore)
Implement `endSession()` which sets `currentSession.status = 'completed'`

### Step 2: Activity Log Call (in your Module Component)
When session completes, call:
```typescript
logActivity('yourModuleId', {
  duration: sessionMs / 60000,  // Convert to MINUTES (critical!)
  targetDuration: targetMs / 60000,
  // Add other metadata as needed
});
```

**⚠️ CRITICAL:** Duration must be in **MINUTES**, not seconds. statsHelpers multiplies by 60 to convert to total seconds. Example: 60s session → `60000ms / 60000 = 1 minute` → `1 * 60 = 60 seconds` in stats.

### Step 3: appStore Integration
Add to appStore (if not already present):
```typescript
logActivity: async (type, metadata = {}) => {
  await useActivityStore.getState().logActivity(type, metadata);
}
```

### Step 4: Activity Type Definition
Create activity entry interface in `src/types/index.ts`:
```typescript
export interface YourActivityEntry extends BaseActivityEntry {
  type: 'yourModule';
  duration?: number;  // In MINUTES
  targetDuration?: number;
}
```

Add to ActivityEntry union:
```typescript
export type ActivityEntry = ... | YourActivityEntry;
```

### Step 5: Stats Module Registration (statsHelpers.ts)
Add your module to ALL of these:
- `MODULE_LABELS` - Display name
- `MODULE_COLORS` - Habit stack block color
- `getHabitStacks` - counts object initialization AND order array
- `getModulesWithData` - order array

Missing any causes silent failures!

### Step 6: Activity Store
Update `ActivityStore.getStats()` to count your module:
```typescript
getStats: () => ({
  // ... existing modules
  yourModule: history.filter((i) => i.type === 'yourModule').length,
})
```

### Step 7: Verification Checklist
- [ ] Complete a test session
- [ ] Navigate to Stats tab
- [ ] Check "This Week's Activity Blocks" - your module should appear with assigned color
- [ ] Click module to view details - duration should display correctly (not multiplied by 60 again)
- [ ] Session count increments

---

## Common Tasks

### Add a New Wellness Module (Use wellness-session-builder Skill)

Refer to `wellness-session-builder` skill for step-by-step pattern. Gaze module is the reference implementation.

**Important:** After implementing the module, follow the Activity Logging Integration checklist above to ensure stats tracking works correctly.

### Add State to App

1. Choose store: authStore, appStore, breathStore, gazeStore, activityStore, or create new
2. Add actions + initial state
3. Use selectors: `useAppStore((state) => state.myProp)`
4. For session modules, follow Gaze pattern (sync effect + currentSession.status)

### Deploy to Production

1. Code ready → Create PR
2. Merge to `main` or push directly
3. Codemagic auto-triggers → Check dashboard
4. Verify iOS build + Android submission

---

## Latest Updates

### Version 1.1.0 (May 4, 2026) — *In Development*

**New Features:**
- **Gaze Module** - Wellness session with candle animation & breathing guide
  - Centered candle (white outline, minimalist)
  - Breathing guide (Inhale/Exhale text with font scaling)
  - Timer countdown (MM:SS, grey text, above buttons)
  - Session lifecycle (Start/Pause/Resume/End)
  - Auto-end timer without restart
  - Audio sync (4s inhale/exhale cycle)
  - Streak tracking
  - Activity logging to Stats screen

**State Management Improvements:**
- ✅ Centralized sync effect for appStore/gazeStore
- ✅ Single source of truth: currentSession.status
- ✅ sessionCompleted flag for state transitions
- ✅ Timer runs in background (no UI lag)

**Bug Fixes (Session Lifecycle):**
- ✅ Freeze on START (resolved sync effect race conditions)
- ✅ Second session won't start (resolved with sessionCompleted flag)
- ✅ Out-of-sync stores (centralized sync effect)
- ✅ Missing 'gaze' in ModuleId type (added to types + activity store)
- ✅ Buttons hidden behind tab bar (paddingBottom 110px)

**Integration Bug Fixes (May 4, 2026):**
- ✅ Missing logActivity in appStore (added delegate to activityStore)
- ✅ statsHelpers missing MODULE_LABELS['gaze'] (added 'Gaze')
- ✅ statsHelpers missing MODULE_COLORS['gaze'] (added purple #A78BFA)
- ✅ statsHelpers missing 'gaze' in getHabitStacks counts & order arrays
- ✅ statsHelpers missing 'gaze' in getModulesWithData order array
- ✅ Duration field unit mismatch (fixed: logging in MINUTES not seconds)

**Testing Status:**
- ✅ Session logging to Stats (fully tested, verified working)
- ✅ Module details display correct duration (fixed and verified)
- ✅ Habit stacks show Gaze sessions (verified)
- ⏳ Firestore persistence (implemented, needs testing)
- ⏳ Streak calculation (implemented, needs testing)

**Next Steps:**
1. Test Firestore persistence end-to-end
2. Verify streak calculation (3-day test)
3. Push to GitHub + merge to main
4. Trigger Codemagic build

---

## Related Skills

**wellness-session-builder** - Reusable pattern for building wellness modules with session lifecycle management. Use this skill for next features like Zen Module, Mind Module, etc.

**ui-component-builder** - Generate new UI components quickly with design system compliance

**module-builder** - Create new wellness modules using Gaze pattern (state management, activity logging, stats integration)

**design-system-updater** - Automatically update design system when code changes

**screen-builder** - Create new screens following app navigation patterns

**ui-audit** - Verify UI components match design system specifications

**responsive-tester** - Test UI across device sizes and orientations

---

## Latest Updates

### Version 1.1.0 + Design System (May 8, 2026)

**New Addition:**
- **Design System Documentation** (Living, Git-versioned)
  - `docs/design-system.html` - Complete reference (colors, typography, modules, buttons, navigation, specs)
  - `docs/README.md` - Usage guide
  - `docs/DESIGN-SYSTEM-UPDATES.md` - Update checklist
  - Extracted directly from source code (colors.ts, components, etc.)
  - Auto-synchronized with code changes

**UI/UX Scaling Documentation Added to CLAUDE.md:**
- ✅ Design System & UI Development section
- ✅ UI Development Workflow (step-by-step)
- ✅ Component Creation Pattern (template + best practices)
- ✅ Screen Development Checklist
- ✅ Module Development Pattern (reference: Gaze)
- ✅ Design-to-Code Integration (workflow + PR checklist)

**7 New Skills Available for Scaling:**
- ✅ ui-component-builder
- ✅ module-builder (critical for feature scaling)
- ✅ design-system-updater
- ✅ screen-builder
- ✅ ui-audit
- ✅ responsive-tester
- ✅ design-sync (bonus)

---

**Last Updated:** May 8, 2026  
**Design System Status:** v1.0.2+, Extracted from source code, Git-versioned in /docs  
**Next Milestone:** Create 7 scaling skills + update memory file
