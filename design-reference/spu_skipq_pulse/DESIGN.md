---
name: SPU SkipQ Pulse
colors:
  surface: '#f8f9ff'
  surface-dim: '#d6dae4'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4fd'
  surface-container: '#eaeef8'
  surface-container-high: '#e4e8f2'
  surface-container-highest: '#dee2ec'
  on-surface: '#171c23'
  on-surface-variant: '#5a3f47'
  inverse-surface: '#2c3138'
  inverse-on-surface: '#edf1fb'
  outline: '#8e6f77'
  outline-variant: '#e2bdc7'
  surface-tint: '#b90064'
  primary: '#b90064'
  on-primary: '#ffffff'
  primary-container: '#e6007e'
  on-primary-container: '#ffffff'
  inverse-primary: '#ffb0c9'
  secondary: '#b52603'
  on-secondary: '#ffffff'
  secondary-container: '#fd5835'
  on-secondary-container: '#570c00'
  tertiary: '#00677d'
  on-tertiary: '#ffffff'
  tertiary-container: '#00829d'
  on-tertiary-container: '#000609'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e2'
  primary-fixed-dim: '#ffb0c9'
  on-primary-fixed: '#3e001e'
  on-primary-fixed-variant: '#8e004b'
  secondary-fixed: '#ffdad2'
  secondary-fixed-dim: '#ffb4a3'
  on-secondary-fixed: '#3d0600'
  on-secondary-fixed-variant: '#8c1900'
  tertiary-fixed: '#b3ebff'
  tertiary-fixed-dim: '#4cd6fb'
  on-tertiary-fixed: '#001f27'
  on-tertiary-fixed-variant: '#004e5f'
  background: '#f8f9ff'
  on-background: '#171c23'
  surface-variant: '#dee2ec'
typography:
  display-queue:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 52px
    letterSpacing: -0.03em
  display-queue-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 38px
    fontWeight: '800'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
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
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-badge:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '800'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
  screen-padding-mobile: 1rem
  screen-padding-tablet: 1.5rem
  bottom-sheet-inset: 5.5rem
---

## Brand & Style

The design system targets Sripatum University (SPU) students, faculty, and campus vendors navigating high-density lunch rushes. The aesthetic fuses energetic campus vitality with high-efficiency transactional utility. It evokes a feeling of swiftness, hunger satisfaction, and zero-anxiety waiting: students glance at their screens and instantly comprehend their food status without breaking conversational flow or class commutes.

The visual style blends **Modern Campus Vibrancy** with **Tactile Utility**. High-energy chromatic focal points (SPU signature dynamic magenta and appetizing warm coral) sit on top of crisp, hyper-clean slate-white canvases. Interface modules prioritize rapid visual triage: large-type queue tokens, food-forward photography containers, and distinct status badges designed for readability from arm’s length under direct campus sunlight.

## Colors

The palette leverages high-chroma university identity accents anchored against neutral, low-strain backdrops:

- **Primary (`#E6007E` - SPU Dynamic Magenta):** Drives core navigational emphasis, master calls-to-action (e.g., "สั่งอาหารทันที / Order Now"), and main active queue tokens.
- **Secondary (`#FF5A36` - Coral Flame):** Serves food-appeal triggers, real-time preparation timers, spicy/special tag highlights, and secondary ordering pathways.
- **Tertiary (`#00B4D8` - Cyan Refresh):** Applied strictly to information highlights, estimated prep time callouts, and location/canteen zone designations.
- **Neutral (`#1E232A` - Deep Obsidian Slate):** Deep charcoal used for ultra-high-contrast typography and icon glyphs, steering clear of harsh pure black to maintain softness on mobile OLED panels.
- **Surface & Backgrounds:**
  - `surface-canvas`: `#F8F9FC` (Cool crisp off-white for full-page scaffolding).
  - `surface-card`: `#FFFFFF` (Pure pristine white for elevation over canvas).
  - `surface-subtle`: `#EDF1F7` (Divider lines, inactive chips, disabled states).

### Status System (Queue States)
Queue-specific semantic pairs are tuned for unambiguous glanceability:
- **รอคิว (Waiting / In Queue):** Amber Orange (`#D97706` text / `#FEF3C7` background).
- **กำลังปรุง (Cooking / In Progress):** SPU Magenta/Coral Blend (`#E6007E` text / `#FDF2F8` background with active pulsing indicator).
- **พร้อมรับ (Ready for Pickup):** Vivid Emerald (`#059669` text / `#D1FAE5` background with bold green outline).
- **ยกเลิก / ปิดร้าน (Cancelled / Closed):** Slate Muted (`#64748B` text / `#F1F5F9` background).

## Typography

The typography pairing relies on **Plus Jakarta Sans** for charismatic, energetic numeric headlines, branding, and status callouts, paired with **Inter** for dense transactional UI data, Thai-friendly metric alignment, and multi-line item breakdowns. 

For bilingual Thai/English campus usage, the system seamlessly maps to system sans-serif fonts such as Prompt or Kanit at runtime without structural shifts:
- `display-queue` is exclusively deployed for queue numbers (e.g., `#A-042`) and checkout grand totals to ensure readability across dining hall crowds.
- Headings maintain compact line-height ratios (`1.15` - `1.25`) to prevent cards from becoming overly tall on standard 390px mobile viewports.
- Thai diacritics are accommodated by specifying a baseline line-height safety net of at least `1.4` on all `body` copy.

