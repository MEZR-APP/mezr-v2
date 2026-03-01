# MEZR Privacy Launch Checklist

> **Status**: For Google Play Store release  
> **Priority**: HIGH - Do before launch  
> **Effort**: 8-12 hours

---

## Phase 1: Audit (2 hours)

### Code Audit
```bash
Task 1: List everything in Firebase
[ ] Open Firebase Console
[ ] Go to Firestore > Data
[ ] Export JSON of /users collection structure
[ ] Ask for each field: "Do we need this?"
[ ] Fields to definitely remove if present:
    - userId (use auth.uid instead)
    - deviceId
    - deviceModel
    - osVersion
    - appVersion
    - ipAddress
    - location
    - anything with "tracking" in the name

Task 2: List everything in AsyncStorage
[ ] Examine: /src/stores/*.ts
[ ] Check persistConfig in each store
[ ] Question: Are we persisting something we shouldn't?
[ ] Default should be: auth, settings, sessions ONLY
```

### What to Remove
```typescript
// If you find ANY of these, DELETE them:

❌ Firebase fields to remove:
- lastSeen (timestamp for tracking)
- appOpenCount
- daysSinceInstall
- features: { used_driving_mode_times: number }
- anything about timing/patterns

❌ AsyncStorage items to remove:
- Any event logs
- Any behavior tracking
- Any device info

✅ Safe to keep:
- email (for auth)
- sessions[] (breathing data)
- settings {} (user preferences)
- stats [] (aggregated numbers)
```

---

## Phase 2: Privacy Policy (2-3 hours)

### Write Policy
```
Location: /public/privacy-policy.md (or .html)

Template:
┌──────────────────────────────────────────┐
│ MEZR PRIVACY POLICY                      │
│ Last Updated: [Date]                     │
├──────────────────────────────────────────┤
│                                          │
│ 1. WHAT WE COLLECT                       │
│    - Email (for your account)            │
│    - Breathing session times             │
│    - Your settings                       │
│                                          │
│ 2. HOW WE STORE IT                       │
│    - On your phone (encrypted by iOS/    │
│      Android)                            │
│    - Optional cloud backup (encrypted)   │
│    - Never sold or shared                │
│                                          │
│ 3. YOUR RIGHTS                           │
│    - Download your data                  │
│    - Delete everything                   │
│    - See what we store                   │
│                                          │
│ 4. WHAT WE DON'T DO                      │
│    - Collect location                    │
│    - Collect health data                 │
│    - Track your behavior                 │
│    - Use data for ads                    │
│    - Sell your data                      │
│                                          │
│ 5. CHANGES                               │
│    - We'll ask before changing this      │
│    - You can leave anytime               │
│                                          │
└──────────────────────────────────────────┘

Word count: 400-600 (human-readable)
Avoid: Legal jargon, long sentences
Style: Like talking to a friend
```

### Key Things To Commit To (In Writing)
```markdown
MEZR WILL NEVER:
[ ] Collect location data
[ ] Sell user data to anyone
[ ] Use data for advertising
[ ] Track user behavior patterns
[ ] Share with third parties without asking
[ ] Change privacy terms without user consent
[ ] Keep data after account deletion

MEZR WILL ALWAYS:
[ ] Keep data encrypted
[ ] Let users download their data
[ ] Let users delete everything
[ ] Be transparent about what we collect
[ ] Respond to privacy questions within 7 days
```

---

## Phase 3: In-App Features (3-4 hours)

### Add Privacy Dashboard (Settings > Privacy)
```typescript
// screens/settings/PrivacySettings.tsx

Interface should show:

┌─────────────────────────────────────┐
│  PRIVACY & DATA CONTROL             │
├─────────────────────────────────────┤
│                                     │
│  DATA STORED ON THIS PHONE          │
│  ├─ Sessions: 127                   │
│  ├─ Total Size: 2.3 MB              │
│  └─ Oldest: Jan 1, 2024             │
│  [→ View Details]                   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  CLOUD BACKUP                       │
│  Status: OFF / ON                   │
│  Last Sync: Today 3:45 PM           │
│  [→ Configure]                      │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  YOUR DATA                          │
│  [📥 Download All Data]             │
│  [📖 Privacy Policy]                │
│  [❓ Your Rights]                   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  DANGER ZONE                        │
│  [🗑️ Delete All Local Data]         │
│  [❌ Delete Account Permanently]    │
│                                     │
└─────────────────────────────────────┘
```

