# Victoria — “The Woman Who Would Not Leave Ben Alone”

## Overview

Playful **coming-soon book microsite** for a humorous Ben & Victoria story. It is a scroll-driven cinematic landing page with a 3D heart particle background, flip-book hero, fake iMessage thread, polaroid gallery, reviews, and a joke notify form.

## Purpose

Entertainment / personal creative project. Showcase interactive web storytelling (Three.js + GSAP) around a fictional book cover and running gag that Victoria texts Ben constantly.

## Features

- Hero with CSS 3D book cover (front/back) and barcode gag
- WebGL background of floating extruded hearts (`main.js` + vendored Three.js)
- Scroll-triggered GSAP animations (reveal, parallax, marquee, phone tilt)
- Fake phone conversation UI
- Photo gallery (“Starring Victoria”)
- Fake 5-star review cards
- “Debt tracker” / siren banner joke section
- Notify CTA that admits there is no real waitlist
- Optional capture helpers in `record.js` / `shoot.js` for recording the experience
- Sample shot/video outputs under `shots/`

## Tech stack

- Static HTML/CSS/JS
- Three.js (`assets/three.module.js`)
- GSAP + ScrollTrigger (vendored under `assets/`)
- ES module `main.js`

## Run / deploy

```bash
# Must be served over HTTP so ES modules resolve
python3 -m http.server 8080
# open http://localhost:8080/
```

Deploy the folder as a static site. No backend required.

## Notes

Satirical fan/joke site. Not a product or SaaS.
