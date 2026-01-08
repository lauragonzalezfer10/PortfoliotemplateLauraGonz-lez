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

// Subtle “tilt” on hover (JS-free alternative exists, but this feels premium)
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
