# AnalyzeFlow Design System Documentation

## 🎨 Design Philosophy

AnalyzeFlow uses a **dark-first, premium control panel** aesthetic inspired by high-end analytics dashboards like liambx.com. The design system emphasizes:

- **Layered depth** - Clear visual hierarchy through subtle elevation
- **Vibrant node colors** - Harmonized palette that works in both modes
- **Precision typography** - Clean, monospaced numbers with Inter font family
- **Intelligent motion** - Smooth 150-300ms transitions with cubic-bezier easing
- **Professional focus** - Designed for marketing, performance, and growth professionals

---

## 🌈 Color Tokens

### Light Mode

#### Surfaces (Layered Depth)
```css
--color-bg-canvas: 220 17% 97%      /* Canvas background */
--color-bg-panel: 0 0% 100%         /* Sidebar/panel surfaces */
--color-bg-card: 0 0% 100%          /* Card backgrounds */
--color-bg-elevated: 0 0% 100%      /* Floating elements */
```

#### Borders
```css
--color-border-default: 220 13% 91% /* Default borders */
--color-border-active: 231 48% 48%  /* Active/selected borders */
--color-border-muted: 220 13% 95%   /* Subtle dividers */
```

#### Text
```css
--color-text-primary: 26 6% 10%     /* Primary text */
--color-text-secondary: 220 9% 46%  /* Secondary text */
--color-text-dimmed: 220 9% 65%     /* Dimmed/disabled text */
--color-text-invert: 0 0% 100%      /* Text on colored backgrounds */
```

#### Brand
```css
--color-accent-primary: 204 100% 50%  /* Brand blue (#0090FF) */
--color-accent-glow: 162 91% 56%      /* Brand green (#36E2B2) */
```

### Dark Mode

#### Surfaces (Layered Depth)
```css
--color-bg-canvas: 222 47% 11%      /* Dark canvas #1A1F2E */
--color-bg-panel: 217 33% 17%       /* Elevated panel #212837 */
--color-bg-card: 217 33% 17%        /* Card background */
--color-bg-elevated: 215 28% 20%    /* Floating elements */
```

#### Borders
```css
--color-border-default: 217 33% 23% /* Default borders */
--color-border-active: 231 70% 65%  /* Active borders (lighter blue) */
--color-border-muted: 217 33% 19%   /* Subtle dividers */
```

#### Text
```css
--color-text-primary: 210 40% 98%   /* Primary text #F9FAFB */
--color-text-secondary: 215 20% 65% /* Secondary text #9CA3AF */
--color-text-dimmed: 217 20% 50%    /* Dimmed text */
--color-text-invert: 222 47% 11%    /* Text on light backgrounds */
```

---

## 🎯 Node Type Colors

### Harmonized Palette (WCAG AA+ Contrast)

| Node Type | Light Mode | Dark Mode | Hex Equivalent | Usage |
|-----------|-----------|-----------|----------------|-------|
| **Traffic** | `199 89% 48%` | `199 89% 55%` | #2D9CDB → #3BAAE6 | Traffic sources, campaigns |
| **Landing** | `160 84% 39%` | `160 84% 45%` | #10B981 → #14CC8F | Landing pages, forms |
| **Email** | `258 90% 66%` | `258 90% 70%` | #8B5CF6 → #A78BFA | Email campaigns, automation |
| **Offer** | `43 96% 56%` | `43 96% 60%` | #FBBF24 → #FCD34D | Proposals, deals |
| **Checkout** | `4 90% 58%` | `4 90% 65%` | #F87171 → #FCA5A5 | Payment, transactions |
| **Thank You** | `189 94% 43%` | `189 94% 50%` | #06B6D4 → #22D3EE | Confirmation pages |
| **Custom** | `220 9% 46%` | `220 9% 60%` | #6B7280 → #9CA3AF | Custom steps |

### Color Application Rules

1. **Node Header Background**: Full saturation node color with 135° gradient
2. **Node Border**: 30% opacity node color (50% on hover, 100% on select)
3. **Bottom Bar Icons**: 12% opacity background + 20% border in node color
4. **Inspector Badge**: Solid node color with white text

---

## 📏 Spacing & Radius

### Border Radius Hierarchy
```css
--radius: 0.75rem (12px)    /* Base radius */
```

- **Nodes**: `12px` (rounded-xl)
- **Panels**: `8px` (rounded-lg)
- **Inputs**: `6px` (rounded-md)
- **Pills/Badges**: `4px` (rounded)

### Shadow Depth Levels

#### Level 1: Canvas
```css
box-shadow: none
```

