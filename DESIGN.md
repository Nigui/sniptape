---
name: Sniptape
description: Paste YouTube links, trim each track on its waveform, save clean MP3s.
colors:
  primary: "oklch(0.52 0.1 165)"
  primary-foreground: "oklch(1 0 0)"
  primary-strong: "oklch(0.42 0.1 165)"
  background: "oklch(0.968 0.006 165)"
  chrome: "oklch(0.988 0.004 165)"
  card: "oklch(1 0 0)"
  foreground: "oklch(0.22 0.015 165)"
  muted: "oklch(0.95 0.008 165)"
  muted-foreground: "oklch(0.49 0.015 165)"
  border: "oklch(0.905 0.008 165)"
  input: "oklch(0.64 0.012 165)"
  destructive: "oklch(0.55 0.2 27)"
  trim-dim: "oklch(1 0 0 / 0.72)"
  primary-dark: "oklch(0.74 0.11 165)"
  primary-foreground-dark: "oklch(0.18 0.03 165)"
  primary-strong-dark: "oklch(0.84 0.077 165)"
  background-dark: "oklch(0.17 0.008 165)"
  chrome-dark: "oklch(0.195 0.008 165)"
  card-dark: "oklch(0.225 0.009 165)"
  foreground-dark: "oklch(0.955 0.006 165)"
  muted-dark: "oklch(0.27 0.01 165)"
  muted-foreground-dark: "oklch(0.73 0.01 165)"
  input-dark: "oklch(0.55 0.01 165)"
  destructive-dark: "oklch(0.7 0.18 25)"
  trim-dim-dark: "oklch(0.225 0.009 165 / 0.75)"
typography:
  display:
    fontFamily: "Nunito Variable, ui-rounded, -apple-system, Segoe UI, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "tnum"
  title:
    fontFamily: "Nunito Variable, ui-rounded, -apple-system, Segoe UI, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.55
  body:
    fontFamily: "Nunito Variable, ui-rounded, -apple-system, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Nunito Variable, ui-rounded, -apple-system, Segoe UI, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Nunito Variable, ui-rounded, -apple-system, Segoe UI, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
    fontFeature: "tnum"
rounded:
  check: "4px"
  md: "0.6rem"
  lg: "0.75rem"
  xl: "1.05rem"
  2xl: "1.35rem"
  pill: "9999px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "44px"
  button-play:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.pill}"
    size: "36px"
  button-ghost:
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "24px"
    padding: "0 8px"
  button-ghost-hover:
    backgroundColor: "{colors.muted}"
  input-paste:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    height: "44px"
    padding: "0 12px 0 40px"
  input-time:
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "28px"
    width: "4.5rem"
  input-inline-title:
    textColor: "{colors.foreground}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: "4px 8px"
  input-inline-title-hover:
    backgroundColor: "{colors.muted}"
  track-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.2xl}"
    padding: "16px"
  cover:
    backgroundColor: "{colors.muted}"
    rounded: "{rounded.xl}"
    size: "80px"
  trim-grip:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.pill}"
    width: "14px"
    height: "36px"
  time-bubble:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  checkbox-checked:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.check}"
    size: "16px"
---

# Design System: Sniptape

## Overview

**Creative North Star: "The Warm Workbench"**

A familiar track-list tool, refined: pine-tinted neutral grounds stacked in three quiet steps, white cards that lift one soft level off the page, and a single pine accent that carries everything the user acts on: the primary action, the play button, the waveform itself, the trim grips, the focus ring. The one owned moment is the trim: a full-width bar waveform with a pine kept region, ends washed back toward the card, and pill grips that show a live time bubble while dragged.

Density is calm and generous: one centred column, large covers, the kept duration set as the headline number of each card. Everything else (labels, secondary text, controls at rest) recedes into faintly green greys so the pine reads as "this is what you can touch or what you keep". Dark mode is a mirror on deep pine-tinted charcoal, not an inversion: the same three-step ground, the pine lifted to a lighter tone that carries dark text.

Rejected by the product brief and absent from the build: glass, decorative gradients, skeuomorphic tape or cassette costume, the stock grey shadcn utility look.

**Key Characteristics:**
- Three-step pine-tinted ground: page, chrome bars, white cards.
- One pine accent for actions, the waveform, the kept region and focus.
- Rounded variable sans (Nunito) with tabular figures everywhere.
- Soft one-level shadow on cards, covers, grips and the paste field; no other elevation.
- Pills for actions and handles; generous rounding on containers.
- Motion only where it confirms state: waveform grow-in, grip settle; all gated on reduced motion.

## Colors

Near-neutral grounds tinted toward the accent's hue (165, chroma 0.004-0.015) carrying one mid-chroma pine.

