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
  function safeRefresh() {
    if (!window.ScrollTrigger || prefersReducedMotion) return;
    // Double rAF helps prevent “jump” on refresh after layout changes
    requestAnimationFrame(() => {
      requestAnimationFrame(() => ScrollTrigger.refresh(true));
    });
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
      safeRefresh();
    }

    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);

    toggleBtn.addEventListener("click", () => {
      const current = html.getAttribute("data-bs-theme") || "light";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  // -------------------------
  // Stickers
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
        safeRefresh();
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
  // GSAP + ScrollTrigger
  // -------------------------
  let ctx = null;

  function initGSAP() {
    if (!window.gsap) return false;

    if (window.ScrollTrigger && !gsap.core.globals().ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      // Helps prevent “resize jitter” on mobile address bar
      ScrollTrigger.config({ ignoreMobileResize: true });

      // Important for refresh stability
      ScrollTrigger.defaults({ invalidateOnRefresh: true });
    }

    if (prefersReducedMotion) return true;

    // ✅ Full cleanup (prevents duplicate tweens/triggers after reload or re-init)
    if (ctx) ctx.revert();
    ctx = gsap.context(() => {
      // Kill ONLY our triggers
      if (window.ScrollTrigger) {
        ScrollTrigger.getAll()
          .filter((t) => t.vars && t.vars.id === "site")
          .forEach((t) => t.kill(true));
      }

      // Kill tweens we might be stacking
      gsap.killTweensOf([
        ".hero-bg",
        ".hero .container",
        ".doodle",
        ".about-image-wrapper",
        ".about-parallax",
        ".gsap-reveal",
        "#projects .project-card .project-image",
      ]);

      // -------------------------
      // HERO reveal
      // -------------------------
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

      if (!window.ScrollTrigger) return;

      // -------------------------
      // HERO bg parallax
      // -------------------------
      const heroBg = document.querySelector(".hero-bg");
      if (heroBg) {
        gsap.to(heroBg, {
          yPercent: 50,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            id: "site",
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      }

      // HERO content parallax
      const heroContainer = document.querySelector(".hero .container");
      if (heroContainer) {
        gsap.to(heroContainer, {
          yPercent: 30,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            id: "site",
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      }

      // DOODLES parallax
      gsap.utils.toArray(".doodle").forEach((doodle, i) => {
        const speed = 1 + i * 0.3;
        gsap.to(doodle, {
          yPercent: speed * 50,
          ease: "none",
          immediateRender: false,
          scrollTrigger: {
            id: "site",
            trigger: "body",
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      });

      // ABOUT parallax
      const aboutSection = document.querySelector(".about-section");
      const aboutWrap = document.querySelector(".about-image-wrapper");

      if (aboutSection) {
        if (aboutWrap) {
          gsap.to(aboutWrap, {
            yPercent: -20,
            ease: "none",
            force3D: true,
            immediateRender: false,
            scrollTrigger: {
              id: "site",
              trigger: aboutSection,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.9,
              anticipatePin: 1,
            },
          });
        }

        const aboutParallaxBlock =
          aboutSection.querySelector(".about-parallax");
        if (aboutParallaxBlock) {
          gsap.to(aboutParallaxBlock, {
            yPercent: -8,
            ease: "none",
            force3D: true,
            immediateRender: false,
            scrollTrigger: {
              id: "site",
              trigger: aboutSection,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.9,
              anticipatePin: 1,
            },
          });
        }
      }

      // Reusable scroll-triggered reveal animation
      gsap.utils.toArray(".gsap-reveal").forEach((el) => {
        gsap.from(el, {
          y: 50,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
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

      // PROJECTS: images appear slowly
      const projectImages = gsap.utils.toArray(
        "#projects .project-card .project-image"
      );

      gsap.set(projectImages, {
        opacity: 0,
        y: 18,
        scale: 1.02,
        force3D: true,
        willChange: "transform,opacity",
      });

      ScrollTrigger.batch(projectImages, {
        id: "site",
        start: "top 85%",
        once: true,
        batchMax: 8,
        interval: 0.12,
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: "power3.out",
            stagger: 0.12,
            clearProps: "willChange",
          });
        },
      });
    });

    safeRefresh();
    return true;
  }

  // -------------------------
  // Boot (refresh after assets load)
  // -------------------------
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      initThemeToggle();
      initStickers();

      // Retry GSAP init
      let tries = 0;
      const tick = () => {
        const ok = initGSAP();
        if (ok) return;
        if (tries++ < 30) setTimeout(tick, 100);
      };
      tick();

      // After all images/fonts load, refresh again
      window.addEventListener(
        "load",
        () => {
          if (window.ScrollTrigger && !prefersReducedMotion) {
            ScrollTrigger.clearScrollMemory?.();
            safeRefresh();
          }
        },
        { once: true }
      );

      // Refresh on resize
      window.addEventListener(
        "resize",
        debounce(() => safeRefresh(), 140)
      );
    },
    { once: true }
  );

  // Scroll to discover
  document.querySelector(".hero-scroll-btn")?.addEventListener("click", () => {
    document.querySelector("#about")?.scrollIntoView({
      behavior: "smooth",
    });
  });
})();
