import { Controller } from "@hotwired/stimulus"

// Message after an action: it disappears by itself after a few seconds.
export default class extends Controller {
  static values = { delay: { type: Number, default: 5000 } }

  connect() {
    this.timer = setTimeout(() => this.close(), this.delayValue)
  }

  disconnect() {
    clearTimeout(this.timer)
  }

  close() {
    clearTimeout(this.timer)
    this.element.classList.add("is-leaving")
    setTimeout(() => this.element.remove(), 300)
  }
}
