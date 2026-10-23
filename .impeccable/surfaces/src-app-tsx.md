---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/components/TrackCard.tsx"]
---

# Sniptape main window

Scope: the single main window (paste, extract, trim, tag, save). Visitor mode: Operate.
Audience and job: a parent on Windows preparing MP3s for a child's audio player SD card; later non-technical public. Task: paste links, trim each track, save.
Benchmarks (craft bar): Spotify / Apple Music for polish and album-art presence; Descript / GarageBand for approachable audio editing.
Anti-goals: childish, hard to use, a Spotify look-alike, glass or decorative gradients.
Unresolved: multi-track export flow (MP3s with ZIP optional), French error mapping, save confirmation wiring; handled in later passes.

## Direction contract

THESIS: The category standard, refined: a familiar track list whose one owned moment is a Descript-grade waveform trim; it refuses the stock shadcn grey utility and any skeuomorphic tape costume.

OWN-WORLD: Tinted warm-neutral grounds layered in three steps, white raised cards with soft one-level shadows, a single coral accent carrying actions, the kept trim region and focus; dark mode mirrors it on deep warm charcoal. Nunito (bundled rounded sans) for every job, tabular figures for time.

STORY: The parent sees at once where to paste, watches each track arrive and its waveform grow in, drags two coral grips to keep the right part, hears it, and saves with a clear confirmation.

FIRST VIEWPORT: Top bar with app name and a wide paste field; track cards in one centred column, each with a large cover, title/artist, kept duration as the headline number, and a full-width waveform with the coral kept region and dimmed cut ends; sticky footer with selection count and the coral primary action at bottom right.

FORM: Category standard (canon), user steer "use standard as a basis but make it a bit more fancy", position: canon exit; seed: 08b6169d2f3cee61. Signature interaction: pill trim grips with live time bubbles, playhead and scrub; motion: waveform bars grow in on ready, grips settle on release, saved check; all off under reduced motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
