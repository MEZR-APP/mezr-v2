# MEZR — Agent Knowledge File
> **Paste this into any AI session (Claude, Cursor) before starting work.**
> Last updated: 2026-03-01 | Version: 1.0.0 (Google Play) | Next: 1.0.1 (export/import)

---

## What is MEZR?

Privacy-first wellness app. Three modules: Breathing, Swimming (lap counter), Meditation (timer). All data stored locally by default. Cloud sync is opt-in. No analytics, no user data exploitation.

- **Live**: Google Play Store v1.0.0
- **Repo**: https://github.com/MEZR-APP/mezr-v2
- **Domain**: mezr.org (Cloudflare + GitHub Pages)
- **App ID**: com.ashok.mezr

---

## Tech Stack (Do Not Change Without Discussing)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native | 0.81.5 (New Architecture / Fabric) |
| Build | Expo SDK | 54 |
| Language | TypeScript | 5.9.2 (strict) |
| State | Zustand | v5 |
| Auth | Firebase Auth | Email/password only |
| Database | Firestore | Opt-in cloud sync |
| Local Storage | AsyncStorage | Primary data store |
| File I/O | expo-file-system/legacy | Export/import backups |
| Audio | expo-av | Breathing cues |
| Icons | lucide-react-native | Via react-native-svg |

---

## Architecture Rules (Must Follow)

1. **No React Navigation** — All routing is state-driven via Zustand (`appStore.currentTab`, boolean flags). Flat structure, no nested navigators.

2. **Pressable, NOT TouchableOpacity** — Required for modals on React Native 0.81 Fabric. TouchableOpacity fails to register touches inside Modal on New Architecture.

3. **expo-file-system/legacy** — Expo SDK 54 changed the API. Must use `import * as FileSystem from 'expo-file-system/legacy'` for all file operations.

4. **Privacy-first** — Export/import is fully offline. Cloud sync is opt-in toggle. Account deletion wipes everything (Firestore + local + auth).

5. **Modal Touch Pattern** — Modals use `Pressable` overlay (tap-outside-to-close) wrapping a `Pressable` card (with `stopPropagation`). Body uses `View`, not `ScrollView`, unless genuinely scrollable content.

6. **Discriminated Union** — `ActivityEntry` uses `type` field ('breath' | 'swim' | 'meditate') for type narrowing. Always check `type` before accessing module-specific fields.

---

## File Map (Where Things Live)

```
mezr-v2/
├── App.tsx                    # Root: auth listener → login OR main app
├── src/
│   ├── screens/               # Full-screen views
│   │   ├── index.tsx          # MainScreen (tab bar + modules)
│   │   ├── StatsScreen.tsx    # Synergy score, habit stacks, charts
│   │   ├── ProfileScreen.tsx  # Export/import, sign out, delete
│   │   ├── LoginScreen.tsx    # Email/password login
│   │   └── SignupScreen.tsx   # Signup + privacy agreement
│   │
│   ├── components/
│   │   ├── SettingsScreen.tsx  # Pattern list, sound, cloud, targets
│   │   ├── PatternBuilder.tsx  # Create/edit breathing patterns
│   │   ├── ExportModal.tsx     # Export data flow
│   │   ├── ImportModal.tsx     # Import backup flow
│   │   └── modules/
│   │       ├── BreathModule.tsx   # Breath phase display + timer
│   │       ├── SwimModule.tsx     # Lap counter
│   │       └── MeditateModule.tsx # Countdown timer
│   │
│   ├── stores/                # Zustand state (the source of truth)
│   │   ├── authStore.ts       # User auth state
│   │   ├── appStore.ts        # Navigation, UI flags, settings
│   │   ├── breathStore.ts     # Patterns, session state, form state
│   │   └── activityStore.ts   # Activity history (all modules)
│   │
│   ├── services/              # Side effects (storage, audio, firebase)
│   │   ├── firebase.ts        # Firebase init
│   │   ├── storageService.ts  # AsyncStorage CRUD
│   │   ├── audioService.ts    # Sound playback
│   │   ├── exportService.ts   # JSON backup export
│   │   ├── importService.ts   # JSON backup import + validation
│   │   └── fileRecoveryService.ts  # Backup file scanner
│   │
│   ├── hooks/
│   │   └── useBreathingSession.ts  # Breathing state machine
│   │
│   ├── types/index.ts         # All TypeScript definitions
│   ├── theme/                 # colors.ts + styles.ts (dark theme)
│   ├── constants/modules.ts   # Categories, modules, defaults, storage keys
│   └── utils/                 # formatters.ts + statsHelpers.ts
```

