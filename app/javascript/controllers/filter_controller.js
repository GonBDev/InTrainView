import { Controller } from "@hotwired/stimulus"

// Trainings page: filter the cards by practice mode and by words in the job title.
export default class extends Controller {
  static targets = ["item", "tab", "query", "empty"]

  connect() {
    this.kind = "all"
    // With no training yet, the page has no filters to run
    if (this.hasQueryTarget) this.apply()
  }

  show(event) {
    this.kind = event.currentTarget.dataset.kind
    this.tabTargets.forEach((tab) => {
      const active = tab === event.currentTarget
      tab.classList.toggle("is-active", active)
      tab.setAttribute("aria-pressed", active)
    })
    this.apply()
  }

  search() {
    this.apply()
  }

  apply() {
    const words = this.queryTarget.value.trim().toLowerCase()
    let visible = 0

    this.itemTargets.forEach((item) => {
      const match = (this.kind === "all" || item.dataset.kind === this.kind) && item.dataset.title.includes(words)
      item.hidden = !match
      if (match) visible += 1
    })

    this.emptyTarget.hidden = visible > 0
  }
}
