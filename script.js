const year = document.getElementById("year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const lightbox = document.getElementById("lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxCaption = lightbox?.querySelector(".lightbox-caption");
const closeButton = lightbox?.querySelector(".lightbox-close");

function openLightbox(src, caption, alt) {
  if (!lightbox || !lightboxImage || !lightboxCaption) return;
  lightboxImage.src = src;
  lightboxImage.alt = alt || caption || "";
  lightboxCaption.textContent = caption || "";
  lightbox.showModal();
}

function closeLightbox() {
  lightbox?.close();
}

document.querySelectorAll(".gallery-item").forEach((button) => {
  button.addEventListener("click", () => {
    const full = button.getAttribute("data-full");
    const caption = button.getAttribute("data-caption") || "";
    const img = button.querySelector("img");
    if (!full) return;
    openLightbox(full, caption, img?.alt || caption);
  });
});

closeButton?.addEventListener("click", closeLightbox);

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox?.open) {
    closeLightbox();
  }
});

document.querySelectorAll(".copy-script").forEach((button) => {
  button.addEventListener("click", async () => {
    const targetId = button.getAttribute("data-target");
    const codeEl = targetId ? document.getElementById(targetId) : null;
    const text = codeEl?.textContent?.trim();
    if (!text) return;

    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Kopieret!";
    } catch {
      button.textContent = "Kunne ikke kopiere";
    }
    window.setTimeout(() => {
      button.textContent = original;
    }, 1600);
  });
});

const RUNNER_URL = "http://127.0.0.1:8787";
const runnerStatus = document.getElementById("runner-status");

function setRunnerStatus(message, isError = false) {
  if (!runnerStatus) return;
  runnerStatus.hidden = !message;
  runnerStatus.textContent = message || "";
  runnerStatus.classList.toggle("is-error", Boolean(isError));
}

async function checkRunner() {
  try {
    const res = await fetch(`${RUNNER_URL}/health`, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) throw new Error("not ok");
    setRunnerStatus("Script-runner er klar — du kan trykke Kør.");
    return true;
  } catch {
    setRunnerStatus(
      "Script-runner kører ikke. Start den med: runner/start-runner.sh",
      true
    );
    return false;
  }
}

document.querySelectorAll(".run-script").forEach((button) => {
  button.addEventListener("click", async () => {
    const scriptId = button.getAttribute("data-script");
    if (!scriptId) return;

    const original = button.textContent;
    button.disabled = true;
    button.textContent = "Kører…";

    try {
      const res = await fetch(`${RUNNER_URL}/run/${scriptId}`, {
        method: "POST",
        signal: AbortSignal.timeout(320000),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.message || `Fejl ${res.status}`);
      }
      button.textContent = "Kørt!";
      setRunnerStatus(data.message || "Scriptet er kørt.");
    } catch (err) {
      button.textContent = "Fejl";
      const offline = String(err?.message || "").includes("Failed to fetch") ||
        err?.name === "TimeoutError" ||
        err?.name === "AbortError";
      setRunnerStatus(
        offline
          ? "Kunne ikke nå script-runner. Start den med: runner/start-runner.sh"
          : String(err.message || err),
        true
      );
    }

    window.setTimeout(() => {
      button.disabled = false;
      button.textContent = original;
    }, 1800);
  });
});

if (document.getElementById("scripts")) {
  checkRunner();
}

const aboutInner = document.querySelector(".about .section-inner");
if (aboutInner && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35 }
  );
  observer.observe(aboutInner);
} else {
  aboutInner?.classList.add("is-visible");
}
