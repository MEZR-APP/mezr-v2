# iOS Build 5bef6423 to Android Production Sync Strategy

**Document Date:** April 27, 2026  
**iOS Build ID:** 5bef6423-7e89-491e-beb7-536027bff784  
**iOS Commit:** 312db79 (chore: bump version to 1.0.2 for App Store submission)  
**iOS Build Status:** ✅ Successfully built & submitted to App Store  
**Target Android Action:** Sync features and push to Google Play production

---

## Executive Summary

The iOS EAS build 5bef6423 is a **production-ready v1.0.2 build** that was successfully submitted to the App Store. The current Android codebase has **diverged** from this iOS version with additional features and changes. This document outlines a strategy to:

1. ✅ **Align Android** with iOS v1.0.2 base
2. ✅ **Integrate new features** added post-iOS build
3. ✅ **Ensure feature parity** across platforms
4. ✅ **Push to Google Play production**

---

## What's in iOS EAS Build 5bef6423

### Build Metadata
```
Build ID: 5bef6423-7e89-491e-beb7-536027bff784
Commit: 312db79 (Apr 23, 2026 5:32 PM UTC)
Version: 1.0.2 (Build 23)
SDK: 54.0.0
Expo CLI: 54.0.32
Profile: production
Status: ✅ FINISHED (successfully built)
```

### Core Configuration
```json
{
  "version": "1.0.2",
  "newArchEnabled": true,
  "ios": {
    "supportsTablet": true,
    "bundleIdentifier": "com.mezr.app",
    "infoPlist": {
      "NSMotionUsageDescription": "MEZR uses motion data to detect and enhance your breathing exercises.",
      "ITSAppUsesNonExemptEncryption": false
    }
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#ffffff"
    },
    "edgeToEdgeEnabled": true,
    "predictiveBackGestureEnabled": false,
    "package": "com.ashok.mezr"
  }
}
```

### Dependencies (iOS v1.0.2)
```json
{
  "@react-native-async-storage/async-storage": "2.2.0",
  "expo": "~54.0.32",
  "expo-av": "~16.0.8",
  "expo-file-system": "~19.0.21",
  "expo-keep-awake": "~15.0.8",
  "expo-sharing": "~14.0.8",
  "expo-status-bar": "~3.0.9",
  "firebase": "^12.8.0",
  "lucide-react-native": "^0.563.0",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-svg": "^15.15.2",
  "zustand": "^5.0.10"
}
```

### Features in iOS v1.0.2
- ✅ Breath Module (customizable patterns with audio)
- ✅ Swim Module (activity tracking)
- ✅ Meditate Module (ZEN)
- ✅ Run & Cycle (Coming Soon)
- ✅ User Authentication (Firebase)
- ✅ Cloud Backup/Restore
- ✅ Export/Import Data
- ✅ Activity History & Stats
- ✅ Privacy Controls
- ✅ Settings Management
- ✅ Audio Controls (Mute/Unmute)
- ✅ Motion Detection

---

## Current Android Codebase Differences

### Version & Configuration Issues
| Aspect | iOS v1.0.2 | Current Android | Issue |
|--------|-----------|-----------------|-------|
| **Version** | 1.0.2 | 1.0.1 | ❌ Misaligned |
| **Expo SDK** | 54.0.32 | 54.0.33 | ⚠️ Newer (not tested with iOS) |
| **Icon paths** | ./assets/adaptive-icon.png | ./src/assets/app-icon.png | ❌ Inconsistent |
| **Favicon path** | ./assets/favicon.png | ./src/assets/app-icon.png | ❌ Inconsistent |
| **Icon BG Color** | #ffffff | #000000 | ❌ Mismatched |

### Dependency Differences
| Package | iOS v1.0.2 | Current Android | Status |
|---------|-----------|-----------------|--------|
| expo-keep-awake | 15.0.8 | ❌ MISSING | ⚠️ Need to add |
| expo-notifications | ❌ Not in iOS | 0.32.16 | ✅ New feature |
| react-native-svg | ^15.15.2 | 15.12.1 | ⚠️ Downgraded |
| expo | 54.0.32 | 54.0.33 | ⚠️ Newer version |

