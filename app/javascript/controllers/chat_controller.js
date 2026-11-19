import { Controller } from "@hotwired/stimulus"

// Chat window: scroll to the latest message, grow the text box, send with Enter,
// and show your answer plus a typing indicator right away while the AI replies.
export default class extends Controller {
  static targets = ["thread", "form", "input", "send", "typing"]

  connect() {
    this.scrollToBottom(false)

    // A finished practice has no text box
    if (this.hasInputTarget) {
      this.autosize()
      this.inputTarget.focus({ preventScroll: true })
    }
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

  sending(event) {
    const text = this.inputTarget.value.trim()
    if (!text) {
      event.preventDefault()
      return
    }

    const empty = this.element.querySelector(".chat-empty")
    if (empty) empty.remove()

    this.threadTarget.insertBefore(this.bubble(text), this.typingTarget)
    this.typingTarget.hidden = false
    this.element.classList.add("is-waiting")
    this.sendTarget.disabled = true
    this.scrollToBottom()
  }

  bubble(text) {
    const row = document.createElement("div")
    row.className = "chat-row chat-row-you is-new"

    const bubble = document.createElement("div")
    bubble.className = "chat-bubble"
    text.split(/\n{2,}/).forEach((paragraph) => {
      const p = document.createElement("p")
      p.textContent = paragraph
      p.style.whiteSpace = "pre-line"
      bubble.appendChild(p)
    })

    row.appendChild(bubble)
    return row
  }

  scrollToBottom(smooth = true) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    this.threadTarget.scrollTo({
      top: this.threadTarget.scrollHeight,
      behavior: smooth && !reduced ? "smooth" : "auto"
    })
  }
}
