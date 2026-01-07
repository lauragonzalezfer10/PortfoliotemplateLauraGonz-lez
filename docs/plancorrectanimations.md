I wanted to ensure the nimations did not bug the page so I asked for a plan and implementation to ensure it works smoothly:

## Plan to make the animations always work

### 1) Lock the loading order

**Goal:** Your code should only run after (a) the DOM exists and (b) GSAP + ScrollTrigger are available.

- Put vendor scripts (Bootstrap, GSAP, ScrollTrigger) **before** your custom script.
- Use **`defer`** on all scripts _or_ place them all right before `</body>`.
- Initialize everything on **`DOMContentLoaded`** (not `load`), then **retry GSAP init** for a short time in case the CDN is slow.

**Why it prevents bugs:** avoids “undefined gsap/ScrollTrigger”, avoids running before elements exist.

---

### 2) Make initialization idempotent (safe to run twice)

**Goal:** If the script is injected twice, navigation happens, or you re-call init on theme change, you don’t stack animations.

- Keep a global flag: `window.__ANIMS_INIT__ = true`.
- Before creating ScrollTriggers, **kill existing** ones:

  - `ScrollTrigger.getAll().forEach(t => t.kill())`

- Avoid `gsap.killTweensOf("*")` unless you know what else is on the page (it can kill other animations). Prefer killing only what you create.