### Implementation Code
```typescript
// Simple implementation:

function PrivacySettings() {
  const { sessions } = useStatsStore();
  const { user } = useAuthStore();
  
  const totalDataSize = estimateDataSize(sessions); // MB
  
  const handleExportData = async () => {
    // Prepare JSON export
    const data = {
      exported_at: new Date().toISOString(),
      user_email: user.email,
      total_sessions: sessions.length,
      sessions: sessions,
      note: 'This is YOUR data. You own it completely.',
    };
    
    // Save as file
    const json = JSON.stringify(data, null, 2);
    await shareToFile(json, 'mezr-data-export.json');
  };
  
  const handleDeleteAllData = async () => {
    // Show confirmation dialog
    const confirmed = await Alert.alert(
      'Delete All Data?',
      'This will delete all sessions and settings from your phone. This cannot be undone.',
      [
        { text: 'Cancel' },
        {
          text: 'Delete Everything',
          onPress: async () => {
            // Delete local
            await AsyncStorage.clear();
            // Delete from Firebase (if using)
            await firebaseDeleteAllSessions();
            // Reset app state
            navigation.reset({ routes: [{ name: 'Login' }] });
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <Section title="Data Stored Locally">
        <StatItem label="Sessions" value={sessions.length} />
        <StatItem label="Total Size" value={`${totalDataSize.toFixed(1)} MB`} />
        <Button onPress={handleExportData} title="📥 Download All Data" />
      </Section>
      
      <Section title="Cloud Backup">
        <Toggle label="Enable Backup" ... />
        <Text style={styles.description}>
          Off: Data stays on your phone{'\n'}
          On: Encrypted backup to cloud
        </Text>
      </Section>
      
      <Section title="Your Rights">
        <Link text="Privacy Policy" url={PRIVACY_URL} />
        <Link text="How your data is used" url={DATA_URL} />
      </Section>
      
      <Section title="Dangerous Actions" red>
        <Button 
          onPress={handleDeleteAllData} 
          title="🗑️ Delete All Local Data" 
          color="#EF4444"
        />
      </Section>
    </ScrollView>
  );
}
```

### Implement Data Export
```typescript
// utils/dataExport.ts

export async function exportUserData(): Promise<string> {
  const sessions = useStatsStore.getState().sessions;
  const settings = useSettingsStore.getState();
  const user = useAuthStore.getState().user;
  
  const exportData = {
    // Metadata
    exported_at: new Date().toISOString(),
    data_version: '1.0',
    
    // User info (minimal)
    user: {
      email: user.email,
      created_at: user.createdAt,
    },
    
    // Their settings
    settings: {
      sound_enabled: settings.soundEnabled,
      breath_hold_duration: settings.breathHoldDuration,
      breaths_per_session: settings.breathsPerSession,
      number_of_sessions: settings.numberOfSessions,
      driving_mode: settings.drivingMode,
    },
    
    // All their sessions
    sessions: sessions.map(s => ({
      date: s.date,
      breath_cycles: s.breathCycles,
      hold_times: s.actualHoldTimes,
      sessions_completed: s.sessionsCompleted,
    })),
    
    // Stats
    summary: {
      total_sessions: sessions.length,
      total_hold_time_seconds: sessions.reduce(
        (sum, s) => sum + s.actualHoldTimes.reduce((a,b) => a+b, 0), 
        0
      ),
      average_hold_time: calculateAverage(allHoldTimes),
    },
    
    note: 'This is your personal data. You own it completely. You can use it for anything.',
  };
  
  return JSON.stringify(exportData, null, 2);
}
```

