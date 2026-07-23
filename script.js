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
