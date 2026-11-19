import { Controller } from "@hotwired/stimulus"

// 15 minute countdown of a practice.
// The server sends the seconds left. The deadline is computed once, so the clock stays
// right even if the tab sleeps. When it reaches zero, the Finish form is sent by itself.
export default class extends Controller {
  static targets = ["clock", "bar", "finish", "status"]
  static values = { seconds: Number, total: Number, running: Boolean }

  connect() {
    this.deadline = Date.now() + this.secondsValue * 1000
    this.over = false
    this.announced = new Set()
    this.render()

    if (this.runningValue) {
      this.interval = setInterval(() => this.render(), 250)
      this.visible = () => this.render()
      document.addEventListener("visibilitychange", this.visible)
    }
  }

  disconnect() {
    clearInterval(this.interval)
    if (this.visible) document.removeEventListener("visibilitychange", this.visible)
  }

  secondsLeft() {
    if (!this.runningValue) return this.secondsValue
    return Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000))
  }

  render() {
    const left = this.secondsLeft()
    const minutes = Math.floor(left / 60)
    const seconds = String(left % 60).padStart(2, "0")

    this.clockTarget.textContent = `${minutes}:${seconds}`
    this.barTarget.style.width = `${(left / this.totalValue) * 100}%`

    if (!this.runningValue) {
      this.element.dataset.state = "paused"
      return
    }

    this.element.dataset.state = left <= 60 ? "danger" : left <= 180 ? "warn" : "ok"
    this.announce(left)

    if (left === 0) this.timeUp()
  }

  // Short messages for screen readers
  announce(left) {
    const steps = { 300: "5 minutes left", 60: "1 minute left" }
    Object.entries(steps).forEach(([at, text]) => {
      if (left <= Number(at) && !this.announced.has(at)) {
        this.announced.add(at)
        if (this.hasStatusTarget) this.statusTarget.textContent = text
      }
    })
  }

  timeUp() {
    if (this.over) return
    this.over = true
    clearInterval(this.interval)

    this.element.dataset.state = "over"
    if (this.hasStatusTarget) this.statusTarget.textContent = "Time is up"
    if (this.hasFinishTarget) this.finishTarget.requestSubmit()
  }
}
