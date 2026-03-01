# ULTIMATE SIMPLE: COPY-PASTE PROMPTS FOR CLAUDE
## That's it. Just these prompts. Nothing else to learn.

---

# 🎯 THIS IS ALL YOU NEED

You will copy-paste ONE of these prompts into Claude chat at each phase.
Claude gives you commands.
You copy-paste commands into terminal.
Done.

---

# ✅ PHASE 1: RIGHT NOW (Before v1.0.0 Approval)

## Copy-Paste This Prompt Into Claude:

```
I need to start coding export/import feature for MEZR app.
I have zero Git knowledge.
My GitHub repo: [paste your repo URL]
I'm on [Mac/Windows/Linux]
My project folder location: [paste the path, or say "I don't know"]

Please give me step-by-step copy-paste terminal commands to:
1. Navigate to my project
2. Verify Git is working
3. Create a feature branch called: feature/export-import-complete
4. Save my first code file to GitHub

Just give me the commands in order. I'll copy-paste each one.
```

## What Claude Will Give You:

```
Step 1: Copy-paste this:
cd ~/path/to/your/project

Step 2: Copy-paste this:
git --version

Step 3: Copy-paste these (one by one):
git checkout develop
git pull origin develop
git checkout -b feature/export-import-complete
git push origin feature/export-import-complete

Done! Now code in Cursor.
```

## Your Job:

1. Open Terminal
2. Copy-paste each command
3. Press Enter
4. See success message
5. Go to Cursor, start coding

**That's it for Phase 1.** ✅

---

# 📝 PHASE 2: DAILY (While Coding)

## Each Time You Finish a File in Cursor:

Copy-Paste This Prompt Into Claude:

```
I just finished coding [filename] in my MEZR export/import feature.
I'm on feature/export-import-complete branch.
I saved the file in Cursor.

Give me the copy-paste terminal commands to save it to GitHub.
```

## What Claude Will Give You:

```
Copy-paste these commands (one by one):

1. git add src/services/[filename]
2. git commit -m "Feature: [describe what you did]"
3. git push origin feature/export-import-complete

Done!
```

## Your Job:

1. Copy-paste command 1, press Enter
2. Copy-paste command 2, press Enter
3. Copy-paste command 3, press Enter
4. See success message
5. Back to Cursor, code next file

**Repeat daily until feature done.** ✅

---

# 🚀 PHASE 3: WHEN v1.0.0 APPROVED (Mar 1-3)

Copy-Paste This Prompt Into Claude:

```
v1.0.0 just got approved on Play Store!

I need to release v1.0.1 with export/import feature.
I'm on feature/export-import-complete branch with all the code done.

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

Give me EVERY command in the exact order. I'll copy-paste each one.
```

## What Claude Will Give You:

```
Command 1: git checkout develop
Command 2: git pull origin develop
Command 3: git merge --no-ff feature/export-import-complete
Command 4: git push origin develop
Command 5: git checkout -b release/1.0.1
Command 6: git push origin release/1.0.1

[Claude will also tell you to edit files in Cursor:
Open app.json, change version to 1.0.1, build to 4
Open CHANGELOG.md, add release notes]

Command 7: git add app.json CHANGELOG.md
Command 8: git commit -m "Release: v1.0.1 with export/import"
Command 9: git push origin release/1.0.1
Command 10: git checkout main
Command 11: git pull origin main
Command 12: git merge --no-ff release/1.0.1
Command 13: git tag -a v1.0.1 -m "Release version 1.0.1"
Command 14: git push origin main --tags
Command 15: git checkout develop
Command 16: git merge --no-ff release/1.0.1
Command 17: git push origin develop
Command 18: git branch -d release/1.0.1
Command 19: git push origin --delete release/1.0.1
Command 20: eas build --platform android --release
```

## Your Job:

1. Copy-paste commands 1-6 in terminal (merge feature)
2. Open Cursor, edit app.json (version 1.0.1, build 4)
3. Open Cursor, edit CHANGELOG.md (add release notes)
4. Copy-paste commands 7-19 in terminal (release process)
5. Copy-paste command 20 (build)
6. Wait 15-20 minutes for build
7. Go to Play Console, upload file manually

