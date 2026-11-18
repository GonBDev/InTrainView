import { Controller } from "@hotwired/stimulus"

// Plays the example practice session once: each message appears in turn,
// then the score bars fill. With reduced motion, everything is shown at once.
export default class extends Controller {
  static targets = ["step"]
  static values = { delay: { type: Number, default: 1100 } }

  connect() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    this.element.classList.add("is-ready")
    this.timers = this.stepTargets.map((step, index) => {
      return setTimeout(() => step.classList.add("is-visible"), 500 + index * this.delayValue)
    })
  }

  disconnect() {
    (this.timers || []).forEach((timer) => clearTimeout(timer))
  }
}
