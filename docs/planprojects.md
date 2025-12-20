I really struggle to develop the project section of my template. I played around with the template I already had but finally asked AI to refine it for me using the template as a base.

## Plan for the Projects section (overlay + glassmorphism)

### 1) Structure

- Keep the section header (`[02] Work` + subtitle) separate from the grid.
- Use a Bootstrap grid row with generous gutters and slightly narrower columns so the cards feel “curated” (not full-width).
- Each project card contains:

  - `img.project-image`
  - `div.project-overlay.glass` with:

    - `h3.project-title`
    - `p.project-subtitle`

### 2) Layout + spacing

- Use `row g-5 justify-content-center` for extra breathing room.
- Use `col-12 col-md-6 col-lg-5` so:

  - mobile: stacked
  - tablet: two-up
  - desktop: two-up but narrower than 50% width

### 3) Overlay behavior (hover)

- Default: overlay hidden (`opacity: 0`)
- On hover:

  - overlay fades in (`opacity: 1`)
  - image scales slightly
  - overlay text slides up + fades in for a premium feel

- Mobile/touch: keep the overlay accessible by showing it on focus as well (`:focus-within`), and allow keyboard navigation.

### 4) Glassmorphism styling

- Use `backdrop-filter: blur(...)` with a transparent white layer.
- Add a subtle border + shadow for separation.
- Ensure readable contrast (white text, slightly stronger overlay tint).

### 5) Quality checks

- ✅ Bootstrap grid valid (cols are children of row)
- ✅ No nested columns inside columns
- ✅ Works with GSAP reveal classes (doesn’t depend on GSAP)
- ✅ Accessible: hover + keyboard focus states
- ✅ Performance: no heavy JS; only CSS transitions

---

## Report of the result (what you’ll see)

### Visual outcome

- The project images appear **smaller and more curated**, centered in the container with **more space between them**.
- On hover, a **glassmorphism panel** fades in over the image:

  - a **title** (serif, editorial)
  - a **subtitle** (uppercase, spaced tracking)

- The image subtly zooms in, giving depth without feeling “techy”.

### UX outcome

- Feels premium, minimal, and interactive.
- Clear hierarchy: image first, then the project label appears only when needed.
- Touch/keyboard users can still access the overlay via focus styles.

### Technical outcome

- Clean Bootstrap structure.
- Simple CSS-only interactions (easy to maintain).
- Compatible with your existing GSAP `.gsap-reveal` setup.

---

## Code (Projects section + overlay)

### HTML

```html
<section id="projects" class="py-5 py-lg-6">
  <div class="container">
    <div class="text-center mb-5">
      <h2 class="display-2 fw-bold gsap-reveal">[02] Work</h2>
      <p class="lead text-muted gsap-reveal">A selection of my recent work</p>
    </div>

    <div class="row g-5 justify-content-center">
      <div class="col-12 col-md-6 col-lg-5">
        <a href="#" class="project-card gsap-reveal">
          <img
            src="https://picsum.photos/600/700?random=10"
            alt="Industrial Design project"
            class="project-image"
            loading="lazy"
          />
          <div class="project-overlay glass">
            <h3 class="project-title">Industrial Design</h3>
            <p class="project-subtitle">Product · Manufacturing</p>
          </div>
        </a>
      </div>

      <div class="col-12 col-md-6 col-lg-5">
        <a href="#" class="project-card gsap-reveal">
          <img
            src="https://picsum.photos/600/700?random=11"
            alt="Modern Objects project"
            class="project-image"
            loading="lazy"
          />
          <div class="project-overlay glass">
            <h3 class="project-title">Modern Objects</h3>
            <p class="project-subtitle">Concept · Visual Design</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</section>
```

### CSS (add to `assets/css/index.css`)

```css
/* Projects cards */
.project-card {
  position: relative;
  display: block;
  border-radius: 1.6rem;
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.4s ease;
}

.project-card:hover {
  transform: translateY(-10px);
}

/* Image */
.project-image {
  width: 100%;
  height: auto;
  display: block;
  transform: scale(1);
  transition: transform 0.6s ease;
}

.project-card:hover .project-image {
  transform: scale(1.06);
}

/* Overlay base */
.project-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  opacity: 0;
  transition: opacity 0.45s ease;
}

/* Glassmorphism */
.project-overlay.glass {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

/* Reveal overlay on hover + keyboard focus */
.project-card:hover .project-overlay,
.project-card:focus .project-overlay,
.project-card:focus-visible .project-overlay,
.project-card:focus-within .project-overlay {
  opacity: 1;
}

/* Text animation (premium feel) */
.project-overlay > * {
  transform: translateY(12px);
  opacity: 0;
  transition: all 0.45s ease;
}

.project-card:hover .project-overlay > *,
.project-card:focus .project-overlay > *,
.project-card:focus-visible .project-overlay > * {
  transform: translateY(0);
  opacity: 1;
}

/* Typography */
.project-title {
  font-family: "Instrument Serif", serif;
  font-size: clamp(1.6rem, 2.5vw, 2.2rem);
  color: #ffffff;
  margin: 0 0 0.4rem;
}

.project-subtitle {
  font-family: "Hanken Grotesk", sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}
```