### Primary
- **Sniptape Pine** (`primary`): the only accent. Fills the primary action button, the play button and checked checkboxes; draws the waveform bars, the trim grip outlines and lines, and the focus ring (`ring` = primary). Also tints the kept region at 10% and text selection at 32%, and sets `accent-color` and `caret-color` at the root. In dark mode it lifts to a light pine (`primary-dark`). Grips and the checked checkbox read it through the `primary-ui` alias, which holds the same value in both themes.
- **Deep Pine** (`primary-strong`): the waveform's played-progress colour, so playback reads as a darker pass over the pine bars. In dark mode it flips to a pale pine (`primary-strong-dark`) so played bars read lighter rather than darker.
- **On-Pine** (`primary-foreground`): text and icons on a pine fill. White in light mode; deep pine ink (`primary-foreground-dark`) in dark mode, where the fill is light.

Measured contrast: pine on white 5.23:1; white on the pine button 5.23:1; dark-mode pine on the dark card 7.76:1; dark text on dark-mode pine 8.51:1.

### Brand alignment
The UI pine is the logo pine: `primary` renders as the symbol colour (#1C7B5A) and `primary-dark` as the light pine used for the symbol on dark grounds (#5FC199). The wordmark ink (#141D19) belongs to the logo files only, not to the UI palette. Logo assets and their usage rules live in `design/logo/final/`.

### Neutral
- **Fog Page** (`background`): the main scroll ground behind the track column.
- **Chrome Fog** (`chrome`): the sticky top bar and sticky footer, one step lighter than the page.
- **Card White** (`card`): track cards, the paste field, grip bodies; the top step of the ground.
- **Pine Ink** (`foreground`): primary text, the waveform playhead (2px), and the inverted time bubble.
- **Pale Sage** (`muted` / `secondary`): ghost-button and inline-field hover, cover placeholder, progress-bar track.
- **Grey Sage** (`muted-foreground`): artist line, labels ("Début", "Fin"), the "sur" total duration, empty-state and helper copy.
- **Hairline** (`border`): the single dividers under the top bar and above the footer.
- **Field Stroke** (`input`): the outline of the small time fields and unchecked checkboxes.
- **Wash** (`trim-dim`): a translucent card-coloured veil laid over the cut ends of the waveform.
- **Alarm Red** (`destructive`): error text only (link parse failures, extraction failures).

### Named Rules
**The One Pine Rule.** Pine marks what the user acts on or keeps, and nothing else. No pine headings, no pine decoration, no second accent hue.

**The Three Grounds Rule.** Depth comes from the ground stack: page (`background`), chrome bars (`chrome`), cards (`card`). A new surface picks one of the three; it does not invent a fourth tint.

**The On-Pine Rule.** Text and icons on a pine fill use `primary-foreground`, in both themes; it is white on the light-mode pine and deep pine ink on the dark-mode pine. Never hard-code either.

## Typography

**Display Font:** Nunito Variable (bundled via @fontsource-variable/nunito), falling back to ui-rounded, -apple-system, Segoe UI, system-ui
**Body Font:** the same family; `--font-heading` aliases `--font-sans`.

**Character:** One rounded humanist sans does every job; hierarchy is size and weight, never a second family. Its soft terminals carry the "approachable, not childish" brief.

### Hierarchy
- **Display** (600, 1.875rem, line-height 1): the kept duration on each track card, the headline number. Tabular.
- **Title** (600, 1.125rem): track titles (as inline editable fields) and the app name in the top bar.
- **Body** (400, 1rem): the paste field text and placeholder, the artist line, the empty state.
- **Body small** (400, 0.875rem): selection count in the footer, error messages, extraction progress text.
- **Label** (400-600, 0.75rem): "Début"/"Fin" labels, time-field values, the "sur" total, ghost "Ici" buttons, and the time bubble (600).

### Named Rules
**The Tabular Time Rule.** `font-variant-numeric: tabular-nums` is set on `body`; every time, count and percentage inherits it so digits never jitter while dragging or playing.

**The One Family Rule.** Nunito Variable for everything. Weight 600 is the ceiling; emphasis comes from size, not heavier weights.

## Layout

A single centred column, `max-width: 56rem` (Tailwind `max-w-4xl`), with 24px side gutters, shared by the top bar, the track list and the footer so their edges align. The top bar and footer are sticky and full-bleed in `chrome`, separated from the page by one hairline each. Track cards stack with a 16px gap and 24px vertical page padding; the empty state sits centred with 64px vertical padding.

Inside a track card: a header row (80px cover, title/artist stack, kept duration right-aligned, checkbox and remove at top right) with 16px gaps, then a trim row (36px round play button beside the full-width waveform, 16px gap), then a time row with start field at left, helper copy centred and end field at right. The waveform is 88px tall, 3px bars with 2px gaps and 3px bar radius.

The primary action lives at the bottom right of the sticky footer; the selection count sits at bottom left.

## Elevation & Depth

Hybrid: tonal layering does most of the work (the three grounds), and one soft two-layer shadow lifts the things you handle. There is exactly one shadow token, `--card-shadow` (exposed as Tailwind `shadow-card`), defined per theme.

### Shadow Vocabulary
- **Card lift** (light: `0 1px 2px oklch(0.3 0.02 165 / 0.06), 0 8px 24px -12px oklch(0.3 0.02 165 / 0.18)`; dark: `0 1px 2px oklch(0 0 0 / 0.3), 0 10px 28px -14px oklch(0 0 0 / 0.6)`): track cards, cover art, the paste field, trim grips.

### Named Rules
**The One Lift Rule.** One shadow level only. Nothing stacks above a card except the grip and the time bubble, and neither gets a stronger shadow.

## Shapes

Generous, soft rounding derived from one base radius (`--radius: 0.75rem`) with multiplier steps. Containers round most (cards 1.35rem, covers and the paste field 1.05rem), small fields least (time fields and the kept-region tint 0.6rem). Everything the user presses or drags as a single object is a full pill: the primary action, the play button, the trim grips, the time bubble. Borders are rare: hairline dividers on chrome bars, a thin stroke on time fields, and a 2px pine outline on grips. The paste field and title fields are borderless.

## Components

### Buttons
Pills for primary actions, quiet ghosts for secondary ones.
- **Shape:** primary actions and play are full pills (`rounded.pill`); stock shadcn buttons keep `rounded.lg`.
- **Primary:** pine fill, `primary-foreground` text, 44px tall, 24px horizontal padding, leading 16px icon (download, or spinning loader while busy).
- **Play:** 36px pine circle with a filled play/pause glyph in `primary-foreground`.
- **Hover / Focus:** focus shows a 3px ring at 50% pine; active nudges down 1px; disabled drops to 50% opacity. Hover switches the fill to Deep Pine (`primary-strong`): darker in light mode (white label 7.9:1), lighter in dark mode (dark label 11.8:1).
- **Ghost:** no fill at rest, `muted` fill on hover. Used for the remove (X) icon button and the "Ici" set-to-playhead buttons.

### Cards / Containers
- **Corner Style:** `rounded.2xl` (1.35rem).
- **Background:** `card`.
- **Shadow Strategy:** card lift (see Elevation).
- **Border:** none.
- **Internal Padding:** 16px, 16px vertical gap between rows.

### Inputs / Fields
- **Paste field:** borderless `card` surface with card lift, `rounded.xl`, 44px tall, 16px text, link icon inset at left in `muted-foreground`. The one prominent field.
- **Inline title / artist:** transparent and borderless at rest so they read as text; `muted` fill on hover, `card` fill and pine ring on focus. Long titles truncate with an ellipsis.
- **Time fields:** 28px tall, 4.5rem wide, `rounded.md`, centred label-size text, `input` stroke. Arrow keys step 0.1 s, Shift steps 1 s.
- **Focus:** pine border and 3px pine ring at 50% everywhere.
- **Error:** `destructive` text below the field or in the card; no red boxes.

### Checkbox
16px, `rounded.check` (4px), `input` stroke at rest; checked fills pine with a `primary-foreground` check. Its hit area is extended by a pseudo-element.

### Progress
4px-6px pill track in `muted` with a pine fill; shown with a right-aligned "Extraction… N %" label while a track loads.

### Waveform Trim (signature)
The owned moment of the product.
- **Waveform:** 88px tall bar waveform drawn in pine, played portion in `primary-strong`, 2px `foreground` playhead.
- **Kept region:** a 10% pine tint behind the bars between the grips, `rounded.md`.
- **Cut ends:** veiled by `trim-dim` so cut audio stays visible but clearly discarded.
- **Grips:** 14x36px pill, `card` body, 2px pine outline, card lift, on a 2px pine vertical line; 20px invisible drag hit zone (`ew-resize`).
- **Time bubble:** inverted pill (`foreground` fill, `background` text, label 600) above each grip, visible only while dragging, fades in 150ms; clamps to the edge near the ends.
- **Motion:** bars grow in from 15% height on ready (520ms, `cubic-bezier(0.16, 1, 0.3, 1)`); a released grip settles from 125% scale (320ms, same curve). Both only under `prefers-reduced-motion: no-preference`.

### Top Bar and Footer
Sticky `chrome` bars with a hairline. The top bar carries the app mark in pine with the name in title type, then the paste field. The footer carries the selection count and the primary action.

## Do's and Don'ts

### Do:
- **Do** route every colour through the CSS custom properties in `src/index.css`; both themes are defined there and components never hard-code a theme.
- **Do** keep pine for actions, the waveform, the kept region, checked state and focus only.
- **Do** use `shadow-card` for anything that lifts off the ground, and nothing stronger.
- **Do** shape pressable single objects (primary action, play, grips, bubbles) as full pills.
- **Do** put text on pine in `primary-foreground`, which resolves to white in light mode and deep pine ink in dark mode.
- **Do** gate every animation behind `prefers-reduced-motion: no-preference`, using `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Do** read waveform colours from the CSS variables at runtime and recolour on scheme change, as the track card does.

### Don't:
- **Don't** add glass, backdrop blur or decorative gradients.
- **Don't** dress the app as a tape or cassette.
- **Don't** introduce a second accent hue or a fourth ground tint.
- **Don't** fall back to the stock grey shadcn look (ring-outlined cards, neutral-grey base) for new surfaces.
- **Don't** add a second display face; Nunito Variable carries every role.