### New Features Added After iOS Build
**New Screens:**
- TimelineScreen (new activity timeline view)
- QuickEntryBar (new UI component)

**New Services:**
- notificationService (push notifications)
- timelineService (activity timeline backend)

**New Stores:**
- taskStore (task management)

**New Types:**
- task.ts (task data structures)
- timeline.ts (timeline data structures)

---

## 3-Phase Sync Strategy

### PHASE 1: Align with iOS v1.0.2 Production Base
**Objective:** Set Android to exact same state as iOS production build

```bash
# Step 1: Reset Android to iOS v1.0.2 commit
git checkout 312db79 -- app.json package.json

# Step 2: Verify iOS configuration is applied
- app.json version: 1.0.2 ✓
- Icon paths: ./assets/adaptive-icon.png ✓
- Icon BG: #ffffff ✓
- Favicon: ./assets/favicon.png ✓
- Expo SDK: 54.0.32 ✓
- expo-keep-awake: included ✓

# Step 3: Create feature branch
git checkout -b android/v1.0.2-production-sync
```

**Expected Result:** Android at exact same codebase + config as iOS production

---

### PHASE 2: Integrate New Features (Timeline + Notifications)
**Objective:** Merge new features added after iOS build into Android v1.0.2 base

```bash
# Features to merge:
1. TimelineScreen & TimelineScreen.tsx
2. notificationService.ts
3. timelineService.ts
4. taskStore.ts
5. expo-notifications dependency
6. task.ts & timeline.ts types
7. QuickEntryBar component (optional UI enhancement)

# Verification:
- All new services properly imported
- Types correctly defined
- New screens integrated into navigation
- Notification permissions in app.json
- No breaking changes to existing modules
```

**Expected Result:** Android with v1.0.2 base + new timeline/notification features

---

### PHASE 3: Prepare for Production Release
**Objective:** Ready Android v1.0.2 for Google Play submission

```bash
# Step 1: Update version metadata
- app.json: version = "1.0.2"
- package.json: version = "1.0.2"
- Build number auto-increment: enabled in eas.json

# Step 2: Verify configuration
- Android package: com.ashok.mezr ✓
- Adaptive icon: ./assets/adaptive-icon.png ✓
- Icon background: #ffffff ✓
- Edge-to-edge: enabled ✓
- Motion permissions: declared ✓
- Notification permissions: declared ✓

# Step 3: Build & test
- Run local Android build
- Test all modules (Breath, Swim, Meditate)
- Test new Timeline & Notifications
- Verify Firebase sync
- Test Export/Import
- Check privacy & settings screens

# Step 4: Create production branch
git checkout -b production/android-v1.0.2

# Step 5: Push to EAS & Google Play
eas build --platform android --profile production
```

**Expected Result:** Android v1.0.2 built, tested, and ready for Google Play submission

---

## Implementation Steps

### Step 1: Sync app.json
```json
{
  "expo": {
    "name": "MEZR",
    "slug": "mezr-v2",
    "version": "1.0.2",  // ← Changed from 1.0.1
    "orientation": "portrait",
    "icon": "./src/assets/app-icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./src/assets/app-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.mezr.app",
      "infoPlist": {
        "NSMotionUsageDescription": "MEZR uses motion data to detect and enhance your breathing exercises.",
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",  // ← Changed from ./src/assets/app-icon.png
        "backgroundColor": "#ffffff"  // ← Changed from #000000
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false,
      "package": "com.ashok.mezr"
    },
    "web": {
      "favicon": "./assets/favicon.png"  // ← Changed from ./src/assets/app-icon.png
    },
    "extra": {
      "eas": {
        "projectId": "75ed59dc-73ba-41c1-82b6-6439d2167680"
      }
    }
  }
}
```