---

## Phase 4: Delete Account Feature (1.5 hours)

### In Profile Screen
```typescript
// screens/profile/ProfileSettings.tsx

function DeleteAccountButton() {
  const handleDelete = async () => {
    // Step 1: Confirm with user
    const confirmed = await Alert.alert(
      'Delete Account?',
      'This will permanently delete:\n' +
      '• Your account\n' +
      '• All sessions\n' +
      '• All settings\n' +
      '• All data from cloud\n\n' +
      'This CANNOT be undone.',
      [
        { text: 'Cancel' },
        {
          text: 'Delete Everything',
          onPress: async () => deleteAccount(),
          style: 'destructive',
        },
      ]
    );
  };
  
  return (
    <Button 
      title="🗑️ Delete Account"
      onPress={handleDelete}
      color="#EF4444"
    />
  );
}

async function deleteAccount() {
  try {
    // Delete from Firebase
    const userId = useAuthStore.getState().user.uid;
    await deleteDoc(doc(db, 'users', userId));
    
    // Delete all sessions from Firestore
    const sessions = await getDocs(
      collection(db, `users/${userId}/sessions`)
    );
    for (const session of sessions.docs) {
      await deleteDoc(session.ref);
    }
    
    // Delete from Firebase Auth
    const user = getAuth().currentUser;
    await user.delete();
    
    // Delete local storage
    await AsyncStorage.clear();
    
    // Sign out and reset
    navigation.reset({
      routes: [{ name: 'Login' }],
    });
    
    Alert.alert('Account Deleted', 'All your data has been permanently deleted.');
  } catch (error) {
    Alert.alert('Error', 'Failed to delete account. Please try again.');
  }
}
```

---

## Phase 5: Documentation (1-2 hours)

### Create Privacy Document in Repo
```
/docs/PRIVACY_ARCHITECTURE.md

Contents:
1. Data minimization principles
2. Where each data type is stored
3. Encryption approach
4. User rights (export, delete, etc.)
5. Future restrictions (what we'll never do)
6. How to audit this in future
```

### Create Data Dictionary
```typescript
// docs/DATA_DICTIONARY.md

Field: email
├─ Purpose: User authentication
├─ Storage: Firebase Auth
├─ User Can Delete: Yes (account deletion)
├─ Retention: Until account deleted
├─ Shared With: No one
└─ Notes: Only field that identifies user

Field: sessionId
├─ Purpose: Session tracking
├─ Storage: AsyncStorage + Firebase (if enabled)
├─ Sensitive: No (just random UUID)
├─ Retention: Until user deletes
└─ Notes: No PII

[... repeat for each field ...]
```

---

## Phase 6: Testing (1 hour)

### Test Data Export
```
[ ] On Android device:
    1. Go to Settings > Privacy > Download All Data
    2. Open JSON file
    3. Verify it's readable
    4. Verify no sensitive data exposed
    5. Check structure matches spec

[ ] On iOS device:
    1. Repeat above
    2. Share to email, verify works
```

### Test Data Deletion
```
[ ] Delete all local data:
    1. Go to Settings > Privacy > Delete All
    2. Confirm deletion
    3. Check app still works
    4. Check Settings > Data shows "0 sessions"

[ ] Delete account:
    1. Go to Profile > Delete Account
    2. Confirm deletion
    3. Check Firebase console: user gone
    4. Check all sessions deleted
    5. App should force logout
```

### Test Cloud Backup (If Implemented)
```
[ ] Enable backup:
    1. Go to Settings > Cloud Backup
    2. Turn ON
    3. Do a few breathing sessions
    4. Check Firebase: data synced (encrypted)
    5. Can you read it? (No = good!)

[ ] Disable backup:
    1. Turn OFF
    2. Do a session
    3. Check Firebase: no new data (good!)
    4. Old encrypted data still there
    5. Add: "Delete cloud backup" option
```

---

## Phase 7: Before Launch on Play Store

