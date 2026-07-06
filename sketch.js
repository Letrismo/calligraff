(() => {
  let layer;
  let pilot;
  let input;
  let gui;
  let guiControllers = [];

  const state = {
    paletteName: "Aurora",
    background: PILOT_CONFIG.canvas.background,
    size: PILOT_CONFIG.brush.size,
    pressureMinScale: PILOT_CONFIG.brush.pressureMinScale,
    pressureMaxScale: PILOT_CONFIG.brush.pressureMaxScale,
    spacing: PILOT_CONFIG.brush.spacing,
    vertexDensity: Math.round(1 / PILOT_CONFIG.brush.curveStep),
    curveSmoothing: PILOT_CONFIG.brush.curveSmoothing,
    smoothingAmount: PILOT_CONFIG.brush.smoothingAmount,
    simplificationAlgorithm: PILOT_CONFIG.brush.simplificationAlgorithm,
    simplificationTolerance: PILOT_CONFIG.brush.simplificationTolerance,
    colorMode: PILOT_CONFIG.brush.colorMode,
    color: PILOT_CONFIG.brush.color,
    colorA: PILOT_CONFIG.brush.palette[0],
    colorB: PILOT_CONFIG.brush.palette[1],
    colorC: PILOT_CONFIG.brush.palette[2],
    colorD: PILOT_CONFIG.brush.palette[3],
    compositeOperation: PILOT_CONFIG.brush.compositeOperation,
    alpha: PILOT_CONFIG.brush.alpha,
    clear: () => layer?.clear()
  };

  window.setup = () => {
    const viewport = window.EQuillsUI?.viewportSize?.() || { width: windowWidth, height: windowHeight };
    const canvas = createCanvas(viewport.width, viewport.height);
    canvas.parent("app");
    pixelDensity(Math.min(window.devicePixelRatio || 1, 2));

    layer = createGraphics(width, height);
    layer.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
    layer.clear();

    pilot = new Pilot();
    input = new PointerInput(canvas.elt, pilot, layer);
    setupGui();
    window.EQuillsUI?.bindSurfaceActions({ onErase: state.clear });
    syncBrush();
  };

  window.draw = () => {
    background(state.background);
    image(layer, 0, 0);
  };

  window.windowResized = () => {
    const oldLayer = layer;
    const viewport = window.EQuillsUI?.viewportSize?.() || { width: windowWidth, height: windowHeight };
    resizeCanvas(viewport.width, viewport.height);

    layer = createGraphics(width, height);
    layer.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
    layer.clear();
    layer.image(oldLayer, 0, 0);
    input.graphics = layer;
  };

  function setupGui() {
    gui = new lil.GUI({ title: "Pilot" });
    guiControllers = [];
    const track = (controller) => {
      guiControllers.push(controller);
      return controller;
    };

    const brush = gui.addFolder("Brush");
    track(brush.add(state, "size", 8, 96, 1)).name("Size").onChange(syncBrush);
    track(brush.add(state, "spacing", 0.04, 0.28, 0.01)).name("Spacing").onChange(syncBrush);
    track(brush.add(state, "alpha", 0.05, 1, 0.01)).name("Alpha").onChange(syncBrush);

    const curve = gui.addFolder("Curve");
    track(curve.add(state, "vertexDensity", 3, 72, 1)).name("Vertices").onChange(syncBrush);
    track(curve.add(state, "curveSmoothing", 0, 4, 1)).name("Smooth passes").onChange(syncBrush);
    track(curve.add(state, "smoothingAmount", 0, 0.48, 0.01)).name("Smooth amount").onChange(syncBrush);
    track(curve.add(state, "simplificationAlgorithm", {
      None: "none",
      "Douglas-Peucker": "douglas-peucker",
      "Visvalingam-Whyatt": "visvalingam-whyatt"
    })).name("Reduction").onChange(syncBrush);
    track(curve.add(state, "simplificationTolerance", 0, 24, 0.25)).name("Tolerance").onChange(syncBrush);

    const colorFolder = gui.addFolder("Color");
    track(colorFolder.add(state, "paletteName", Object.keys(PILOT_PALETTES))).name("Palette").onChange(applyPalette);
    track(colorFolder.add(state, "colorMode", ["solid", "gradient"])).name("Mode").onChange(syncBrush);
    track(colorFolder.addColor(state, "color")).name("Solid").onChange(syncBrush);
    track(colorFolder.addColor(state, "colorA")).name("Stop 1").onChange(syncBrush);
    track(colorFolder.addColor(state, "colorB")).name("Stop 2").onChange(syncBrush);
    track(colorFolder.addColor(state, "colorC")).name("Stop 3").onChange(syncBrush);
    track(colorFolder.addColor(state, "colorD")).name("Stop 4").onChange(syncBrush);
    track(colorFolder.add(state, "compositeOperation", [
      "source-over",
      "lighter",
      "multiply",
      "screen",
      "overlay",
      "difference"
    ])).name("Composite").onChange(syncBrush);

    const canvasFolder = gui.addFolder("Canvas");
    track(canvasFolder.addColor(state, "background")).name("Background");
    track(canvasFolder.add(state, "clear")).name("Clear");
  }

  function applyPalette(name) {
    const palette = PILOT_PALETTES[name];

    if (!palette) return;

    state.background = palette.background;
    state.compositeOperation = palette.compositeOperation;
    [state.colorA, state.colorB, state.colorC, state.colorD] = palette.colors;
    state.colorMode = "gradient";
    refreshGui();
    syncBrush();
  }

  function syncBrush() {
    if (!pilot) return;

    // The brush receives only rendering settings; canvas state stays in this sketch.
    pilot.setSettings({
      size: state.size,
      pressureMinScale: state.pressureMinScale,
      pressureMaxScale: state.pressureMaxScale,
      spacing: state.spacing,
      curveStep: 1 / state.vertexDensity,
      curveSmoothing: state.curveSmoothing,
      smoothingAmount: state.smoothingAmount,
      simplificationAlgorithm: state.simplificationAlgorithm,
      simplificationTolerance: state.simplificationTolerance,
      colorMode: state.colorMode,
      color: state.color,
      palette: [state.colorA, state.colorB, state.colorC, state.colorD],
      compositeOperation: state.compositeOperation,
      alpha: state.alpha
    });
  }

  function refreshGui() {
    guiControllers.forEach((controller) => controller.updateDisplay());
  }
})();
