# RESTRUCTURING IMPLEMENTATION GUIDE
## Option A: Step-by-Step with Cursor Prompts

---

## ⏱️ TIMELINE
- **Milestone 1:** 30 min
- **Milestone 2:** 30 min
- **Milestone 3:** 15 min
- **Milestone 4:** 15 min
- **Milestone 5:** 30 min
- **TOTAL:** ~2 hours

---

## 🚀 MILESTONE 1: CREATE NEW PROFILE SCREEN (30 min)

### What We're Building:
A new Profile screen that shows:
- Account information (email, display name)
- Privacy controls (View Data, Export, Delete)
- Privacy & Terms links
- App info

### Current State:
You have an old `profile.tsx` that might be breathing-specific.

### What to Do:

**Step 1: In Cursor, paste this prompt:**

```
CREATE NEW PROFILE SCREEN - ACCOUNT + PRIVACY FOCUSED

File: src/app/(tabs)/profile.tsx

REQUIREMENTS:
1. Show Account Section
   - Display user email (from authStore)
   - Display user name (from authStore)
   - Button: "Change Password" (disabled for now, placeholder)
   - Button: "Connected Devices" (disabled for now, placeholder)

2. Show Privacy Controls Section
   - Button: "View All My Data" (opens JSON preview)
   - Button: "Export My Data" (downloads JSON file)
   - Button: "Delete My Account" (shows confirmation)

3. Show Privacy & Terms Section
   - Link: "Privacy Policy" (navigates or opens modal)
   - Link: "Terms of Service" (navigates or opens modal)

4. Show App Info Section
   - App Version: 1.0.0
   - "About Mezr" link

DESIGN:
- Black background (#000000)
- White text (#FFFFFF)
- Sections separated with dividers
- Buttons use existing Button component style
- Red delete button
- Scrollable content

FUNCTIONALITY:
- View All Data → Shows JSON alert with email, session count
- Export Data → Shows export confirmation with session count
- Delete Account → Shows confirmation dialog

USE THESE IMPORTS:
- useAuthStore from stores/authStore
- useStatsStore from stores/statsStore  
- useNavigation from @react-navigation/native
- Colors, typography from theme
- AsyncStorage for data

NOTES:
- This replaces privacy controls currently in Settings
- Privacy controls should be moved FROM Settings TO here
- Account info at top, Privacy controls in middle, Terms at bottom
```

**Step 2: Review what Cursor creates**

Cursor will generate a new Profile screen. Check:
- [ ] Account section shows your email
- [ ] Privacy buttons are visible
- [ ] Privacy & Terms section exists
- [ ] No TypeScript errors

**Step 3: Keep this file**

Once it's created, don't modify it yet. We'll refine in Milestone 4.

---

## 🔧 MILESTONE 2: UPDATE SETTINGS SCREEN (30 min)

### What We're Doing:
Change Settings from mixed (breathing + privacy) to **module-focused** (breathing only).

### Structure:
```
Settings Screen
├── Module: Breathing 🫁
│   ├── Sound: [Toggle]
│   ├── Breath Hold Duration: [Slider]
│   ├── Breaths Per Session: [Slider]
│   ├── Sessions Per Round: [Slider]
│   ├── Driving Mode: [Toggle]
│   └── [Other breathing settings]
└── Cloud Backup (Global)
    └── Backup all modules: [Toggle OFF by default]
```

### In Cursor, paste this prompt:

