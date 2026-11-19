import { Controller } from "@hotwired/stimulus"

// Chat window: scrolls to the newest message, grows the text box and sends with Enter.
// Messages, the typing indicator and the AI reply are added by Turbo Streams,
// so the page is never reloaded.
export default class extends Controller {
  static targets = ["thread", "form", "input", "send"]

  connect() {
    this.scrollToBottom(false)

    // Scroll again each time a message or the typing indicator is added
    this.observer = new MutationObserver(() => this.scrollToBottom())
    this.observer.observe(this.threadTarget, { childList: true })
  }

  disconnect() {
    if (this.observer) this.observer.disconnect()
  }

  // Runs each time a text box appears, including the new one that Turbo swaps in after a send
  inputTargetConnected(input) {
    if (input.disabled) return

    this.autosize()
    input.focus({ preventScroll: true })
  }

  // Enter sends. Shift+Enter makes a new line. Enter while typing Japanese (IME) is left alone.
  keydown(event) {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing || event.keyCode === 229) return

    event.preventDefault()
    this.formTarget.requestSubmit()
  }

  autosize() {
    const box = this.inputTarget
    box.style.height = "auto"
    box.style.height = `${Math.min(box.scrollHeight, 160)}px`
  }

  // A starter button fills the text box
  fill(event) {
    this.inputTarget.value = event.currentTarget.dataset.text
    this.autosize()
    this.inputTarget.focus()
  }

  // Nothing is sent for an empty box
  sending(event) {
    if (!this.inputTarget.value.trim()) event.preventDefault()
  }

  scrollToBottom(smooth = true) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    this.threadTarget.scrollTo({
      top: this.threadTarget.scrollHeight,
      behavior: smooth && !reduced ? "smooth" : "auto"
    })
  }
}
