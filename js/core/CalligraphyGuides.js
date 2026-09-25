class CalligraphyGuides {
  static render(settings, canvasWidth, canvasHeight) {
    if (!settings?.enabled) return;

    const metrics = CalligraphyGuides.metrics(settings);

    if (metrics.rowHeight <= 0) return;

    push();
    drawingContext.globalCompositeOperation = "source-over";
    CalligraphyGuides.drawHorizontal(settings, metrics, canvasWidth, canvasHeight);

    if (settings.slantEnabled) {
      CalligraphyGuides.drawSlant(settings, metrics, canvasWidth, canvasHeight);
    }

    pop();
  }

  static metrics(settings) {
    const nib = Math.max(1, Number(settings.nibSize) || 1);
    const unit = Math.max(8, nib * Math.max(0.1, Number(settings.unitScale) || 1));
    const xHeight = unit * Math.max(0.1, Number(settings.xHeightRatio) || 1);
    const ascender = unit * Math.max(0, Number(settings.ascenderRatio) || 0);
    const descender = unit * Math.max(0, Number(settings.descenderRatio) || 0);
    const rowHeight = xHeight + ascender + descender;
    const offsetY = Number(settings.offsetY) || 0;

    return { unit, xHeight, ascender, descender, rowHeight, offsetY };
  }

  static drawHorizontal(settings, metrics, canvasWidth, canvasHeight) {
    const startBaseline = metrics.offsetY + metrics.ascender + metrics.xHeight;
    const firstBaseline = startBaseline - Math.ceil(startBaseline / metrics.rowHeight) * metrics.rowHeight;
    const endY = canvasHeight + metrics.rowHeight;

    for (let baseline = firstBaseline; baseline <= endY; baseline += metrics.rowHeight) {
      CalligraphyGuides.drawLine(settings, 0, baseline - metrics.xHeight - metrics.ascender, canvasWidth, baseline - metrics.xHeight - metrics.ascender, settings.secondaryAlpha);
      CalligraphyGuides.drawLine(settings, 0, baseline - metrics.xHeight, canvasWidth, baseline - metrics.xHeight, settings.secondaryAlpha);
      CalligraphyGuides.drawLine(settings, 0, baseline, canvasWidth, baseline, settings.baselineAlpha);
      CalligraphyGuides.drawLine(settings, 0, baseline + metrics.descender, canvasWidth, baseline + metrics.descender, settings.secondaryAlpha);
    }
  }

  static drawSlant(settings, metrics, canvasWidth, canvasHeight) {
    const spacing = Math.max(12, metrics.unit * Math.max(0.1, Number(settings.slantSpacingScale) || 1));
    const angle = radians(Number(settings.slantAngle) || 0);
    const drift = Math.tan(angle) * canvasHeight;
    const startX = -Math.abs(drift) - spacing;
    const endX = canvasWidth + Math.abs(drift) + spacing;

    for (let x = startX; x <= endX; x += spacing) {
      CalligraphyGuides.drawLine(settings, x, 0, x + drift, canvasHeight, settings.secondaryAlpha * 0.72);
    }
  }

  static drawLine(settings, x1, y1, x2, y2, alpha) {
    const guide = color(settings.color);
    guide.setAlpha(Math.min(1, Math.max(0, alpha)) * 255);
    stroke(guide);
    strokeWeight(Math.max(0.25, Number(settings.strokeWeight) || 1));
    line(x1, y1, x2, y2);
  }
}
