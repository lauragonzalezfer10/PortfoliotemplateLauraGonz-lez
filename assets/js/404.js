/* =========================================================
   404 DRAWING BACKGROUND (SVG + GSAP) — MOBILE TOUCH OPTIMIZED
   ========================================================= */

(() => {
  /* ---------------------------
           1) DOM LOOKUP + SAFE EXIT
           --------------------------- */
  const layer = document.getElementById("draw-layer");
  const svg = document.getElementById("draw-svg");

  // If required elements or GSAP are missing, stop
  if (!layer || !svg || !window.gsap) return;

  /* -----------------------------------------
           2) SVG VIEWBOX = PIXEL COORDINATE SYSTEM
           ----------------------------------------- */
  function syncViewBox() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("preserveAspectRatio", "none");
  }

  syncViewBox();
  window.addEventListener("resize", syncViewBox);

  /* ---------------------------
           3) CONSTANTS + STATE
           --------------------------- */
  const NS = "http://www.w3.org/2000/svg";
  const strokes = new Map(); // pointerId -> { pathEl, points }

  /* ------------------------------------------
           4) SETTINGS (mobile-optimized)
           ------------------------------------------ */
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const isSmallScreen = window.innerWidth < 768;

  const SETTINGS = {
    minDist: isMobile ? 1.5 : 2.5,
    strokeWidth: isMobile ? 5 : 6,
    fadeAfter: 0.6,
    driftDuration: 4.0,
  };

  // Extra small screens
  if (window.matchMedia("(max-width: 480px)").matches) {
    SETTINGS.strokeWidth = 4;
    SETTINGS.minDist = 1.2;
  }

  /* ------------------------------------------
           5) PATH CONSTRUCTION (smoothing)
           ------------------------------------------ */
  function buildSmoothPath(pts) {
    if (pts.length < 2) return "";

    const p0 = pts[0];
    let d = `M ${p0.x} ${p0.y}`;

    for (let i = 1; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      d += ` Q ${p1.x} ${p1.y} ${mx} ${my}`;
    }

    const last = pts[pts.length - 1];
    d += ` T ${last.x} ${last.y}`;

    return d;
  }

  /* ------------------------------------------
           6) HELPERS
           ------------------------------------------ */
  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function toSvgPoint(clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;

    const m = svg.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()) : { x: clientX, y: clientY };
  }

  /* ------------------------------------------
           7) STROKE LIFECYCLE
           ------------------------------------------ */
  function startStroke(pointerId, x, y) {
    const points = [{ x, y }];

    const pathEl = document.createElementNS(NS, "path");
    pathEl.setAttribute("fill", "none");
    pathEl.setAttribute("stroke-linecap", "round");
    pathEl.setAttribute("stroke-linejoin", "round");
    pathEl.setAttribute("stroke-width", SETTINGS.strokeWidth);

    const hue = Math.floor(rand(180, 320));
    pathEl.setAttribute("stroke", `hsl(${hue} 85% 45%)`);
    pathEl.setAttribute("opacity", "0.95");

    svg.appendChild(pathEl);

    gsap.fromTo(
      pathEl,
      { opacity: 0, scale: 0.98, transformOrigin: "50% 50%" },
      { opacity: 0.95, scale: 1, duration: 0.25, ease: "power2.out" }
    );

    strokes.set(pointerId, { pathEl, points });
  }

  function moveStroke(pointerId, x, y) {
    const stroke = strokes.get(pointerId);
    if (!stroke) return;

    const { pathEl, points } = stroke;
    const last = points[points.length - 1];
    const next = { x, y };

    if (dist(last, next) < SETTINGS.minDist) return;

    points.push(next);
    pathEl.setAttribute("d", buildSmoothPath(points));
  }

  function endStroke(pointerId) {
    const stroke = strokes.get(pointerId);
    if (!stroke) return;

    const { pathEl, points } = stroke;
    strokes.delete(pointerId);

    if (points.length < 3) {
      pathEl.remove();
      return;
    }

    gsap
      .timeline({ delay: SETTINGS.fadeAfter })
      .to(pathEl, {
        duration: SETTINGS.driftDuration,
        x: rand(-60, 60),
        y: rand(-80, -140),
        opacity: 0,
        ease: "power1.out",
      })
      .add(() => pathEl.remove());
  }

  /* ------------------------------------------
           8) POINTER EVENTS (Works with touch!)
           ------------------------------------------ */
  layer.addEventListener("pointerdown", (e) => {
    // Prevent default to stop scrolling on touch
    e.preventDefault();

    // For mouse: only left click draws
    if (e.pointerType === "mouse" && e.button !== 0) return;

    // Capture pointer
    layer.setPointerCapture?.(e.pointerId);

    const p = toSvgPoint(e.clientX, e.clientY);
    startStroke(e.pointerId, p.x, p.y);
  });

  layer.addEventListener("pointermove", (e) => {
    e.preventDefault(); // Prevent scrolling while drawing

    const p = toSvgPoint(e.clientX, e.clientY);
    moveStroke(e.pointerId, p.x, p.y);
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach((evt) => {
    layer.addEventListener(evt, (e) => {
      endStroke(e.pointerId);
    });
  });

  /* ------------------------------------------
           9) FALLBACK: Touch Events (for older browsers)
           ------------------------------------------ */
  layer.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();

      Array.from(e.changedTouches).forEach((touch) => {
        const p = toSvgPoint(touch.clientX, touch.clientY);
        startStroke(touch.identifier, p.x, p.y);
      });
    },
    { passive: false }
  );

  layer.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();

      Array.from(e.changedTouches).forEach((touch) => {
        const p = toSvgPoint(touch.clientX, touch.clientY);
        moveStroke(touch.identifier, p.x, p.y);
      });
    },
    { passive: false }
  );

  layer.addEventListener("touchend", (e) => {
    Array.from(e.changedTouches).forEach((touch) => {
      endStroke(touch.identifier);
    });
  });

  layer.addEventListener("touchcancel", (e) => {
    Array.from(e.changedTouches).forEach((touch) => {
      endStroke(touch.identifier);
    });
  });

  /* ------------------------------------------
           10) KEYBOARD SHORTCUT: Press "C" to clear
           ------------------------------------------ */
  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "c") {
      strokes.clear();

      const paths = svg.querySelectorAll("path");
      gsap.to(paths, {
        opacity: 0,
        duration: 0.25,
        stagger: 0.01,
        onComplete: () => paths.forEach((p) => p.remove()),
      });
    }
  });

  /* ------------------------------------------
           11) Fade-in layer on load
           ------------------------------------------ */
  gsap.fromTo(layer, { opacity: 0 }, { opacity: 1, duration: 0.6 });
})();