```
UPDATE SETTINGS SCREEN - MODULE-BASED LAYOUT

File: src/app/(tabs)/settings.tsx

REQUIREMENTS:

1. REMOVE:
   - Privacy Dashboard button
   - Any privacy-related content
   - All privacy controls (these moved to Profile)

2. ADD MODULE HEADER:
   - Section title: "Module: Breathing 🫁"
   - Subtitle: (optional) "Configure breathing session settings"

3. KEEP ALL BREATHING SETTINGS:
   - Sound: [Toggle] - on/off
   - Breath Hold Duration: [Slider] 5-120 seconds
   - Breaths Per Session: [Slider] 5-50
   - Sessions Per Round: [Slider] 1-10
   - Driving Mode: [Toggle] - on/off
   - (All other breathing settings you have)

4. ADD CLOUD BACKUP SECTION (Global):
   - Section title: "Cloud Backup (All Modules)"
   - Subtitle: "Save all your data to cloud"
   - Toggle: "Backup all modules" [OFF by default]
   - Description: "When OFF: Data saved on device only. When ON: Sessions synced to cloud."

5. REMOVE Sign Out BUTTON:
   - Don't put Sign Out here
   - We'll add it to Profile screen instead

DESIGN:
- Black background (#000000)
- White text (#FFFFFF)
- Module header with emoji and title
- Same sliders/toggles as before
- Scrollable content

FUNCTIONALITY:
- All sliders/toggles work as before (breathing settings)
- Cloud Backup toggle saves to settingsStore
- Settings persist across app restart

IMPORT:
- useSettingsStore from stores/settingsStore
- Colors, typography, dimensions from theme
- Keep existing toggle/slider components

NOTES:
- This is a layout change, functionality stays the same
- Prepare for future modules (Finance, Sleep) to add below Breathing
- Cloud Backup is global (affects all modules)
```

**Step 2: Review what Cursor creates**

Check:
- [ ] "Module: Breathing" header visible
- [ ] All breathing settings still there (Sound, Duration, Breaths, Sessions, Driving)
- [ ] Cloud Backup section visible
- [ ] Privacy Dashboard button is GONE
- [ ] No TypeScript errors
- [ ] Sliders and toggles still work

---

## 🧭 MILESTONE 3: UPDATE NAVIGATION ROUTES (15 min)

### What We're Doing:
Add the new Profile screen to your tab navigator so it's accessible from bottom tabs.

### In Cursor, paste this prompt:

```
UPDATE TAB NAVIGATOR - ADD PROFILE ROUTE

File: src/app/(tabs)/_layout.tsx

REQUIREMENTS:

1. IMPORT the Profile screen:
   - Add: import ProfileScreen from './profile';

2. ADD NEW TAB.SCREEN:
   ```
   <Tab.Screen
     name="profile"
     component={ProfileScreen}
     options={{
       title: 'Profile',
       tabBarLabel: 'Profile',
       headerShown: false,
       // Add icon if you have one
     }}
   />
   ```

3. PLACE IT:
   - Add AFTER the Stats screen
   - BEFORE any closing tags
   - Should be the 4th or 5th screen in the navigator

4. EXISTING SCREENS:
   - Don't remove any existing screens
   - Just add Profile as new one
   - Keep: Breathe, Settings, Stats, [Profile] (NEW)

5. NAVIGATION STACK:
   - Bottom tab bar should now have 4-5 icons
   - Users can tap Profile from anywhere
   - Profile should NOT appear in Settings

IMPORT:
- ProfileScreen from './profile'
- Keep existing imports

NOTES:
- If you have custom tab icons, add one for Profile
- Profile is top-level tab (not nested in Settings)
- Users go: Settings tab → Settings screen, Profile tab → Profile screen
```

**Step 2: Verify in your app**

Check:
- [ ] Bottom tab bar shows 4-5 tabs now
- [ ] One of them is "Profile" or has profile icon
- [ ] Can tap Profile tab to see Profile screen
- [ ] Can tap Settings tab to see updated Settings
- [ ] No errors when switching tabs

---

## 🔐 MILESTONE 4: INTEGRATE PRIVACY CONTROLS (15 min)

### What We're Doing:
Make the Profile screen functional with actual privacy controls.

### In Cursor, paste this prompt:

