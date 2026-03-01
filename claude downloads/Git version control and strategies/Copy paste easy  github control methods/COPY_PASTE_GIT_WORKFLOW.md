# COPY-PASTE GIT WORKFLOW
## Use Claude + Cursor to Manage Versions (Zero Git Learning)

**Philosophy:** You don't need to learn Git. Tell Claude/Cursor what to do, copy-paste the commands, done.

---

# 🎯 THE WORKFLOW (Super Simple)

## Step 1: You Tell Claude What You Want
```
(In Claude)

You write:
"I need to create a feature branch for export/import. 
What are the exact commands I copy-paste into my terminal?"
```

## Step 2: Claude Gives You Commands
```
Claude responds:
"Here are the exact commands. Copy-paste them one by one:

1. git checkout develop
2. git pull origin develop
3. git checkout -b feature/export-import-complete
4. git push origin feature/export-import-complete
"
```

## Step 3: You Copy-Paste Into Terminal
```
Open terminal:
$ git checkout develop
$ git pull origin develop
$ git checkout -b feature/export-import-complete
$ git push origin feature/export-import-complete

You see: Branch created ✅
```

## Step 4: Code in Cursor
```
Open Cursor IDE
Work on your code
Use Cursor's AI to help
When done: Save file
```

## Step 5: Tell Claude "I'm Done, What's Next?"
```
(In Claude)

You write:
"I finished coding exportService.ts. 
What's the next command to save my work?"
```

## Step 6: Claude Tells You, You Copy-Paste
```
Claude responds:
"Copy-paste these commands:

1. git add src/services/exportService.ts
2. git commit -m 'Feature: Add export service'
3. git push origin feature/export-import-complete
"

You copy-paste them ✅
```

**Repeat until v1.0.1 is ready.**

---

# 📋 EXACT COMMANDS (Copy These, Don't Learn Them)

## SETUP (Do Once, Right Now)

```
STEP 1: Go to Terminal
├─ Mac: Command + Space → type "Terminal" → Enter
├─ Windows: Win Key → type "Terminal" → Enter
└─ Linux: Ctrl+Alt+T

STEP 2: Navigate to Your Project
Copy-paste this (modify path):
cd ~/path-to-your-mezr-project

Example (if you don't know path):
cd ~/Documents/mezr-app

STEP 3: Verify Git Exists
Copy-paste:
git --version

You should see: git version X.X.X ✅
If not: Tell Claude "I'm getting error, git not found"
```

## PHASE 1: CREATE FEATURE BRANCH (Do This NOW)

```
In terminal, copy-paste these ONE AT A TIME:

1. git checkout develop
   (You switch to develop branch)

2. git pull origin develop
   (You get latest code)

3. git checkout -b feature/export-import-complete
   (You create your feature branch)

4. git push origin feature/export-import-complete
   (You save branch to GitHub)

DONE ✅
```

**Result:** You now have a feature branch. Ready to code.

---

# 🔄 WORKFLOW DURING DEVELOPMENT

## Each Time You Finish Code

```
AFTER you write code in Cursor:

1. git add .
   (Tells Git "I want to save these files")

2. git commit -m "Feature: [what you did]"
   (Example: "Feature: Add export service")

3. git push origin feature/export-import-complete
   (Saves to GitHub)

DONE ✅
```

**You can do this multiple times per day. No problem.**

---

# 🚀 PHASE 2: WHEN v1.0.0 APPROVED (Release v1.0.1)

## Tell Claude This:

```
(In Claude)

You write:
"v1.0.0 just got approved. I need to:
1. Merge my export/import code from feature/export-import-complete
2. Create a release branch
3. Update app.json version to 1.0.1
4. Update CHANGELOG.md
5. Build and submit v1.0.1

Please give me exact copy-paste commands for each step."
```

## Claude Will Give You Commands Like:

```
Claude responds:

STEP 1: Merge to develop
Copy-paste:
git checkout develop
git pull origin develop
git merge --no-ff feature/export-import-complete
git push origin develop

STEP 2: Create release branch
Copy-paste:
git checkout -b release/1.0.1
git push origin release/1.0.1

STEP 3: Update Files
(Cursor handles this - Claude shows you what to change)

STEP 4: Commit changes
Copy-paste:
git add app.json CHANGELOG.md
git commit -m "Release: v1.0.1 with export/import"
git push origin release/1.0.1

[More commands for merging to main, tagging, etc.]
```

**You just copy-paste. Claude does the thinking.**

---

# 💡 PROMPT TEMPLATES (Use These Exactly)

