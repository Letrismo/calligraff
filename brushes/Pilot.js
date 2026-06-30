class Pilot extends EQuill {
  constructor(settings = {}) {
    super({ ...PILOT_CONFIG.brush, ...settings });
    this.renderer = new CircleStampRenderer();
    this.lastRendered = null;
    this.distanceCarry = 0;
    this.gradientDistance = 0;
  }

  begin(sample) {
    super.begin(sample);
    this.lastRendered = { x: sample.x, y: sample.y };
    this.distanceCarry = 0;
    this.gradientDistance = 0;
  }

  renderIncrement(graphics) {
    const points = this.stroke.getLast(4);

    if (points.length < 2) return;

    if (points.length < 4) {
      const last = points[points.length - 1];
      const processed = PathProcessing.process([this.lastRendered, { x: last.x, y: last.y }], this.settings);

      for (let i = 1; i < processed.length; i += 1) {
        this.renderSegment(graphics, processed[i - 1], processed[i]);
      }

      this.lastRendered = processed[processed.length - 1] || this.lastRendered;
      return;
    }

    const [p0, p1, p2, p3] = points;
    const curve = this.buildCurveSegment(p0, p1, p2, p3);
    const processed = PathProcessing.process([this.lastRendered || { x: p1.x, y: p1.y }, ...curve], this.settings);

    for (let i = 1; i < processed.length; i += 1) {
      this.renderSegment(graphics, processed[i - 1], processed[i]);
    }

    this.lastRendered = processed[processed.length - 1] || this.lastRendered;
  }

  buildCurveSegment(p0, p1, p2, p3) {
    const step = Math.min(0.5, Math.max(0.015, Number(this.settings.curveStep) || 0.12));
    const points = [];

    // Smaller curve steps create more intermediate vertices before simplification.
    for (let t = step; t <= 1 + 0.0001; t += step) {
      points.push(this.catmullRom(p0, p1, p2, p3, Math.min(1, t)));
    }

    return points;
  }

  renderSegment(graphics, from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) return;

    const spacing = Math.max(1, this.settings.size * this.settings.spacing);
    const steps = Math.floor((distance + this.distanceCarry) / spacing);

    if (steps <= 0) {
      this.distanceCarry += distance;
      return;
    }

    for (let i = 1; i <= steps; i += 1) {
      const progress = (i * spacing - this.distanceCarry) / distance;

      if (progress < 0 || progress > 1) continue;

      const x = lerp(from.x, to.x, progress);
      const y = lerp(from.y, to.y, progress);
      this.gradientDistance += spacing;
      this.renderer.render(graphics, {
        x,
        y,
        size: this.settings.size,
        color: this.resolveColor(),
        alpha: this.settings.alpha,
        compositeOperation: this.settings.compositeOperation
      });
    }

    this.distanceCarry = (distance + this.distanceCarry) % spacing;
  }

  resolveColor() {
    if (this.settings.colorMode === "solid") return this.settings.color;

    const palette = this.settings.palette;

    if (!palette || palette.length === 0) return this.settings.color;
    if (palette.length === 1) return palette[0];

    const cycle = 900;
    const position = (this.gradientDistance % cycle) / cycle;
    const scaled = position * palette.length;
    const index = Math.floor(scaled) % palette.length;
    const next = (index + 1) % palette.length;
    const amount = scaled - Math.floor(scaled);

    return lerpColor(color(palette[index]), color(palette[next]), amount);
  }

  catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;

    return {
      x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
    };
  }
}