```
INTEGRATE PRIVACY CONTROLS INTO PROFILE SCREEN

File: src/app/(tabs)/profile.tsx

REQUIREMENTS:

1. IMPLEMENT "View All My Data" BUTTON:
   - Collects: email, sessions count, storage size, settings
   - Shows: JSON preview in alert
   - Data format:
     {
       "email": "user@example.com",
       "sessions": [count],
       "storageSize": "X KB",
       "exportDate": "ISO timestamp"
     }
   - Alert dismissible with OK button

2. IMPLEMENT "Export My Data" BUTTON:
   - Collects all user data (email, sessions, settings)
   - Creates JSON file with timestamp in filename
   - Shows: "Export Ready" alert with summary
   - Filename format: "mezr-data-export-2024-01-30.json"
   - File should be human-readable (pretty-printed JSON)

3. IMPLEMENT "Delete My Account" BUTTON:
   - Shows: Confirmation dialog
   - Dialog text: "Delete your account and all data? This cannot be undone."
   - Lists what gets deleted: account, sessions, settings
   - Has: Cancel button and "Delete Everything" button (red)
   - On confirm:
     a) Clear all AsyncStorage
     b) Sign out user (call authStore.signOut())
     c) Navigate to login screen

4. IMPLEMENT "Privacy Policy" LINK:
   - Tap shows: Modal or alert with privacy policy text
   - Or navigates to PrivacyPolicy screen if exists
   - Generic text that applies to all modules:
     "Mezr is a wellness app. We store your personal data 
      (breathing, finance, sleep modules). We never track 
      your behavior. Your data is yours - download or delete anytime."

5. IMPLEMENT "Terms of Service" LINK:
   - Shows: Terms modal/alert
   - Basic placeholder text is fine for now

6. IMPLEMENT "Sign Out" BUTTON:
   - Place at bottom of screen (red button like Delete)
   - Calls: authStore.signOut()
   - Navigates to login screen
   - Shows confirmation dialog before signing out

FUNCTIONALITY:
- View Data → AsyncStorage read → JSON preview
- Export Data → Collect all data → Create JSON → Show confirmation
- Delete Account → Confirmation → Clear everything → Sign out
- Sign Out → Confirmation → Sign out

USE THESE HOOKS:
- const { user } = useAuthStore()
- const { sessions } = useStatsStore()
- const navigation = useNavigation()
- useState for loading states
- useEffect for data size calculation

HANDLE ERRORS:
- If AsyncStorage fails: Show alert "Error reading data"
- If export fails: Show alert "Error exporting data"
- If delete fails: Show alert "Error deleting account"

DESIGN:
- Buttons styled consistently
- Delete/SignOut buttons RED (destructive style)
- Other buttons WHITE (neutral style)
- Confirmation dialogs for destructive actions
```

**Step 2: Test each function**

On your phone:
- [ ] Tap "View All My Data" → JSON appears
- [ ] Tap "Export My Data" → Export success alert
- [ ] Tap "Delete My Account" → Can see and cancel confirmation
- [ ] Tap "Sign Out" → Can see and cancel confirmation
- [ ] No errors in console

**Step 3: Don't actually delete account yet**

Just verify the dialog works and you can cancel it.

---

## ✅ MILESTONE 5: TEST EVERYTHING (30 min)

### Testing Checklist:

**NAVIGATION:**
- [ ] Bottom tab bar has 4-5 icons now
- [ ] Profile is accessible from bottom tabs
- [ ] Settings is separate from Profile
- [ ] No errors when switching between tabs

**SETTINGS SCREEN:**
- [ ] Title shows "Module: Breathing"
- [ ] All breathing settings visible (Sound, Duration, Breaths, etc.)
- [ ] Cloud Backup section at bottom
- [ ] Cloud Backup toggle works
- [ ] NO privacy controls visible (all moved to Profile)
- [ ] NO "Privacy Dashboard" button

