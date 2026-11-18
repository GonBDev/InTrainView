import { Controller } from "@hotwired/stimulus"

// Skills as chips: Enter or comma adds one, the cross removes it, suggestions add in one click.
// The hidden field keeps the list as "Skill one, Skill two" for the server.
export default class extends Controller {
  static targets = ["input", "hidden", "list", "suggestion"]
  static values = { max: { type: Number, default: 15 } }

  connect() {
    this.skills = this.hiddenTarget.value.split(",").map((s) => s.trim()).filter(Boolean)
    this.render()
  }

  keydown(event) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      this.commit()
    } else if (event.key === "Backspace" && this.inputTarget.value === "" && this.skills.length) {
      this.skills.pop()
      this.render()
      this.sync()
    }
  }

  // Add what is typed in the box
  commit() {
    const added = this.add(this.inputTarget.value)
    this.inputTarget.value = ""
    if (added) this.sync()
  }

  suggest(event) {
    if (this.add(event.currentTarget.dataset.skill)) this.sync()
  }

  remove(event) {
    this.skills.splice(Number(event.currentTarget.dataset.index), 1)
    this.render()
    this.sync()
  }

  add(raw) {
    const skill = raw.replace(/,/g, " ").trim()
    const exists = this.skills.some((s) => s.toLowerCase() === skill.toLowerCase())
    if (!skill || exists || this.skills.length >= this.maxValue) return false

    this.skills.push(skill)
    this.render(true)
    return true
  }

  render(animateLast = false) {
    this.listTarget.replaceChildren()

    this.skills.forEach((skill, index) => {
      const chip = document.createElement("span")
      chip.className = "chip"
      if (!(animateLast && index === this.skills.length - 1)) chip.style.animation = "none"

      const label = document.createElement("span")
      label.textContent = skill

      const button = document.createElement("button")
      button.type = "button"
      button.textContent = "×"
      button.setAttribute("aria-label", `Remove ${skill}`)
      button.dataset.index = index
      button.dataset.action = "skills#remove"

      chip.append(label, button)
      this.listTarget.appendChild(chip)
    })

    // Hide the suggestions that are already chosen
    const lower = this.skills.map((s) => s.toLowerCase())
    this.suggestionTargets.forEach((button) => {
      button.hidden = lower.includes(button.dataset.skill.toLowerCase())
    })
  }

  sync() {
    this.hiddenTarget.value = this.skills.join(", ")
    this.hiddenTarget.dispatchEvent(new Event("input", { bubbles: true }))
  }
}
