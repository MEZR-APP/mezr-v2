# Google Sheets Setup Guide - MEZR Privacy Requirements

## Quick Setup (10 minutes)

### Step 1: Create New Google Sheet
1. Go to https://sheets.google.com
2. Click "+" (New)
3. Name it: "MEZR Privacy Requirements - Master"
4. Share with: anyone building the app (email or link)

### Step 2: Add Headers (Row 1)
```
A: Requirement_ID
B: Category
C: Requirement
D: Priority
E: Implementation_Details
F: Validation_Checklist
G: Status
H: Dependencies
I: Notes (optional)
J: Last_Updated (optional)
```

### Step 3: Import Data
Option 1 (Easiest):
- Copy all rows from MEZR_PRIVACY_REQUIREMENTS.csv
- Paste into Sheet starting at A2
- Done!

Option 2 (Via Import):
- Menu: File > Import Sheets
- Upload CSV file
- Select: Replace current sheet

### Step 4: Format Columns

**Column Width:**
- A: 100px (ID)
- B: 120px (Category)
- C: 300px (Requirement) ← text wrapping ON
- D: 80px (Priority)
- E: 200px (Details) ← text wrapping ON
- F: 250px (Checklist) ← text wrapping ON
- G: 100px (Status)
- H: 120px (Dependencies)

**Text Wrapping:**
- Select columns C, E, F
- Format > Text wrapping > Wrap

**Freeze Rows:**
- Select row 2
- View > Freeze > 1 row
- (Keeps headers visible while scrolling)

---

## Step 5: Add Conditional Formatting

### Rule 1: Highlight Priority
```
Range: D:D (entire Priority column)
Condition: Text contains "HIGH"
Format: Background color RED (#FF6B6B)
Font: White

Repeat for:
MEDIUM → YELLOW (#FFD93D)
LOW → LIGHT GRAY (#E8E8E8)
```

**How to do it:**
1. Select column D
2. Format > Conditional formatting
3. Format rules > Custom formula is
4. Enter: `=$D1="HIGH"`
5. Set color: RED
6. Repeat for MEDIUM and LOW

### Rule 2: Highlight Status
```
Range: G:G (entire Status column)
Condition: Text contains "Done"
Format: Background GREEN (#95E1D3), Font: DARK, Strikethrough

Condition: Text contains "In_Progress"
Format: Background BLUE (#A8DADC), Font: DARK

Condition: Text contains "Backlog"
Format: Background WHITE (no special formatting)
```

### Rule 3: Red Flag Dependencies
```
Range: H:H
Condition: Text is not empty AND another requirement not "Done"
Format: Background ORANGE (#FFB703) [warning: dependency not met]
```

---

## Step 6: Add Filters

**Enable filters:**
1. Select row 1 (headers)
2. Data > Create a filter
3. Click filter icons to use

**Filter views to create:**
1. **View: "HIGH Priority Items"**
   - Filter: Priority = HIGH
   - Filter: Status ≠ Done
   - Use: Before starting work each day

2. **View: "My Current Tasks"**
   - Filter: Status = In_Progress
   - Use: Track what you're working on

3. **View: "Ready to Implement"**
   - Filter: Status = Backlog
   - Filter: Dependencies = (empty or all met)
   - Use: Plan next sprint

4. **View: "Done & Completed"**
   - Filter: Status = Done
   - Use: Review what's been completed

---

## Step 7: Add Summary Dashboard (Optional)

Create a second sheet tab: "Dashboard"

**In Dashboard sheet, add:**

```
MEZR PRIVACY REQUIREMENTS - STATUS DASHBOARD

Total Requirements: [COUNTIF formula]
HIGH Priority: [COUNTIF where Priority="HIGH"]
MEDIUM Priority: [COUNTIF where Priority="MEDIUM"]
LOW Priority: [COUNTIF where Priority="LOW"]

Status Breakdown:
- Done: [COUNTIF where Status="Done"]
- In Progress: [COUNTIF where Status="In_Progress"]
- Backlog: [COUNTIF where Status="Backlog"]

Completion Rate: [Done / Total %]

Last 5 Completed:
[Table showing 5 most recent "Done" items]

Blockers (Dependencies Not Met):
[Table showing items blocked by incomplete dependencies]

HIGH Priority Items Not Yet Done:
[Table showing HIGH items still in Backlog/In_Progress]
```

**Formulas to use:**

```
Total Requirements:
=COUNTA(Requirements!A2:A100)

Done Count:
=COUNTIF(Requirements!G2:G100,"Done")

In Progress Count:
=COUNTIF(Requirements!G2:G100,"In_Progress")

Backlog Count:
=COUNTIF(Requirements!G2:G100,"Backlog")

Completion %:
=DONE_COUNT / TOTAL_COUNT * 100

HIGH Priority Not Done:
=COUNTIFS(Requirements!D:D,"HIGH",Requirements!G:G,"<>Done")
```

