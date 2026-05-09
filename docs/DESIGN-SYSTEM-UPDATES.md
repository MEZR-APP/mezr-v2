# Design System Update Checklist

When you modify code, update the design system to match. This checklist shows exactly what to change.

---

## Color Changes

**When:** You modify `src/theme/colors.ts`

**Update in design-system.html:**
```
Section 01 / COLOR PALETTE
├─ Color Swatches (update hex value)
├─ Color Grid (update visual color box)
└─ Specs Table (if adding new color)
```

**Example:**
```typescript
// If you change in colors.ts:
textPrimary: '#FFF' → '#F0F0F0'

// Update in HTML:
Section 01, find the "Text Primary" swatch
Change the color box from #FFF to #F0F0F0
Update the hex label: #FFFFFF → #F0F0F0
```

---

## Typography Changes

**When:** You modify font sizes or weights in components

**Update in design-system.html:**
```
Section 02 / TYPOGRAPHY
├─ Typography Grid (update sample + specs)
└─ Key Insights (if pattern changes)
```

**Example:**
```typescript
// If you change in BreathModule.tsx:
fontSize: 22 → fontSize: 24

// Update in HTML:
Section 02, find "Phase Text" example
Change "INHALE" display size from 22px to 24px
Update the info: "22px, 200 weight" → "24px, 200 weight"
```

---

## Button Changes

**When:** You modify button styles in components or `Button.tsx`

**Update in design-system.html:**
```
Section 04 / BUTTONS
├─ Button examples
├─ Button variants (primary/secondary/danger)
├─ Specs Table (dimensions, colors, weights)
└─ Module control buttons (if new types added)
```

**Example:**
```typescript
// If you change button padding in Button.tsx:
paddingVertical: 20 → paddingVertical: 24

// Update in HTML:
Section 04, find Button Specifications table
Find row: "button_large" → "paddingHorizontal 60, paddingVertical 20"
Change to: "paddingHorizontal 60, paddingVertical 24"
Update Primary button visual example
```

---

## Module Changes

**When:** You add/modify modules (Breath, Swim, Zen, Gaze) or add new ones

**Update in design-system.html:**
```
Section 03 / MODULES
├─ Module cards (visuals)
├─ Module display sections
├─ Specs Table (dimensions)
└─ Section 08 / MODULES REFERENCE (status)
```

**Example:**
```typescript
// If you add a new Run module:
export const ALL_MODULES: Module[] = [
  { id: 'run', label: 'RUN', category: 'health' }
]

// Update in HTML:
Section 03, add new module card
Section 08, change RUN status from "⏳ Coming Soon" to "✓ RUN - Running distance counter"
Section 06, add Run module screen mockup
```

---

## Button State Changes

**When:** You modify button visibility or states in MainScreen or modules

**Update in design-system.html:**
```
Section 04 / BUTTONS
└─ Button State Machine (if flow changes)

Key Insights section:
└─ "Button State Machine" code block
```

**Example:**
```typescript
// If you change button visibility in GazeModule:
// Current: PAUSE/RESUME/END when active
// New: PAUSE/RESUME/END/SKIP when active

// Update in HTML:
Section 09 / KEY INSIGHTS
Find "Button State Machine" code block
Add new state transitions showing SKIP button
```

---

## Navigation Changes

**When:** You modify tab bar, category bar, or header

**Update in design-system.html:**
```
Section 05 / NAVIGATION
├─ Category Bar (if categories change)
├─ Bottom Tab Bar (if tabs change)
└─ Tab Bar code specs (if structure changes)

Section 06 / SCREEN LAYOUTS
└─ Device mockups (if layout changes)
```

**Example:**
```typescript
// If you add a new category:
export const CATEGORIES: Category[] = [
  { id: 'goals', label: 'GOALS', emoji: '🎯' }
]

// Update in HTML:
Section 05, Category Bar example
Add new category tab: "🎯 GOALS"
Update description: "4 categories" → "5 categories"
```

---

## Spacing/Layout Changes

**When:** You modify padding, margins, gaps, or border-radius

**Update in design-system.html:**
```
Section 07 / SPECIFICATIONS
├─ Spacing & Layout table
└─ Layout examples

Section 09 / KEY INSIGHTS
└─ Key Insights code block
```

**Example:**
```typescript
// If you change tab bar height in index.tsx:
height: 64 → height: 72

// Update in HTML:
Section 07, find row: "Bottom Tab Bar"
Change: "64px height" → "72px height"
Update mockup heights in Section 06
```

---

## Adding New Components

**When:** You create a new component type (not module)

**If it should appear in design system:**

1. **Determine section:** Where does it belong?
   - UI element → Section 04 (Buttons) or create new section
   - Layout pattern → Section 05 (Navigation) or 06 (Screens)
   - Color/style rule → Section 01-02

2. **Update design-system.html:**
   - Add component visual example
   - Add specifications
   - Add to relevant section

3. **Example: New Input Field Component**
   ```
   Create new "Section 04B / FORM INPUTS"
   - Input field states (default, focused, error)
   - Height, padding, border specs
   - Color and typography specs
   - Update Specifications table
   ```

---

## Animation Changes

**When:** You modify animations (breathing pulse, candle flicker, etc.)

**Update in design-system.html:**
```
Section 09 / KEY INSIGHTS
└─ Update animation descriptions

Section 03 / MODULES
└─ Update module card descriptions if visual changes
```

**Example:**
```typescript
// If you modify breathing animation duration:
Animated.timing(pulseAnim, { duration: 4000 })
→ Animated.timing(pulseAnim, { duration: 3000 })

// Update in HTML:
Section 09, find "Timer Implementation" note
Update: "100ms updates" reference if timing changes
Section 03, Zen module: update animation description
```

---

## General Workflow

### Step 1: Make Code Change
```bash
# Edit your component/config file
# Example: modify src/theme/colors.ts
```

### Step 2: Update Design System
```bash
# Open docs/design-system.html in editor
# Find relevant section (use Ctrl+F to search)
# Update text/colors/specs to match code change
# Save file
```

### Step 3: Verify
```bash
# Open design-system.html in browser
# Visually verify changes look correct
# Compare to code to ensure accuracy
```

### Step 4: Commit Both
```bash
git add src/theme/colors.ts docs/design-system.html
git commit -m "Update: Modify color palette and design system"
```

---

## Quick Reference: What Changes What

| File Changed | Design System Section | Update |
|---|---|---|
| `src/theme/colors.ts` | Section 01 | Color hex, names |
| Component `fontSize` | Section 02 | Typography specs |
| `src/components/ui/Button.tsx` | Section 04 | Button styles, specs |
| Module component (new/modified) | Section 03, 08 | Module cards, reference |
| `src/screens/index.tsx` layout | Section 05, 06 | Navigation, mockups |
| `src/constants/modules.ts` | Section 08 | Module reference list |
| Animation timing | Section 03, 09 | Module descriptions, insights |
| Spacing/padding | Section 07 | Specifications table |

---

## If You Forget to Update

**Code review will catch it.**

The design system must stay in sync. If you see a PR with code changes but no design system updates:
```
Request changes: "Please update docs/design-system.html to match code changes"
```

---

## Need Help?

- **Where do I find Section X?** → Use Ctrl+F in HTML, search "/ X"
- **What color is used?** → Section 01 / COLOR PALETTE
- **What size button?** → Section 04 / BUTTONS → Specifications
- **Module specs?** → Section 03 / MODULES or Section 07 / SPECIFICATIONS

---

**Remember:** The design system is a living document. It evolves with your code. Keep it updated with every change.

**Last Updated:** May 8, 2026  
**Version:** 1.0.2+