**DONE!** v1.0.1 submitted ✅

---

# 💡 THAT'S ALL YOU NEED TO KNOW

## Copy-Paste Pattern:

```
YOU TELL CLAUDE:
"I need to [do something with version/release]"

CLAUDE RESPONDS:
"Copy-paste these commands in order:
1. [command]
2. [command]
3. [command]"

YOU DO:
Open Terminal
Copy-paste each command
Press Enter
See success message
Move to next command

DONE ✅
```

---

# 📞 IF SOMETHING GOES WRONG

Copy-Paste This Into Claude:

```
I got this error:
[paste the error message from terminal]

When I ran this command:
[paste the command that caused the error]

What do I do?
```

Claude will tell you the fix commands.
You copy-paste them.
Done. ✅

---

# ✅ THAT'S LITERALLY IT

```
PHASE 1 (Now): 1 prompt
PHASE 2 (Daily): 1 prompt (repeated many times)
PHASE 3 (Release): 1 prompt

3 prompts.
20-30 copy-paste commands total.
No Git learning needed.
Claude does 100% of the thinking.
You do 100% of the executing.
```

---

# 🚀 WHAT TO DO RIGHT NOW

## Step 1: Get Your GitHub URL

```
Go to: github.com
Find your MEZR repo
Copy the URL from the address bar
Example: https://github.com/yourusername/mezr-app
```

## Step 2: Get Your Project Path (If You Don't Know)

```
Open Terminal
Type: open ~/Documents
Find where your mezr-app folder is
Copy the path
Example: ~/Documents/mezr-app
```

## Step 3: Open This Chat with Claude

(You're already here)

## Step 4: Copy-Paste This Prompt:

```
I need to start coding export/import feature for MEZR app.
I have zero Git knowledge.
My GitHub repo: [paste your repo URL from step 1]
I'm on [Mac/Windows/Linux]
My project folder location: [paste from step 2]

Please give me step-by-step copy-paste terminal commands to:
1. Navigate to my project
2. Verify Git is working
3. Create a feature branch called: feature/export-import-complete
4. Save my first code file to GitHub

Just give me the commands in order. I'll copy-paste each one.
```

## Step 5: Copy-Paste Claude's Commands Into Terminal

Done! You're set up. 🎉

---

# 📋 QUICK REFERENCE: The 3 Prompts

### Prompt 1 (Setup - Use Once Now)
```
I need to start coding export/import feature for MEZR app.
I have zero Git knowledge.
My GitHub repo: [URL]
I'm on: [Mac/Windows/Linux]
My project location: [path]

Give me copy-paste commands to setup feature/export-import-complete branch.
```

### Prompt 2 (Daily - Use Many Times)
```
I finished [filename] in Cursor.
I'm on feature/export-import-complete branch.

Give me copy-paste commands to save it to GitHub.
```

### Prompt 3 (Release - Use Once)
```
v1.0.0 approved!

Give me ALL copy-paste commands to:
1. Merge feature/export-import-complete
2. Update app.json (1.0.1, build 4)
3. Update CHANGELOG.md
4. Release to main
5. Build & submit v1.0.1

Commands in exact order.
```

### Bonus Prompt (If Error)
```
I got error: [paste error]
When running: [paste command]

What do I do?
```

---

# ✅ CHECKLIST

```
Right Now:
☐ Find your GitHub repo URL
☐ Find your project folder path
☐ Copy Prompt 1 into this Claude chat
☐ Get commands from Claude
☐ Copy-paste commands in terminal

Days 1-14 (While Coding):
☐ Code in Cursor
☐ Use Prompt 2 after each file
☐ Copy-paste save commands
☐ Repeat

When v1.0.0 Approved:
☐ Use Prompt 3
☐ Copy-paste all release commands
☐ Done! ✅
```

---

**That's literally everything. You're done reading. Now go do it.** 🚀

Copy Prompt 1, paste into Claude, get commands, copy-paste into terminal.

**You've got this.** ❤️
