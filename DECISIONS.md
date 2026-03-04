# MEZR Technical Decisions

### DXXX: Title (YYYY-MM-DD)
**Decision**: What you decided.
**Why**: The reasoning.
**Revisit if**: When this decision should be reconsidered.


## 2026-03: No React Navigation
**Decision**: Use state-driven routing via Zustand instead of React Navigation.
**Why**: App has flat structure (4 tabs + modals). React Navigation adds complexity and bundle size for no benefit at this scale.
**Revisit when**: Adding deep linking, or more than 2 levels of navigation depth.

## 2026-03: Pressable over TouchableOpacity
**Decision**: Replace all TouchableOpacity with Pressable in modal contexts.
**Why**: React Native 0.81 (Fabric/New Architecture) breaks TouchableOpacity touch detection inside Modal components.
**Revisit when**: React Native fixes this in a future release.

## 2026-03: Privacy-first / No analytics
**Decision**: No tracking, no analytics SDK, all data local by default.
**Why**: Competitive differentiation. Privacy enables premium pricing models (subscriptions, B2B) that pay 10-100x more than ads per user.
**Revisit when**: Need specific user behavior data to make product decisions (can add privacy-respecting analytics like Plausible).

## 2026-03: expo-file-system/legacy import
**Decision**: Use legacy API path for file operations.
**Why**: Expo SDK 54 changed the expo-file-system API. The legacy import is required for documentDirectory, read/write/delete operations.
**Revisit when**: Expo SDK 55+ stabilizes the new API.

### D007: Remove cloud backup UI (2026-03-01)
**Decision**: Remove the cloud backup toggle and its confirmation popup from SettingsScreen entirely.
**Why**: No MEZR cloud infrastructure exists or is planned for near-term releases. Showing the toggle misleads users and creates support burden. The cloudBackupEnabled flag and Firestore sync logic in activityStore can stay in code (dormant) but must not be user-facing.
**Revisit if**: We build encrypted cloud sync infrastructure after reaching meaningful user scale.

### D008: Infinity scroll with notification bar entry, reminders (2026-03-02)
**Decision**:  Infiniti scroll of life easy way to enter a doing a thing from notificationbar and start a timer from scroll button. Stitch feature available where a node can be edited and snapped back in wherever needed in the loop, have availability for a multi tasking. 
**Why**: Have a visual representation of wake time spent on different tasks, tapping into idle times and practicing breathing, provide consumer the stats of ideal and utilized time, suggest idle time simple tasks.
**Revisit if**: color coding with the type of tasks, doing work, at gym, meditation, breathing, doom scrolling different colors pallets. In future use on device AI/ML to provide things consumers can use the idle times and be more effecient if they chose to. 