## Template 1: When Starting

```
(Copy this into Claude chat)

"I'm starting work on export/import for MEZR app.
I have:
- A GitHub repo at: [your GitHub URL]
- I'm on my laptop
- I don't know Git

Please give me the exact copy-paste commands to:
1. Create a feature branch called feature/export-import-complete
2. Start coding
3. Save my work as I code

Give me step-by-step copy-paste commands."
```

## Template 2: When Saving Work

```
(Copy this into Claude chat)

"I just finished coding [filename] for the export service.
What are the exact copy-paste commands to save this to GitHub?"
```

## Template 3: When v1.0.0 Approved

```
(Copy this into Claude chat)

"v1.0.0 got approved on Play Store. I need to:
1. Merge my feature/export-import-complete branch
2. Update version to 1.0.1 in app.json
3. Update CHANGELOG.md
4. Create a release branch
5. Submit v1.0.1 to Play Store

Give me exact copy-paste commands for the entire process, step by step."
```

## Template 4: When You Get an Error

```
(Copy this into Claude chat)

"I got this error when I ran [command]:
[copy the error message]

What do I do?"
```

---

# 📱 HOW TO USE CURSOR + CLAUDE TOGETHER

## For Code Changes

```
SCENARIO: You need to update app.json version

IN CURSOR:
1. Open file: app.json
2. Find: "version": "1.0.0"
3. Cursor will highlight it
4. Right-click → "Ask Claude"
5. Type: "Change version to 1.0.1 and buildNumber to 4"
6. Claude rewrites it in Cursor
7. Save file (Cmd+S or Ctrl+S)

DONE ✅
```

## For Git Commands

```
SCENARIO: You finished a file, need to save to Git

IN CLAUDE:
1. Ask: "I finished exportService.ts. How do I save it to GitHub?"
2. Claude gives commands
3. Copy-paste into terminal
4. DONE ✅
```

## Workflow

```
CURSOR: Write code (use Cursor's AI to help)
        ↓
CLAUDE: "How do I save this?"
        ↓
CLAUDE: Gives Git commands
        ↓
YOU: Copy-paste commands in terminal
        ↓
REPEAT until feature done
```

---

# 🔧 COMMON SCENARIOS + COPY-PASTE SOLUTIONS

## Scenario 1: "I Don't Know My Project Path"

```
Tell Claude:
"I don't know the full path to my MEZR project folder.
How do I find it and navigate to it?"

Claude responds with commands like:
ls -la ~/Documents/
cd ~/Documents/mezr-app
```

## Scenario 2: "I'm Not Sure Which Branch I'm On"

```
In terminal, copy-paste:
git branch

You'll see list:
develop
feature/export-import-complete (this one has *)
main

The * shows you're on: feature/export-import-complete ✅
```

## Scenario 3: "I Made a Mistake, How Do I Fix It?"

```
Tell Claude:
"I accidentally did [command] and now [problem].
How do I undo this?"

Claude gives you fix commands.
Copy-paste them.
Done ✅
```

## Scenario 4: "My Code Won't Save to GitHub"

```
Tell Claude:
"I tried to push but got error: [paste error]
What do I do?"

Claude will tell you exact fix.
You copy-paste fix.
```

## Scenario 5: "I Want to See What Changed"

```
In terminal, copy-paste:
git status

You see:
modified: src/services/exportService.ts
new file: src/services/importService.ts

This shows you what files changed ✅
```

---

# 📋 COMPLETE TIMELINE (Copy-Paste Version)

## RIGHT NOW (Before v1.0.0 Approval)

```
STEP 1: Tell Claude
"Help me set up Git for coding export/import.
Give me exact terminal commands."

STEP 2: Claude Gives Commands
"Copy-paste these:
1. git checkout develop
2. git pull origin develop
3. git checkout -b feature/export-import-complete
4. git push origin feature/export-import-complete"

STEP 3: You Copy-Paste in Terminal
Done ✅

STEP 4: Open Cursor
Start coding exportService.ts

STEP 5: Each Time You Finish a File
Tell Claude: "I finished [filename]. How do I save it?"
Claude tells you commands.
You copy-paste.

REPEAT until feature done.
```

## WHEN v1.0.0 APPROVED (Mar 1-3)

```
STEP 1: Tell Claude
"v1.0.0 approved! Now I need to release v1.0.1 with export/import.
Give me all the copy-paste commands."

STEP 2: Claude Gives All Commands
(Exact order, exact copy-paste)

STEP 3: You Follow Step-by-Step
Terminal → Copy-paste → Cursor (edit files) → Terminal (save)

STEP 4: Done ✅
v1.0.1 submitted to Play Store
```

