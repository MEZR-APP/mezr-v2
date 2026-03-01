# STEP-BY-STEP VISUAL GUIDE
## What You'll Actually See + What to Do Next

**Format:** Terminal output shown in code blocks. Your actions shown in arrows.

---

# 🚀 PART 1: INITIAL SETUP (Right Now)

## Step 1: Open Terminal

```
Mac: Command + Space → Type "Terminal" → Press Enter
Windows: Win Key → Type "Terminal" → Press Enter
Linux: Ctrl + Alt + T

You'll see something like:
┌────────────────────────────────────┐
│ ~ $ █                              │  ← Cursor blinking here
└────────────────────────────────────┘
```

**Action:** Just opened terminal ✅

---

## Step 2: Go to Your Project Folder

**In Claude, ask:**
```
"I don't know where my MEZR project is stored.
Tell me the exact command to navigate there."
```

**Claude will say something like:**
```
"If your project is in Documents:
Copy-paste: cd ~/Documents/mezr-app

If you don't know, run:
open ~/Documents
And look for the mezr-app folder"
```

**You copy-paste the command:**

```
Terminal shows:
~ $ cd ~/Documents/mezr-app
~ $

(Cursor is ready for next command)
```

**Action:** You navigated to project ✅

---

## Step 3: Verify Git Works

**You copy-paste:**
```
git --version
```

**Terminal shows:**
```
~ $ git --version
git version 2.43.0
~ $
```

**Good sign:** Git is installed ✅

---

## Step 4: Create Feature Branch

**You copy-paste (one by one):**

```
Command 1:
git checkout develop

Terminal shows:
~ $ git checkout develop
Switched to branch 'develop'
Your branch is up to date with 'origin/develop'.
~ $

✅ This is good
```

**Then:**
```
Command 2:
git pull origin develop

Terminal shows:
~ $ git pull origin develop
Already up to date.
~ $

✅ You have latest code
```

**Then:**
```
Command 3:
git checkout -b feature/export-import-complete

Terminal shows:
~ $ git checkout -b feature/export-import-complete
Switched to a new branch 'feature/export-import-complete'
~ $

✅ Branch created
```

**Then:**
```
Command 4:
git push origin feature/export-import-complete

Terminal shows:
~ $ git push origin feature/export-import-complete
Enumerating objects: 1, done.
...
 * [new branch]      feature/export-import-complete -> feature/export-import-complete
~ $

✅ Branch saved to GitHub
```

**Action:** Feature branch ready ✅

---

# 💻 PART 2: CODING (Days 1-14)

## Step 5: Open Cursor

```
Open Cursor IDE
Click: File > Open Folder
Select: Your mezr-app folder
Click: Open

You see:
┌─────────────────────────────────────┐
│  MEZR-APP (folder)                  │
│  ├─ src/                            │
│  │  ├─ services/                    │
│  │  ├─ components/                  │
│  │  └─ ...                          │
│  ├─ app.json                        │
│  └─ ...                             │
└─────────────────────────────────────┘
```

**Action:** Cursor open, ready to code ✅

---

## Step 6: Create File in Cursor

**In Cursor:**
```
Right-click: src/services/
Select: New File
Type: exportService.ts
Press: Enter

You see new file in editor:
┌─────────────────────────────────┐
│ exportService.ts                │
│                                 │
│ (empty file, cursor blinking)   │
│                                 │
└─────────────────────────────────┘
```

**Action:** File created ✅

---

## Step 7: Code in Cursor (Daily)

**You write code in Cursor. Use Cursor's AI to help:**

```
In Cursor, select some code → Right-click → "Ask Claude"
Type: "Add error handling to this function"
Cursor AI rewrites it

Keep coding, use AI help whenever needed
```

**After coding each file:**
```
Save file: Cmd+S (Mac) or Ctrl+S (Windows)

Status bar shows:
exportService.ts ← No dot = saved
                   (Dot means unsaved)
```

**Action:** File coded and saved ✅

---

## Step 8: Save to GitHub (After Each File)

**Go back to Terminal**

**You copy-paste:**
```
git add src/services/exportService.ts
```

**Terminal shows:**
```
~ $ git add src/services/exportService.ts
~ $

(No message = success ✅)
```

**Then:**
```
git commit -m "Feature: Add export service"
```

