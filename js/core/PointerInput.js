class PointerInput {
  constructor(canvasElement, quill, graphics, options = {}) {
    this.canvas = canvasElement;
    this.quill = quill;
    this.graphics = graphics;
    this.onSample = options.onSample || null;
    this.activePointerId = null;
    this.pressureInput = new PressureInput(canvasElement);
    this.bind();
  }

  bind() {
    this.canvas.addEventListener("pointerdown", this.handleDown.bind(this), { passive: false });
    this.canvas.addEventListener("pointermove", this.handleMove.bind(this), { passive: false });
    this.canvas.addEventListener("pointerup", this.handleUp.bind(this), { passive: false });
    this.canvas.addEventListener("pointercancel", this.handleUp.bind(this), { passive: false });
  }

  sample(event) {
    const rect = this.canvas.getBoundingClientRect();
    const pressure = this.pressureInput.detail(event);
    const sample = new Sample(event, rect, pressure.pressure);
    sample.inputPressure = pressure;
    this.onSample?.(sample, pressure, event);
    return sample;
  }

  handleDown(event) {
    event.preventDefault();
    this.activePointerId = event.pointerId;
    this.canvas.setPointerCapture?.(event.pointerId);
    this.quill.begin(this.sample(event));
  }

  handleMove(event) {
    event.preventDefault();
    if (event.pointerId !== this.activePointerId) return;
    const coalesced = event.getCoalescedEvents ? event.getCoalescedEvents() : [event];

    for (const e of coalesced) {
      this.quill.update(this.sample(e), this.graphics);
    }
  }

  handleUp(event) {
    event.preventDefault();
    if (event.pointerId !== this.activePointerId) return;
    this.quill.end(this.sample(event), this.graphics);
    this.activePointerId = null;
  }
}