---

# 🎯 EXACT PROMPTS TO USE (Copy These)

## Prompt 1: Initial Setup

```
"I'm starting development on MEZR app export/import feature.
My GitHub repo: [paste URL]
I have zero Git experience.

Give me:
1. Exact terminal command to navigate to my project
2. Exact command to verify Git is working
3. Exact commands to create feature/export-import-complete branch
4. Exact commands to save my first code file

Just copy-paste steps."
```

## Prompt 2: Save Work Daily

```
"I finished coding [filename]. 
It's saved in Cursor.
Give me the exact copy-paste commands to save it to GitHub."
```

## Prompt 3: Release v1.0.1

```
"v1.0.0 approved. I need to release v1.0.1.

I need:
1. Merge feature/export-import-complete
2. Update app.json: version 1.0.1, build 4
3. Update CHANGELOG.md
4. Create release branch
5. Tag v1.0.1
6. Merge to main
7. Submit to Play Store

Give me EVERY copy-paste command in order."
```

## Prompt 4: Something Went Wrong

```
"I got error: [paste exact error]
When I ran: [paste exact command]

What copy-paste command fixes this?"
```

---

# ✅ QUICK REFERENCE (Keep This Handy)

## Most Common Commands (Copy-Paste)

```
SEE WHAT BRANCH YOU'RE ON:
git branch

SAVE YOUR WORK (Do this daily):
git add .
git commit -m "Your message"
git push origin [branch-name]

GET LATEST CODE:
git pull origin develop

UPDATE STATUS:
git status

FIX MISTAKES:
(Ask Claude!)
```

## File Paths (Don't Memorize, Just Ask Claude)

```
Instead of memorizing paths, tell Claude:
"I need to navigate to my MEZR project. 
What's the exact cd command for [describe location]?"

Claude: "cd ~/Documents/mezr-app"
You copy-paste.
```

---

# 🚀 THE REAL WORKFLOW (All Claude/Cursor)

## Day 1: Start Feature Branch

```
Claude → "Here's your setup commands" 
You → Copy-paste terminal commands
Cursor → Write code
Claude → "Here's your save commands"
You → Copy-paste terminal commands
DONE ✅
```

## Days 2-14: Develop Export/Import

```
Cursor → Write code
You → Tell Claude "I finished [file]"
Claude → Gives save commands
You → Copy-paste
REPEAT ✅
```

## Day 15: v1.0.0 Approved

```
Claude → "Here's your release process (20 commands)"
You → Copy-paste each command in order
Cursor → Edit version numbers when told
Claude → "Next command is..."
You → Copy-paste
REPEAT until v1.0.1 submitted ✅
```

---

# 💡 KEY INSIGHT

**You're not learning Git. You're using Git.**

```
❌ DON'T: "I need to understand Git"
✅ DO: "Claude, what do I copy-paste?"

❌ DON'T: "I need to memorize Git commands"
✅ DO: "Claude, tell me exactly what to do"

❌ DON'T: "I need to read Git documentation"
✅ DO: "Claude, fix this error"

Git becomes just a tool you use via copy-paste.
Claude is your Git instruction manual.
```

---

# 📚 WORKFLOW AT A GLANCE

```
CURRENT STATE:
├─ v1.0.0 submitted to Play Store (waiting approval)
├─ You need to code export/import
└─ You have zero Git knowledge

YOUR WORKFLOW:
├─ Ask Claude: "Help me set up"
├─ Copy-paste commands
├─ Code in Cursor
├─ Ask Claude: "How do I save?"
├─ Copy-paste commands
├─ REPEAT until v1.0.1 ready
└─ Ask Claude: "How do I release?"
   └─ Copy-paste release commands
   └─ DONE ✅

NO GIT LEARNING REQUIRED.
CLAUDE DOES THE THINKING.
YOU COPY-PASTE.
```

---

# 🎯 FIRST THING YOU DO RIGHT NOW

```
In Claude, copy-paste this:

"I'm starting MEZR export/import development.
My GitHub repo: [paste your GitHub URL]
I'm on [Mac/Windows/Linux]

I don't know Git. Please give me the EXACT terminal commands to:
1. Navigate to my project
2. Create feature/export-import-complete branch
3. Save my first code file

Just copy-paste, step by step. No learning needed."
```

Claude will give you 5-10 exact commands.
You copy-paste them in terminal.
Done.

**That's it. That's the whole workflow.**

Now go ask Claude. 🚀
