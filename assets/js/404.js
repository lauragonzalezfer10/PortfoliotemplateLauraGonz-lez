/* =========================================================
   404 DRAWING BACKGROUND (SVG + GSAP)
   - Lets the user draw on a full-screen SVG layer
   - Each stroke becomes an SVG <path>
   - Paths drift upward and fade out automatically
   - Press "C" to clear all drawings
   ========================================================= */

(() => {
  /* ---------------------------
       1) DOM LOOKUP + SAFE EXIT
       --------------------------- */
  const layer = document.getElementById("draw-layer");
  const svg = document.getElementById("draw-svg");

  // If required elements or GSAP are missing, stop (prevents errors in exam/demo)
  if (!layer || !svg || !window.gsap) return;

  /* -----------------------------------------
       2) SVG VIEWBOX = PIXEL COORDINATE SYSTEM
       So pointer coordinates match SVG coordinates
       ----------------------------------------- */
  function syncViewBox() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  }

  // Set initially + keep in sync on resize
  syncViewBox();
  window.addEventListener("resize", syncViewBox);

  /* ---------------------------
       3) CONSTANTS + STATE
       --------------------------- */
  const NS = "http://www.w3.org/2000/svg"; // SVG namespace for createElementNS

  // Drawing state
  let drawing = false; // true while pointer is down
  let pathEl = null; // current active <path>
  let points = []; // points captured for the current stroke

  /* ------------------------------------------
       4) SETTINGS (tweak drawing “feel” here)
       ------------------------------------------ */
  const SETTINGS = {
    minDist: 2.5, // minimum distance between points (performance vs smoothness)
    strokeWidth: 6, // thickness of the stroke
    fadeAfter: 0.6, // seconds to wait after finishing before fade/drift
    driftDuration: 4.0, // drift + fade duration
  };

  /* ------------------------------------------
       5) PATH CONSTRUCTION (smoothing)
       Quadratic smoothing using midpoints
       ------------------------------------------ */
  function buildSmoothPath(pts) {
    // Need at least two points to draw a line
    if (pts.length < 2) return "";

    const p0 = pts[0];
    let d = `M ${p0.x} ${p0.y}`; // Move to first point

    // For each point, create a Q curve to the midpoint of next segment
    for (let i = 1; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];

      // Midpoint between p1 and p2
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;

      // Q = quadratic curve command
      d += ` Q ${p1.x} ${p1.y} ${mx} ${my}`;
    }

    // T = smooth quadratic curve to final point
    const last = pts[pts.length - 1];
    d += ` T ${last.x} ${last.y}`;

    return d;
  }

  /* ------------------------------------------
       6) HELPERS (math + randomness)
       ------------------------------------------ */
  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy); // sqrt(dx^2 + dy^2)
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  /* ------------------------------------------
       7) STROKE LIFECYCLE: start / move / end
       ------------------------------------------ */
  function startStroke(x, y) {
    drawing = true;
    points = [{ x, y }];

    // Create an SVG path for this stroke
    pathEl = document.createElementNS(NS, "path");
    pathEl.setAttribute("fill", "none");
    pathEl.setAttribute("stroke-linecap", "round");
    pathEl.setAttribute("stroke-linejoin", "round");
    pathEl.setAttribute("stroke-width", SETTINGS.strokeWidth);

    // Random-ish neon/pastel hue range (brand-friendly)
    const hue = Math.floor(rand(180, 320));
    pathEl.setAttribute("stroke", `hsl(${hue} 85% 45%)`);
    pathEl.setAttribute("opacity", "0.95");

    // Add path to the SVG
    svg.appendChild(pathEl);

    // Small “ink pop” animation (GSAP)
    gsap.fromTo(
      pathEl,
      { opacity: 0, scale: 0.98, transformOrigin: "50% 50%" },
      { opacity: 0.95, scale: 1, duration: 0.25, ease: "power2.out" }
    );
  }

  function moveStroke(x, y) {
    // Only update while drawing and if a path exists
    if (!drawing || !pathEl) return;

    const last = points[points.length - 1];
    const next = { x, y };

    // Ignore tiny movements to reduce heavy path updates
    if (dist(last, next) < SETTINGS.minDist) return;

    // Add point and rebuild the path string
    points.push(next);
    pathEl.setAttribute("d", buildSmoothPath(points));
  }

  function endStroke() {
    if (!drawing || !pathEl) return;
    drawing = false;

    // If user just tapped (too few points), remove the tiny stroke
    if (points.length < 3) {
      pathEl.remove();
      pathEl = null;
      points = [];
      return;
    }

    // Store current stroke element, then reset active stroke state
    const el = pathEl;
    pathEl = null;
    points = [];

    // Drift upwards + fade out, then cleanup (GSAP timeline)
    gsap
      .timeline({ delay: SETTINGS.fadeAfter })
      .to(el, {
        duration: SETTINGS.driftDuration,
        x: rand(-60, 60), // small sideways drift
        y: rand(-80, -140), // drift upward
        opacity: 0,
        ease: "power1.out",
      })
      .add(() => el.remove()); // remove from DOM at the end
  }

  /* ------------------------------------------
       8) POINTER EVENTS (mouse + touch + pen)
       ------------------------------------------ */
  layer.addEventListener("pointerdown", (e) => {
    // For mouse: only left click draws
    if (e.button !== 0 && e.pointerType === "mouse") return;

    // Capture pointer so we still receive move/up even if pointer leaves layer
    layer.setPointerCapture?.(e.pointerId);

    startStroke(e.clientX, e.clientY);
  });

  layer.addEventListener("pointermove", (e) => {
    moveStroke(e.clientX, e.clientY);
  });

  // End stroke on common stop events
  const stopEvents = ["pointerup", "pointercancel", "pointerleave"];
  stopEvents.forEach((evt) => layer.addEventListener(evt, endStroke));

  /* ------------------------------------------
       9) KEYBOARD SHORTCUT: Press "C" to clear
       ------------------------------------------ */
  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "c") {
      const paths = svg.querySelectorAll("path");

      // Fade out all paths, then remove them
      gsap.to(paths, {
        opacity: 0,
        duration: 0.25,
        stagger: 0.01,
        onComplete: () => paths.forEach((p) => p.remove()),
      });
    }
  });

  /* ------------------------------------------
       10) Fade-in layer on load
       ------------------------------------------ */
  gsap.fromTo(layer, { opacity: 0 }, { opacity: 1, duration: 0.6 });
})();