**PROFILE SCREEN:**
- [ ] Account section shows your email
- [ ] Privacy Controls section visible
- [ ] "View All My Data" button works → shows JSON
- [ ] "Export My Data" button works → shows success alert
- [ ] "Delete Account" button is RED
- [ ] "Delete Account" shows confirmation on tap
- [ ] "Cancel" in confirmation works (back to Profile)
- [ ] "Privacy Policy" link works
- [ ] "Terms of Service" link works
- [ ] "Sign Out" button at bottom

**FUNCTIONALITY:**
- [ ] Can complete a breathing session (nothing broke)
- [ ] Settings still save (change a slider, restart app, it's still changed)
- [ ] Privacy controls accessible and functional
- [ ] No TypeScript errors
- [ ] No console errors

**STRUCTURE:**
- [ ] Profile = Account + Privacy
- [ ] Settings = Module: Breathing only
- [ ] Clear separation between user account and module settings

---

## 🎯 COMPLETION CHECKLIST

Once all 5 milestones are done:

- [ ] Profile screen created and functional
- [ ] Settings screen updated (module-based)
- [ ] Navigation routes added
- [ ] Privacy controls integrated into Profile
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] App is ready for multi-module scaling

---

## 📋 WHAT'S NEXT (After Restructuring)

Once restructuring is complete:

**Option 1: Continue with Phase 3 Testing**
- Test the restructured Privacy/Profile screen
- Verify all features work in new location

**Option 2: Move to Phase 4 (Google Sheets)**
- Set up tracking sheet for all 65 privacy requirements
- Mark current progress
- Plan remaining work

**Option 3: Start Phase 2 (Add Features)**
- Cloud backup implementation
- Real data export to file
- Real Firebase deletion

---

## 🚨 IF SOMETHING BREAKS

**Settings screen shows error:**
- Check that useSettingsStore import is correct
- Verify sliders/toggles have proper handlers
- Check console for specific errors

**Profile screen won't load:**
- Verify imports (useAuthStore, useStatsStore)
- Check that ProfileScreen is exported properly
- Check navigation config

**Privacy buttons don't work:**
- Check that handlers are defined (handleViewData, etc.)
- Verify AsyncStorage import
- Check console for specific errors

**Can't navigate to Profile:**
- Verify Tab.Screen with name="profile" was added
- Check that component={ProfileScreen} is correct
- Restart Expo app

---

## ✨ TIPS FOR SUCCESS

1. **Do one milestone at a time**
   - Don't skip steps
   - Test after each milestone

2. **Copy-paste the Cursor prompts**
   - They're detailed and comprehensive
   - Will generate good code first try

3. **Test on phone frequently**
   - Don't wait until end to test
   - Catch issues early

4. **Check console for errors**
   - Press 'j' in Expo terminal
   - Most errors appear there first

5. **Commit/backup your code**
   - If you use git: commit before each milestone
   - Easy to revert if needed

---

## 🎬 START NOW

**Ready? Follow this order:**

1. **Milestone 1:** Create Profile screen (30 min)
2. **Milestone 2:** Update Settings (30 min)
3. **Milestone 3:** Update Navigation (15 min)
4. **Milestone 4:** Integrate Privacy (15 min)
5. **Milestone 5:** Test Everything (30 min)

**Total: ~2 hours**

Once done, reply with:
- "Restructuring complete!"
- Any issues encountered
- Test results (all pass? any failures?)

Then we move to:
- ✅ Phase 3 Testing (verify everything works)
- ✅ Phase 4 Google Sheets (track 65 privacy requirements)

---

## 💡 REMEMBER

This restructuring is **temporary pain for long-term gain:**

- 2 hours now = easier to add Finance later
- 2 hours now = easier to add Sleep later
- 2 hours now = Privacy automatically applies to all modules
- 2 hours now = Clear architecture you can defend

**Worth it!** ✨

---

**When you're ready, start with Milestone 1!** 🚀
