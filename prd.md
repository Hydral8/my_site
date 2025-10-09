# Sung Jae Personal Website — “Encrypted Reality”

## Overview
A one-page personal website that begins as an **encrypted, interactive experience**.  
Visitors encounter a visually rich, cryptic interface:

- All text rapidly cycles through random glyphs, unreadable at first.  
- A small **moving “bug”** crawls across the screen.  
- The user must **“squash”** the bug with their paddle (cursor mechanic).  
- Once caught, the site **progressively decodes** — text resolves into readable content, visuals stabilize, and Sung Jae’s story, projects, and links are revealed.

**Vibe:** futuristic, dev-aesthetic, sleek, mysterious — not “terminal” style, but more like a **tech art installation**.  
**Background:** deep black-charcoal gradient with soft cyan and magenta highlights.  
**Structure:** single scrolling page divided into sections that appear as content decodes.

---

## Goals
- Create a **unique, interactive identity** experience.  
- Evoke curiosity and discovery before revealing information.  
- Keep **everything on one page** for the first version.  
- Build with **Next.js** to allow future expansion (routing, SEO, API routes).

---

## Core Experience Flow

| Phase | Description | Interaction |
|-------|--------------|-------------|
| **1. Obfuscation** | Page loads; all text rapidly scrambles between random glyphs. A glowing bug roams the screen. | Mouse/touch paddle follows user input. |
| **2. Discovery** | Bug reacts to proximity, dodging slightly to make the interaction feel alive. | User must “squash” the bug (collision detection). |
| **3. Unlock** | On collision, play particle explosion + glitch animation. Begin decoding text gradually (5%/100ms). | Staggered character morph + fade-in. |
| **4. Reveal** | All content becomes visible and stable; sections smoothly appear as user scrolls. | Normal scrolling and hover interactions enabled. |

---

## Visual Design

### Color Palette
- **Background:** `#0B0B0D → #111` gradient  
- **Accents:**  
  - Cyan `#00F5D4`  
  - Purple `#A29BFE`  
  - Soft white `#EAEAEA`  
- **Bug Glow:** neon magenta ↔ green cycling glow

### Typography
- **Primary:** `Inter` or `Space Grotesk`  
- **Encoded Font:** `JetBrains Mono` or `IBM Plex Mono`

### Animation Feel
- Smooth and elegant, not chaotic.  
- Character morph decode → fade transition (Framer Motion staggered).  
- Subtle parallax or chromatic flicker on hover.  
- Canvas-based bug animation overlays the rest of the page.

---

## Sections (All on One Page)

### 🧠 About / History
Brief scrolling timeline:
- RocLab → Remote Roofing → Magi → Queue → Meural → SKMC pivot  
- Render as a horizontal timeline or animated vertical stack that appears as decoding completes.

### 🚀 Projects
Grid or carousel of project cards:
- Each card shows: thumbnail, short tagline, optional “more” expansion.  
- Hover → 3D tilt, glitch ripple on edges.

### 📡 Contact / Socials
Footer area:
- Icons for GitHub, X/Twitter, LinkedIn, Magi, Email.  
- Subtle glowing hover and fade-in animation when revealed.

---

## Technical Implementation

| Component | Approach |
|------------|-----------|
| **Framework** | **Next.js (App Router)** for long-term flexibility, SEO, and deployment simplicity. |
| **Styling** | Tailwind CSS for rapid prototyping and consistent design. |
| **Animation** | Framer Motion + custom Canvas layer for the bug/paddle system. |
| **Scramble Effect** | Custom React hook cycling characters (setInterval or requestAnimationFrame). |
| **Decode Effect** | Character morphing using Framer Motion staggered transitions. |
| **Bug Mechanic** | requestAnimationFrame loop; collision detection via simple circle or bounding-box logic. |
| **Audio (Optional)** | Bitcrushed “glitch” sound cue for bug hit. |
| **Deployment** | Vercel static build (Next.js export or standard App Router deploy). |

---

## MVP Scope (Single Page)
✅ Encrypted landing with scrambling text  
✅ Interactive bug and paddle mechanic  
✅ Gradual decoding sequence revealing all content  
✅ One-page layout: About → Projects → Contact  
✅ Responsive dark theme with minimal framer-motion transitions  

---

## Future Enhancements
- Add **multi-stage unlocks** (e.g., multiple bugs = reveal new sections).  
- Layered **3D transitions** post-unlock (e.g., “world reveal” fold-out).  
- “Quantum” text effect for your name (letters vibrate before stabilizing).  
- Add **/blog**, **/writing**, or **/press** pages later — easy with Next.js routing.  
- Magnetic hover and “lens distortion” effects for cards.

---

## Rapid Timeline
| Day | Deliverable |
|-----|--------------|
| **Day 1** | Next.js + Tailwind setup, scrambled text prototype |
| **Day 2** | Bug canvas with movement + collision logic |
| **Day 3** | Decode animation + staged reveal of content |
| **Day 4** | Layout polish, typography, content filling |
| **Day 5** | Final styling, responsiveness, deploy to Vercel |

---

## Summary
A **one-page encrypted portal** that feels alive —  
Visitors “unlock” Sung Jae’s world through action and curiosity.  
Built for performance and expandability using **Next.js**, ready to evolve into a multi-page portfolio.

---
