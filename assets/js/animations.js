// ==========================================================================
// Doodles
// ==========================================================================

// Floating doodles loop
gsap.utils.toArray(".beyond-doodles .floaty").forEach((el, i) => {
  gsap.to(el, {
    y: -10,
    duration: 1.6 + i * 0.2,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
});

gsap.utils.toArray(".beyond-tilt").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(card, {
      rotateY: px * 6,
      rotateX: -py * 6,
      transformPerspective: 800,
      transformOrigin: "center",
      duration: 0.25,
      ease: "power2.out",
    });
  });

  card.addEventListener("mouseleave", () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.35,
      ease: "power2.out",
    });
  });
});

(() => {
  "use strict";

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
  // Helpers
  // -------------------------
  function refreshScrollTrigger() {
    if (window.ScrollTrigger && !prefersReducedMotion) {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }

  // -------------------------
  // GSAP
  // -------------------------
  function initGSAP() {
    if (!window.gsap) return false;

    if (window.ScrollTrigger && !gsap.core.globals().ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (prefersReducedMotion) return true;

    // Safety: remove ONLY our triggers (do NOT kill other modules)
    if (window.ScrollTrigger) {
      ScrollTrigger.getAll()
        .filter((t) => t.vars && t.vars.id === "site")
        .forEach((t) => t.kill());
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
          id: "site",
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
          id: "site",
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
          id: "site",
          trigger: "body",
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });

    // ABOUT parallax (image wrapper + text block)
    const aboutSection = document.querySelector(".about-section");
    const aboutWrap = document.querySelector(".about-image-wrapper");

    if (aboutSection) {
      if (aboutWrap) {
        gsap.to(aboutWrap, {
          yPercent: -20,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            id: "site",
            trigger: aboutSection,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      }

      const aboutParallaxBlock = aboutSection.querySelector(".about-parallax");
      if (aboutParallaxBlock) {
        gsap.to(aboutParallaxBlock, {
          yPercent: -8,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            id: "site",
            trigger: aboutSection,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      }
    }

    // REVEALS (generic)
    gsap.utils.toArray(".gsap-reveal").forEach((el) => {
      gsap.from(el, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          id: "site",
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
          once: true,
        },
        clearProps: "transform,opacity",
      });
    });

    // PROJECTS: images appear slowly (ONLY images)
    const projectImages = gsap.utils.toArray(
      "#projects .project-card .project-image"
    );

    projectImages.forEach((img) => {
      gsap.set(img, {
        opacity: 0,
        y: 18,
        scale: 1.03,
        filter: "blur(10px)",
      });

      gsap.to(img, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.6,
        ease: "power2.out",
        clearProps: "transform,filter",
        scrollTrigger: {
          id: "site",
          trigger: img,
          start: "top 85%",
          toggleActions: "play none none none",
          once: true,
          invalidateOnRefresh: true,
        },
      });
    });

    ScrollTrigger.refresh();
    return true;
  }

  // -------------------------
  // Theme toggle
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
  // Stickers (overlay-safe)
  // -------------------------
  function initStickers() {
    const section = document.querySelector(".personality-section");
    const title = section?.querySelector(".section-title");
    const layer = section?.querySelector(".stickers-layer");
    const stickers = Array.from(section?.querySelectorAll(".sticker") || []);

    if (!section || !title || !layer || stickers.length === 0) return;
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

      const titleW = title.offsetWidth;
      const titleH = title.offsetHeight;

      const baseMargin = isSmallMobile ? 50 : isMobile ? 60 : 80;

      const minDistance =
        Math.sqrt(Math.pow(titleW / 2, 2) + Math.pow(titleH / 2, 2)) +
        baseMargin;

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

    position();
    loop();

    window.addEventListener(
      "resize",
      debounce(() => {
        position();
        refreshScrollTrigger();
      }, 140)
    );

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
  // Boot
  // -------------------------
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      initThemeToggle();
      initStickers();

      // Retry GSAP init (CDN might load after our script)
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