---

## Using the Sheet Effectively

### Daily Workflow

**Every morning:**
1. Open Google Sheet
2. Apply filter: "HIGH Priority Items"
3. Check: Any due soon?
4. Check: Any In_Progress blocked?
5. Pick next task from Backlog
6. Start work

**During development:**
1. When starting task: Set Status → In_Progress
2. Reference: Implementation_Details column
3. Build feature
4. Test against: Validation_Checklist
5. When done: Set Status → Done

**Before PR/Commit:**
1. Check: All validation items ✓?
2. Check: Any dependencies incomplete?
3. Update: Last_Updated date
4. Add note in Notes column if relevant
5. Mark: Done (if truly complete)

### Weekly Review

**Every Friday (15 minutes):**

1. Open Dashboard
2. Review: Completion Rate
3. Review: Any blockers?
4. Review: HIGH items still pending?
5. Plan: What's next week priority?
6. Update: Notes on blockers/issues

### Before Launch Checklist

**All HIGH requirements must be Done:**

```
Go to Google Sheet
Filter: Priority = HIGH AND Status ≠ Done

If any rows appear:
❌ CANNOT LAUNCH
✅ Fix them first

Then:
- All HIGH items DONE
- All MEDIUM items DONE (if possible)
- All validation checklists PASSED
- Notes captured explaining anything delayed

THEN: Green light to launch!
```

---

## Sheet Sharing & Permissions

### For Different Roles

**Ashok (Founder):**
- Edit access to everything
- Responsibility: Make final decisions on conflicts

**Developers:**
- Edit access to: Status, Notes columns
- View access to: Everything else
- Cannot change: Requirements, Implementation, Validation
- (Prevents accidental modification)

**Designers:**
- View access only
- Focus on: UI/UX requirements (PR-012, PR-034, etc.)

**Team Lead (if any):**
- Edit access to: Status, Notes
- View access to: Everything
- Responsibility: Track progress, unblock

**Share with:**
1. Right-click sheet > Share
2. Add emails / Share link
3. Set permissions:
   - Ashok: Editor
   - Developers: Commenter (can suggest changes, you approve)
   - Others: Viewer

---

## Tracking Progress

### Metrics to Watch

**Completion Rate:**
- Target: 100% HIGH priority done before MVP launch
- Target: 80% MEDIUM priority before launch
- Target: 20-30% LOW priority acceptable for MVP

**Days to Complete:**
- Track: Start date → Done date for each requirement
- Learning: Which types take longest?
- Adjust: Timeline for future features

**Blockers:**
- Track: How long are items blocked?
- If > 3 days: Escalate to Ashok

**High Priority Coverage:**
- HIGH items in Backlog? Bad sign.
- Should be: HIGH items all started + completed before medium/low

---

## Example: Tracking One Requirement

### Requirement: PR-010 (Data Export Feature)

**Week 1: Backlog**
```
Requirement_ID: PR-010
Status: Backlog
Notes: Waiting for Privacy Dashboard design (PR-012)
```

**Week 2: In_Progress**
```
Requirement_ID: PR-010
Status: In_Progress
Notes: Started data export functionality. Testing format.
Last_Updated: 2024-01-22
```

**Week 2 (continued): In_Progress**
```
Status: In_Progress
Notes: Export working on Android. Testing iOS. JSON format good.
Validation: ✓ Export button ✓ JSON format | ✗ iOS test | ✗ No PII check
```

**Week 3: Done**
```
Status: Done
Notes: Tested on Android & iOS. JSON human-readable. No PII. Ready.
Validation: ✓ All items checked
Last_Updated: 2024-01-28
```

---

## Red Flags: What to Watch

### Status Red Flags

❌ **Too many "In_Progress" items**
- More than 3 in-progress = you're scattered
- Finish one before starting another
- Check: Are they blocked?

❌ **HIGH priority stuck in Backlog for 2+ weeks**
- These should be first
- Check: Any blockers?
- If not: Why not started?

❌ **Dependencies show something's blocked**
- Example: PR-012 (Dashboard) blocks PR-010 (Export)
- If PR-012 is Backlog, PR-010 should wait
- Conditional formatting highlights this

---

## Automation Ideas (Advanced)

### Auto-Update Last_Updated
```
When Status cell changes, auto-update date column
→ Sheets doesn't do this natively, but you can manually update
→ Or use Zapier to auto-fill (advanced)
```

### Email Reminders
```
If no activity on HIGH items for 3 days:
→ Send reminder (use Google Forms + email)
→ "What's blocking this?"
```

