# MASTER ACTION PLAN
## Everything You Need to Know (One Page)

---

# 🎯 YOUR SITUATION

```
Current:
├─ v1.0.0 submitted to Play Store (waiting approval, 1-7 days)
├─ Need to code export/import
├─ Zero Git knowledge
└─ Want to use Claude/Cursor to handle everything

Goal:
├─ Code export/import while waiting
├─ Release v1.0.1 immediately after v1.0.0 approved
├─ NO learning Git (copy-paste only)
└─ LLMs do the work, you monitor
```

---

# 📚 DOCUMENTS YOU HAVE

```
1. ULTIMATE_SIMPLE_COPY_PASTE_ONLY.md
   └─ START HERE - Just 3 prompts to copy-paste
   └─ Everything else is extra

2. QUICK_START_FREE_APP.md
   └─ Your version strategy (free app, no monetization)
   └─ What v1.0.1 includes

3. COPY_PASTE_GIT_WORKFLOW.md
   └─ Detailed workflow (if you want to understand what's happening)
   └─ Read if confused

4. STEP_BY_STEP_VISUAL_GUIDE.md
   └─ What terminal looks like (visual reference)
   └─ Read if you want to see examples
```

---

# ⏱️ TIMELINE

```
TODAY (Feb 28):
└─ Copy Prompt 1 into Claude
└─ Get setup commands
└─ Copy-paste into terminal
└─ Start coding in Cursor

Days 1-14 (Mar 1-14):
├─ Code export/import
├─ Use Prompt 2 daily to save work
├─ Continue until feature done
└─ Monitor Play Store for v1.0.0 approval

When Approved (Mar 1-3):
├─ Use Prompt 3 in Claude
├─ Get all release commands
├─ Copy-paste into terminal
├─ Edit version numbers in Cursor
├─ Submit v1.0.1
└─ Done ✅

When v1.0.1 Approved (Mar 5-7):
└─ Users have export/import ✅
```

---

# 🚀 WHAT YOU DO RIGHT NOW (5 Minutes)

## Step 1: Prepare Information

```
Get 2 things:
1. GitHub repo URL (from github.com)
   Example: https://github.com/yourname/mezr-app

2. Project folder path (where code is stored)
   Examples:
   - ~/Documents/mezr-app
   - ~/Projects/MEZR
   - C:\Users\YourName\Documents\mezr-app
   
   If you don't know: Don't worry, Claude will help
```

## Step 2: Copy This Prompt

```
Open this Claude chat
Copy everything below (this is Prompt 1):

---

I need to start coding export/import feature for MEZR app.
I have zero Git knowledge.
My GitHub repo: [paste your repo URL]
I'm on: [Mac/Windows/Linux]
My project folder location: [paste path, or say "I don't know"]

Please give me step-by-step copy-paste terminal commands to:
1. Navigate to my project
2. Verify Git is working
3. Create a feature branch called: feature/export-import-complete
4. Save my first code file to GitHub

Just give me the commands in order. I'll copy-paste each one.

---
```

## Step 3: Paste Into Claude

```
Paste the prompt (from Step 2) into THIS chat window
Press Send
Claude responds with setup commands
```

## Step 4: Execute Commands

```
Open Terminal:
  Mac: Command + Space → type "Terminal"
  Windows: Win key → type "Terminal"
  
Copy-paste Claude's commands one by one:
  1. Paste command
  2. Press Enter
  3. Wait for response
  4. Paste next command
  5. Repeat
```

## Step 5: Start Coding

```
Open Cursor IDE
Create files in: src/services/
Start coding export service
Use Cursor's AI to help
```

**That's it! You're set up.** ✅

---

# 💻 DAILY WORKFLOW (Days 1-14)

## Each Day:

```
1. Open Cursor
2. Code one file (exportService.ts, importService.ts, etc.)
3. Save in Cursor (Cmd+S or Ctrl+S)
4. Ask Claude: "I finished [filename]. How do I save it to GitHub?"
5. Claude gives commands
6. Copy-paste commands in Terminal
7. Done for that file

Repeat for next file next day.
```

## Use Prompt 2 Daily:

```
Copy this prompt into Claude (change filename each time):

---

I just finished [filename] in my MEZR export/import feature.
I'm on feature/export-import-complete branch.
I saved the file in Cursor.

Give me the copy-paste terminal commands to save it to GitHub.

---

Claude gives you:
git add [file]
git commit -m "Feature: [what you did]"
git push origin feature/export-import-complete

You copy-paste each one. Done.
```

---

# 🎉 WHEN v1.0.0 APPROVED (Mar 1-3)

## Use Prompt 3 (One Time):