**Terminal shows:**
```
~ $ git commit -m "Feature: Add export service"
[feature/export-import-complete abc1234] Feature: Add export service
 1 file changed, 50 insertions(+)
 create mode 100644 src/services/exportService.ts
~ $

✅ Committed
```

**Then:**
```
git push origin feature/export-import-complete
```

**Terminal shows:**
```
~ $ git push origin feature/export-import-complete
Enumerating objects: 2, done.
...
abc1234..def5678  feature/export-import-complete -> feature/export-import-complete
~ $

✅ Pushed to GitHub
```

**Action:** Changes saved ✅

---

## Step 9: Repeat Steps 7-8

**For next file (importService.ts):**
```
Cursor: Create file, code, save
Terminal: git add [file], git commit, git push

Repeat this cycle for each new file.
No need to create new branch (you're still on same branch).
```

**After each commit:**
```
Go to GitHub.com
Click: Your repo
Click: feature/export-import-complete branch
You should see your latest commits listed
```

**Action:** Feature developing ✅

---

# 📅 PART 3: RELEASE v1.0.1 (When v1.0.0 Approved)

## Step 10: Merge Feature Branch

**You tell Claude:**
```
"v1.0.0 approved! 
I finished export/import on feature/export-import-complete branch.
Give me the exact copy-paste commands to merge it and release v1.0.1"
```

**Claude gives you something like:**
```
"Copy-paste these commands one by one:

1. git checkout develop
2. git pull origin develop
3. git merge --no-ff feature/export-import-complete
4. git push origin develop
"
```

**You copy-paste each one in Terminal:**

```
Command 1:
git checkout develop

Terminal shows:
~ $ git checkout develop
Switched to branch 'develop'
~ $

✅
```

```
Command 2:
git pull origin develop

Terminal shows:
~ $ git pull origin develop
Already up to date.
~ $

✅
```

```
Command 3:
git merge --no-ff feature/export-import-complete

Terminal shows:
~ $ git merge --no-ff feature/export-import-complete
Merge made by the 'recursive' strategy.
 src/services/exportService.ts | 50 ++++++++++++++++++++++++++
 src/services/importService.ts | 45 +++++++++++++++++++++++++
 ...
 3 files changed, 120 insertions(+)
 create mode 100644 src/services/fileRecoveryService.ts
~ $

✅ Merged!
```

```
Command 4:
git push origin develop

Terminal shows:
~ $ git push origin develop
Enumerating objects: 15, done.
...
abc1234..ghi9012  develop -> develop
~ $

✅ Pushed to GitHub
```

**Action:** Feature merged to develop ✅

---

## Step 11: Update Files (Version Numbers)

**Claude tells you what to change:**

**In Cursor:**
```
Open: app.json

Find:
"version": "1.0.0"

Change to:
"version": "1.0.1"

Find:
"buildNumber": "3"

Change to:
"buildNumber": "4"

Find:
"versionCode": 3

Change to:
"versionCode": 4

Save: Cmd+S
```

**Open: CHANGELOG.md**

**Add at the top:**
```
## [1.0.1] - 2026-03-05
### Added
- Export sessions to JSON
- Import from backup file
- Share to user's clouds
- Auto-detect backups

### Changed
- Privacy controls improved

---

## [1.0.0] - 2026-02-28
[previous content stays]
```

**Save: Cmd+S**

**Action:** Files updated ✅

---

## Step 12: Create Release Branch

**Claude tells you:**
```
"Now create a release branch. Copy-paste:

git checkout -b release/1.0.1
git push origin release/1.0.1
"
```

**You copy-paste:**

```
git checkout -b release/1.0.1

Terminal shows:
~ $ git checkout -b release/1.0.1
Switched to a new branch 'release/1.0.1'
~ $

✅
```

```
git push origin release/1.0.1

Terminal shows:
~ $ git push origin release/1.0.1
...
 * [new branch]      release/1.0.1 -> release/1.0.1
~ $

✅
```

**Action:** Release branch created ✅

---

## Step 13: Commit Version Changes

**You copy-paste:**

```
git add app.json CHANGELOG.md
```

**Terminal shows:**
```
~ $ git add app.json CHANGELOG.md
~ $

✅
```

```
git commit -m "Release: v1.0.1 with export/import"
```

**Terminal shows:**
```
~ $ git commit -m "Release: v1.0.1 with export/import"
[release/1.0.1 xyz9876] Release: v1.0.1 with export/import
 2 files changed, 15 insertions(+)
 modify app.json
 modify CHANGELOG.md
~ $

✅
```

