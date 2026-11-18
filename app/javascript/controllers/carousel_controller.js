import { Controller } from "@hotwired/stimulus"

// Horizontal carousel of tiles with previous and next buttons.
export default class extends Controller {
  static targets = ["track", "prev", "next"]

  connect() {
    this.update()
  }

  next() {
    this.scroll(1)
  }

  prev() {
    this.scroll(-1)
  }

  scroll(direction) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    this.trackTarget.scrollBy({ left: direction * this.step(), behavior: reduced ? "auto" : "smooth" })
  }

  // Width of one tile plus the gap between tiles
  step() {
    const tile = this.trackTarget.querySelector(".tile")
    return tile ? tile.offsetWidth + 20 : 300
  }

  // Disable a button when there is nothing more to scroll to
  update() {
    const track = this.trackTarget
    const atStart = track.scrollLeft <= 4
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4

    this.prevTarget.disabled = atStart
    this.nextTarget.disabled = atEnd
  }
}
