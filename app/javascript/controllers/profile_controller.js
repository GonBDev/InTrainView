import { Controller } from "@hotwired/stimulus"

// Profile page: live completion bar, "unsaved changes" message and bio counter.
export default class extends Controller {
  static targets = ["bar", "percent", "status", "saveBar", "bio", "count"]

  connect() {
    this.update()
  }

  // Called on every change in the form
  touch() {
    this.update()
    this.saveBarTarget.classList.add("is-dirty")
    this.statusTarget.textContent = "You have unsaved changes"
  }

  update() {
    const fields = Array.from(this.element.querySelectorAll("[data-profile-field]"))
    const filled = fields.filter((field) => this.isFilled(field)).length
    const percent = Math.round((filled * 100) / fields.length)

    this.barTarget.style.setProperty("--value", percent)
    this.percentTarget.textContent = `${percent}%`
    this.barTarget.parentElement.setAttribute("aria-valuenow", percent)

    if (this.hasBioTarget) this.countTarget.textContent = this.bioTarget.value.length
  }

  isFilled(field) {
    if (field.dataset.filled !== undefined) return field.dataset.filled === "true"
    if (field.matches("fieldset")) return field.querySelector(":checked") !== null
    return field.value.trim() !== ""
  }
}
