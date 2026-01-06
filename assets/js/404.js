(() => {
  const layer = document.getElementById("draw-layer");
  const svg = document.getElementById("draw-svg");
  if (!layer || !svg || !window.gsap) return;

  // Make SVG coordinate system match pixels (so path math is easy)
  function syncViewBox() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  }
  syncViewBox();
  window.addEventListener("resize", syncViewBox);

  const NS = "http://www.w3.org/2000/svg";

  let drawing = false;
  let pathEl = null;
  let points = [];

  // Tweak feel here
  const SETTINGS = {
    minDist: 2.5, // lower = more points = smoother but heavier
    strokeWidth: 6,
    fadeAfter: 0.6, // seconds to wait after stroke ends
    driftDuration: 4.0,
  };

  // Build a smooth-ish path from points using quadratic midpoints
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

  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function startStroke(x, y) {
    drawing = true;
    points = [{ x, y }];

    pathEl = document.createElementNS(NS, "path");
    pathEl.setAttribute("fill", "none");
    pathEl.setAttribute("stroke-linecap", "round");
    pathEl.setAttribute("stroke-linejoin", "round");
    pathEl.setAttribute("stroke-width", SETTINGS.strokeWidth);

    // Pick a nice stroke color (you can lock this to your brand color)
    const hue = Math.floor(rand(180, 320));
    pathEl.setAttribute("stroke", `hsl(${hue} 85% 45%)`);
    pathEl.setAttribute("opacity", "0.95");

    svg.appendChild(pathEl);

    // Nice “ink pop” when starting
    gsap.fromTo(
      pathEl,
      { opacity: 0, scale: 0.98, transformOrigin: "50% 50%" },
      { opacity: 0.95, scale: 1, duration: 0.25, ease: "power2.out" }
    );
  }

  function moveStroke(x, y) {
    if (!drawing || !pathEl) return;

    const last = points[points.length - 1];
    const next = { x, y };

    if (dist(last, next) < SETTINGS.minDist) return;

    points.push(next);
    pathEl.setAttribute("d", buildSmoothPath(points));
  }

  function endStroke() {
    if (!drawing || !pathEl) return;
    drawing = false;

    // If user just tapped, remove tiny strokes
    if (points.length < 3) {
      pathEl.remove();
      pathEl = null;
      points = [];
      return;
    }

    const el = pathEl;
    pathEl = null;
    points = [];

    // Drift + fade + cleanup (GSAP)
    gsap
      .timeline({ delay: SETTINGS.fadeAfter })
      .to(el, {
        duration: SETTINGS.driftDuration,
        x: rand(-60, 60),
        y: rand(-80, -140),
        opacity: 0,
        ease: "power1.out",
      })
      .add(() => el.remove());
  }

  // Pointer events (mouse + touch)
  layer.addEventListener("pointerdown", (e) => {
    // Only draw with primary button/finger
    if (e.button !== 0 && e.pointerType === "mouse") return;

    layer.setPointerCapture?.(e.pointerId);
    startStroke(e.clientX, e.clientY);
  });

  layer.addEventListener("pointermove", (e) => {
    moveStroke(e.clientX, e.clientY);
  });

  const stopEvents = ["pointerup", "pointercancel", "pointerleave"];
  stopEvents.forEach((evt) => layer.addEventListener(evt, endStroke));

  // Clear all drawings with "C"
  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "c") {
      const paths = svg.querySelectorAll("path");
      gsap.to(paths, {
        opacity: 0,
        duration: 0.25,
        stagger: 0.01,
        onComplete: () => paths.forEach((p) => p.remove()),
      });
    }
  });

  // Optional: soften the layer presence on load
  gsap.fromTo(layer, { opacity: 0 }, { opacity: 1, duration: 0.6 });
})();
