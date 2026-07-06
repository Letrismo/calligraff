class Sample {
  constructor(event, rect, pressure = null) {
    this.x = event.clientX - rect.left;
    this.y = event.clientY - rect.top;
    this.timestamp = performance.now();
    this.pressure = Sample.resolvePressure(event, pressure);
    this.tangentialPressure = event.tangentialPressure ?? null;
    this.tiltX = event.tiltX ?? null;
    this.tiltY = event.tiltY ?? null;
    this.twist = event.twist ?? null;
    this.altitudeAngle = event.altitudeAngle ?? null;
    this.azimuthAngle = event.azimuthAngle ?? null;
    this.pointerType = event.pointerType || "mouse";
    this.pointerId = event.pointerId ?? 0;
  }

  static resolvePressure(event, pressure) {
    const explicitPressure = Number(pressure);

    if (Number.isFinite(explicitPressure)) {
      return Math.min(1, Math.max(0, explicitPressure));
    }

    const nativePressure = Number(event?.pressure);

    if (Number.isFinite(nativePressure) && nativePressure > 0) {
      return Math.min(1, Math.max(0, nativePressure));
    }

    return 0.5;
  }
}
