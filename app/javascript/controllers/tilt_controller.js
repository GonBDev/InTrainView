import { Controller } from "@hotwired/stimulus"

// Follows the mouse: the card tilts and the shapes drift. The CSS reads --mx and --my (-1 to 1).
// Use: data-controller="tilt" data-action="mousemove->tilt#move mouseleave->tilt#reset"
export default class extends Controller {
  move(event) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const rect = this.element.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1

    this.element.style.setProperty("--mx", x.toFixed(3))
    this.element.style.setProperty("--my", y.toFixed(3))
  }

  reset() {
    this.element.style.setProperty("--mx", 0)
    this.element.style.setProperty("--my", 0)
  }
}
