---
name: AgroTech Precision
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#40493d'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#707a6c'
  outline-variant: '#bfcaba'
  surface-tint: '#1b6d24'
  primary: '#0d631b'
  on-primary: '#ffffff'
  primary-container: '#2e7d32'
  on-primary-container: '#cbffc2'
  inverse-primary: '#88d982'
  secondary: '#77574d'
  on-secondary: '#ffffff'
  secondary-container: '#fed3c7'
  on-secondary-container: '#795950'
  tertiary: '#0054a7'
  on-tertiary: '#ffffff'
  tertiary-container: '#246dc8'
  on-tertiary-container: '#edf1ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a3f69c'
  primary-fixed-dim: '#88d982'
  on-primary-fixed: '#002204'
  on-primary-fixed-variant: '#005312'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#e7bdb1'
  on-secondary-fixed: '#2c160e'
  on-secondary-fixed-variant: '#5d4037'
  tertiary-fixed: '#d6e3ff'
  tertiary-fixed-dim: '#a9c7ff'
  on-tertiary-fixed: '#001b3d'
  on-tertiary-fixed-variant: '#00468c'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-display:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 24px
---

## Brand & Style

The design system is engineered for the high-stakes environment of industrial agriculture. It balances scientific rigor with natural growth, evoking a sense of "digital organicism." The brand personality is authoritative yet approachable, ensuring that complex environmental data feels manageable and actionable.

The visual style follows a **Modern Corporate** aesthetic with subtle **Tactile** influences. It utilizes structured layouts to convey reliability and "high-tech" precision, while maintaining accessibility through clear visual hierarchies and high-contrast information density. The goal is to provide a "command center" feel that minimizes cognitive load for greenhouse operators.

## Colors

The palette is rooted in the "Growth Green" primary, representing health and vitality. "Earth Brown" serves as the secondary anchor, providing a grounded, professional contrast used for navigation and structural elements. 

- **Primary (Growth Green):** Used for primary actions, success states, and active growth indicators.
- **Secondary (Earth Brown):** Used for heavy UI elements, headers, and grounded navigational components.
- **Functional Spectrum:** Critical Red, Warning Yellow, and Info Blue are strictly reserved for status-driven data (e.g., pH levels out of range, low water tank alerts).
- **Surface Strategy:** A neutral light-gray base (#F5F5F5) reduces eye strain during long monitoring sessions, with pure white (#FFFFFF) used for card surfaces to create distinct content separation.

## Typography

The design system employs a dual-font strategy to optimize for both readability and professional character. **Manrope** is used for headlines to provide a modern, refined tech feel. **Inter** is the workhorse for body copy and data visualization, chosen for its exceptional legibility at small sizes and high-density tabular views.

A specialized `data-display` style is included for real-time sensor readings (Temperature, Humidity, CO2), ensuring that key metrics are the most prominent elements on the dashboard.

## Layout & Spacing

The design system utilizes a **12-column fluid grid** for dashboard views and a **fixed-width container** (1280px) for settings and administrative pages. A strict 4px base unit ensures mathematical harmony across all components.

- **Gutters:** Standardized at 16px to allow for high data density without feeling cluttered.
- **Margins:** 24px outer margins provide a breathable frame for the greenhouse "Command Center."
- **Rhythm:** Vertical spacing between cards should favor 24px (lg) to clearly demarcate different sensor groups or greenhouse zones.

## Elevation & Depth

To maintain a professional and clean look, the design system uses **Tonal Layers** combined with **Low-contrast outlines**. 

- **Level 0 (Background):** #F5F5F5.
- **Level 1 (Cards/Surface):** White (#FFFFFF) with a 1px border in #E0E0E0. No shadow.
- **Level 2 (Hover/Active):** White (#FFFFFF) with a soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)).
- **Level 3 (Modals/Overlays):** White (#FFFFFF) with a more pronounced shadow (0px 8px 24px rgba(0,0,0,0.1)).

This approach ensures the UI feels "flat" and efficient, avoiding unnecessary visual noise while still providing enough depth to signify interactivity.

## Shapes

The design system utilizes **Soft** roundedness (0.25rem / 4px). This subtle rounding strikes a balance between the precision of a technical tool (sharp) and the accessibility of a modern SaaS product (rounded). 

- **Standard components (Buttons, Inputs):** 4px radius.
- **Large components (Cards, Containers):** 8px radius (rounded-lg).
- **Status Pills:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid "Growth Green" with white text. High emphasis.
- **Secondary:** Outlined "Earth Brown" with 1px border. Low emphasis.
- **Icon Buttons:** Ghost style (no background) until hover, then a light gray circular background appears.

### Cards
Cards are the primary container. They must include a `16px` internal padding. Dashboard cards for sensors should feature a "header" area with an icon and the secondary color for the title to establish hierarchy.

### Status Indicators & Chips
- **Indicators:** Small circular dots (8px) preceding text to show live connection status.
- **Chips:** Used for "Active Zones" or "Crop Types." High contrast text on light-tinted backgrounds of the primary or secondary colors.

### Toggle Switches
Used for manual overrides (e.g., Fans ON/OFF). Use "Growth Green" for the active state and a neutral gray for the inactive state to ensure the "ON" status is unmistakable.

### Input Fields
Fields use a 1px border. When focused, the border transitions to "Growth Green" with a 2px stroke. Labels are always positioned above the input in the `label-md` typography style.

### Data Visualizations
Charts should use a simplified color palette matching the functional colors. Line charts for growth trends should default to "Growth Green." Any threshold violations should dynamically change the line color to Red or Yellow in the affected segment.