---

## Zustand Stores Quick Reference

### authStore — Who is logged in
- `user: { uid, email } | null`
- `isAuthenticated`, `isLoading`, `isSigningOut`
- Actions: `setUser()`, `signOut()`, `deleteAccount(password)`

### appStore — What the UI is showing
- `currentTab`: 'main' | 'stats' | 'settings' | 'profile'
- `currentCategory`: 'breathwork' | 'movement' | 'mindfulness'
- `currentModule`: 'breath' | 'swim' | 'meditate'
- `isActive`: session currently running
- `isMuted`: sound toggle
- `cloudBackupEnabled`: opt-in sync
- Modal flags: `showSettings`, `showModulePicker`, `showPrivacyDashboard`

### breathStore — Breathing patterns and session
- `patterns: BreathPattern[]` (persisted in AsyncStorage)
- `selectedPatternId`, `sessionState`, `formState`
- Actions: `loadPatterns()`, `savePattern()`, `setPhase()`, `resetSession()`

### activityStore — Activity history (all modules)
- `history: ActivityEntry[]` (persisted in AsyncStorage)
- Actions: `loadHistory()`, `logActivity(entry)`, `clearHistory()`

---

## Breathing Session State Machine

```
IDLE → INHALE → HOLD1 → EXHALE → HOLD2
                                    │
                cycle < max? ───────┘ (back to INHALE)
                cycle === max?
                    │
                    ├─ more sessions → next session → INHALE
                    └─ final session → COMPLETE → logActivity()
```

---

## Key Types

```typescript
interface BreathPattern {
  id: string; name: string;
  inhaleDuration: number; hold1Duration: number;
  exhaleDuration: number; hold2Duration: number;
  breathCycles: number; sessions: number;
}

type ActivityEntry =
  | { type: 'breath'; date: string; pattern: string }
  | { type: 'swim'; date: string; laps: number }
  | { type: 'meditate'; date: string; duration: number }
```

---

## Storage Keys
- `@mezr/breath-patterns` → BreathPattern[]
- `@mezr/activity-history` → ActivityEntry[]
- `@mezr/cloud-backup-enabled` → boolean

---

## Known Gotchas (Read Before Coding)

1. **Import paths**: Use `useActivityStore`, NOT `useStatsStore`. Stats are computed via `statsHelpers.ts` utilities, not a separate store.
2. **TouchableOpacity breaks in modals** on RN 0.81 Fabric → use `Pressable`.
3. **expo-file-system** requires `/legacy` import path on SDK 54.
4. **ScrollView in modals** steals touch events → use `View` wrapper.
5. **Google Play Health declarations**: Declare ALL health categories upfront. Don't remove features to avoid rejection.
6. **Settings split across stores**: Sound = `appStore.isMuted`, patterns = `breathStore`, cloud = `appStore.cloudBackupEnabled`.

---

## How Ashok Works

- Non-technical founder, zero coding background
- All development via AI-assisted workflow (Claude + Cursor)
- Tests on Pixel 8 with Expo Go immediately
- Needs exact copy-paste terminal commands for Git
- Project path: `C:\Users\ashok\Documents\Projects\mezr-v2`
