import { Controller } from "@hotwired/stimulus"

// Sends its form as soon as it appears on the page.
// Used by the typing indicator to ask for the AI reply.
export default class extends Controller {
  connect() {
    this.timer = setTimeout(() => this.element.requestSubmit(), 50)
  }

  disconnect() {
    clearTimeout(this.timer)
  }
}
