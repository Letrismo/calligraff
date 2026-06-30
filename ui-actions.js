(() => {
  const fullscreenEnterIcon = `
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M8 3H3v5h2V5h3V3Zm8 0v2h3v3h2V3h-5ZM5 16H3v5h5v-2H5v-3Zm14 3h-3v2h5v-5h-2v3Z" />
    </svg>
  `;
  const fullscreenExitIcon = `
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M9 3H7v4H3v2h6V3Zm8 0h-2v6h6V7h-4V3ZM3 17h4v4h2v-6H3v2Zm12 4h2v-4h4v-2h-6v6Z" />
    </svg>
  `;

  function bindSurfaceActions({ onErase, fullscreenTarget = document.documentElement } = {}) {
    const eraseButton = document.querySelector("[data-action='erase']");
    const fullscreenButton = document.querySelector("[data-action='fullscreen']");

    const erase = () => {
      if (typeof onErase === "function") onErase();
    };

    const updateFullscreenButton = () => {
      if (!fullscreenButton) return;

      const isFullscreen = Boolean(document.fullscreenElement);
      fullscreenButton.innerHTML = isFullscreen ? fullscreenExitIcon : fullscreenEnterIcon;
      fullscreenButton.setAttribute("aria-label", isFullscreen ? "Salir de pantalla completa" : "Pantalla completa");
      fullscreenButton.title = isFullscreen ? "Salir de pantalla completa" : "Pantalla completa";
    };

    eraseButton?.addEventListener("click", erase);
    fullscreenButton?.addEventListener("click", async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await fullscreenTarget.requestFullscreen();
        }
      } catch (error) {
        console.warn("Fullscreen is not available in this context.", error);
      }
    });

    document.addEventListener("fullscreenchange", updateFullscreenButton);
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;

      erase();
    });

    updateFullscreenButton();
  }

  window.EQuillsUI = { bindSurfaceActions };
})();
