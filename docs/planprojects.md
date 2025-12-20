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

I really liked th eresult but I wanted to change the layout from two to three so I asked ChatGPT for a new plan.

Here’s a **clear, practical plan** to move your Projects section from **two columns to three columns**, written so you can use it as **design documentation** or a **project report note**.

---

## Plan: Transition from Two-Column to Three-Column Layout (Projects Section)

### 1) Objective

Increase visual density and portfolio coverage by displaying **three project cards per row** on large screens, while:

- Maintaining readability
- Preserving the glassmorphism overlay effect
- Keeping strong hierarchy and spacing
- Ensuring responsiveness across devices

---

### 2) Grid Strategy (Bootstrap-based)

#### Column distribution

| Breakpoint         | Columns per row | Reason                    |
| ------------------ | --------------- | ------------------------- |
| Mobile (`<768px`)  | 1               | Legibility, touch comfort |
| Tablet (`≥768px`)  | 2               | Balanced density          |
| Desktop (`≥992px`) | 3               | Portfolio overview        |

#### Technical choice

Use:

```html
col-12 col-md-6 col-lg-4
```

Why:

- `12 / 3 = 4` → three equal columns at `lg`
- Bootstrap handles wrapping automatically

---

### 3) Spacing & rhythm

- Increase gutters to avoid visual crowding:

  - Use `row g-4` or `g-5`

- Center the grid when fewer than 3 items exist:

  - `justify-content-center`

This preserves a curated, gallery-like feel.

---

### 4) Card size & proportions

With three columns, cards must feel lighter:

- Reduce vertical lift on hover
- Use consistent image aspect ratio
- Avoid overly tall images

Design decision:

```css
.project-image {
  aspect-ratio: 3 / 4;
  object-fit: cover;
}
```

---

### 5) Overlay & glassmorphism adjustments

Three columns mean less screen real estate per card, so:

- Slightly reduce blur intensity
- Reduce title font size
- Keep subtitles concise

Rationale:

- Prevents visual overload
- Improves performance on low-power devices

---

### 6) Interaction behavior

Hover remains the primary interaction on desktop:

- Image scales subtly
- Glass overlay fades in
- Title + subtitle animate upward

Accessibility additions:

- `:focus-visible` mirrors hover
- Tap interaction remains safe on touch devices

---

### 7) Performance considerations

- Avoid stacking multiple heavy `backdrop-filter` layers
- Prefer one glass surface per card (overlay)
- Use reduced blur for repeated elements (tags)

---

### 8) Implementation checklist

- [ ] Replace `col-lg-6` → `col-lg-4`
- [ ] Increase row gutter spacing
- [ ] Adjust typography scale for smaller cards
- [ ] Test hover/focus on desktop
- [ ] Verify stacking on mobile & tablet
- [ ] Confirm glass blur performance

---

### 9) Expected result

- Cleaner, more professional grid
- Improved portfolio overview
- Strong visual rhythm
- Modern editorial feel with glassmorphism intact

---

### 10) Future extensions (optional)

- GSAP stagger animation per row
- Filterable categories (3-column aware)
- Masonry variant for uneven content
- Auto-generated grid from CMS/data
