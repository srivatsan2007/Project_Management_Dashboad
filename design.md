# VeroPlan — Visual Design System & Specification

This document details the visual design architecture, tokens, typography, component behaviors, motion guidelines, and accessibility standards for the **VeroPlan Personal Project Management System**.

---

## 1. Brand Identity

- **Product Name**: VeroPlan
- **Tagline**: *"Plan • Track • Achieve"*
- **Brand Personality**: Calm, organic, precision-engineered, intentional, focused, and premium.
- **Visual Design Principles**:
  1. **Nature-Infused Sophistication**: Grounded olive tones combined with luminous pistachio highlights deliver a relaxed yet focused visual atmosphere, reducing cognitive fatigue.
  2. **Tactile & Dimensional Depth**: Clean structural glassmorphism, subtle micro-borders, organic gradients, and three-dimensional sculpture accents provide tangible depth without clutter.
  3. **Zero Clutter, Total Purpose**: Interfaces present 0 fabricated records or noise. Every empty state communicates clarity, context, and immediate next steps.
  4. **Uncompromised Accessibility**: High-contrast typography, accessible touch targets (≥ 44×44px), keyboard navigation, and full reduced-motion support.

### Logo Usage & Placement
- **Emblem**: 3D folded "V" leaf emblem symbolizing growth, momentum, and structure.
- **Desktop Sidebar**: Displayed at 34×34px in the primary header alongside wordmark *"VeroPlan"*.
- **Mobile Navigation**: Prominently featured on the drawer header with tagline.
- **Splash Screen**: Centered at 96×96px with delicate cubic-bezier reveal animation.
- **Favicon**: Scalable vector rendering in `/public/favicon.svg` and `/public/logo.jpg`.

---

## 2. Color Palette & Semantic Tokens

### Core Color Palette
| Token Name | Hex Code | HSL Representation | Primary Purpose & Usage |
| :--- | :--- | :--- | :--- |
| **Primary Olive** | `#606B3D` | `hsl(74, 27%, 33%)` | Primary interactive elements, active accents, headers, main branding |
| **Pistachio Accent**| `#C8DEA0` | `hsl(81, 52%, 75%)` | Luminous focus rings, interactive hover states, badges, glow effects |
| **Deep Olive** | `#22291F` | `hsl(98, 14%, 14%)` | Dark mode application backdrop, deep card surfaces, high-contrast borders |
| **Light Sage** | `#F3F5E9` | `hsl(69, 31%, 94%)` | Light mode background, splash screen background, subtle light panels |
| **Soft Green Surface**| `#E7EED8` | `hsl(80, 41%, 89%)` | Elevated light surfaces, soft card backgrounds, subtle highlight chips |
| **Muted Olive** | `#849B54` | `hsl(80, 30%, 47%)` | Secondary icons, subtle borders, inactive tab highlights, chart series |
| **Light Text** | `#F2F4EB` | `hsl(73, 27%, 94%)` | High-contrast text on dark surfaces, buttons, and badges |
| **Dark Text** | `#26351D` | `hsl(97, 29%, 16%)` | High-contrast text on light surfaces and sage backgrounds |

### Semantic CSS Tokens
```css
:root {
  /* Brand Tokens */
  --color-primary-olive: #606B3D;
  --color-pistachio-accent: #C8DEA0;
  --color-deep-olive: #22291F;
  --color-light-sage: #F3F5E9;
  --color-soft-green-surface: #E7EED8;
  --color-muted-olive: #849B54;
  --color-light-text: #F2F4EB;
  --color-dark-text: #26351D;

  /* Status Colors */
  --color-status-success: #6ba84f;
  --color-status-success-bg: rgba(107, 168, 79, 0.15);
  --color-status-warning: #d99b26;
  --color-status-warning-bg: rgba(217, 155, 38, 0.15);
  --color-status-danger: #d95d5d;
  --color-status-danger-bg: rgba(217, 93, 93, 0.15);
  --color-status-info: #4a90e2;
  --color-status-info-bg: rgba(74, 144, 226, 0.15);

  /* Radius Scale */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --card-radius: 14px;

  /* Elevations & Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.15);
  --shadow-md: 0 4px 14px rgba(0, 0, 0, 0.25);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.35);
  --accent-color-glow: rgba(200, 222, 160, 0.28);
}
```

---

## 3. Typography

- **Display & Headings**: `Outfit`, system fallbacks: `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`
- **Body & Controls**: `Plus Jakarta Sans`, system fallbacks: `Inter`, `system-ui`, `sans-serif`
- **Code & Numerical Stats**: `JetBrains Mono`, `monospace`

