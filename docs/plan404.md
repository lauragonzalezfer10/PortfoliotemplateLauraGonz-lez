In order to create the 404 page I gave ChatGPT the following prompt:
Give me a plan and a report on an original, clean and aesthetic 404 page with these as inspo
This was its answer:

1. CONCEPT (Core Idea)
   Concept Title:
   “Lost in the Grid.”
   Creative Rationale
   Most 404 pages show a big number. Your inspo uses oversized typography, split grids, optical tension, and minimal palettes.
   This concept turns the “404” into a broken typographic grid that visually communicates “something has slipped out of place.”
   The user lands in a calm, elegant error page that feels intentional, not accidental.

2. VISUAL DIRECTION
   Style Keywords:
   Oversized thin serif + clean sans geometric contrast
   Monochrome palette (black, white, ash grey)
   Micro-motion: slight drift, parallax or distort effect
   Whitespace-heavy to keep it premium
   Abstract shapes (ink blob / clay sculpture / distorted vector)
   Soft glitches that reference the error subtly, not literally
   Typographic Direction
   Main numeral (404):
   A refined serif like Editorial New, GT Alpina, or Cormorant
   Extra large (90–140vh)
   Cut into segments by a grid → “broken layout” metaphor
   Body text:
   Neue Haas Grotesk, Inter, or Helvetica Now
   Keep micro-size (12–14px) to respect hierarchy

3. LAYOUT STRUCTURE
   A. Hero Section (Full Viewport)
   Background: solid white or #F7F7F5
   Center: Oversized “404” spanning entire screen
   The numbers are split by a clean 12-column grid. Misaligned sections imply an elegant ‘error.’
   B. Message Block
   Small, centered micro-copy:
   Page Not Found
   It seems this page slipped out of the grid.
   → CTA: Return Home (simple underline animation)
   C. Motion / Interactive Layer
   Slow x-axis drifting of each 404 segment
   On hover:
   The segments subtly realign → then drift apart again
   OR: a light typographic distortion on scroll
   Everything remains subtle — no gimmicks
   D. Optional Visual Element
   A minimal sculpture or ink blob (like your row 2 inspo).
   Placed behind or between numbers (low opacity, soft shadows).
   This adds artistic identity without clutter.

4. MICRO-COPY OPTIONS
   You can adapt the tone based on your brand:
   Clean + Elegant
   This page is temporarily misplaced.
   Looks like something stepped outside the grid.
   More Playful
   Oops. The page wandered off.
   404: A graceful little mistake.
   Minimal
   Not available.
   Wrong turn.

5. MOTION DESIGN (Simple + Premium)
   Micro-animations
   Slow 1–2px drift loops for each 404 fragment
   Grid lines fading in/out
   CTA underline expands from center-out on hover
   Interaction on Cursor
   Segments move slightly away from cursor → creates spatial tension
   Cursor magnet to “Back Home” button
   Load Animation
   The grid draws itself in 0.7s
   The oversized numerals fade up in staggered timing
   All subtle; avoid heavy glitch unless it’s your brand.

6. TECHNICAL IMPLEMENTATION PLAN
   Front-End Structure
   HTML
   Hero container
   SVG or split divs for each “4” and “0” component
   CTA button
   CSS
   Grid layout for slicing typography
   Mix-blend modes for interesting overlaps
   Keyframe animations for drift
   Prefers-reduced-motion rules
   JS
   Basic GSAP animations (drifting, magnetic button)
   Scroll-trigger if movement reacts to scroll
   Cursor interaction optional

7. ACCESSIBILITY
   A11y message “Page Not Found – Error 404” in ARIA label
   Visible CTA
   Respect prefers-reduced-motion
   High contrast text

8. FINAL DELIVERABLES LIST (for a designer/developer)
   Design Files
   1 hero layout (desktop)
   1 mobile version (simplified, maybe stacked vertical “404”)
   Grid-on and grid-off versions
   Motion storyboard (3–5 frames)
   Assets
   404 typography exported as:
   SVG split panels
   Or variable font option for distortion
   Content
   Final copy
   CTA labels
   Fallback messages
   Code Package
   HTML/CSS structure
   Optional GSAP animation file
   Accessibility notes
   Figma file with grids and spacing

