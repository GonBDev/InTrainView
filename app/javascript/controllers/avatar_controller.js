import { Controller } from "@hotwired/stimulus"

// Profile photo: pick a file, preview it right away, or remove it.
export default class extends Controller {
  static targets = ["input", "image", "initial", "flag", "removeButton", "error"]
  static MAX_SIZE = 5 * 1024 * 1024
  static TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

  choose() {
    this.inputTarget.click()
  }

  picked() {
    const file = this.inputTarget.files[0]
    if (!file) return

    if (!this.constructor.TYPES.includes(file.type)) {
      return this.fail("Use a JPG, PNG, WebP or GIF image.")
    }
    if (file.size > this.constructor.MAX_SIZE) {
      return this.fail("The image must be smaller than 5 MB.")
    }

    this.errorTarget.hidden = true
    this.imageTarget.src = URL.createObjectURL(file)
    this.show(true)
    this.flagTarget.value = "0"
    this.changed()
  }

  remove() {
    this.inputTarget.value = ""
    this.imageTarget.removeAttribute("src")
    this.show(false)
    this.flagTarget.value = "1"
    this.errorTarget.hidden = true
    this.changed()
  }

  show(hasPhoto) {
    this.imageTarget.hidden = !hasPhoto
    this.initialTarget.hidden = hasPhoto
    this.removeButtonTarget.hidden = !hasPhoto
    this.element.dataset.filled = hasPhoto
  }

  fail(message) {
    this.inputTarget.value = ""
    this.errorTarget.textContent = message
    this.errorTarget.hidden = false
  }

  changed() {
    this.dispatch("changed")
  }
}