## Layout & Spacing

The layout operates on an **8pt modular grid** with a tight **4pt baseline sub-grid** for micro-labels, queue badges, and tag chips. 

- **Mobile Viewport Structure (< 600px):** Single-column dynamic scroll with a fixed horizontal screen margin of `16px` (`space-md`). Food stall listings and menu arrays operate as an asymmetrical card stream with `12px` gaps between interactive elements.
- **Tablet / Responsive Kiosk Viewport (600px - 1024px):** 2-column or 3-column masonry grid for menu browsing, anchored by a persistent right-hand sticky drawer for order tracking and live tray status.
- **Safe Zone & Persistent Bar Offset:** Bottom screens enforce a mandatory `bottom-sheet-inset` of `88px` (`5.5rem`) above the system navigation bar to accommodate the floating real-time queue pill without obscuring checkout buttons or item lists.

## Elevation & Depth

Visual hierarchy uses **crisp daylight layering** rather than generic dark drop shadows. Surfaces communicate urgency and active ordering through tonal lifts:

1. **Level 0 (Base Canvas):** Background color `#F8F9FC`, completely flat.
2. **Level 1 (Menu Cards & Stall Tiles):** White surfaces resting on canvas using an ultra-subtle border (`1px solid rgba(226, 232, 240, 0.8)`) paired with an ambient tinted drop: `0px 4px 12px -2px rgba(30, 35, 42, 0.04)`.
3. **Level 2 (Interactive Floating Trackers & Modals):** Reserved for the floating quick-order tracking pill and bottom sheets. Casts a vibrant ambient glow tinted with the primary hue: `0px 12px 32px -4px rgba(230, 0, 126, 0.18), 0px 4px 12px -2px rgba(30, 35, 42, 0.06)`.
4. **Level 3 (Urgent Callouts & Ready-for-Pickup Alerts):** Full-bleed floating notifications use a high-contrast shadow with soft green or magenta rim lighting: `0px 16px 40px -8px rgba(5, 150, 105, 0.24)`.

## Shapes

The interface adopts a **Rounded (`2`)** geometry profile to communicate youthfulness, friendliness, and tactile comfort without descending into excessive pill bubble distortion.

- Standard cards, vendor thumbnails, and bottom modal sheets employ `16px` (`rounded-lg` / `1rem`).
- Secondary interactive surfaces (inputs, item steppers, filter cards) apply `12px` (`0.75rem`).
- Status tags, counter badges, and key transaction buttons utilize full stadium pills (`9999px`) to immediately separate actionable elements and status states from structural content cards.
- Imagery containers within cards feature matched interior border-radii (`12px`) inset symmetrically against the parent card's `16px` frame.

## Components

### 1. Buttons
- **Primary Order Button:** High-visibility pill container with SPU Magenta (`#E6007E`) gradient shifting slightly to Coral Flame (`#FF5A36`). Heights are standardized to 48px or 52px for fat-finger speed tap capability on the run. Uses `label-lg` white bold typography.
- **Fast-Add (+) Stepper Button:** Circular (36px x 36px) high-contrast button placed directly on food cards with an energetic bounce transition upon tap (`scale: 0.92` active state).

### 2. Food Stall & Menu Cards
- **Stall Card:** Full-width container with 16:9 or 21:9 banner image, live walk-up queue estimate chip (e.g., "⚡ รอ ~5 นาที") overlapping the image corner, stall logo avatar, and active tags (e.g., "ฮาลาล", "ตามสั่ง").
- **Dish Row Card:** Horizontal split with 96x96px rounded square image on the right, item title and optional dietary badges on the left, and a baseline row featuring price in high-contrast neutral slate next to a one-tap `+ เพิ่ม` button.

### 3. Status Pills & Queue Badges
- Capsule format with minimum height of 24px and horizontal padding of 10px.
- Uses `label-badge` all-caps styling.
- "กำลังปรุง" includes a micro pulsing dot (4px) in secondary coral.
- "พร้อมรับ" triggers a full card border transition to emerald green with an animated sound/haptic wave indicator.

### 4. Floating Quick Order Tracking Bar
- A persistent floating pill docking 16px above the screen bottom safe area.
- Background: Obsidian Slate (`#1E232A`) with 92% opacity and `backdrop-blur(12px)`.
- Left: Circular badge containing live queue number (e.g., `A42`).
- Center: Shop name, item counter, and real-time status micro-pill.
- Right: Tap chevron opening the full-screen pickup QR verification pass.

### 5. Chips & Filters
- Compact horizontal swipe list for quick campus canteen selection (e.g., "โรงอาหาร อาคาร 10", "อาคาร 11 Sky Lounge").
- Unselected state uses transparent slate outline with subtle gray fill; selected state uses solid SPU Magenta with white text and no border.

### 6. Inputs & Search Fields
- 48px height with soft light-gray background (`#F1F5F9`), zero aggressive borders until focused.
- Focused state transitions to a 2px outer ring in primary magenta with instant icon color match.