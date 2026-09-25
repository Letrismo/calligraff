(() => {
  const fullscreenRoot = document.documentElement;

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

  function fullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function requestNativeFullscreen(target) {
    const request = target.requestFullscreen || target.webkitRequestFullscreen;

    if (!request) return Promise.reject(new Error("Fullscreen API is not available."));

    return request.call(target);
  }

  function exitNativeFullscreen() {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;

    if (!exit) return Promise.resolve();

    return exit.call(document);
  }

  function viewportSize() {
    const viewport = window.visualViewport;

    return {
      width: Math.round(viewport?.width || window.innerWidth),
      height: Math.round(viewport?.height || window.innerHeight)
    };
  }

  function updateViewportSize() {
    const { width, height } = viewportSize();

    fullscreenRoot.style.setProperty("--app-width", `${width}px`);
    fullscreenRoot.style.setProperty("--app-height", `${height}px`);
  }

  function queueCanvasResize() {
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
  }

  function bindSurfaceActions({ onErase, fullscreenTarget = document.documentElement } = {}) {
    const eraseButton = document.querySelector("[data-action='erase']");
    const fullscreenButton = document.querySelector("[data-action='fullscreen']");
    let viewportFullscreen = false;

    const erase = () => {
      if (typeof onErase === "function") onErase();
    };

    const isFullscreen = () => Boolean(fullscreenElement()) || viewportFullscreen;

    const enterViewportFullscreen = () => {
      viewportFullscreen = true;
      updateViewportSize();
      fullscreenRoot.classList.add("is-viewport-fullscreen");
      updateFullscreenButton();
      queueCanvasResize();
    };

    const exitViewportFullscreen = () => {
      viewportFullscreen = false;
      fullscreenRoot.classList.remove("is-viewport-fullscreen");
      updateFullscreenButton();
      queueCanvasResize();
    };

    const updateFullscreenButton = () => {
      if (!fullscreenButton) return;

      fullscreenButton.innerHTML = isFullscreen() ? fullscreenExitIcon : fullscreenEnterIcon;
      fullscreenButton.setAttribute("aria-label", isFullscreen() ? "Salir de pantalla completa" : "Pantalla completa");
      fullscreenButton.title = isFullscreen() ? "Salir de pantalla completa" : "Pantalla completa";
    };

    eraseButton?.addEventListener("click", erase);
    fullscreenButton?.addEventListener("click", async () => {
      try {
        if (fullscreenElement()) {
          await exitNativeFullscreen();
        } else if (viewportFullscreen) {
          exitViewportFullscreen();
        } else {
          await requestNativeFullscreen(fullscreenTarget);
        }
      } catch (error) {
        enterViewportFullscreen();
        console.info("Native fullscreen is not available; using viewport fullscreen.", error);
      }
    });

    document.addEventListener("fullscreenchange", updateFullscreenButton);
    document.addEventListener("webkitfullscreenchange", updateFullscreenButton);
    window.addEventListener("resize", updateViewportSize);
    window.visualViewport?.addEventListener("resize", () => {
      updateViewportSize();
      if (viewportFullscreen) queueCanvasResize();
    });
    window.visualViewport?.addEventListener("scroll", updateViewportSize);
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;

      if (viewportFullscreen) {
        exitViewportFullscreen();
        return;
      }

      erase();
    });

    updateViewportSize();
    updateFullscreenButton();
  }

  window.EQuillsUI = { bindSurfaceActions, viewportSize };
})();
