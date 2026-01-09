Below is a **complete, exam-ready deliverable** with:

1. **Clear plan**
2. **Final report**
3. **Exact code used** (HTML + JS only, no CSS)

You can copy this directly into your documentation or presentation.

---

# 1. Plan — Dark Mode Switch

### Objective

Implement a dark mode toggle that:

- Uses **Bootstrap 5.3 native theming**
- Persists user preference
- Respects system settings on first visit
- Is accessible and semantic

---

### Technical decisions

- **Theme mechanism:**
  `data-bs-theme="light | dark"` on `<html>`
- **Persistence:**
  `localStorage`
- **Fallback:**
  `prefers-color-scheme`
- **UI feedback:**
  Icon swap (sun / moon)
- **Accessibility:**
  `button`, `aria-label`, `aria-pressed`

---

### Flow logic

1. On page load:

   - If `localStorage.theme` exists → use it
   - Else → read system preference

2. Apply theme to `<html>`
3. Update icons + ARIA state
4. On button click:

   - Toggle theme
   - Save to localStorage
   - Update UI instantly

---

### Validation checklist

- No page reload
- Theme persists after refresh
- Keyboard accessible
- Works without CSS dependency
- Graceful fallback if JS fails

---

# 2. Report — Dark Mode Implementation

### Overview

The dark mode switch was implemented using Bootstrap 5.3’s native theming system through the `data-bs-theme` attribute. This approach avoids custom color management and ensures consistency with Bootstrap components.

---

### Implementation details

- The theme state is stored in `localStorage` under the key `"theme"`.
- The root `<html>` element dynamically switches between `"light"` and `"dark"`.
- The toggle button updates visual feedback using inline SVG icons.
- Accessibility is ensured using semantic buttons and ARIA attributes.

---

### User experience behavior

- Returning users always see their last selected theme.
- First-time visitors inherit their operating system preference.
- The toggle provides immediate visual feedback without reloading the page.

---

### Accessibility considerations

- The toggle is keyboard-operable.
- `aria-pressed` reflects the current state.
- Icons are marked `aria-hidden` to avoid redundant announcements.

---

### Final evaluation

The solution is lightweight, accessible, scalable, and aligned with modern Bootstrap best practices. It enhances usability without introducing unnecessary complexity.

---

# 3. Code Used (HTML + JavaScript)

## 3.1 HTML — Toggle Button

```html
<button
  id="themeToggle"
  class="btn btn-outline-secondary d-flex align-items-center justify-content-center"
  aria-label="Toggle dark and light theme"
  aria-pressed="false"
  title="Toggle theme"
  type="button"
>
  <!-- Sun icon (light mode) -->
  <svg
    id="icon-sun"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
    aria-hidden="true"
  >
    <path
      d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8
         4 4 0 0 0 0 8M8 0a.5.5 0 0 1
         .5.5v2a.5.5 0 0 1-1 0v-2
         A.5.5 0 0 1 8 0m0 13a.5.5
         0 0 1 .5.5v2a.5.5 0 0 1-1
         0v-2A.5.5 0 0 1 8 13"
    />
  </svg>

  <!-- Moon icon (dark mode) -->
  <svg
    id="icon-moon"
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
    class="d-none"
  >
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3
         a7 7 0 0 0 9.79 9.79z"
    />
  </svg>
</button>
```

---

## 3.2 JavaScript — Theme Logic

```html
<script>
  const html = document.documentElement;
  const toggleBtn = document.getElementById("themeToggle");
  const sunIcon = document.getElementById("icon-sun");
  const moonIcon = document.getElementById("icon-moon");

  // Determine initial theme
  const storedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const initialTheme = storedTheme || (systemPrefersDark ? "dark" : "light");
  setTheme(initialTheme);

  // Toggle on click
  toggleBtn.addEventListener("click", () => {
    const currentTheme = html.getAttribute("data-bs-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  });

  function setTheme(theme) {
    html.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);

    const isDark = theme === "dark";

    sunIcon.classList.toggle("d-none", isDark);
    moonIcon.classList.toggle("d-none", !isDark);

    toggleBtn.setAttribute("aria-pressed", isDark);
  }
</script>
```

---

I used Bootstrap’s native theming via `data-bs-theme` because it is lightweight, accessible, and avoids duplicating color logic. The implementation respects user preferences, persists state, and follows semantic and inclusive design principles.