9. SHORT REPORT FOR PRESENTATION
   “Lost in the Grid” — 404 Design Report
   This 404 page uses oversized artistic typography, a minimal color palette, and subtle motion to transform an error state into a sophisticated visual moment. Inspired by experimental grid layouts and editorial-style serifs, the page presents “404” as a fragmented grid composition—communicating the idea of something slipping out of order.
   Clean micro-copy and spacious layout provide clarity without noise, while gentle animations (drifting fragments, underline expansion, or slight distortion) create a premium, modern feel. The design remains highly functional: a central CTA quickly guides users home, accessibility considerations are integrated, and motion is subtle to avoid distraction.
   The result is a refined, elegant, art-driven 404 page that feels intentional, unique, and aligned with contemporary design aesthetics.

   This was the first code it gave me when telling it to implement it

      <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8" />
     <title>404 – Page Not Found</title>
     <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Fonts (serif for 404, sans for UI) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg: #f7f7f5;
      --fg: #111111;
      --muted: #9b9b9b;
      --accent: #111111;
      --grid-line: rgba(0, 0, 0, 0.06);
      --transition-fast: 180ms ease-out;
      --transition-normal: 260ms ease-out;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      height: 100%;
    }

    body {
      font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--fg);
      -webkit-font-smoothing: antialiased;
      display: flex;
      align-items: stretch;
      justify-content: center;
    }

    .page-404 {
      position: relative;
      width: 100%;
      min-height: 100vh;
      display: grid;
      grid-template-rows: auto 1fr auto;
      padding: 24px clamp(20px, 4vw, 48px);
      overflow: hidden;
    }

    /* Top meta bar */
    .page-404__meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
      z-index: 2;
      mix-blend-mode: multiply;
    }

    .page-404__meta span {
      white-space: nowrap;
    }

    .page-404__meta-divider {
      flex: 1;
      height: 1px;
      margin-inline: 16px;
      background: linear-gradient(to right, transparent, var(--grid-line), transparent);
    }

    /* Main layout */
    .page-404__main {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(260px, 360px);
      gap: clamp(24px, 6vw, 64px);
      padding-block: clamp(32px, 8vh, 64px);
      align-items: center;
    }

    @media (max-width: 800px) {
      .page-404__main {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto;
      }
    }

    /* Big 404 layer */
    .page-404__hero {
      position: relative;
      height: clamp(260px, 60vh, 520px);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .page-404__hero-inner {
      position: relative;
      width: 120%;
      max-width: 900px;
      aspect-ratio: 3 / 1;
    }

    .page-404__404 {
      position: absolute;
      inset: 50% auto auto 50%;
      transform: translate(-50%, -50%);
      font-family: "Cormorant Garamond", "Times New Roman", serif;
      font-weight: 500;
      font-size: clamp(14rem, 38vw, 22rem);
      letter-spacing: 0.08em;
      color: var(--fg);
      line-height: 0.75;
      text-align: center;
      white-space: nowrap;
      z-index: 1;
      pointer-events: none;
    }

    /* Abstract sculptural blob */
    .page-404__blob {
      position: absolute;
      inset: 50% auto auto 50%;
      transform: translate(-50%, -50%) rotate(-12deg);
      width: 42%;
      max-width: 360px;
      aspect-ratio: 4 / 3;
      border-radius: 999px;
      background: radial-gradient(circle at 20% 10%, #f7f7f5 0, #f7f7f5 26%, transparent 27%),
                  radial-gradient(circle at 70% 85%, #f7f7f5 0, #f7f7f5 22%, transparent 23%),
                  radial-gradient(circle at 60% 20%, #d7d7d3 0, #a3a39f 40%, #5b5b57 80%);
      filter: blur(0.2px);
      mix-blend-mode: multiply;
      opacity: 0.75;
      z-index: 0;
    }

    /* Grid overlay strips to “break” the 404 */
    .page-404__grid {
      position: absolute;
      inset: 0;
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      pointer-events: none;
      z-index: 2;
    }

    .page-404__grid-strip {
      border-left: 1px solid var(--grid-line);
      border-right: 1px solid var(--grid-line);
      mix-blend-mode: multiply;
      backdrop-filter: blur(2px);
      background: linear-gradient(to bottom,
        rgba(247,247,245,0.5),
        rgba(247,247,245,0.2),
        rgba(247,247,245,0.6)
      );
      opacity: 0.7;
      transform: translateY(0%);
      transition: transform 12s linear, opacity var(--transition-normal);
    }

    .page-404__grid-strip:nth-child(odd) {
      transform: translateY(-6%);
    }

    .page-404__grid-strip:nth-child(even) {
      transform: translateY(4%);
    }

    .page-404__hero:hover .page-404__grid-strip {
      opacity: 0.55;
    }

    .page-404__hero[data-animated="true"] .page-404__grid-strip:nth-child(3n) {
      animation: drift-a 26s linear infinite alternate;
    }

    .page-404__hero[data-animated="true"] .page-404__grid-strip:nth-child(3n+1) {
      animation: drift-b 32s linear infinite alternate;
    }

    .page-404__hero[data-animated="true"] .page-404__grid-strip:nth-child(3n+2) {
      animation: drift-c 28s linear infinite alternate;
    }

    @keyframes drift-a {
      0% { transform: translateY(-8%); }
      100% { transform: translateY(4%); }
    }
    @keyframes drift-b {
      0% { transform: translateY(5%); }
      100% { transform: translateY(-5%); }
    }
    @keyframes drift-c {
      0% { transform: translateY(-3%); }
      100% { transform: translateY(6%); }
    }

    /* Respect reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .page-404__hero[data-animated="true"] .page-404__grid-strip {
        animation: none !important;
        transform: translateY(0);
      }
    }

    /* Content column */
    .page-404__content {
      align-self: center;
      max-width: 360px;
    }

    .page-404__label {
      font-size: 10px;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 10px;
    }

    .page-404__title {
      font-size: clamp(1.6rem, 3vw, 2rem);
      line-height: 1.2;
      margin-bottom: 12px;
      font-weight: 500;
    }

    .page-404__text {
      font-size: 0.9rem;
      line-height: 1.5;
      color: #4b4b4b;
      margin-bottom: 24px;
    }

    .page-404__actions {
      display: inline-flex;
      flex-wrap: wrap;
      gap: 10px 18px;
      align-items: center;
    }

    .btn-primary {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 20px;
      border-radius: 999px;
      border: 1px solid var(--accent);
      background: transparent;
      color: var(--accent);
      font-size: 0.85rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      text-decoration: none;
      overflow: hidden;
      cursor: pointer;
      transition:
        color var(--transition-fast),
        background-color var(--transition-fast),
        transform var(--transition-fast),
        box-shadow var(--transition-fast),
        border-color var(--transition-fast);
    }

    .btn-primary::before {
      content: "";
      position: absolute;
      inset: 0;
      transform: translateX(-120%);
      background: radial-gradient(circle at 0% 50%, rgba(0,0,0,0.08), transparent 55%);
      transition: transform 260ms ease-out;
      pointer-events: none;
    }

    .btn-primary span {
      position: relative;
    }

    .btn-primary:hover {
      background: var(--accent);
      color: var(--bg);
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .btn-primary:hover::before {
      transform: translateX(60%);
    }

    .btn-secondary {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: var(--muted);
      text-decoration: none;
      position: relative;
      padding-bottom: 2px;
    }

    .btn-secondary::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 1px;
      background: var(--grid-line);
      transform-origin: center;
      transform: scaleX(0.6);
      transition: transform var(--transition-normal), background-color var(--transition-normal);
    }

    .btn-secondary:hover::after {
      transform: scaleX(1);
      background: var(--fg);
    }

    /* Footer */
    .page-404__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: var(--muted);
      border-top: 1px solid rgba(0,0,0,0.04);
      padding-top: 12px;
      margin-top: 8px;
      gap: 10px;
      flex-wrap: wrap;
    }

    .page-404__footer a {
      color: inherit;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      padding-bottom: 1px;
      transition: border-color var(--transition-normal);
    }

    .page-404__footer a:hover {
      border-color: var(--grid-line);
    }

    .page-404__badge {
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <main class="page-404" aria-labelledby="page-404-title">
    <!-- Meta header -->
    <header class="page-404__meta">
      <span>ERROR · 404</span>
      <div class="page-404__meta-divider" aria-hidden="true"></div>
      <span>Page not in this grid</span>
    </header>

    <!-- Main area -->
    <section class="page-404__main">
      <!-- Left: Hero / 404 -->
      <div class="page-404__hero" data-animated="true" aria-hidden="true">
        <div class="page-404__hero-inner">
          <div class="page-404__404">404</div>
          <div class="page-404__blob"></div>
          <div class="page-404__grid">
            <!-- 12 strips to “cut” the 404 -->
            <div class="page-404__grid-strip"></div>
            <div class="page-404__grid-strip"></div>
            <div class="page-404__grid-strip"></div>
            <div class="page-404__grid-strip"></div>
            <div class="page-404__grid-strip"></div>
            <div class="page-404__grid-strip"></div>
            <div class="page-404__grid-strip"></div>
            <div class="page-404__grid-strip"></div>
            <div class="page-404__grid-strip"></div>
            <div class="page-404__grid-strip"></div>
            <div class="page-404__grid-strip"></div>
            <div class="page-404__grid-strip"></div>
          </div>
        </div>
      </div>

      <!-- Right: Content / CTA -->
      <div class="page-404__content">
        <p class="page-404__label">Page not found</p>
        <h1 class="page-404__title" id="page-404-title">This page slipped out of the grid.</h1>
        <p class="page-404__text">
          The address you followed doesn’t exist or is no longer available.
          Let’s take you back to a page that does.
        </p>
        <div class="page-404__actions">
          <a href="/" class="btn-primary">
            <span>Back to home</span>
          </a>
          <a href="javascript:history.back()" class="btn-secondary">
            Go to previous page
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="page-404__footer">
      <span class="page-404__badge">404 Layout · Lost in the Grid</span>
      <span>Rendered with care · <a href="/">Return to site</a></span>
    </footer>

  </main>

  <script>
    // Small pointer-based parallax on the hero (kept subtle)
    (function () {
      const hero = document.querySelector(".page-404__hero-inner");
      if (!hero) return;

      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      const maxOffset = 8; // px

      function handleMove(e) {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        const translateX = -(x * maxOffset);
        const translateY = -(y * maxOffset);

        hero.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
      }

      function reset() {
        hero.style.transform = "translate3d(0, 0, 0)";
      }

      hero.addEventListener("mousemove", handleMove);
      hero.addEventListener("mouseleave", reset);
    })();
  </script>
</body>
</html>

I did not really like the result so I told it to make the 404 be very begi, the middle white background and some text smaller, no image and this was its response

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>404 – Page Not Found</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg: #ffffff;
      --fg: #111111;
      --muted: #858585;
      --transition: 200ms ease;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: var(--bg);
      color: var(--fg);
      font-family: "Inter", sans-serif;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      -webkit-font-smoothing: antialiased;
    }

    .wrapper {
      text-align: center;
      max-width: 480px;
    }

    .big-404 {
      font-family: "Cormorant Garamond", serif;
      font-size: clamp(6rem, 20vw, 12rem);
      line-height: 1;
      font-weight: 500;
      margin-bottom: 0.4em;
      color: var(--fg);
    }

    .label {
      font-size: 0.75rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 10px;
    }

    .message {
      font-size: 1rem;
      color: #444;
      margin-bottom: 24px;
      line-height: 1.5;
    }

    .btn {
      padding: 10px 22px;
      border: 1px solid var(--fg);
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.15em;
      color: var(--fg);
      text-decoration: none;
      border-radius: 999px;
      transition: var(--transition);
      display: inline-block;
    }

    .btn:hover {
      background: var(--fg);
      color: var(--bg);
    }
  </style>
</head>

<body>
  <div class="wrapper">
    <div class="big-404">404</div>
    <div class="label">Page Not Found</div>
    <p class="message">
      The page you were looking for doesn’t exist or may have been moved.
    </p>

    <a href="/" class="btn">Back to Home</a>

  </div>
</body>
</html>

I liked it better than the previous one