```
Copy this prompt into Claude:

---

v1.0.0 just got approved on Play Store!

I need to release v1.0.1 with export/import feature.
I'm on feature/export-import-complete branch with all code done.

Please give me ALL the copy-paste commands in exact order to:
1. Merge my feature branch to develop
2. Update app.json (version 1.0.1, buildNumber 4, versionCode 4)
3. Update CHANGELOG.md with v1.0.1 release notes
4. Create a release branch
5. Commit version changes
6. Merge to main (production)
7. Tag the release as v1.0.1
8. Build with EAS
9. Submit to Play Store

Give me EVERY command in order. I'll copy-paste each one.

---

Claude responds with ~20 commands.
You copy-paste each one.
Done!
```

---

# ❓ IF SOMETHING GOES WRONG

## Use Error Prompt:

```
Copy this into Claude (paste your actual error):

---

I got this error:
[paste the error from terminal]

When I ran this command:
[paste the command]

What do I do?

---

Claude tells you the fix.
You copy-paste fix commands.
Done.
```

---

# 📊 FILES YOU'LL CREATE

```
While coding, you'll create:

src/services/exportService.ts
├─ Exports sessions to JSON

src/services/importService.ts
├─ Imports from JSON file

src/services/fileRecoveryService.ts
├─ Detects backups on device

src/components/privacy/ExportModal.tsx
├─ Export UI

src/components/privacy/ImportModal.tsx
├─ Import UI

Update:
src/app/(tabs)/profile.tsx
└─ Add export/import buttons

That's it. 5-6 new files total.
```

---

# ✅ VERSION NUMBERS (What Changes)

## Current (v1.0.0)

```
app.json:
├─ "version": "1.0.0"
├─ "buildNumber": "3"
└─ "versionCode": 3
```

## Next (v1.0.1)

```
app.json (change these):
├─ "version": "1.0.1"  (change .0 to .1)
├─ "buildNumber": "4"  (3 → 4)
└─ "versionCode": 4    (3 → 4)

CHANGELOG.md (add at top):
## [1.0.1] - 2026-03-XX
### Added
- Export sessions to JSON
- Import from backup file
- Share to user's clouds
- Auto-detect backups
```

That's all you change. Claude will tell you exactly what.

---

# 🎯 CRITICAL POINTS

```
✅ You don't learn Git
✅ You don't memorize commands
✅ You don't understand branching

❌ You just copy-paste
❌ You just follow instructions
❌ You just monitor progress

✅ Claude thinks
✅ Cursor codes
✅ You execute

Simple.
```

---

# 📞 QUICK REFERENCE

## 3 Prompts You'll Use:

### Prompt 1 (Setup - Now)
```
"I need to start coding export/import.
I have zero Git knowledge.
My repo: [URL]
My folder: [path]
Give me setup commands."
```

### Prompt 2 (Daily - Many times)
```
"I finished [filename].
Give me copy-paste save commands."
```

### Prompt 3 (Release - Once)
```
"v1.0.0 approved.
Give me ALL release/submit commands."
```

### Bonus (If Error)
```
"I got error: [error]
When running: [command]
What do I do?"
```

---

# ✅ FINAL CHECKLIST

```
Right Now:
☐ Read: ULTIMATE_SIMPLE_COPY_PASTE_ONLY.md (2 min)
☐ Read: QUICK_START_FREE_APP.md (5 min)
☐ Get GitHub URL
☐ Get project path
☐ Copy Prompt 1
☐ Paste into Claude
☐ Get commands from Claude
☐ Copy-paste into terminal
☐ Open Cursor, start coding ✅

Days 1-14:
☐ Code daily
☐ Use Prompt 2 daily to save ✅

When Approved:
☐ Use Prompt 3 (one time) ✅
☐ Copy-paste all commands ✅
☐ Submit v1.0.1 ✅
```

---

# 🚀 YOU'RE READY

You have:
- ✅ Clear version strategy (free app, device export/import)
- ✅ Copy-paste workflow (no Git learning)
- ✅ 3 main prompts (that's all you need)
- ✅ Timeline (clear milestones)
- ✅ Support docs (if you need more detail)

**Everything else is just reference if you want to understand more.**

---

# 🎬 START NOW

1. Read: ULTIMATE_SIMPLE_COPY_PASTE_ONLY.md (yes, again)
2. Get your GitHub URL
3. Get your project path
4. Copy Prompt 1 from that document
5. Paste into THIS Claude chat
6. Execute commands
7. Code in Cursor
8. Repeat Prompt 2 daily
9. When v1.0.0 approved, use Prompt 3
10. Done! ✅

**That's literally everything.**

No Git learning needed.
No memorization needed.
No complexity needed.

Just copy. Paste. Monitor. Done.

**Let's build this.** 🚀
