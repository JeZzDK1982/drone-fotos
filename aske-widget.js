/**
 * Aske chat widget for Drone Fotos.
 * Indlejrer Aske i en flydende panel via iframe.
 *
 * Sæt URL med:
 *   <script src="aske-widget.js" data-aske-url="http://localhost:3000"></script>
 * eller window.ASKE_URL før scriptet.
 */
(function () {
  const script = document.currentScript;
  const defaultUrl = "https://din-persolige-ai.ai.studio";
  const askeUrl = (
    window.ASKE_URL ||
    script?.getAttribute("data-aske-url") ||
    defaultUrl
  ).replace(/\/$/, "");

  const root = document.createElement("div");
  root.className = "aske-widget";
  root.innerHTML = `
    <button type="button" class="aske-launcher" aria-expanded="false" aria-controls="aske-panel" aria-label="Åbn Aske chat">
      <svg class="aske-icon" viewBox="0 0 512 512" aria-hidden="true">
        <circle cx="170" cy="170" r="110" fill="none" stroke="currentColor" stroke-width="28"/>
        <circle cx="360" cy="260" r="48" fill="none" stroke="currentColor" stroke-width="20"/>
        <circle cx="440" cy="180" r="22" fill="currentColor"/>
        <circle cx="360" cy="390" r="48" fill="none" stroke="currentColor" stroke-width="20"/>
      </svg>
      <span class="aske-launcher-label">Aske</span>
    </button>

    <div class="aske-panel" id="aske-panel" hidden>
      <div class="aske-panel-header">
        <div class="aske-panel-title">
          <svg class="aske-icon" viewBox="0 0 512 512" aria-hidden="true">
            <circle cx="170" cy="170" r="110" fill="none" stroke="currentColor" stroke-width="28"/>
            <circle cx="360" cy="260" r="48" fill="none" stroke="currentColor" stroke-width="20"/>
            <circle cx="440" cy="180" r="22" fill="currentColor"/>
            <circle cx="360" cy="390" r="48" fill="none" stroke="currentColor" stroke-width="20"/>
          </svg>
          <div>
            <strong>Aske</strong>
            <span>Din AI-planlægger</span>
          </div>
        </div>
        <div class="aske-panel-actions">
          <a class="aske-open-tab" href="${askeUrl}" target="_blank" rel="noopener noreferrer">Åbn i fane</a>
          <button type="button" class="aske-close" aria-label="Luk Aske">×</button>
        </div>
      </div>
      <div class="aske-panel-body">
        <div class="aske-status" role="status">Forbinder til Aske…</div>
        <iframe
          class="aske-frame"
          title="Aske chat"
          loading="lazy"
          allow="microphone; clipboard-read; clipboard-write"
        ></iframe>
      </div>
    </div>
  `;

  document.body.appendChild(root);

  const launcher = root.querySelector(".aske-launcher");
  const panel = root.querySelector(".aske-panel");
  const closeBtn = root.querySelector(".aske-close");
  const frame = root.querySelector(".aske-frame");
  const status = root.querySelector(".aske-status");
  let loaded = false;

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    root.classList.toggle("is-open", open);
    if (open && !loaded) {
      loadAske();
    }
  }

  async function loadAske() {
    loaded = true;
    status.hidden = false;
    status.textContent = "Forbinder til Aske…";
    status.classList.remove("is-error");

    const healthy = await pingAske();
    if (!healthy) {
      status.classList.add("is-error");
      status.innerHTML = `
        <p><strong>Aske er ikke tilgængelig lige nu.</strong></p>
        <p>Prøv at åbne Aske i en ny fane, eller tjek at adressen stadig er aktiv.</p>
        <p><a href="${askeUrl}" target="_blank" rel="noopener noreferrer">Åbn Aske direkte</a></p>
      `;
      frame.hidden = true;
      return;
    }

    frame.hidden = false;
    frame.src = askeUrl;
    status.textContent = "Indlæser Aske…";

    frame.addEventListener(
      "load",
      () => {
        status.hidden = true;
      },
      { once: true }
    );
  }

  async function pingAske() {
    // localhost / private hosts can only work when visitor is on same machine
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(askeUrl, {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
      });
      clearTimeout(timer);
      // no-cors gives opaque response; treat as reachable if no network error
      return true;
    } catch {
      // HEAD may fail; try GET no-cors as fallback
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2500);
        await fetch(askeUrl, {
          method: "GET",
          mode: "no-cors",
          signal: controller.signal,
        });
        clearTimeout(timer);
        return true;
      } catch {
        return false;
      }
    }
  }

  launcher.addEventListener("click", () => {
    setOpen(panel.hidden);
  });

  closeBtn.addEventListener("click", () => setOpen(false));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setOpen(false);
    }
  });
})();
