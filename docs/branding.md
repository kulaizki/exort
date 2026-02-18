# Exort — Branding Guide

## Colors

### Primary Palette (Gold)

| Token         | Hex       | Usage                                      |
|---------------|-----------|---------------------------------------------|
| `gold`        | `#FFB800` | Primary accent, CTAs, active states         |
| `gold-light`  | `#FFCC40` | Hover states, highlights                    |
| `gold-dark`   | `#CC9400` | Pressed states, borders on dark backgrounds |

### Neutrals (Dark Theme)

| Token         | Hex       | Usage                                      |
|---------------|-----------|---------------------------------------------|
| `neutral-950` | `#0A0A0A` | Page background                             |
| `neutral-900` | `#141414` | Card / surface background                   |
| `neutral-800` | `#1F1F1F` | Elevated surfaces, sidebar, modals          |
| `neutral-700` | `#2E2E2E` | Borders, dividers                           |
| `neutral-400` | `#9CA3AF` | Secondary text, placeholders                |
| `neutral-200` | `#E5E5E5` | Primary text                                |
| `white`       | `#FFFFFF` | Headings, emphasis text                     |

### Semantic

| Token    | Hex       | Usage              |
|----------|-----------|--------------------|
| `error`  | `#EF4444` | Errors, blunders   |
| `warn`   | `#F59E0B` | Warnings, mistakes |
| `success`| `#22C55E` | Success, accuracy  |
| `info`   | `#3B82F6` | Info, links        |

## Typography

**Font:** Manrope (self-hosted, `/static/fonts/manrope/`)

| Weight    | File                  | CSS Value | Usage                        |
|-----------|-----------------------|-----------|------------------------------|
| Regular   | Manrope-Regular.ttf   | 400       | Body text, descriptions      |
| Medium    | Manrope-Medium.ttf    | 500       | Labels, nav items, metadata  |
| SemiBold  | Manrope-SemiBold.ttf  | 600       | Subheadings, card titles     |
| Bold      | Manrope-Bold.ttf      | 700       | Headings, emphasis, CTAs     |

### Scale

| Class       | Size   | Line Height | Usage              |
|-------------|--------|-------------|--------------------|
| `text-xs`   | 12px   | 16px        | Captions, badges   |
| `text-sm`   | 14px   | 20px        | Secondary text     |
| `text-base` | 16px   | 24px        | Body               |
| `text-lg`   | 18px   | 28px        | Card titles        |
| `text-xl`   | 20px   | 28px        | Section headings   |
| `text-2xl`  | 24px   | 32px        | Page headings      |
| `text-3xl`  | 30px   | 36px        | Hero / dashboard   |

## Border Radius

**Extra small only** — modern, sharp, minimal.

| Token          | Value | Usage                       |
|----------------|-------|-----------------------------|
| `rounded-sm`   | 4px   | Buttons, inputs, badges     |
| `rounded`      | 6px   | Cards, modals, dropdowns    |
| `rounded-full` | 9999px| Avatars, status indicators  |

No `rounded-lg`, `rounded-xl`, or `rounded-2xl` in this design system.

## Shadows

Minimal shadows on dark backgrounds — rely on border/surface contrast instead.

| Token        | Value                              | Usage            |
|--------------|------------------------------------|------------------|
| `shadow-sm`  | `0 1px 2px rgba(0, 0, 0, 0.3)`    | Cards, dropdowns |
| `shadow-md`  | `0 4px 12px rgba(0, 0, 0, 0.4)`   | Modals, popovers |

## Spacing

Use Tailwind 4 defaults (4px base). Consistent spacing scale:
- `gap-2` (8px) — between inline elements
- `gap-3` (12px) — between form fields
- `gap-4` (16px) — between cards, sections
- `p-4` (16px) — card padding
- `p-6` (24px) — page/section padding

## Component Patterns

### Buttons

```
Primary:   bg-gold text-neutral-950 font-semibold rounded-sm hover:bg-gold-light
Secondary: bg-neutral-800 text-neutral-200 font-medium rounded-sm hover:bg-neutral-700 border border-neutral-700
Ghost:     bg-transparent text-neutral-400 font-medium hover:text-neutral-200
Danger:    bg-red-500/10 text-red-400 font-medium rounded-sm hover:bg-red-500/20
```

### Cards

```
bg-neutral-900 border border-neutral-700 rounded p-4
```

### Inputs

```
bg-neutral-900 border border-neutral-700 rounded-sm text-neutral-200 placeholder:text-neutral-400
focus:border-gold focus:ring-1 focus:ring-gold/20
```

### Sidebar

```
bg-neutral-800 border-r border-neutral-700 w-64
```

## Dark-Only

Exort is dark theme only. No light mode toggle needed for v1.