```
git push origin release/1.0.1
```

**Terminal shows:**
```
~ $ git push origin release/1.0.1
...
xyz9876..abc1234  release/1.0.1 -> release/1.0.1
~ $

✅
```

**Action:** Release committed ✅

---

## Step 14: Merge to Main (Production)

**Claude tells you:**
```
"Now merge to main (production). Copy-paste:

git checkout main
git pull origin main
git merge --no-ff release/1.0.1
git tag -a v1.0.1 -m 'Release version 1.0.1'
git push origin main --tags
"
```

**You copy-paste each command:**

```
git checkout main

Terminal shows:
~ $ git checkout main
Switched to branch 'main'
~ $

✅
```

```
git pull origin main

Terminal shows:
~ $ git pull origin main
Already up to date.
~ $

✅
```

```
git merge --no-ff release/1.0.1

Terminal shows:
~ $ git merge --no-ff release/1.0.1
Merge made by the 'recursive' strategy.
 app.json | 6 ++++--
 CHANGELOG.md | 15 ++++++++++
 ...
 2 files changed, 15 insertions(+)
~ $

✅ Merged to main!
```

```
git tag -a v1.0.1 -m "Release version 1.0.1"

Terminal shows:
~ $ git tag -a v1.0.1 -m "Release version 1.0.1"
~ $

✅ Tagged
```

```
git push origin main --tags

Terminal shows:
~ $ git push origin main --tags
Enumerating objects: 3, done.
...
* [new tag]         v1.0.1 -> v1.0.1
~ $

✅ Pushed!
```

**Action:** v1.0.1 tagged and on main ✅

---

## Step 15: Merge Back to Develop

**Claude tells you:**
```
"Merge back to develop and clean up:

git checkout develop
git pull origin develop
git merge --no-ff release/1.0.1
git push origin develop

git branch -d release/1.0.1
git push origin --delete release/1.0.1
"
```

**You copy-paste each one:**
(Same pattern as above - terminal shows success messages)

**Action:** Develop updated, release branch deleted ✅

---

## Step 16: Build & Submit

**You tell Claude:**
```
"Now I need to build with EAS and submit to Play Store.
Give me the exact commands."
```

**Claude tells you:**
```
"In terminal, copy-paste:

eas build --platform android --release

Wait 15-20 minutes for build to complete.
Then go to Play Console and upload the file."
```

**Terminal shows (while building):**
```
~ $ eas build --platform android --release
✔ Signed in as [your email]
✔ Using Expo CLI
✔ Building APK...

Building... (shows progress)

✔ Build complete!
Build details: https://expo.dev/...
```

**Action:** Build complete ✅

---

## Step 17: Upload to Play Console (Manual)

**You manually go to:**
```
https://play.google.com/console
→ Your app
→ Release > Production
→ Create new release
→ Upload AAB file (from EAS build)
→ Add release notes (from CHANGELOG.md)
→ Submit
```

**Action:** Submitted to Play Store ✅

---

# ✅ SUMMARY: WHAT YOU SAW

## Beginning
```
Terminal commands → Cursor opens → Files created
```

## Middle
```
Code in Cursor → Save → Terminal git commands → GitHub updated
(Repeat daily)
```

## End
```
Terminal merge commands → Version updated → Build → Submit
```

## Total Git Commands You Actually Copy-Pasted
```
Maybe 30-40 total across entire release
None required learning - all copy-paste
All explained by Claude
```

---

# 🎯 KEY TAKEAWAY

**You never needed to understand Git.**

```
❌ Didn't memorize: git checkout, git merge, git push, etc.
❌ Didn't learn: Branching strategy, merge conflicts, etc.
❌ Didn't read: Git documentation

✅ You just: Copy-pasted commands Claude gave you
✅ You just: Followed step-by-step instructions
✅ You just: Monitored progress (saw success messages)
```

**Claude did all the thinking. You did all the executing.**

---

# 📞 WHEN THINGS GO WRONG

**You see an error in terminal:**

```
error: Your local changes to 'app.json' would be overwritten by merge.
```

**You tell Claude:**
```
"I got this error: [paste error]
When I ran: [paste command]

What do I do?"
```

**Claude gives you fix commands:**
```
"Copy-paste:
git stash
git pull origin develop
git stash pop"
```

**You copy-paste. Error fixed.**

---

**That's your entire workflow. Copy. Paste. Done.** 🚀
