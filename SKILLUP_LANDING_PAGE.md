# Skill Up — Landing Page (First Page / Home) — Complete Design Specification

| | |
|---|---|
| **File** | `SKILLUP_LANDING_PAGE.md` |
| **Page** | Public landing page every visitor lands on (before login) |
| **Version** | v1.0 — DRAFT: logo pending; theme is a **test proposal** until the official logo arrives and the palette is re-derived from it |
| **Stack** | Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion + Three.js / @react-three/fiber |

**Target:** a fully animated, 3D, mouse-interactive page that highlights **students first**, since Skill Up is an initiation of Super 60.

---

## 1. Design Foundation (theme — test proposal, re-derive from logo later)

### 1.1 Color Palette

| Token | Value |
|---|---|
| Base / background | `#0A0A1A` (deep indigo-black, dark theme) |
| Surface / cards | `#12122B` with 8% white borders (glass feel) |
| Glass surface | `rgba(255,255,255,0.04)` + backdrop-blur |
| Primary (brand) | `#7C3AED` → `#4F46E5` (violet → indigo gradient) |
| Accent (energy / CTA) | `#FF7A18` → `#FFB800` (orange → gold) |
| Student highlight | `#FFB800` gold (medal-like; students are the heroes) |
| Success / status | `#22C55E` |
| Danger / errors | `#EF4444` |
| Text primary | `#F8FAFC` |
| Text secondary | `#94A3B8` |
| Hairlines / dividers | `rgba(255,255,255,0.08)` |

**Rules**

- Dark theme by default (works best with 3D + glow effects).
- Gradient (primary → accent) only on primary CTAs and hero glow.
- All colors defined as CSS variables / Tailwind tokens in one place (`globals.css` + Tailwind config), so re-theming after the logo arrives = single-file change.
- Contrast must stay WCAG AA (≥ 4.5:1 for body text).

### 1.2 Typography

| Role | Font |
|---|---|
| Display / headings | **Sora** (600/700/800) — fallback: Space Grotesk |
| Body / UI | **Inter** (400/500/600) |
| Code / numbers | **JetBrains Mono** (code-flavored accents) |

Loaded with `next/font/google` (self-hosted, zero layout shift).

**Scale**

- **Hero H1:** `clamp(2.75rem, 7vw, 5.5rem)`, weight 800, line-height 1.05, letter-spacing -0.03em
- **Section H2:** `clamp(2rem, 4vw, 3rem)`, weight 700, tracking -0.02em
- **Section H3:** 1.5rem, weight 600
- **Eyebrow / label:** 0.75rem, uppercase, letter-spacing 0.2em, accent color, always sits above its H2
- **Body:** 1rem–1.125rem, line-height 1.7, text-secondary
- **Buttons:** 0.95rem, weight 600

### 1.3 Logo (placeholder until the asset is provided)

- Preferred: official Skill Up logo as **SVG** (or PNG ≥ 512px).
- Until then: placeholder wordmark **"Skill Up"** (Sora 800) + violet→gold spark glyph + micro-tagline **"An initiative of Super 60"**.
- Sizes: navbar 40px height, footer 56px, favicon from the same asset.
- When the logo arrives: sample its dominant colors → update §1.1 variables.

### 1.4 Button System

| Style | Spec |
|---|---|
| **Primary** | rounded-full, gradient (violet→indigo), white text, padding 14px 32px; hover: lift -2px + glow `0 0 30px rgba(124,58,237,.55)` + gradient shift |
| **Accent** | same shape, orange→gold gradient — **only** for the main conversion CTA ("Register Now") |
| **Ghost** | transparent, 1px border `rgba(255,255,255,.2)`, hover fills 8% white |

All buttons: focus-visible ring (2px accent), active scale 0.97, 150–200ms transitions, optional click ripple.

---

## 2. Navbar (sticky header)

**Layout:** full-width, height 72px (mobile 64px), inner max-width 1280px, horizontal padding 5%.

- **Left:** Logo + wordmark "Skill Up" (hidden-on-mobile micro-tag: "Super 60").
- **Center (desktop):** nav links, hover underline growing from center, animated accent dot on active section (scroll-spy): **Home · About · Program · Gallery · Mentors · Contact** (all in-page anchors; Contact scrolls to footer).
- **Right (desktop):**
  - `[ Login ]` → ghost button → `/login`
  - `[ Register ]` → accent button → `/register`
  - Subtle edition pill badge **"Workshop 2026"** (updates per active edition).

