# MEZR - Privacy-First Architecture & Trust Framework

> **Philosophy**: Privacy is a feature, not an afterthought. Build such that data breaches, government requests, or business pivots cannot harm users.

---

## Table of Contents
1. [Core Privacy Principles](#core-privacy-principles)
2. [Data Architecture (On-Device vs Cloud)](#data-architecture)
3. [Encryption Strategy](#encryption-strategy)
4. [Data Minimization](#data-minimization)
5. [Transparency & User Control](#transparency--user-control)
6. [Legal & Policy Protection](#legal--policy-protection)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Future-Proofing Against Risks](#future-proofing-against-risks)

---

## Core Privacy Principles

### Principle 1: Data Minimization
**Only collect what's necessary for the stated purpose.**

```
Current Mezr collects:
✅ Email (authentication only)
✅ Breathing session stats (performance)
✅ Settings preferences (user experience)

❌ DON'T collect:
- Location data
- Health data beyond breathing (heart rate, etc.)
- Device identifiers (IDFA, Android Ad ID)
- Behavioral patterns
- Biometric data beyond breath timing
- User device info
- IP address logs
```

### Principle 2: Purpose Limitation
**Data collected for breathing sessions cannot be used for advertising or third-party sharing.**

```typescript
// Mark data purpose in schema
interface SessionRecord {
  // PURPOSE: Performance improvement and user stats only
  // NOT for: Marketing, advertising, or third-party sharing
  id: string;
  date: string;
  actualHoldTimes: number[];
  
  // NEVER collect:
  // - deviceId
  // - location
  // - userId for tracking (use auth UID only)
  // - timestamps for pattern analysis
}
```

### Principle 3: Storage Minimization
**Delete data when it's no longer needed.**

```
Retention Policy:
- Session data: Keep indefinitely (user can manually delete)
- Auth tokens: Delete on logout
- Temp files: Delete after 24 hours
- Error logs: Delete after 30 days
- Analytics: Never (see Analytics section below)
```

---

## Data Architecture: On-Device vs Cloud

### The Ideal Pyramid (Privacy ↑ → Features ↓)

```
        LEVEL 1: On-Device Only (Maximum Privacy)
    ┌─────────────────────────────────────────┐
    │ • Breathing sessions                    │
    │ • Session stats                         │
    │ • User settings                         │
    │ • Session history                       │
    │ → All stored locally, encrypted         │
    │ → Zero cloud dependency                 │
    └─────────────────────────────────────────┘
                        ↓
        LEVEL 2: Cloud with User Control
    ┌─────────────────────────────────────────┐
    │ • Auth credentials (Firebase)           │
    │ • Backup data (opt-in, encrypted)       │
    │ • Settings sync (cross-device, opt-in)  │
    │ → User chooses what syncs                │
    │ → End-to-end encrypted                  │
    └─────────────────────────────────────────┘
                        ↓
        LEVEL 3: Cloud Required (Minimal)
    ┌─────────────────────────────────────────┐
    │ • Authentication state                  │
    │ • Account existence                     │
    │ → No session data                       │
    │ → No personal health info               │
    └─────────────────────────────────────────┘
```

### MVP Architecture (Current)

**Status**: Currently using Firebase for auth + optional cloud sync
**Decision**: Keep session data on-device by default, offer encrypted backup as opt-in

```typescript
// Current setup - CORRECT approach
interface MezrDataLayers {
  layer1_onDevice: {
    // Primary storage - user owns this data completely
    storage: 'AsyncStorage (encrypted)',
    data: ['sessions', 'settings', 'stats'],
    backup: 'Manual export (JSON)',
    deletion: 'User can wipe anytime',
  },
  
  layer2_cloudOptional: {
    // Only if user explicitly enables
    storage: 'Firebase Firestore (with E2E encryption key)',
    data: ['encrypted session backup'],
    userControl: true,
    deletion: 'User can disable sync + delete cloud copy',
  },
  
  layer3_required: {
    storage: 'Firebase Auth',
    data: ['email', 'auth token'],
    notes: 'Essential for login, minimal surface area',
  },
}
```

### What NOT to Do

```typescript
// ❌ WRONG: Force everything to cloud
const wrongApproach = {
  storage: 'Firebase Firestore',
  data: ['every session', 'every stat', 'every setting'],
  problem: 'Users cannot use app offline, 100% dependent on cloud',
  risk: 'Business changes → forced data collection',
}

// ❌ WRONG: Auto-sync without user knowledge
const anotherWrong = {
  behavior: 'Sessions auto-uploaded to cloud',
  transparency: false,
  userControl: false,
  problem: 'User might not know their breathing data is on Firebase',
  risk: 'Privacy violation discovered → trust destroyed',
}
```

---

## Encryption Strategy

### MVP Phase: Local Encryption

```typescript
// Use expo-secure-store for sensitive data
// Use AsyncStorage for main session data (with native encryption on modern OS)

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Critical: On iOS 8+, Android 6+, AsyncStorage is already encrypted via OS
// But explicitly label what's sensitive

interface EncryptionStrategy {
  // Tier 1: OS-level encryption (free)
  asyncStorage: {
    items: ['sessions', 'stats', 'settings'],
    encryption: 'OS-level (TEE on Android, Keychain on iOS)',
    notes: 'Automatic, no extra code needed',
  },
  
  // Tier 2: SecureStore (app-level)
  secureStore: {
    items: ['encryptionKey (if user enables custom encryption)'],
    encryption: 'KeyStore (Android), Keychain (iOS)',
  },
}
```

### Future Phase: User-Controlled Encryption

```typescript
// For users who want absolute privacy (opt-in feature)
// Only they can decrypt their data

import * as crypto from 'expo-crypto';

interface UserEncryption {
  // User can set "Privacy Pin" or passphrase
  // Only they enter PIN to decrypt local session data
  // Cloud backup can use this PIN as encryption key
  
  // Benefits:
  // - Even you (developer) cannot see their data
  // - Cannot be compelled to decrypt user data
  // - Adds friction (PIN entry) so make optional
  
  implementation: `
    1. User sets 6-digit PIN (optional, default OFF)
    2. PIN → derives encryption key via PBKDF2
    3. Sessions encrypted with key, stored encrypted
    4. On app open, prompt for PIN (once per session)
    5. All session data accessible only after PIN entry
    
    Cloud backup scenario:
    - Encrypted session data sent to cloud
    - Key never sent to cloud
    - Only user can decrypt cloud backup
    - You (Mezr) cannot access encrypted data
  `,
}
```

### What This Means

```
Scenario 1: User without PIN (default, ease-of-use focused)
├─ Sessions stored on device
├─ Device OS encrypts the storage
├─ If user loses phone → data lost (user choice)
├─ Your servers see nothing
└─ Result: Privacy ✅, Recovery ❌

Scenario 2: User with PIN + Cloud Backup
├─ Sessions stored locally (OS encrypted)
├─ Separate encryption key: only in PIN
├─ Cloud gets encrypted blob
├─ Only user can decrypt with PIN
├─ If user loses phone → restore from cloud
├─ You servers see encrypted blob (unreadable)
└─ Result: Privacy ✅, Recovery ✅

Scenario 3: Suspicious user worried about you
├─ Their concern: "Even Mezr team might read my data"
├─ Your response: "We built in PIN encryption"
├─ They set PIN → total control
├─ You literally cannot read their data (good!)
└─ Result: Trust ✅, Privacy ✅
```

---

## Data Minimization

### What Mezr Actually Needs to Store

```typescript
// Session Record - MINIMAL
interface SessionRecord {
  // Absolutely essential:
  id: string;                    // UUID, generated on device
  date: string;                  // ISO timestamp
  actualHoldTimes: number[];     // Just numbers (seconds)
  sessionsCompleted: number;
  totalSessions: number;
  breathCycles: number;
  
  // Optional for basic stats:
  holdDurationTarget: number;    // The setting used
  drivingMode: boolean;          // Was driving mode on?
  
  // ❌ NEVER COLLECT:
  // location, gender, age, weight, health_conditions
  // device_model, os_version, app_version
  // time_of_day, day_of_week patterns
  // heart_rate, blood_oxygen, other_sensors
  // user_behavior patterns
}

// Why minimal?
// - User fears data misuse? → Less data = less risk
// - Government requests data? → Can't give what you don't have
// - Business changes direction? → Can't monetize what's minimal
// - Future "emergency" data request? → Doesn't exist to give
```

### Audit Your Data Regularly

```markdown
## Quarterly Data Audit

1. Firestore: What fields exist?
   - List every field in /users/{userId}/sessions
   - Ask: "Do we need this?"
   - If no: Remove from schema

2. AsyncStorage: What's stored locally?
   - Export from test device
   - Check: Any PII? Any tracking IDs? Any timestamps that reveal patterns?

3. Firebase Auth: What extra user data is stored?
   - Keep ONLY email
   - Delete displayName if not essential
   - Don't store phone number

4. Logs & Monitoring: What are we logging?
   - Check Firebase console for events
   - Remove any events that contain user data
   - Keep only: Error logs (no PII), Session start/end counts

5. Analytics: Are we using Firebase Analytics?
   - Answer: Should be NO for MVP
   - Any analytics added later must be opt-in
```

---

## Transparency & User Control

### Privacy Policy (Simple Version for Users)

```markdown
# Mezr Privacy Policy - Simple Version

## What We Collect
- Your email (login only)
- Your breathing sessions (if you allow cloud backup)
- Your settings (stored on your phone)

## Where It's Stored
- On your phone: encrypted by your phone's OS
- In cloud (optional): encrypted, only you can decrypt with PIN
- Our servers: only see encrypted data or nothing

## What We DON'T Collect
- Your location
- Your health data (beyond breathing times)
- Your device info
- Your behavior patterns
- Your IP address
- Anything for advertising

## Your Rights
- Delete all data anytime: Settings → Delete Account
- Stop cloud backup anytime: Settings → Cloud → Off
- Export your data: Settings → Export → JSON file
- See what's stored: All data visible in app

## Changes
- Any change to this policy = opt-in (you must agree)
- We will NOT:
  - Start collecting location without asking
  - Start collecting health data without asking
  - Start using data for ads without asking
  - Sell your data to anyone
  - Share with third parties without asking

## If We're Acquired
- You keep ownership of your data
- New company cannot change privacy without your consent
- You can export and leave anytime
```

### In-App Transparency

```typescript
// Implement in Settings > Privacy section

interface PrivacyDashboard {
  sections: {
    whatWeStore: {
      // Show exactly what's on device
      items: [
        'Sessions: 127',
        'Total data: 2.3 MB',
        'Oldest session: Jan 1, 2024',
      ],
      action: 'View raw data (JSON)',
    },
    
    cloudBackup: {
      // Show cloud status
      status: 'Enabled (encrypted)',
      lastSync: 'Today at 3:45 PM',
      action: 'Manage backup',
    },
    
    dataDownload: {
      // Let users export
      description: 'Download all your data',
      format: 'JSON (human readable)',
      action: 'Export now',
    },
    
    dataDelete: {
      // Let users nuke everything
      options: [
        'Delete old sessions (before date)',
        'Delete all local data',
        'Delete account completely',
      ],
    },
  },
}
```

---

## Legal & Policy Protection

### Build These Into Your Guardrails

#### 1. Terms of Service

```markdown
## Key Clauses for Privacy

### Data Ownership
"Your data belongs to you. You can request deletion, export, 
or account removal at any time."

### No Third-Party Sharing
"We will never sell, share, or transfer your data to 
third parties without explicit written consent."

### No Advertising
"Mezr is not and will never be advertising-supported. 
We do not use your data for ads."

### Acquisition Clause
"If Mezr is acquired, your data rights do not change. 
You can export and leave. New owner cannot modify 
privacy terms without your agreement."

### Government Requests
"If government requests your data, we will:
1. Notify you (unless legally prohibited)
2. Challenge the request
3. Provide only what's legally required"

### Bankruptcy Clause
"If Mezr goes out of business, your data will be 
deleted (not sold to highest bidder)."
```

#### 2. Privacy Principles Document

```markdown
## Mezr Privacy Principles (Public Commitment)

These are not just policy. They're architectural decisions.

### 1. Data Minimization is Mandatory
- Every data field must justify its existence
- Quarterly audits remove unused fields
- If we don't need it, we don't store it

### 2. Encryption by Default
- All data at rest encrypted by OS
- All data in transit encrypted (HTTPS only)
- User can opt-in for additional encryption

### 3. No Tracking
- No analytics that track individuals
- No device fingerprinting
- No persistent identifiers
- No behavior pattern analysis

### 4. User Control is First
- All cloud features are opt-in
- Users can see exactly what's stored
- Users can delete everything anytime
- Users can export raw data

### 5. We Are Accountable
- Public privacy audit annually
- Security audit by third party
- Transparent incident reporting
- User notification within 72 hours of breach
```

#### 3. GDPR Compliance (Even if not required)

```markdown
## Mezr's GDPR-Style Compliance (Even in US)

Why? Because it's the right thing, not just legal requirement.

✅ Implemented:
- Right to access: Users can download their data
- Right to erasure: Users can delete everything
- Right to portability: Data in standard JSON format
- Data minimization: Only essential data collected
- Transparency: Privacy policy is simple and clear

If you operate in EU:
- GDPR applies legally
- Follow above anyway for all users (consistency)

If acquired by someone else:
- These commitments live in your code/docs
- New owner cannot easily undo them
- Users have documented expectations
```

---

## Implementation Roadmap

### Phase 1 (MVP - Current)
```
Goal: Privacy by Design
Timeline: Before Google Play launch
Effort: 5-10 hours

Tasks:
☐ Move all session data to AsyncStorage (done?)
☐ Only authenticate via Firebase, don't store extra user data
☐ Write simple privacy policy (500 words)
☐ Add Privacy section to Settings (view what's stored)
☐ Implement data export feature (JSON)
☐ Implement account delete feature (wipes everything)
☐ Document all data you collect (audit)
☐ Remove any unused data fields

Test:
- Export data from app
- Verify it's human-readable
- Wipe account and data
- Verify everything gone
```

### Phase 2 (Post-MVP, Pre-1M Users)
```
Goal: User Control
Timeline: Months 2-4
Effort: 15-20 hours

Tasks:
☐ Optional cloud backup (encrypted)
☐ Encryption key management (PIN-based)
☐ Settings to control what syncs
☐ Data retention settings
☐ Privacy dashboard (storage info)
☐ Third-party security audit
☐ Update policy based on audit findings

Test:
- Enable/disable cloud backup multiple times
- Verify data syncs securely
- Set PIN, verify encryption works
- Check: Can you see encrypted data? (Shouldn't be able to)
```

### Phase 3 (Post-Launch, Future Features)
```
Goal: Transparency & Accountability
Timeline: Months 6+
Effort: Ongoing

Tasks:
☐ Public privacy audit (annually)
☐ Open-source privacy audit findings
☐ Transparency report (any government requests)
☐ Implement data deletion schedule (auto-delete old sessions?)
☐ Community review process for new features

These build trust over time.
```

---

## Future-Proofing Against Risks

### Risk 1: Business Pressure to Monetize
**Temptation**: "Let's add analytics to understand users better"

**Your Guard**:
```typescript
// In your code, document this decision
const PRINCIPLES = {
  noTracking: "No analytics that identify individuals",
  noAdvertising: "Mezr will never be ad-supported",
  noBehavioralData: "No collection of usage patterns for profit",
  
  ifPressured: `
    If investors ask to add tracking:
    1. Remind them: Users chose Mezr FOR privacy
    2. Analytics won't help improve retention (private app ≠ viral)
    3. Privacy IS the moat (competitors can't match)
    4. If monetization needed, use subscriptions, not data
  `
}
```

### Risk 2: Acquisition / Business Pivot
**Scenario**: Company gets acquired, new owner wants "data strategy"

**Your Guard**: Architectural & Legal
```typescript
interface AcquisitionProof {
  // Technical:
  // Users' data is encrypted on their device
  // New owner can't access it without user PIN
  // No backdoor into user data
  
  // Legal:
  // ToS explicitly states: "Acquisition doesn't change your rights"
  // Users can export anytime
  // If terms change, users must re-consent
  
  // Practical:
  // Most of value is in users (not data)
  // Compromising privacy = losing users
  // Better to honor original promise
}
```

### Risk 3: Government / Legal Request
**Scenario**: Subpoena for user's breathing data

**Your Defense**:
```
Good news:
- You don't have user's session data (it's on their phone)
- You only have encrypted backup (can't decrypt)
- You legitimately cannot provide unencrypted data

If question: "Why don't you store this server-side?"
Answer: "Privacy is our feature. Users own their data."

If pressure: "But we need the data"
Answer: "User can provide it themselves (export feature)"
```

### Risk 4: Future "Emergency" Law
**Scenario**: New law requires apps to collect health data / track location

**Your Position**:
```markdown
"Mezr's architecture doesn't support this because:
1. We don't collect health data (only breathing session times)
2. We don't have infrastructure to track location
3. Changing this would violate user privacy policy"

You're protected because:
- You made privacy-first decisions early
- It's architecturally harder to add tracking
- Breaking your policy = losing users
- (Most sustainable outcome)
```

---

## Checklist: Before Any Feature Launch

```markdown
## Feature Launch Privacy Checklist

New feature: ___________________

1. Data Impact
   ☐ What new data does this feature require?
   ☐ Is this data essential? (can't build without it?)
   ☐ How long must we store it?
   ☐ Can user delete it?

2. User Consent
   ☐ Is this feature opt-in or default?
   ☐ Default: User explicitly enabled it? (Yes = safe)
   ☐ Does user understand what data we collect?
   ☐ Can user disable anytime without breaking app?

3. Encryption & Storage
   ☐ Where is data stored? (Device/Cloud?)
   ☐ If cloud: Is it encrypted? Who has key?
   ☐ Can you see the data? Should you be able to?
   ☐ If user deletes account, is this data deleted?

4. Purpose Limitation
   ☐ Why do we need this data?
   ☐ Will we use it ONLY for stated purpose?
   ☐ Could we use it for ads/tracking? (✅ Say no)
   ☐ Could we sell it? (✅ Say no)

5. User Control
   ☐ Can user see what data was collected?
   ☐ Can user export this data?
   ☐ Can user delete this data?
   ☐ Can user opt-out of this feature?

6. Documentation
   ☐ Updated privacy policy?
   ☐ Updated in-app privacy dashboard?
   ☐ Code comments explain data collection?

RULE: If you check "No" to any question, feature is NOT ready.
```

---

## Summary: Your Competitive Advantage

```
Traditional Wellness Apps:
├─ Collect everything (location, health, behavior)
├─ Sell data to advertisers
├─ Users feel tracked
├─ Privacy breaches → users leave
└─ Vulnerable to acquisition pivot

MEZR (Privacy-First):
├─ Collect only what's needed
├─ User owns their data
├─ Users feel in control
├─ Privacy is the differentiator
├─ Sustainable long-term
└─ Defensible against future risks

The Paradox:
"Collecting less data makes your app BETTER, not worse"

Why?
- Users trust you → longer retention
- Simpler to maintain → lower costs
- Can't monetize data → forces sustainable business model
- Defensible position → investors like it
- Harder to compete with → they'd need privacy too
```

---

## Next Steps for Ashok

### This Week
1. **Audit current architecture**
   - What data is in Firebase?
   - What's in AsyncStorage?
   - Is any of it unnecessary?

2. **Write privacy policy**
   - Use the template above
   - Make it 500-1000 words (readable)
   - Don't hide behind legal jargon

3. **Add privacy dashboard to Settings**
   - Show: "Sessions stored: 42, Data size: 1.2 MB"
   - Show: "Cloud backup: (OFF/ON)"
   - Add buttons: Export Data, Delete Account

### This Month
1. **Implement data export**
   - Users can download JSON of all sessions
   - Make it human-readable
   - Test on your phone

2. **Implement account delete**
   - Button in Profile > Delete Account
   - Confirms user intent (modal)
   - Deletes all local data
   - Deletes from Firebase

3. **Third-party review**
   - Before Google Play launch
   - Find privacy/security consultant
   - Ask: "What am I missing?"
   - Budget: $500-2000 (worth it)

### Before Launch
1. **Privacy audit** (internal)
   - List every data field
   - Justify each one
   - Remove the rest

2. **Policy finalization**
   - Privacy policy on your website
   - In-app link to policy
   - Clear Terms of Service

3. **Documentation**
   - Code comments explaining data flows
   - Architecture diagram (data flow)
   - For future team members / acquirers

---

## Resources

### Privacy Frameworks
- **GDPR** (EU standard, but good practices): https://gdpr-info.eu
- **CCPA** (California): https://oag.ca.gov/privacy/ccpa
- **Privacy by Design**: https://www.iapp.org/

### Tools
- **OWASP** (Security best practices): https://owasp.org/
- **Data impact assessment template**: https://ico.org.uk/for-organisations/guide-to-data-protection/
- **Privacy policy generators**: iubenda, termly (use as template)

### React Native Specific
- **Encryption**: https://github.com/emeraldsanto/rn-crypto-mnemonic
- **Secure storage**: expo-secure-store (built-in)
- **Local storage**: AsyncStorage (OS-encrypted by default)

---

## Remember

> Privacy isn't a feature you add later. It's a decision you make upfront.

Every data field, every API call, every sync is a decision.
**Make the right ones now, or pay for them later.**

Your users will trust Mezr not because you say "privacy matters" but because you designed it that way from day one.

---

**Created by**: AI Assistant  
**For**: Ashok / Mezr Project  
**Version**: 1.0  
**Last Updated**: Jan 2025
