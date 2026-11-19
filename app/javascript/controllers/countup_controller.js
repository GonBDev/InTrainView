import { Controller } from "@hotwired/stimulus"

// A number that counts up from 0 when it appears. The text already in the page is the final value.
export default class extends Controller {
  static values = { end: Number, decimals: { type: Number, default: 0 }, duration: { type: Number, default: 900 } }

  connect() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / this.durationValue, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      this.element.textContent = (this.endValue * eased).toFixed(this.decimalsValue)
      if (progress < 1) this.frame = requestAnimationFrame(tick)
    }
    this.frame = requestAnimationFrame(tick)
  }

  disconnect() {
    cancelAnimationFrame(this.frame)
  }
}