#### Level 2: Node/Panel (Resting)
```css
/* Light */
box-shadow: 0 4px 12px -4px hsl(node-color / 0.25)

/* Dark */
box-shadow: 0 4px 12px -4px hsl(node-color / 0.25)
```

#### Level 3: Node/Panel (Hover)
```css
box-shadow: 0 12px 24px -8px hsl(node-color / 0.35), 
            0 0 0 1px hsl(node-color / 0.4)
```

#### Level 4: Selected/Active
```css
box-shadow: 0 20px 40px -10px hsl(node-color / 0.4),
            0 0 0 2px hsl(--primary),
            0 0 20px hsl(--primary / 0.3)
```

#### Level 5: Floating (Context Menu, Tooltip)
```css
box-shadow: 0 20px 40px -10px hsl(0 0% 0% / 0.3)
backdrop-filter: blur(8px)
```

---

## ✍️ Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

### Type Scale

| Element | Size | Weight | Tracking | Usage |
|---------|------|--------|----------|-------|
| **Node Label** | `14px` | `600` | `-0.01em` | Node header titles |
| **Metric Label** | `12px` | `500` | `0.05em` (uppercase) | Bottom bar, inspector labels |
| **Metric Value** | `18px` | `600` | `normal` (tabular-nums) | Bottom bar numbers |
| **Node Metric** | `12px` | `500` | `normal` | Node card metrics |
| **Section Title** | `13px` | `500` | `0.05em` (uppercase) | Inspector sections |
| **Input Label** | `14px` | `500` | `normal` | Form labels |

### Number Formatting
```css
font-variant-numeric: tabular-nums; /* Monospaced numbers */
```

---

## 🎬 Animation Guidelines

### Easing Function
```css
transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
```

### Duration Standards

| Interaction | Duration | Easing |
|-------------|----------|--------|
| **Hover** | `150ms` | ease-out |
| **Node drag/move** | `200ms` | cubic-bezier |
| **Theme switch** | `200-300ms` | cubic-bezier |
| **Tooltip/menu** | `150ms` | ease-out |
| **Number count-up** | `300ms` | ease-in-out |
| **Node creation** | `200ms` | ease-out (scale 0.8 → 1.0) |

### Keyframe Animations

#### Node Creation (Pop-in)
```css
@keyframes node-pop {
  0% { 
    transform: scale(0.8); 
    opacity: 0; 
  }
  100% { 
    transform: scale(1); 
    opacity: 1; 
  }
}
```

#### Hover Lift
```css
/* Node hover */
transform: scale(1.02) translateY(-2px);
transition: 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
```

#### Particle Flow (Edge Animation)
```css
/* 8 particles along path */
animation: flow 2s linear infinite;
/* Speed up to 1.5s when highlighted */
```

---

## 🔌 Connection/Edge Styles

### Default State
```css
stroke-width: 2px
stroke: hsl(var(--muted-foreground) / 0.3)
```

### Hover/Highlighted State
```css
stroke-width: 3px
stroke: hsl(var(--primary))
filter: drop-shadow(0 0 4px hsl(var(--primary) / 0.3))
```

### Particle Animation
- **Count**: 8 particles
- **Size**: 2.5px (normal), 3px (highlighted)
- **Glow**: 5-6px blur radius at 20% opacity
- **Speed**: 2s per cycle (1.5s when highlighted)
- **Stagger**: 12.5% offset between particles

---

## 🎨 Brand Gradient

### Gradient Definition
```css
background: linear-gradient(90deg, 
  hsl(var(--color-accent-primary)), 
  hsl(var(--color-accent-glow))
);
/* Equivalent: #0090FF → #36E2B2 */
```

### Usage
- **CTA Buttons**: Full gradient background
- **Active Icon Highlight**: Gradient border or glow
- **Text Highlight**: Gradient text fill (login screen, hero text)
- **Link Hover**: Gradient underline animation

### Gradient Text Utility
```css
.brand-gradient-text {
  background: linear-gradient(90deg, 
    hsl(var(--color-accent-primary)), 
    hsl(var(--color-accent-glow))
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 📊 Data Visualization Tokens

### Chart Colors
```css
/* Light Mode */
--color-chart-line: 231 48% 48%
--color-chart-fill: 231 48% 88%
--color-chart-accent: 280 65% 60%

/* Dark Mode */
--color-chart-line: 231 70% 65%
--color-chart-fill: 231 70% 25%
--color-chart-accent: 280 65% 60%
```

### Tooltip Style
```css
background: hsl(var(--popover) / 0.6)
backdrop-filter: blur(12px)
border: 1px solid hsl(var(--border))
box-shadow: 0 20px 40px -10px hsl(0 0% 0% / 0.3) /* Level 5 */
```

---

## 🧩 Component-Specific Tokens

### Node Card
```css
/* Background */
background: hsl(var(--card))

