# MEZR Privacy Requirements - How to Use with LLM Agent

## Quick Start

### Step 1: Import CSV to Google Sheets
1. Go to Google Sheets: https://sheets.google.com
2. Create new sheet: "MEZR Privacy Requirements"
3. Click: Data > Import Range
4. Paste CSV content (or upload file)
5. Confirm import

### Step 2: Set Up Columns
Your sheet should have these columns:
- **Requirement_ID** (PR-001, PR-002, etc.)
- **Category** (Data_Minimization, Storage_Architecture, etc.)
- **Requirement** (The actual requirement)
- **Priority** (HIGH, MEDIUM, LOW)
- **Implementation_Details** (How to do it)
- **Validation_Checklist** (How to verify it's done)
- **Status** (Backlog, In_Progress, Done)
- **Dependencies** (What other requirements must be done first)

### Step 3: Add Conditional Formatting
Make it visual:
- **HIGH priority** rows → RED background
- **MEDIUM priority** rows → YELLOW background
- **In_Progress** status → BLUE text
- **Done** status → GREEN checkmark + strikethrough

---

## How to Use This with Your LLM Agent

### Option A: Reference Document (Recommended for MVP)

**Before every development task**, ask the LLM:

```
CONTEXT:
You are building Mezr, a privacy-first breathing app.
Privacy requirements are non-negotiable.

REQUIREMENT REFERENCE:
[Copy relevant requirements from the sheet]

TASK:
[Your development task]

VALIDATION:
Before you finish, ensure:
[Paste validation checklist for that requirement]

Never skip privacy checks.
```

**Example Prompt:**

```
CONTEXT:
Building data export feature for Mezr.

REQUIREMENTS:
PR-010: User Control - Implement data export feature
- Settings > Privacy > Export: user downloads JSON with ALL their data
- Must be human-readable
- File name: mezr-data-export-[date].json

PR-013: Transparency - Write simple privacy policy
- 500-1000 words, NOT legal jargon
- Link in app to privacy policy

TASK:
Create data export functionality that lets users download JSON file 
with all their sessions, settings, and stats.

VALIDATION:
☐ Export button in Privacy section
☐ JSON contains all user data
☐ Human-readable format (pretty-printed)
☐ Test on Android and iOS
☐ File naming correct
☐ No PII accidentally exposed

START WITH: Review PR-010 requirements above. Then build feature.
```

---

### Option B: Automated Checklist in Spreadsheet

Share this Google Sheet with your team/LLM:

```
Before Starting a Task:
1. Find task in PR column
2. Read Requirement & Implementation_Details
3. Read Validation_Checklist
4. Mark Status: "In_Progress"
5. Build feature
6. Check off all validation items
7. Mark Status: "Done"
```

---

### Option C: Integration with LLM System Prompt

If using Cursor IDE with custom instructions, add:

```markdown
## PRIVACY REQUIREMENTS PRIORITY

Reference: MEZR Privacy Requirements Sheet
URL: [Your Google Sheets URL]

Before implementing ANY feature:
1. Check if privacy requirement exists
2. Read requirement + implementation details
3. Follow implementation details exactly
4. Validate against checklist
5. Update sheet status to Done

Non-negotiable requirements (never skip):
- PR-001: Email only for auth
- PR-002: Only breathing data (no health metadata)
- PR-003: Never store device IDs
- PR-004: Never store location
- PR-005: No analytics
- PR-006: On-device storage primary
- PR-039: Firebase Analytics OFF
- PR-040: No custom event tracking

If requirement conflicts with feature request:
Privacy wins. Don't build feature if it violates requirements.
```

---

## Using This Sheet: Real-World Examples

### Example 1: Building Settings Screen

**Task**: "Add Settings screen with toggles and sliders"

**LLM Prompt**:
```
Building Settings screen for Mezr.

PRIVACY REQUIREMENTS:
PR-007: Cloud backup must default to OFF
PR-021: All cloud features default to OFF
PR-022: No auto-sync without user knowledge

IMPLEMENTATION:
- Cloud Backup toggle: default false
- Settings UI shows toggle state clearly
- User explicitly enables to turn on
- Show notification when enabling: "Your data will sync to cloud"

BUILD: Settings component with above requirements
```

### Example 2: Implementing Firebase Connection

**Task**: "Set up Firestore for session storage"

**LLM Prompt**:
```
Setting up Firebase for Mezr.

PRIVACY REQUIREMENTS:
PR-020: No extra user data in Firestore
PR-019: Firestore security rules restrict to auth user
PR-039: Firebase Analytics MUST be disabled
PR-043: Only Firestore (not Realtime Database)

IMPLEMENTATION:
1. Initialize Firebase (auth + firestore only)
2. Do NOT initialize Analytics
3. Firestore schema: /users/{uid}/sessions only
4. Security rules: user can only read/write their own data
5. No displayName, photoURL, or extra fields

VALIDATION:
☐ Analytics library not imported
☐ Firestore schema audit: only email + sessions
☐ Security rules reviewed and deployed
☐ Test: cannot access other users' data
☐ Test: must be authenticated

BUILD: Firebase setup with requirements above
```

### Example 3: Adding New Feature Request

**Request**: "Add push notifications for daily reminders"

**First Check Requirements**:
1. Does privacy requirement exist?
   - No specific requirement for notifications
2. Would it require new data?
   - Need: time user wants reminder
   - Need: notification history?
3. Is data minimized?
   - Store: reminder time preference (OK)
   - Don't store: notification sent timestamps (not needed)
4. Is it user-controlled?
   - Must be: opt-in (settings toggle)
   - Must be: user can turn off anytime
5. Is it encrypted?
   - Local: preference on-device (yes)

**Then Ask LLM**:
```
REQUEST: Add daily reminder notifications

FIRST, check privacy:
- ✅ Necessary data: reminder time preference
- ✅ No tracking of notification history
- ✅ Must be opt-in (toggle in settings)
- ✅ User can turn off anytime
- ✅ No analytics on reminder actions

NEW REQUIREMENT CREATED:
PR-XX: Reminders opt-in
- Default: OFF
- User enables in Settings
- Only stores: preferred time
- No tracking of notification events
- No behavior analysis

THEN BUILD: Implement reminders with above constraints
```

---

## Sheet Maintenance

### Weekly Review
- [ ] Check "In_Progress" items (any blocked?)
- [ ] Update Status as features complete
- [ ] Add new requirements if new features planned

### Before Launch
- [ ] All HIGH priority requirements: DONE
- [ ] All MEDIUM priority requirements: DONE (if possible)
- [ ] All validation checklists: PASSED
- [ ] No HIGH priority items in Backlog

### Post-Launch
- [ ] Add anything discovered during testing
- [ ] Quarterly: audit unused data fields (PR-027)
- [ ] Monitor: any privacy issues?

---

## Key Rules for Using This Sheet

### ✅ DO:

1. **Reference requirements in every PR/commit message**
   - Example: "Implement data export (PR-010)"

2. **Validate against checklist before marking Done**
   - Don't skip validation

3. **Update Status column**
   - Backlog → In_Progress → Done

4. **Ask for clarification if requirements unclear**
   - Don't guess, ask

5. **Flag if requirement conflicts with feature**
   - Privacy wins (don't build feature)

6. **Document new privacy decisions**
   - Add to sheet if new data/feature added

---

### ❌ DON'T:

1. **Don't skip HIGH priority requirements**
   - These are deal-breakers

2. **Don't assume feature is private without checking**
   - Always check requirements first

3. **Don't add data fields without requirement**
   - Every field needs a PR

4. **Don't merge code without validation**
   - Checklist must pass

5. **Don't change privacy without user consent**
   - Update requirements first, then communicate

6. **Don't store data "just in case we need it"**
   - Data minimization principle

---

## For When You Talk to LLM Agent

### Template Prompt (Copy & Paste)

```markdown
# MEZR Development Task

## Privacy Context
Mezr is privacy-first. These requirements are non-negotiable:
- Only collect what's essential
- User owns their data
- Data stays on device by default
- Cloud is opt-in and encrypted
- No tracking, no ads, no data selling

## Relevant Requirements
[Copy 1-3 relevant requirements from sheet]

## Task Description
[What you want to build]

## Implementation Requirements
[Copy implementation details from sheet]

## Validation Checklist
[Copy validation checklist from sheet]

## Before You Start
1. Confirm you understand each requirement
2. Ask clarifying questions if needed
3. Never skip validation

## After You Finish
1. Check off validation items
2. Share code review points
3. Mark as Done in sheet

IMPORTANT: Privacy is not optional. If this task conflicts with privacy,
tell me BEFORE building it. We'll find a different solution.
```

---

## Red Flags: Stop If You See These

🚨 **STOP immediately if LLM suggests:**

- [ ] "Let's add analytics to understand user behavior"
  → PR-039: Analytics disabled, PR-040: No tracking

- [ ] "Let's auto-sync to cloud for convenience"
  → PR-007: Cloud must be opt-in

- [ ] "Let's collect location for nearby users feature"
  → PR-004: Never store location

- [ ] "Let's add device ID to track sessions across installs"
  → PR-003: Never store device IDs

- [ ] "Let's store user profile photos and display names"
  → PR-001: Email only

- [ ] "Let's add Facebook login"
  → Check: What data does Facebook SDK collect? (Likely too much)

- [ ] "Let's collect heart rate data to improve sessions"
  → PR-002: Only breathing times, no health metadata

- [ ] "Let's send data to third-party analytics service"
  → PR-044: No third-party tracking

**If you see red flags:**
1. Say "No"
2. Reference the requirement
3. Find privacy-compliant alternative
4. Or create new requirement (with privacy impact assessment)

---

## Monthly Privacy Audit

First Monday of each month:

```
MONTHLY PRIVACY AUDIT

Date: [date]
Reviewed by: [your name]

1. DATA AUDIT
   [ ] List all fields in Firebase
   [ ] List all fields in AsyncStorage
   [ ] Any new fields since last month?
   [ ] Any unused fields to remove?

2. CODE AUDIT
   [ ] Search codebase for: 'track', 'analytics', 'event'
   [ ] Check: Firebase Analytics still disabled?
   [ ] Check: Any new SDK dependencies (check for tracking)?
   [ ] Check: Any new permissions requested?

3. REQUIREMENTS AUDIT
   [ ] Any new requirements added this month?
   [ ] Are all HIGH priority done?
   [ ] Any requirements at risk?
   [ ] Any new threats discovered?

4. ISSUES FOUND
   - [Issue 1]: [how to fix]
   - [Issue 2]: [how to fix]
   
5. NEXT MONTH PRIORITIES
   [ ] [Action 1]
   [ ] [Action 2]

RESULT: ✅ Compliant / ⚠️ Issues Found
```

---

## Sharing with Team

### For Developers
- Share: Full sheet with Implementation_Details + Validation_Checklist columns
- Say: "Reference these before writing code"
- Responsibility: Don't skip validation

### For Designers
- Share: Requirements + Transparency columns
- Say: "These features must be in UI"
- Responsibility: Privacy dashboard, export button, delete button visible

### For Product Managers
- Share: Requirements + Priority + Status columns
- Say: "These are non-negotiable constraints"
- Responsibility: Don't add features that violate requirements

### For Legal/Compliance
- Share: Entire sheet + policy/legal requirements
- Say: "These are our privacy commitments"
- Responsibility: Ensure ToS/Policy match requirements

---

## Escalation Process

**If requirement conflicts with business goal:**

1. **Don't build conflicting feature**
2. **Escalate to Ashok** with:
   - What feature requested?
   - Which privacy requirement conflicts?
   - What data would need to be collected?
   - Why is data minimization important? (remind self)
3. **Find privacy-compliant alternative**
   - Can feature work with less data?
   - Can feature be opt-in instead?
   - Can we delay feature until encryption in place?
4. **Update requirement if decision changes**
   - Never silently violate requirements
   - Always update sheet + document decision

---

## Summary

This sheet is your **north star** for privacy.

**Every task:**
1. Check if requirement exists
2. Follow implementation details
3. Validate against checklist
4. Update status

**Never:**
- Skip high priority items
- Add features without checking
- Assume something is private
- Store unnecessary data

**Remember:**
Privacy is not a feature added later.
It's a decision made every day.

---

**Questions?** Ask before building.  
**Confused?** Clarify with Ashok.  
**Found issue?** Update the sheet + fix.  

🔒 Mezr: Privacy by Design