**Mobile:** compact `[ Register ]` button + hamburger icon → full-screen drawer with staggered slide-in links (300ms), then `[ Login ]` (ghost) and `[ Register ]` (accent) stacked.

**Behavior**

- Transparent at `scrollY = 0` (sits over the hero).
- After 40px scroll: `bg rgba(10,10,26,0.75)` + backdrop-blur-xl + bottom hairline; logo shrinks 10%.
- Auto-hide on scroll down, reappear on scroll up.
- Anchor links smooth-scroll with header offset.

---

## 3. Hero (first viewport, min-height 100vh)

- **Eyebrow:** "AN INITIATION OF SUPER 60" (gold, small pulsing dot)
- **H1 line 1:** "Skill Up" (huge, violet→gold gradient text, shimmer sweep)
- **H1 line 2:** "Where students master C++" (solid white)
- **Sub-copy:** "A yearly hands-on C++ workshop — learn from mentors, ship real assignments, climb assessments, and track every mark, every session."
- **CTAs:** `[ Register Now ]` (accent) · `[ Explore the Program ↓ ]` (ghost)

**Visual center — 3D scene (students highlighted)**

- Three.js canvas background: slowly rotating field of floating "code cubes"/wireframe polyhedrons + particle wave at the bottom + soft violet/gold point lights.
- Floating **glass cards** overlaid around the scene (HTML, not WebGL):
  - ⭐ "Rank #1 — Aditya S. · Skill Up 2025" (gold border)
  - ✔ "Assignment submitted" (green tick)
  - 📈 "Attendance 96%"
  - 🏆 "Top performer · Lab A"
  - Cards float gently (sine wave) and follow the mouse with parallax.
- **Student portrait** at the center of the card cluster: circular avatar with gold ring, orbited by achievement chips (photo placeholder until provided).

**Stats strip** (bottom of hero — 4 counters, animate on load): `60+ Students per edition` | `5+ Yearly editions` | `20+ Live sessions` | `100% Mentored` *(placeholder values — admin-configurable later)*

**Scroll indicator:** bobbing chevron/mouse icon, bottom center.

**Micro-details:** radial background glow (violet top-left, gold bottom-right) following the mouse at ~5% intensity · subtle film-grain/noise overlay · headline letters stagger in (fade + rise, 40ms per letter).

---

## 4. Page Sections (scroll order)

### S1. About / Super-60 Introduction (`id="about"`)

- **Left:** eyebrow "WHAT IS SKILL UP", H2 "An initiation of Super 60", 2 paragraphs (yearly C++ workshop; the student → engineer journey), checklist: Learn C++ from scratch · Weekly labs · Real mentor feedback · Performance-based selection.
- **Right:** previous-session photo in a card with tilt-on-hover (placeholder until photos arrive).
- Faint giant watermark text **"SUPER 60"** scrolling behind the section.

### S2. Why Skill Up / What You Get (`id="program"`)

H2 "Everything you need to level up" + 6 feature cards (3×2):

1. Learning Notes & Resources
2. Assignments & Reviews
3. One-on-one Mentor Support
4. Tests & Assessments
5. Attendance & Progress
6. Doubt-Solving, anytime

Card: gradient icon tile, title, 1-line description; hover = 3D tilt + cursor-tracking border glow.

### S3. Student Spotlight (students highlighted — required by brief)

- H2 "Our students take the stage"
- Horizontal carousel of student cards: photo (gold ring), name, lab, one-line achievement, animated progress ring (overall performance %).
- Photos/quotes: placeholders now; real data once assets are provided.

### S4. Previous Skill Up — Gallery (`id="gallery"`) ← photos section

- H2 "Moments from previous Skill Ups"
- Year tabs: `[2023] [2024] [2025]` (filterable, animated underline).
- Layout: masonry grid — 3 cols desktop / 2 cols tablet / 1 col mobile, mixed heights, 16px gap.
- Tile hover: scale 1.05 + grayscale→full color + caption bar slides up ("Skill Up 2025 · Lab A · Inauguration").
- Click → **Lightbox:** fullscreen image, arrow nav, ESC to close, caption + year, swipe on mobile.
- Below grid: `[ View full album → ]` ghost button.
- Until photos are provided: styled placeholders labeled "Photo — Skill Up {year}" so the layout is developable/testable now.

