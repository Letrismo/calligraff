class PressureInput {
  constructor(element) {
    this.element = element;
    this.force = null;
    this.source = "pointer";
    this.bindPressureJs();
  }

  bindPressureJs() {
    if (!window.Pressure?.set || !this.element) return;

    window.Pressure.set(this.element, {
      start: (event) => {
        this.force = this.resolveNativePressure(event);
        this.source = "pressure.js";
      },
      change: (force) => {
        this.force = PressureInput.normalize(force);
        this.source = "pressure.js";
      },
      end: () => {
        this.force = null;
      },
      unsupported: () => {
        this.force = null;
        this.source = "pointer";
      }
    }, { polyfill: false });
  }

  resolve(event) {
    const nativePressure = PressureInput.nativePressure(event);

    if (nativePressure !== null) return nativePressure;
    if (Number.isFinite(this.force)) return this.force;
    return 0.5;
  }

  resolveNativePressure(event) {
    const nativePressure = PressureInput.nativePressure(event);

    return nativePressure === null ? 0.5 : nativePressure;
  }

  static nativePressure(event) {
    const pressure = Number(event?.pressure);

    if (Number.isFinite(pressure) && pressure > 0) {
      return PressureInput.normalize(pressure);
    }

    return null;
  }

  static normalize(value) {
    const pressure = Number(value);

    if (!Number.isFinite(pressure)) return 0.5;

    return Math.min(1, Math.max(0, pressure));
  }
}