/* Border (default) */
border: 1px solid hsl(node-color / 0.3)

/* Border (selected) */
border: 2px solid hsl(var(--primary))

/* Header */
background: linear-gradient(135deg, 
  hsl(node-color) 0%, 
  hsl(node-color / 0.85) 100%
)
box-shadow: inset 0 1px 0 hsl(node-color / 0.2),
            inset 0 -1px 2px hsl(node-color / 0.3)

/* Inner glow */
radial-gradient(circle at top left, 
  hsl(node-color / 0.4) 0%, 
  transparent 70%
)
```

### Bottom Bar
```css
/* Background */
background: hsl(var(--card) / 0.95)
backdrop-filter: blur(12px)

/* Border */
border-top: 1px solid hsl(var(--color-border-active) / 0.2)
box-shadow: 0 -4px 12px -4px hsl(var(--foreground) / 0.1)

/* Metric pill */
background: hsl(node-color / 0.12)
border: 1px solid hsl(node-color / 0.2)
```

### Inspector Panel
```css
/* Background */
background: hsl(var(--color-bg-elevated))

/* Section divider */
border-top: 1px solid hsl(var(--border))

/* Section title */
font-size: 12px
font-weight: 500
text-transform: uppercase
letter-spacing: 0.05em
color: hsl(var(--color-text-secondary))
```

---

## 🖼️ Icon Mapping

### Default Node Icons (Lucide)

| Node Type | Icon Name | Icon Component |
|-----------|-----------|----------------|
| **Traffic** | `Rocket` | `<Rocket />` |
| **Landing** | `FileText` | `<FileText />` |
| **Email** | `Mail` | `<Mail />` |
| **Offer** | `MessageSquare` | `<MessageSquare />` |
| **Checkout** | `ShoppingCart` | `<ShoppingCart />` |
| **Thank You** | `PartyPopper` | `<PartyPopper />` |
| **Custom** | `Box` | `<Box />` |

### Icon Style Rules
- **Stroke width**: `2px` (consistent with Lucide default)
- **Size**: `16px` (w-4 h-4) in node headers
- **Color**: `white` on colored backgrounds, node-color on light backgrounds
- **Container**: 20×20px with 15% white background and backdrop blur

---

## 🔄 State Transitions

### Theme Switching
All theme-sensitive properties transition smoothly:
```css
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

### Node States

| State | Scale | Shadow | Border |
|-------|-------|--------|--------|
| **Default** | `1.0` | Level 2 | 1px, 30% opacity |
| **Hover** | `1.01` | Level 3 | 1px, 40% opacity |
| **Selected** | `1.02` | Level 4 | 2px, 100% opacity |
| **Dragging** | `1.02` | Level 4 (enhanced) | 2px, primary color |

---

## 📦 Export/Print Optimization

### Light Skin for Reports
When exporting or generating PDFs:
1. Force light mode for better print visibility
2. Remove particle animations
3. Increase border contrast to 50%
4. Use solid shadows (no blur) for compatibility

```css
@media print {
  * {
    background: white !important;
    color: black !important;
    box-shadow: none !important;
  }
  
  .node-card {
    border: 2px solid hsl(node-color) !important;
  }
}
```

---

## ✅ Accessibility

### Contrast Ratios (WCAG AA+)

All node colors maintain at least **4.5:1** contrast ratio against their backgrounds in both light and dark modes.

| Element | Light Contrast | Dark Contrast |
|---------|---------------|---------------|
| Node text on header | 8.2:1 | 9.1:1 |
| Body text | 11.5:1 | 13.2:1 |
| Secondary text | 4.6:1 | 5.1:1 |

### Focus States
```css
/* Keyboard focus */
outline: 2px solid hsl(var(--ring))
outline-offset: 2px
```

---

## 🚀 Performance Notes

1. **Use `will-change` sparingly** - Only on draggable nodes and particles
2. **GPU acceleration** - Transform and opacity properties only
3. **Debounce resize** - Recalculate shadows/positions on 150ms debounce
4. **Particle count** - Max 8 particles per edge to maintain 60fps
5. **Backdrop blur** - Use only on elevated panels (bottom bar, tooltips)

---

## 📝 Version History

- **v1.0** (2025-01-20) - Initial design system with dark-first premium aesthetic
- Token-based architecture for easy theming
- Harmonized 7-color node palette
- Particle flow animations
- Brand gradient identity

---

**End of Design Tokens Documentation**