### S5. Mentors Strip (`id="mentors"`)

- H2 "Guided by mentors who've been there"
- Row of avatar chips (photo, name, specialty) as a gentle horizontal marquee that pauses on hover.

### S6. Final CTA Band

- Full-width gradient panel (violet→indigo) + noise overlay.
- H2 "Applications are open for Skill Up 2026"
- Sub: "Limited seats. Selection based on performance."
- `[ Register Now ]` (accent) + `[ Login ]` (ghost-on-dark)
- Optional animated countdown chip: "Closes in XXd XXh".

### S7. Footer

- 4 columns: Logo + tagline | Quick links (About, Program, Gallery, Login, Register) | Contact (email, phone, address) | Social icons.
- Bottom bar: "© 2026 Skill Up · An initiative of Super 60" + Privacy/Terms.

---

## 5. 3D, Animation & Mouse Interaction Spec (the "wow" layer)

**Libraries**

- `three` + `@react-three/fiber` + `@react-three/drei` → hero 3D scene
- `framer-motion` → UI entrance/exit, gestures, carousels, drawer/lightbox
- `gsap` + ScrollTrigger (optional) → parallax watermarks, marquee
- `lenis` (optional) → smooth scrolling

### Mouse integration (global)

1. **Custom cursor:** accent dot (fast) + outlined ring (lag, lerp 0.15); ring expands 2× with label "View"/"Open" over gallery tiles; hidden on touch devices; `mix-blend-mode: difference`.
2. **Hero parallax:** each floating card translates by mouse offset, depth-based (back layers ±8px, front ±24px), spring-eased.
3. **3D scene reacts to pointer:** camera rotates ±4°, lights shift toward the cursor, particle wave ripples under the pointer position.
4. **Cursor spotlight:** soft radial gradient follows the mouse across dark sections (~6% opacity, fixed, `pointer-events: none`).
5. **Card tilt:** on hover of feature/student cards — rotateX/rotateY ±8° from cursor position + counter-shifting icon layer.
6. **Magnetic buttons:** primary CTAs move up to 6px toward the cursor and snap back on leave.
7. **Gallery tiles:** image pans slightly toward the cursor.

### Scroll animations

- Every section: eyebrow → H2 → content stagger (y:40→0, opacity, 80ms stagger, `whileInView` once, 15% margin).
- Watermark words ("SUPER 60", "SKILL UP") move at 0.3× scroll speed.
- Stats counters count up when visible; progress rings animate `stroke-dashoffset` on view.
- Navbar hide/show + blur (see §2).

### 3D scene performance rules

- Canvas `dpr=[1, 1.75]`, antialias on, ≤ ~40k triangles, ≤ 6 lights, 60fps target on integrated GPUs.
- Lazy: `dynamic import` with `ssr: false`; render only while hero is in viewport; dispose geometries/materials on unmount.
- Fallback: static gradient poster if WebGL unavailable or `prefers-reduced-motion` is set.

### Accessibility & responsiveness

- `prefers-reduced-motion`: disable custom cursor, parallax, marquee, letter stagger; keep opacity-only transitions.
- Focus-visible rings everywhere; drawer + lightbox fully keyboard operable (Tab/Esc/arrows); alt text on every photo; contrast ≥ 4.5:1.
- Breakpoints: 360 / 768 / 1024 / 1440. Hero 3D simplifies on mobile (fewer cubes/particles, no card tilt).

---

## 6. Assets Needed (before final theme & content)

1. Official logo (SVG/PNG) → then finalize colors in §1.1
2. Previous Skill Up photos (10–20) each with: year, caption, lab (optional)
3. Student spotlight photos + names + one-line achievements (3–6 students)
4. Mentor photos + names + specialties (3–6)
5. Real stats (students, sessions, editions, mentors)
6. Contact details & social links for the footer

---

## 7. File / Route Plan (implementation later)

- **Route:** `/` → `src/app/page.tsx`
- **Components:** `Navbar`, `Hero`, `HeroScene` (3D), `CustomCursor`, `StatsStrip`, `AboutSection`, `FeatureGrid`, `StudentSpotlight`, `GallerySection`, `Lightbox`, `MentorsStrip`, `CtaBand`, `Footer`
- **Placeholder image slots:** `/public/images/gallery/{year}/{n}.jpg`
- This document is the single source of truth for the landing page.