### Slack Integration (Advanced)
```
Daily Slack message to dev team:
- "3 items ready to work on today"
- "2 items completed yesterday"
- "1 item blocked (dependency)"

Use: Zapier or custom script
```

---

## Troubleshooting

### Issue: Too Many Columns, Can't Read

**Solution:**
1. Hide unnecessary columns (right-click > hide)
2. Keep visible: ID, Category, Requirement, Priority, Status
3. Expand hidden columns when needed

### Issue: Different Team Members Can't See Updates

**Solution:**
1. Check: Everyone has right permissions
2. Check: Sheet not "Viewer" only (need Commenter+)
3. Refresh: Google Sheets caches, reload page if not updating
4. Share: Use "Sharing settings" link, not just invite

### Issue: Formatting Got Messed Up

**Solution:**
1. Undo (Ctrl+Z / Cmd+Z)
2. Or: Create new sheet from scratch, re-import CSV
3. Save: Keep backup of original CSV file

### Issue: Can't Find a Requirement

**Solution:**
1. Use Find (Ctrl+F / Cmd+F)
2. Search: Requirement_ID or keyword
3. Use Filter: Filter by Category, then scroll

---

## Best Practices

### ✅ DO

- ✅ Update Status regularly (daily if in progress)
- ✅ Use Notes column to explain status
- ✅ Check dependencies before starting work
- ✅ Keep validation checklist visible while coding
- ✅ Mark Done only when ALL validation items pass
- ✅ Reference PR number in code commits
- ✅ Review sheet weekly
- ✅ Archive completed items to "Done" tab after quarter

### ❌ DON'T

- ❌ Skip validation before marking Done
- ❌ Ignore HIGH priority items
- ❌ Leave Status blank (always update)
- ❌ Mark Done without finishing validation
- ❌ Delete rows (archive instead)
- ❌ Change requirements mid-development (update sheet first)
- ❌ Leave items In_Progress indefinitely (finish or move to Backlog)

---

## Integration with Development Process

### In Your Git Commits

```
Example commit message:

"Implement data export feature (PR-010)"

[Detailed commit message explaining what was done]

Validation passed:
- ✓ Export button in Privacy section
- ✓ JSON contains all user data
- ✓ Human-readable format
- ✓ Tested on Android and iOS
- ✓ No PII exposed

Related: Privacy Requirements sheet (PR-010)
```

### In Pull Request Description

```
Closes requirement: PR-010 (Data Export Feature)

## What's in this PR
- Added export button to Privacy Dashboard
- JSON serialization of sessions
- File download on both platforms

## Validation
[Paste validation checklist from sheet]
☑ All items passed

## Related Requirements
- PR-010: Data export
- PR-012: Privacy dashboard (dependency)
```

### In Code Comments

```typescript
// PURPOSE: Allow users to download their data (PR-010)
// NOT FOR: Selling data, sharing with third parties
async function exportUserData(): Promise<string> {
  // Implementation
}

// REQUIREMENT: PR-039 - Firebase Analytics must be disabled
// NEVER: Initialize Analytics library or send events
// REASON: Privacy-first design
```

---

## Monthly Maintenance

**First day of month:**

1. ☐ Review Dashboard metrics
2. ☐ Update any stale Status values
3. ☐ Check: Any HIGH items > 2 weeks in progress?
4. ☐ Archive completed items to "Done" sheet
5. ☐ Plan: What's priority for this month?
6. ☐ Send: Summary email to team

**Sample monthly summary:**

```
MEZR PRIVACY REQUIREMENTS - JANUARY SUMMARY

Completed: 8 items
In Progress: 3 items
Backlog: 54 items

Completion Rate: 13%

Blockers:
- PR-013 (Policy) waiting for legal review

Next Month Focus:
- Complete all HIGH priority items
- Finish Privacy Dashboard (PR-012)
- Complete data export/delete (PR-010, PR-011)

On Track for MVP Launch: YES ✅
```

---

## Final Checklist: Before Using Sheet

- [ ] Sheet created and shared
- [ ] CSV imported (all 65 requirements)
- [ ] Headers frozen (View > Freeze)
- [ ] Conditional formatting applied (Priority, Status)
- [ ] Filter enabled on row 1
- [ ] Filter views created (HIGH Priority, My Tasks, etc.)
- [ ] Dashboard tab created (optional but recommended)
- [ ] Permissions set (who can edit what?)
- [ ] Shared with team (link sent)
- [ ] This guide shared with team
- [ ] Team trained on how to use it
- [ ] First task selected and marked In_Progress

---

**You're ready to go! 🚀**

Use this sheet every day.
Reference it before coding.
Update it as you progress.
Celebrate when HIGH items are Done.

🔒 Privacy by Design = Mezr's competitive advantage
