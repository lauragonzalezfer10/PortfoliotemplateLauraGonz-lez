document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("newsletterForm");
  if (!form) return;

  const emailInput = document.getElementById("newsletterEmail");
  const statusEl = document.getElementById("newsletterStatus");
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    if (!email) return;

    // reset status
    statusEl.textContent = "";
    statusEl.className = "text-center small mt-2 mb-0";

    // loading state
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Joining...";

    try {
      const res = await fetch(form.action, {
        method: form.method || "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        statusEl.textContent = "Thanks for subscribing! 🎉";
        statusEl.classList.add("text-success");
        emailInput.value = "";
      } else {
        statusEl.textContent =
          "Something went wrong. Please try again in a moment.";
        statusEl.classList.add("text-danger");
      }
    } catch (err) {
      statusEl.textContent =
        "Network error. Please check your connection and retry.";
      statusEl.classList.add("text-danger");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