### Final Checklist
```
POLICY & LEGAL
[ ] Privacy policy on website (public URL)
[ ] Link to privacy policy in app (Settings)
[ ] Terms of Service written
[ ] No third-party SDKs that violate privacy
    - Check: Firebase Analytics (should be OFF)
    - Check: Crash reporting (should be minimal PII)
    - Check: Any ad SDKs? (should be none for MVP)

TECHNICAL
[ ] Data export works on both platforms
[ ] Account deletion works on both platforms
[ ] No unused data being collected
[ ] No device identifiers being stored
[ ] No location/health data beyond breathing times

DATA
[ ] Firebase Firestore security rules reviewed
[ ] Rules restrict to authenticated user
[ ] Can't read other users' data
[ ] Can't access sessions without userId auth

TESTING
[ ] Export data on Android
[ ] Export data on iOS
[ ] Delete account on Android
[ ] Delete account on iOS
[ ] Fresh install: App works without data (good UX)
[ ] Uninstall/Reinstall: Data gone (expected)

DOCUMENTATION
[ ] README includes privacy principles
[ ] Code has comments about data flow
[ ] Architecture diagram (show what's local vs cloud)
[ ] Data dictionary (every field explained)
```

### For Play Store Listing
```
In app description, mention:
"🔒 Privacy First
- Your data stays on your phone
- No ads, no tracking
- No data ever sold
- Export or delete anytime"

In privacy policy section:
- Link to full privacy policy
- Link to data dictionary
- Contact email for privacy questions
```

---

## Red Flags: Don't Do These Before Launch

```
❌ DON'T: Auto-sync sessions to Firebase without asking
❌ DON'T: Add analytics that track user behavior
❌ DON'T: Integrate Facebook/Google SDKs (for tracking)
❌ DON'T: Store location data (even optional)
❌ DON'T: Store health data beyond breathing times
❌ DON'T: Have unclear privacy policy
❌ DON'T: No way to delete account
❌ DON'T: No way to export data
❌ DON'T: Surprise users with cloud data collection
❌ DON'T: Anything not clearly explained in Settings

✅ DO: Tell users exactly what you collect
✅ DO: Let them control cloud features (off by default)
✅ DO: Make data export obvious
✅ DO: Make data deletion obvious
✅ DO: Assume user distrust, prove them wrong
```

---

## Success Criteria

After completing this checklist, you should be able to honestly say:

✅ "I know exactly what data I'm collecting"
✅ "Users can see what I collect"
✅ "Users can download their data"
✅ "Users can delete everything"
✅ "Data is encrypted at rest"
✅ "I have a clear privacy policy"
✅ "Nothing is surprising or hidden"

---

## Time Estimates

| Phase | Task | Hours | Difficulty |
|-------|------|-------|------------|
| 1 | Data Audit | 2 | Low |
| 2 | Privacy Policy | 2-3 | Low |
| 3 | Privacy Dashboard | 3-4 | Medium |
| 4 | Delete Account | 1.5 | Medium |
| 5 | Documentation | 1-2 | Low |
| 6 | Testing | 1 | Low |
| 7 | Final Checks | 1 | Low |
| **TOTAL** | | **12-16** | **Medium** |

**Timeline**: Can complete in 2-3 days (4-5 hours/day)

---

## What Happens After Launch

### Month 1
- Monitor: Any user privacy questions?
- Alert: Check Firebase for unexpected data
- Fix: Remove unused data fields

### Month 3
- Audit: External privacy review ($1000-2000)
- Update: Fix any issues found
- Communicate: Tell users what you fixed

### Month 6-12
- Review: Any new data collection ideas?
- Check: Do they align with privacy commitment?
- Decide: No = don't build it

### Year 2+
- Annual audit: Is privacy still core value?
- Stay consistent: Don't gradually erode privacy
- Hire: Privacy engineer if team grows

---

**Questions?** Create a `PRIVACY_Q_A.md` document for FAQs

**Your Advantage**: First breathing app with real privacy = huge differentiator