### Heading Hierarchy
| Level | Font Size | Weight | Line Height | Letter Spacing | Responsive Size (<768px) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1 (Page Title)** | `1.75rem (28px)` | `700` | `1.25` | `-0.025em` | `1.4rem (22.4px)` |
| **H2 (Section Header)** | `1.35rem (21.6px)`| `700` | `1.3` | `-0.02em` | `1.2rem (19.2px)` |
| **H3 (Card Title)** | `1.10rem (17.6px)`| `600` | `1.35` | `-0.015em` | `1.0rem (16px)` |
| **H4 (Subheadings)** | `0.95rem (15.2px)`| `600` | `1.4` | `0` | `0.9rem (14.4px)` |
| **Body Standard** | `0.875rem (14px)` | `400 / 500`| `1.55` | `0` | `0.85rem (13.6px)` |
| **Caption / Labels** | `0.75rem (12px)` | `500 / 600`| `1.4` | `0.02em` | `0.72rem (11.5px)` |
| **Badges / Micro** | `0.675rem (10.8px)`| `700` | `1.2` | `0.04em` | `0.65rem (10.4px)` |

---

## 4. Layout & Spacing Scale

### Spacing Scale
- `2xs`: `4px`
- `xs`: `8px`
- `sm`: `12px`
- `md`: `16px`
- `lg`: `24px`
- `xl`: `32px`
- `2xl`: `48px`
- `3xl`: `64px`

### Structural Grid & Shell
1. **Vertical Left Sidebar**:
   - Expanded width: `250px`
   - Collapsed width: `68px`
   - Mobile: Slide-out drawer (`280px`) with high z-index backdrop overlay and scroll-locking.
2. **Top Header**:
   - Fixed height: `64px`
   - Integrated breadcrumbs, quick global search trigger (`Ctrl+K`), quick add action, theme toggle, and authenticated user/guest profile controls.
3. **Main Content Canvas**:
   - Maximum width: `1600px` centered with fluid gutters (`16px` mobile, `24px` tablet, `32px` desktop).
4. **Responsive Breakpoints**:
   - Mobile: `< 768px`
   - Tablet: `768px - 1024px`
   - Desktop: `1024px - 1440px`
   - Wide Monitor: `> 1440px`

---

## 5. Component Specifications

### Buttons
- **Primary Button**: Solid Olive Green background (`#606B3D`), Light text (`#F2F4EB`), 8px border radius, subtle hover lift (`translateY(-1px)`) and pistachio glow.
- **Secondary Button**: Translucent background (`rgba(200, 222, 160, 0.1)`), Olive/Pistachio border, hover surface transition.
- **Ghost Button**: Transparent background, accessible hover state, used for icon toolbars and table row actions.
- **Minimum Touch Target**: `44px` height on mobile viewport.

### Form Inputs & Selects
- 1px continuous border with `var(--border-card)`.
- Accessible focus ring: `0 0 0 2px var(--color-pistachio-accent)`.
- Password fields include built-in eye toggle for show/hide visibility.

### Cards & Panels
- Glass-like surface with dark olive base (`rgba(34, 41, 31, 0.75)` in dark theme, `#FFFFFF` in light theme).
- 1px subtle boundary border (`rgba(200, 222, 160, 0.12)`).
- Hoverable cards feature smooth 0.2s elevation and border highlight.

### Guest Authentication Modal Popup
- Small, focused dialog (`maxWidth: 440px`).
- Retains background page context with a translucent blurred backdrop (`backdrop-filter: blur(4px)`).
- Clear header: *"Sign in to upload documents"* (or contextual action).
- Distinct Primary button (*"Login"*) and Secondary button (*"Create account"*).
- Dismissible via close icon or backdrop tap without forcing redirection.

### Empty States
Every section features dedicated zero-data design:
- Prominent Lucide icon enclosed in an accent circular badge.
- Descriptive heading (e.g. *"No projects yet"*, *"No tasks yet"*, *"No documents uploaded yet"*).
- Clear explanation sentence.
- Primary CTA to immediately create or sign in, plus optional secondary guidance action (*"Learn how it works"*).

### Kanban Board
- 4 status columns: *To Do*, *In Progress*, *Testing*, *Completed*.
- HTML5 Drag and drop with visual drag-over indicator and optimistic state update.
- Empty columns display a clean dashed placeholder with a quick "+ Add task" button.

### Splash Screen
- Dedicated startup screen with VeroPlan 3D logo emblem.
- Scales and fades smoothly into the application once initial auth check completes.
- Fallback timeout prevents indefinite hanging if network is interrupted.
- Honored by `prefers-reduced-motion`.

---

## 6. Motion & Accessibility

### Motion Standards
- **Durations**:
  - Micro-interactions (hover, toggle, buttons): `150ms - 200ms`
  - Modals, drawers, and popups: `200ms - 250ms cubic-bezier(0.16, 1, 0.3, 1)`
  - Splash screen transition: `400ms - 450ms`
- **Reduced Motion**:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```

### Accessibility Compliance
- **Color Contrast**: All text elements meet or exceed WCAG AA ratio (4.5:1 for body copy, 3:1 for large display titles).
- **Non-Color Indicators**: Status badges combine distinct icons, text labels, and color codes (never color alone).
- **Keyboard Navigation**: Modals trap focus, handle Escape to close, and form fields provide visible tab focus outlines.