**Why it prevents bugs:** stops duplicated ScrollTriggers (the #1 cause of jitter + weird scroll behavior).

---

### 3) Use one animation loop for stickers (never one per sticker)

**Goal:** Stickers float smoothly forever without “multiplying” loops on resize.

- Do **one** `requestAnimationFrame` loop that updates every sticker.
- On resize: reposition stickers, **do not start new loops**.
- Pause the loop when the tab is hidden (`visibilitychange`).

**Why it prevents bugs:** multiple RAF loops quickly degrade performance and cause transform conflicts.

---

### 4) Separate responsibilities into 3 modules

Keep code predictable:

- **Theme module**: reads/writes `data-bs-theme`, swaps icons, triggers a refresh.
- **GSAP module**: creates hero reveal + ScrollTriggers, has a `refresh()` helper.
- **Sticker module**: positions + floats stickers, exposes `reflow()` on resize.

**Why it prevents bugs:** fewer accidental cross-effects, easier debugging.

---

### 5) Refresh ScrollTrigger at the right times

ScrollTrigger needs recalculation when layout changes:

Call `ScrollTrigger.refresh()`:

- after theme toggle (fonts, sizes, contrast, spacing can change)
- after images load in sections that affect height (hero, about)
- after resizing (debounced)

Use:

- `invalidateOnRefresh: true` in triggers
- `requestAnimationFrame(() => ScrollTrigger.refresh())` after theme change

**Why it prevents bugs:** prevents wrong trigger start/end positions and “jumping” parallax.

---

### 6) Make reveals “once” and stable

For reveal animations:

- Use `once: true` or `toggleActions: "play none none none"`
- Add `clearProps: "transform,opacity"` to avoid leaving inline styles that later conflict with hover/click transforms.

**Why it prevents bugs:** no repeated reveals, no accumulating inline styles.

---

### 7) Defensive DOM checks everywhere

Before using an element:

- `const el = document.querySelector(...)`
- `if (!el) return;`

For loops:

- if no elements, skip.

**Why it prevents bugs:** prevents null errors from breaking the entire script.

---

### 8) Respect reduced motion globally

If reduced motion is enabled:

- Skip GSAP parallax + reveals
- Skip sticker floating loop
- Keep layout positioning only

**Why it prevents bugs:** avoids animation logic running when it should be off.

---

### 9) Avoid transform fights (very important)

If you animate `transform` in two places, they will conflict:

- Your sticker float loop uses `transform`.
- Your sticker click animation also uses `transform`.

Fix by either:

- click effect uses a CSS class with `scale` applied via nested element (best), or
- temporarily pause float updates for that sticker during click (what we did).

**Why it prevents bugs:** prevents snapping, flicker, “teleporting”.

---

### 10) Add lightweight diagnostics (optional but powerful)

Add a debug mode:

- `console.info("[anim] initGSAP")`
- `console.info("[anim] triggers:", ScrollTrigger.getAll().length)`
- `console.info("[anim] sticker loop running")`

**Why it prevents bugs:** you immediately see duplicates or missing assets.

---

## Report: What causes the “bugs” and how the plan fixes them

### Root cause A — GSAP loads after your code runs

**Symptoms**

- Nothing animates
- Console shows `gsap is undefined` or `ScrollTrigger is undefined`

**Fix**

- Run on `DOMContentLoaded`
- Retry init until gsap exists (short window)
- Or use `defer` for scripts so order is guaranteed

---

### Root cause B — ScrollTriggers get created more than once

**Symptoms**

- Parallax gets stronger after theme toggles
- Scroll feels “sticky” or jittery
- Reveal animations fire multiple times

**Fix**

- Kill existing triggers before creating new ones
- Make init idempotent with a “hasInitialized” flag

---

### Root cause C — Sticker animations multiply over time

**Symptoms**

- Page becomes laggy after resizing
- Stickers start “vibrating” / moving oddly
- CPU usage spikes

**Why it happens**

- Your current code starts a new RAF loop **per sticker**
- On every resize you call `positionStickers()` which calls `animateSticker()` again → new loops stack

**Fix**

- One RAF loop for all stickers
- Resize only repositions, never starts new loops

---

### Root cause D — Layout changes without ScrollTrigger refresh

**Symptoms**

- Triggers fire too early/late
- Parallax looks “off”
- Animations feel inconsistent across reloads

**Fix**

- `ScrollTrigger.refresh()` after theme toggle + resize + key image loads
- `invalidateOnRefresh: true`

---

### Root cause E — Competing transforms

**Symptoms**

- Sticker click effect snaps back weirdly
- Hover/click animations “fight” the float

**Fix**

- Pause float updates during click pop OR use nested elements so float and click transforms don’t overwrite each other

---

## “Always works” checklist (paste into your workflow)

- [ ] All scripts either **deferred** or placed before `</body>`
- [ ] Init runs on **DOMContentLoaded**
- [ ] GSAP init is **idempotent** (kills its own triggers)
- [ ] Stickers use **one RAF loop** total
- [ ] Resize is **debounced** and does not start loops
- [ ] Theme toggle calls **ScrollTrigger.refresh()**
- [ ] DOM checks prevent null crashes
- [ ] Reduced motion respected
- [ ] No two systems write `transform` to the same element at the same time
- [ ] Debug logs confirm trigger counts aren’t growing

---

If you want, I can turn this into a **final “production” main.js structure** with:

- `init()` + `destroy()` methods,
- a debug switch,
- and a clean way to re-init only the parts you need (e.g., refresh triggers without re-running hero).

<script>
  /* =========================================================
     Bulletproof animations + theme toggle + stickers
     - Runs once (DOMContentLoaded)
     - Retries GSAP init if CDN is slow
     - Registers ScrollTrigger once
     - Kills old ScrollTriggers before re-init (no duplicates)
     - Stickers use ONE requestAnimationFrame loop (no stacking)
     - Resize is debounced (no jitter)
     - Theme toggle refreshes ScrollTrigger safely
     - Respects prefers-reduced-motion
     ========================================================= */
  (() => {
    "use strict";

    // Prevent double init if script is injected twice
    if (window.__SITE_ANIMS_INIT__) return;
    window.__SITE_ANIMS_INIT__ = true;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const debounce = (fn, wait = 140) => {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
      };
    };

    // -------------------------
    // GSAP module
    // -------------------------
    function initGSAP() {
      if (!window.gsap) return false;

      // Register ScrollTrigger once
      if (window.ScrollTrigger && !gsap.core.globals().ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
      }

      if (prefersReducedMotion) return true;

      // Safety: remove old triggers if re-initialized
      if (window.ScrollTrigger) {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      }

      // HERO reveal
      const splitEls = document.querySelectorAll(".split-text");
      if (splitEls.length) {
        gsap.from(splitEls, {
          y: "100%",
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.15,
          clearProps: "transform,opacity",
        });
      }

      if (!window.ScrollTrigger) return true;

      // HERO bg parallax
      const heroBg = document.querySelector(".hero-bg");
      if (heroBg) {
        gsap.to(heroBg, {
          yPercent: 50,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }

      // HERO content parallax
      const heroContainer = document.querySelector(".hero .container");
      if (heroContainer) {
        gsap.to(heroContainer, {
          yPercent: 30,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }

      // DOODLES parallax
      gsap.utils.toArray(".doodle").forEach((doodle, i) => {
        const speed = 1 + i * 0.3;
        gsap.to(doodle, {
          yPercent: speed * 50,
          ease: "none",
          scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });

      // ABOUT image parallax
      const aboutWrap = document.querySelector(".about-image-wrapper");
      if (aboutWrap) {
        gsap.to(aboutWrap, {
          yPercent: -20,
          ease: "none",
          scrollTrigger: {
            trigger: ".about-section",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }

      // REVEALS
      gsap.utils.toArray(".gsap-reveal").forEach((el) => {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
          clearProps: "transform,opacity",
        });
      });

      ScrollTrigger.refresh();
      return true;
    }

    function refreshScrollTrigger() {
      if (window.ScrollTrigger && !prefersReducedMotion) {
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }
    }

    // -------------------------
    // Theme toggle module
    // -------------------------
    function initThemeToggle() {
      const html = document.documentElement;
      const toggleBtn = document.getElementById("themeToggle");
      const sunIcon = document.getElementById("icon-sun");
      const moonIcon = document.getElementById("icon-moon");

      if (!toggleBtn) return;

      function setTheme(theme) {
        html.setAttribute("data-bs-theme", theme);
        localStorage.setItem("theme", theme);

        if (sunIcon && moonIcon) {
          if (theme === "dark") {
            sunIcon.classList.add("d-none");
            moonIcon.classList.remove("d-none");
          } else {
            moonIcon.classList.add("d-none");
            sunIcon.classList.remove("d-none");
          }
        }

        // Layout can change (fonts/colors) -> refresh ST
        refreshScrollTrigger();
      }

      const storedTheme = localStorage.getItem("theme") || "light";
      setTheme(storedTheme);

      toggleBtn.addEventListener("click", () => {
        const current = html.getAttribute("data-bs-theme") || "light";
        setTheme(current === "dark" ? "light" : "dark");
      });
    }

    // -------------------------
    // Stickers module (ONE RAF loop)
    // -------------------------
    function initStickers() {
      const section = document.querySelector(".personality-section");
      const title = document.querySelector(".section-title");
      const stickers = Array.from(document.querySelectorAll(".sticker"));

      if (!section || !title || stickers.length === 0) return;
      if (prefersReducedMotion) return;

      const data = stickers.map((el, i) => ({
        el,
        seed: Math.random() * 1000 + i * 7.7,
        amp: 10 + i * 0.6,
        rotAmp: 4,
        period: 3.2 + i * 0.12,
        popLock: false,
      }));

      let rafId = null;

      function position() {
        const centerX = section.offsetWidth / 2;
        const centerY = section.offsetHeight / 2;

        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;

        const titleRect = title.getBoundingClientRect();
        const baseMargin = isSmallMobile ? 50 : isMobile ? 60 : 80;

        const minDistance =
          Math.sqrt(
            Math.pow(titleRect.width / 2, 2) + Math.pow(titleRect.height / 2, 2)
          ) + baseMargin;

        stickers.forEach((sticker) => {
          const angle = parseFloat(sticker.dataset.angle || "0");
          let distance = parseFloat(sticker.dataset.distance || "160");

          if (isSmallMobile) distance *= 0.5;
          else if (isMobile) distance *= 0.65;

          distance = Math.max(distance, minDistance);

          const rad = (angle * Math.PI) / 180;
          const x = centerX + Math.cos(rad) * distance - sticker.offsetWidth / 2;
          const y = centerY + Math.sin(rad) * distance - sticker.offsetHeight / 2;

          sticker.style.left = `${x}px`;
          sticker.style.top = `${y}px`;
        });
      }

      function loop() {
        const t = performance.now() / 1000;

        data.forEach((s) => {
          if (s.popLock) return;

          const phase = (t + s.seed) * ((2 * Math.PI) / s.period);
          const y = Math.sin(phase) * s.amp;
          const x = Math.cos(phase) * (s.amp * 0.5);
          const r = Math.sin(phase) * s.rotAmp;

          s.el.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
        });

        rafId = requestAnimationFrame(loop);
      }

      // Click pop (temporarily locks float)
      data.forEach((s) => {
        s.el.addEventListener("click", () => {
          s.popLock = true;

          s.el.style.transition =
            "transform 0.5s cubic-bezier(0.68,-0.55,0.265,1.55)";
          s.el.style.transform = "scale(1.2) rotate(360deg)";

          setTimeout(() => {
            s.el.style.transition = "transform 0.3s ease";
            s.popLock = false;
          }, 500);
        });
      });

      // Start
      position();
      loop();

      // Resize (debounced) - reposition only
      window.addEventListener(
        "resize",
        debounce(() => {
          position();
          refreshScrollTrigger();
        }, 140)
      );

      // Pause in background tab
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = null;
        } else if (!rafId) {
          rafId = requestAnimationFrame(loop);
        }
      });
    }

    // -------------------------
    // Boot once DOM is ready
    // -------------------------
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        initThemeToggle();
        initStickers();

        // Retry GSAP init (CDN might load slowly)
        let tries = 0;
        const tick = () => {
          const ok = initGSAP();
          if (ok) return;
          if (tries++ < 30) setTimeout(tick, 100);
        };
        tick();
      },
      { once: true }
    );
  })();
</script>