### Step 2: Sync package.json
```json
{
  "name": "mezr-v2",
  "version": "1.0.0",  // Keep as is (package version != app version)
  "main": "index.ts",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "2.2.0",
    "expo": "~54.0.32",  // ← Sync to iOS version
    "expo-av": "~16.0.8",
    "expo-file-system": "~19.0.21",
    "expo-keep-awake": "~15.0.8",  // ← ADD (missing in Android)
    "expo-notifications": "~0.32.16",  // ← Keep new feature
    "expo-sharing": "~14.0.8",
    "expo-status-bar": "~3.0.9",
    "firebase": "^12.8.0",
    "lucide-react-native": "^0.563.0",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-svg": "^15.15.2",  // ← Sync to iOS version
    "zustand": "^5.0.10"
  },
  "devDependencies": {
    "@types/react": "~19.1.0",
    "typescript": "~5.9.2"
  },
  "private": true
}
```

### Step 3: Update eas.json
```json
{
  "cli": {
    "version": ">= 18.0.3",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "android": {
        "track": "internal",
        "releaseStatus": "draft"
      }
    }
  }
}
```

### Step 4: Add Notification Permissions (app.json)
```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./src/assets/app-icon.png",
          "color": "#000000"
        }
      ]
    ]
  }
}
```

---

## Testing Checklist

### Functional Testing
- [ ] Breath Module works (start/stop, patterns, audio)
- [ ] Swim Module works (tracking, logging)
- [ ] Meditate Module works (timer, progress)
- [ ] Run/Cycle modules show "Coming Soon"
- [ ] Authentication works (login/signup with Firebase)
- [ ] Cloud backup/restore works
- [ ] Export/Import data works
- [ ] Activity history displays correctly
- [ ] Stats screen shows metrics
- [ ] Settings screen functional

### New Features Testing
- [ ] Timeline screen displays activity history
- [ ] Notifications work (if triggered)
- [ ] Quick entry bar functional (if included)
- [ ] Task management works
- [ ] All new services properly integrated

### Platform-Specific Testing
- [ ] Motion sensor permissions granted on first launch
- [ ] Notification permissions granted on first launch
- [ ] Adaptive icons display correctly
- [ ] Edge-to-edge layout works
- [ ] Firebase syncs correctly across devices

### Build & Deployment
- [ ] EAS build completes successfully
- [ ] Build artifacts generated (AAB file)
- [ ] Google Play submission script works
- [ ] Release notes visible in Play Store

---

## Rollback Plan

If issues occur during sync:

```bash
# Option 1: Revert to current Android state
git checkout HEAD -- app.json package.json eas.json

# Option 2: Go back to last working Android build
git reset --hard <last-working-commit>

# Option 3: Cherry-pick specific fixes
git cherry-pick <specific-commit>
```

---

## Timeline & Milestones

| Phase | Task | Estimated Time | Target Date |
|-------|------|-----------------|-------------|
| 1 | Sync app.json & package.json | 30 min | Now |
| 1 | Verify configuration | 30 min | Now |
| 2 | Merge new features | 1-2 hours | Today |
| 2 | Integration testing | 1-2 hours | Today |
| 3 | Final QA & testing | 2-3 hours | Today |
| 3 | Build Android AAB | 5-10 min | Today |
| 3 | Submit to Google Play | 5-10 min | Today |
| | **TOTAL** | **5-8 hours** | **Same day** |

---

## Success Criteria

✅ Android v1.0.2 built successfully  
✅ All features match iOS v1.0.2  
✅ New features (Timeline, Notifications) integrated  
✅ All tests passing  
✅ Android submitted to Google Play internal track  
✅ Build artifacts available for release  

---

## Notes & Considerations

1. **Version Number**: App version (1.0.2) stays in sync with iOS. Package version remains 1.0.0.

2. **Assets**: Ensure icon and favicon files exist at expected paths:
   - `./assets/adaptive-icon.png`
   - `./assets/favicon.png`
   - `./src/assets/app-icon.png`

3. **Dependencies**: expo-keep-awake must be added back to match iOS build.

4. **Notifications**: expo-notifications is new to Android but not in iOS v1.0.2 build. This is an enhancement.

5. **Google Play Submission**: Already automated via codemagic.yaml and submit-to-playstore.js

6. **Feature Parity**: After sync, Android will have:
   - All iOS v1.0.2 features ✓
   - New Timeline feature ✓
   - New Notifications feature ✓
   - Better feature coverage than current state ✓

---

**Next Action:** Execute Phase 1 - Sync app.json and package.json files to iOS v1.0.2 production state.

