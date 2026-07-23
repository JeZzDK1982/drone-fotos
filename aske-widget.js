/**
 * Aske chat widget for Drone Fotos.
 * Indlejrer Aske i et flydende panel via iframe.
 *
 * Sæt URL med:
 *   <script src="aske-widget.js" data-aske-url="https://din-persolige-ai.ai.studio"></script>
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
        <button type="button" class="aske-close" aria-label="Luk Aske">×</button>
      </div>
      <div class="aske-panel-body">
        <div class="aske-status" role="status">Indlæser Aske…</div>
        <iframe
          class="aske-frame"
          title="Aske chat"
          allow="microphone; clipboard-read; clipboard-write; fullscreen"
          referrerpolicy="no-referrer-when-downgrade"
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
  let loadTimer = null;

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    root.classList.toggle("is-open", open);
    if (open && !loaded) {
      loadAske();
    }
  }

  function showStatus(message, isError) {
    status.hidden = false;
    status.classList.toggle("is-error", Boolean(isError));
    if (isError) {
      status.innerHTML = message;
    } else {
      status.textContent = message;
    }
  }

  function hideStatus() {
    status.hidden = true;
  }

  function loadAske() {
    loaded = true;
    showStatus("Indlæser Aske…", false);
    frame.hidden = false;
    frame.src = askeUrl + "/";

    const onLoad = () => {
      clearTimeout(loadTimer);
      hideStatus();
    };

    frame.addEventListener("load", onLoad, { once: true });

    // Hvis indlæsning trækker ud, behold iframe men skjul spinneren
    loadTimer = setTimeout(() => {
      hideStatus();
    }, 8000);
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
