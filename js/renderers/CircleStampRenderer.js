class CircleStampRenderer {
  render(graphics, stamp) {
    graphics.drawingContext.globalCompositeOperation = stamp.compositeOperation;
    graphics.noStroke();
    const c = color(stamp.color);
    c.setAlpha(stamp.alpha * 255);
    graphics.fill(c);
    graphics.circle(stamp.x, stamp.y, this.resolveSize(stamp));
  }

  resolveSize(stamp) {
    const size = Number.isFinite(stamp.size) ? stamp.size : 1;
    const pressure = Number.isFinite(stamp.pressure) ? Math.min(1, Math.max(0, stamp.pressure)) : 0.5;
    const minScale = Number.isFinite(stamp.pressureMinScale) ? stamp.pressureMinScale : 1;
    const maxScale = Number.isFinite(stamp.pressureMaxScale) ? stamp.pressureMaxScale : 1;
    const pressureScale = minScale + (maxScale - minScale) * pressure;

    return Math.max(1, size * pressureScale);
  }
}
