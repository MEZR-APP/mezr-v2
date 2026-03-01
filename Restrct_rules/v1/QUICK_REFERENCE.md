# RESTRUCTURING QUICK REFERENCE
## Keep this open while working

---

## MILESTONE 1: CREATE PROFILE SCREEN
**Time: 30 min | File: src/app/(tabs)/profile.tsx**

What it shows:
- Account (Email, Name)
- Privacy Controls (View Data, Export, Delete)
- Privacy & Terms (Links)
- App Info (Version)

Cursor Prompt: "CREATE NEW PROFILE SCREEN - ACCOUNT + PRIVACY FOCUSED"

✅ When done: Profile screen exists with all sections

---

## MILESTONE 2: UPDATE SETTINGS
**Time: 30 min | File: src/app/(tabs)/settings.tsx**

What changes:
- ❌ REMOVE: Privacy Dashboard button
- ✅ ADD: "Module: Breathing 🫁" header
- ✅ KEEP: All breathing settings (same)
- ✅ ADD: Cloud Backup section

Cursor Prompt: "UPDATE SETTINGS SCREEN - MODULE-BASED LAYOUT"

✅ When done: Settings focused on Module: Breathing only

---

## MILESTONE 3: UPDATE NAVIGATION
**Time: 15 min | File: src/app/(tabs)/_layout.tsx**

What changes:
- Import ProfileScreen from './profile'
- Add: <Tab.Screen name="profile" component={ProfileScreen} />
- Place after Stats screen

Cursor Prompt: "UPDATE TAB NAVIGATOR - ADD PROFILE ROUTE"

✅ When done: Profile appears as 4th/5th tab at bottom

---

## MILESTONE 4: INTEGRATE PRIVACY
**Time: 15 min | File: src/app/(tabs)/profile.tsx**

Implement these buttons:
1. "View All My Data" → Shows JSON
2. "Export My Data" → Export confirmation
3. "Delete My Account" → Confirmation dialog (RED)
4. "Sign Out" → Confirmation (RED)
5. "Privacy Policy" → Shows text
6. "Terms of Service" → Shows text

Cursor Prompt: "INTEGRATE PRIVACY CONTROLS INTO PROFILE SCREEN"

✅ When done: All privacy buttons functional

---

## MILESTONE 5: TEST EVERYTHING
**Time: 30 min | Phone testing**

Check:
- [ ] Profile screen loads
- [ ] Settings shows "Module: Breathing"
- [ ] Bottom tabs show 4-5 options
- [ ] Can tap Profile tab from anywhere
- [ ] All privacy buttons work (don't click Delete yet!)
- [ ] Settings changes save
- [ ] No errors in console
- [ ] Can still complete breathing session

✅ When done: All tests pass

---

## COPY-PASTE WORKFLOW

**In Cursor:**

1. Open file mentioned in milestone
2. Find the prompt below
3. Copy exact prompt text
4. Paste into Cursor
5. Let Cursor generate code
6. Check for errors
7. Test on phone

---

## CURSOR PROMPTS (Copy exactly)

### MILESTONE 1:
```
CREATE NEW PROFILE SCREEN - ACCOUNT + PRIVACY FOCUSED

File: src/app/(tabs)/profile.tsx
[rest of prompt in RESTRUCTURE_IMPLEMENTATION.md]
```

### MILESTONE 2:
```
UPDATE SETTINGS SCREEN - MODULE-BASED LAYOUT

File: src/app/(tabs)/settings.tsx
[rest of prompt in RESTRUCTURE_IMPLEMENTATION.md]
```

### MILESTONE 3:
```
UPDATE TAB NAVIGATOR - ADD PROFILE ROUTE

File: src/app/(tabs)/_layout.tsx
[rest of prompt in RESTRUCTURE_IMPLEMENTATION.md]
```

### MILESTONE 4:
```
INTEGRATE PRIVACY CONTROLS INTO PROFILE SCREEN

File: src/app/(tabs)/profile.tsx
[rest of prompt in RESTRUCTURE_IMPLEMENTATION.md]
```

### MILESTONE 5:
Test on phone using checklist above

---

## TROUBLESHOOTING

**"Cannot find module ProfileScreen"**
→ Check import path in _layout.tsx

**"Privacy controls button not visible"**
→ Check Profile screen ScrollView has all sections

**"Settings missing sliders"**
→ Verify sliders weren't accidentally removed

**"Can't tap Profile tab"**
→ Verify Tab.Screen with name="profile" exists

**"Navigation error"**
→ Restart Expo (`Ctrl+C` then `expo start`)

---

## SUCCESS INDICATORS

✅ Profile screen shows account + privacy
✅ Settings shows "Module: Breathing"
✅ 4-5 tabs at bottom (not 3)
✅ Privacy buttons work (don't delete yet!)
✅ Settings changes persist
✅ No TypeScript errors
✅ No console errors

---

## AFTER RESTRUCTURING

Next steps:
1. Phase 3 Testing (verify new structure works)
2. Phase 4 Google Sheets (track 65 requirements)
3. Phase 2 Features (cloud backup, real export, real delete)

---

## TIME ESTIMATE

Total time: ~2 hours

Breakdown:
- Milestone 1: 30 min
- Milestone 2: 30 min
- Milestone 3: 15 min
- Milestone 4: 15 min
- Milestone 5: 30 min
- Buffer: 0 min (should be tight if following steps)

---

**Ready to start?** Begin with Milestone 1! 🚀
