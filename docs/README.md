# Mezr Design System Documentation

**Version:** 1.0.2+  
**Last Updated:** May 8, 2026  
**Repository:** [github.com/MEZR-APP](https://github.com/orgs/MEZR-APP/repositories)

## Overview

This folder contains the **living design system** for Mezr—a React Native breathing exercise & wellness app. The design system is the single source of truth for:

- **Colors** - Exact hex codes from `src/theme/colors.ts`
- **Typography** - Font sizes, weights, and letter-spacing from components
- **Components** - Buttons, circles, layouts, animations
- **Modules** - Breath, Swim, Zen (Meditate), Gaze with specifications
- **Spacing & Layout** - Grid, padding, margins, border radius
- **Navigation** - Bottom tab bar, category bar structure

## Files

| File | Purpose |
|------|---------|
| `design-system.html` | Main design system reference (open in browser) |
| `README.md` | This file - overview and usage |
| `DESIGN-SYSTEM-UPDATES.md` | Checklist for keeping design system in sync with code |

## How to Use

### For Developers
1. **Open the design system:** `docs/design-system.html` in any browser
2. **Reference during development:**
   - Copy exact color hex codes from Color Palette section
   - Check button dimensions and styling from Buttons section
   - Verify spacing from Specifications section
   - Review module layouts from Modules section

### For Designers
1. Review current app specifications
2. Plan design changes
3. Update relevant sections in `design-system.html`
4. Commit changes to Git

## Design System Structure

### 01 / COLOR PALETTE
Exact colors from `src/theme/colors.ts`:
- Backgrounds: #000, #0A0A0A, #111, #1A1A1A
- Text: #FFF (primary), #888 (secondary), #666 (muted), #444 (dark)
- Accents: #FF4444 (danger)

### 02 / TYPOGRAPHY
Font specifications extracted from component files:
- Large Headers: 22px, 200 weight, 8px letter-spacing
- Large Numbers: 90px, 100 weight
- Labels: 14px, 600 weight, 4px letter-spacing
- Small Text: 10px-11px with varying tracking

### 03 / MODULES
Current modules (v1.0.2+):
- **BREATH** - 180px animated circle, phase text, cycle counter
- **SWIM** - Tap-to-count laps, 90px counter display
- **ZEN (Meditate)** - Ambient circle (0.3 opacity), breathing pulse, timer
- **GAZE** - Candle animation, breathing guide text, 4-second cycle

### 04 / BUTTONS
Button variants and sizes:
- Primary: #FFF background, #000 text
- Secondary: #1A1A1A background, #666 text
- Danger: #1A0000 background, #FF4444 text
- All: 40px border-radius (large), 700 font-weight, 2px letter-spacing

### 05 / NAVIGATION
- **Bottom Tab Bar:** 64px height, 4 tabs (Home/Stats/Settings/Profile)
- **Category Bar:** Scrollable, 4 categories (Health/Wellness/Productivity/Finance)
- **Top Header:** Module selector, sound toggle, settings icon

### 06 / SCREEN LAYOUTS
Device mockups and actual screen arrangements:
- iPhone 12 Pro (375×812px)
- Screen tabs: Main, Stats, Settings, Profile
- Module positioning and safe areas

### 07 / SPECIFICATIONS
Technical specifications:
- Button dimensions and styling
- Module circle sizes (180px, 90px)
- Spacing and layout rules
- Border radius values
- Tab bar measurements

### 08 / MODULES REFERENCE
Current implementation status:
- ✓ BREATH, SWIM, ZEN, GAZE (Active)
- ⏳ RUN, CYCLE (Coming Soon)

### 09 / KEY INSIGHTS
Critical patterns from source code:
- Animation implementations (breathing pulse, candle flicker)
- Button state flows
- Tab bar padding and safe area
- Letter-spacing usage throughout
- Minimal color palette philosophy

## When to Update the Design System

See **`DESIGN-SYSTEM-UPDATES.md`** for detailed checklist.

**Quick summary:**
- Changed a color → Update Color Palette section
- Added new button variant → Update Buttons section  
- Modified module → Update Modules section
- Changed spacing/dimensions → Update Specifications section
- New screen/layout → Update Screen Layouts section

## Keeping Synchronized

This design system is extracted directly from source code (`src/theme/colors.ts`, component files, etc.). 

**Workflow:**
```
Code Change → Update Design System HTML → Commit Both Together
```

Never commit code changes without updating the design system—they must stay in sync.

## Development Integration

### For Cursor (Your IDE)
When working on components:
1. Open design system in browser side-by-side
2. Reference exact specifications while coding
3. Commit design system updates with code changes

### For Code Review
Reviewers can check:
- Colors match design system
- Typography matches specifications
- Button sizing and styling correct
- Spacing and layout follow rules

### For New Team Members
1. Read this README
2. Open `design-system.html` in browser
3. Explore each section
4. Reference during first feature implementation

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.2+ | May 8, 2026 | Initial design system created from v1.0.2 code specifications |

## Questions?

Refer to:
- **How to update?** → `DESIGN-SYSTEM-UPDATES.md`
- **Color codes?** → See `design-system.html` Section 01
- **Button specs?** → See `design-system.html` Section 04
- **Module details?** → See `design-system.html` Section 03

---

**Last Updated:** May 8, 2026  
**Maintained By:** Process Quality Engineering  
**Repository:** https://github.com/orgs/MEZR-APP
