(() => {
  let layer;
  let input;
  let coreQuill;

  const state = {
    background: "#0d0d0d",
    color: "#f2f2f0",
    lineWidth: 4,
    pressureMinScale: 0.35,
    pressureMaxScale: 1.65,
    alpha: 0.86,
    vertexDensity: 10,
    curveSmoothing: 1,
    smoothingAmount: 0.22,
    simplificationAlgorithm: "none",
    simplificationTolerance: 0,
    clear: () => layer?.clear()
  };

  class CoreLineQuill extends EQuill {
    constructor(settings = {}) {
      super(settings);
      this.lastRendered = null;
    }

    begin(sample) {
      super.begin(sample);
      this.lastRendered = { x: sample.x, y: sample.y, pressure: sample.pressure };
    }

    renderIncrement(graphics) {
      const points = this.stroke.getLast(4);

      if (points.length < 2) return;

      const line = points.length >= 4
        ? [this.lastRendered, ...this.buildCurveSegment(...points)]
        : [this.lastRendered, {
          x: points[points.length - 1].x,
          y: points[points.length - 1].y,
          pressure: points[points.length - 1].pressure
        }];
      const processed = PathProcessing.process(line, this.settings);

      graphics.drawingContext.globalCompositeOperation = "source-over";
      graphics.noFill();
      const strokeColor = color(this.settings.color);
      strokeColor.setAlpha(this.settings.alpha * 255);
      graphics.stroke(strokeColor);

      for (let i = 1; i < processed.length; i += 1) {
        graphics.strokeWeight(this.resolveWidth(processed[i - 1], processed[i]));
        graphics.line(processed[i - 1].x, processed[i - 1].y, processed[i].x, processed[i].y);
      }

      this.lastRendered = processed[processed.length - 1] || this.lastRendered;
    }

    buildCurveSegment(p0, p1, p2, p3) {
      const step = Math.min(0.5, Math.max(0.015, Number(this.settings.curveStep) || 0.1));
      const points = [];

      // Core exposes the same vertex-density control without the stamp renderer.
      for (let t = step; t <= 1 + 0.0001; t += step) {
        points.push(this.catmullRom(p0, p1, p2, p3, Math.min(1, t)));
      }

      return points;
    }

    catmullRom(p0, p1, p2, p3, t) {
      const t2 = t * t;
      const t3 = t2 * t;

      return {
        x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
        pressure: this.resolvePressure(p1, p2, t)
      };
    }

    resolveWidth(from, to) {
      const pressure = this.resolvePressure(from, to, 0.5);
      const minScale = Number.isFinite(this.settings.pressureMinScale) ? this.settings.pressureMinScale : 1;
      const maxScale = Number.isFinite(this.settings.pressureMaxScale) ? this.settings.pressureMaxScale : 1;
      const pressureScale = minScale + (maxScale - minScale) * pressure;

      return Math.max(1, this.settings.lineWidth * pressureScale);
    }

    resolvePressure(from, to, progress) {
      const fromPressure = Number.isFinite(from.pressure) ? from.pressure : 0.5;
      const toPressure = Number.isFinite(to.pressure) ? to.pressure : fromPressure;

      return Math.min(1, Math.max(0, fromPressure + (toPressure - fromPressure) * progress));
    }
  }

  window.setup = () => {
    const viewport = window.EQuillsUI?.viewportSize?.() || { width: windowWidth, height: windowHeight };
    const canvas = createCanvas(viewport.width, viewport.height);
    canvas.parent("app");
    pixelDensity(Math.min(window.devicePixelRatio || 1, 2));

    layer = createGraphics(width, height);
    layer.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
    layer.clear();

    coreQuill = new CoreLineQuill(currentSettings());
    input = new PointerInput(canvas.elt, coreQuill, layer);
    setupGui();
    window.EQuillsUI?.bindSurfaceActions({ onErase: state.clear });
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
    const gui = new lil.GUI({ title: "Core" });
    gui.addColor(state, "background").name("Background");
    gui.addColor(state, "color").name("Stroke").onChange(syncSettings);
    gui.add(state, "lineWidth", 1, 32, 1).name("Width").onChange(syncSettings);
    gui.add(state, "alpha", 0.05, 1, 0.01).name("Alpha").onChange(syncSettings);

    const curve = gui.addFolder("Curve");
    curve.add(state, "vertexDensity", 3, 72, 1).name("Vertices").onChange(syncSettings);
    curve.add(state, "curveSmoothing", 0, 4, 1).name("Smooth passes").onChange(syncSettings);
    curve.add(state, "smoothingAmount", 0, 0.48, 0.01).name("Smooth amount").onChange(syncSettings);
    curve.add(state, "simplificationAlgorithm", {
      None: "none",
      "Douglas-Peucker": "douglas-peucker",
      "Visvalingam-Whyatt": "visvalingam-whyatt"
    }).name("Reduction").onChange(syncSettings);
    curve.add(state, "simplificationTolerance", 0, 24, 0.25).name("Tolerance").onChange(syncSettings);

    const actions = gui.addFolder("Canvas");
    actions.add(state, "clear").name("Clear");
  }

  function currentSettings() {
    return {
      lineWidth: state.lineWidth,
      pressureMinScale: state.pressureMinScale,
      pressureMaxScale: state.pressureMaxScale,
      color: state.color,
      alpha: state.alpha,
      curveStep: 1 / state.vertexDensity,
      curveSmoothing: state.curveSmoothing,
      smoothingAmount: state.smoothingAmount,
      simplificationAlgorithm: state.simplificationAlgorithm,
      simplificationTolerance: state.simplificationTolerance
    };
  }

  function syncSettings() {
    coreQuill.setSettings(currentSettings());
  }
})();
