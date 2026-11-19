import { Controller } from "@hotwired/stimulus"

// Training form: example jobs fill the field, and the description shows its length.
export default class extends Controller {
  static targets = ["job", "description", "count"]

  connect() {
    this.count()
  }

  fill(event) {
    this.jobTarget.value = event.currentTarget.dataset.text
    this.jobTarget.focus()
  }

  count() {
    this.countTarget.textContent = this.descriptionTarget.value.length
  }
}
