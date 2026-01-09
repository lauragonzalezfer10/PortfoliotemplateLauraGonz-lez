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
  // Stickers - ALWAYS WORK (Fixed for Safari)
  // -------------------------
  function initStickers() {
    const section = document.querySelector(".personality-section");
    const title = section?.querySelector(".section-title");
    const stickers = Array.from(section?.querySelectorAll(".sticker") || []);

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
    let isPositioned = false;

    function position() {
      // Force layout recalculation for Safari
      void section.offsetHeight;

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

        // Use translate3d for better Safari performance
        sticker.style.left = `${x}px`;
        sticker.style.top = `${y}px`;
      });

      isPositioned = true;
    }

    function loop() {
      if (!isPositioned) return;

      const t = performance.now() / 1000;

      data.forEach((s) => {
        if (s.popLock) return;

        const phase = (t + s.seed) * ((2 * Math.PI) / s.period);
        const y = Math.sin(phase) * s.amp;
        const x = Math.cos(phase) * (s.amp * 0.5);
        const r = Math.sin(phase) * s.rotAmp;

        // Use translate3d for hardware acceleration (Safari fix)
        s.el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${r}deg)`;
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
          s.el.style.transition = "none";
          s.popLock = false;
        }, 500);
      });
    });

    // Initial position with delay for Safari
    setTimeout(() => {
      position();
      loop();
    }, 100);

    const handleResize = debounce(() => {
      position();
      safeRefresh();
    }, 140);

    window.addEventListener("resize", handleResize);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!rafId && isPositioned) {
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
      ScrollTrigger.config({ ignoreMobileResize: true });
      ScrollTrigger.defaults({ invalidateOnRefresh: true });
    }

    if (prefersReducedMotion) return true;

    if (ctx) ctx.revert();

    ctx = gsap.context(() => {
      // Kill existing triggers
      if (window.ScrollTrigger) {
        ScrollTrigger.getAll()
          .filter((t) => t.vars && t.vars.id === "site")
          .forEach((t) => t.kill(true));
      }

      // Kill tweens
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

      // -------------------------
      // ABOUT parallax
      // -------------------------
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

      // -------------------------
      // Reusable reveal (text, cards, etc.)
      // -------------------------
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

      // -------------------------
      // PROJECTS: Quick fade-in for first 2 images only (Safari compatible)
      // -------------------------
      // PROJECTS: show immediately (no gradual reveal) + faster decode (Safari-friendly)
      const projectImages = Array.from(
        document.querySelectorAll("#projects .project-card .project-image")
      );

      if (projectImages.length) {
        // Never hide them -> they won't "appear gradually"
        gsap.set(projectImages, { clearProps: "opacity,transform,filter" });

        // Make them visible immediately in case any CSS/old tween touched them
        projectImages.forEach((img) => {
          img.style.opacity = "1";
          img.style.visibility = "visible";
          img.style.transform = "none";
          img.style.willChange = "auto";
        });

        // Help them load/render sooner when approaching viewport
        const boost = (img) => {
          try {
            // If you used lazy loading, this makes it eager once we care about it
            if (img.loading === "lazy") img.loading = "eager";

            // Ask browser to decode ASAP (helps Safari)
            if (img.decode) img.decode().catch(() => {});
          } catch (_) {}
        };

        // Boost first ones immediately (above-the-fold of projects)
        projectImages.slice(0, 6).forEach(boost);

        // Boost the rest when close to viewport (fast + light)
        if ("IntersectionObserver" in window) {
          const io = new IntersectionObserver(
            (entries) => {
              entries.forEach((e) => {
                if (e.isIntersecting) {
                  boost(e.target);
                  io.unobserve(e.target);
                }
              });
            },
            { root: null, rootMargin: "600px 0px", threshold: 0.01 }
          );
          projectImages.forEach((img) => io.observe(img));
        }
      }
    });

    safeRefresh();
    return true;
  }

  // -------------------------
  // Boot
  // -------------------------
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      initThemeToggle();

      // Init stickers with delay for Safari
      setTimeout(initStickers, 50);

      // Retry GSAP init
      let tries = 0;
      const tick = () => {
        const ok = initGSAP();
        if (ok) return;
        if (tries++ < 30) setTimeout(tick, 100);
      };
      tick();

      // After all images/fonts load
      window.addEventListener(
        "load",
        () => {
          if (window.ScrollTrigger && !prefersReducedMotion) {
            ScrollTrigger.clearScrollMemory?.();
            safeRefresh();
          }
          // Re-position stickers after everything loads
          setTimeout(() => {
            const section = document.querySelector(".personality-section");
            if (section) {
              window.dispatchEvent(new Event("resize"));
            }
          }, 100);
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
  const scrollBtn = document.querySelector(".hero-scroll-btn");
  if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      const aboutSection = document.querySelector("#about");
      if (aboutSection) {
        aboutSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  }
})();
