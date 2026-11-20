import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
  "toggle", "status", "message", "endTurn", "voiceControls", "textMode"
]

  connect() {
    // Voice mode starts off when opening or restoring a chat.
    this.enabled = false
    if (!this.hasToggleTarget) return

    this.toggleTarget.checked = false

    if (!("speechSynthesis" in window)) {
      this.toggleTarget.disabled = true
      this.statusTarget.textContent = "Speech playback is unavailable."
    }
  }

  change() {
    this.enabled = this.toggleTarget.checked
    this.stop()
      this.autoSubmit = false
      this.updateModeDisplay()

    this.endTurnTarget.hidden = !this.enabled
    this.endTurnTarget.disabled = true

    if (!this.enabled) {
      // Stop an active recording and preserve its transcription in the draft.
      const voice = this.voiceController
      if (voice?.recorder?.state === "recording") voice.stop()
      return
    }

   // Inspect saved conversation messages, excluding the typing indicator.
    const messages = this.element.querySelectorAll(
      "#chat_messages [data-message-role]"
    )
    const lastMessage = messages[messages.length - 1]

    if (lastMessage?.dataset.messageRole === "assistant") {
      // The assistant has already answered: read its latest turn aloud.
      this.speak(lastMessage)
    } else if (lastMessage?.dataset.messageRole === "user") {
      // A reply is pending. Keep voice mode enabled until it arrives.
      this.statusTarget.textContent = "Waiting for the assistant…"
    } else {
      this.statusTarget.textContent = "Waiting for the opening question…"
    }
  }

  // Stimulus calls this when Turbo inserts an assistant message.
  messageTargetConnected(message) {
    if (this.enabled) this.speak(message)
  }

  speak(message) {
    this.stop()

    // Read the message paragraphs without reading the hidden speaker label.
    const text = Array.from(message.querySelectorAll(".chat-bubble p"))
      .map(paragraph => paragraph.textContent)
      .join("\n")

    if (!text.trim()) return

    this.utterance = new SpeechSynthesisUtterance(text)
    this.utterance.lang = "en-US"
    // Slightly slower than the default.
      this.utterance.rate = 0.9

      // Prefer a matching English voice installed on this device.
        const voices = window.speechSynthesis.getVoices()

        // Prefer these voices when available on the current device.
        const preferredNames = [
          "Google US English",
          "Microsoft Aria Online (Natural) - English (United States)",
          "Microsoft Jenny Online (Natural) - English (United States)",
          "Ava",
          "Samantha"
        ]

        const preferredVoice = preferredNames
          .map(name => voices.find(voice => voice.name === name))
          .find(Boolean)

        // Fall back to a default English voice, then any English voice.
        const voice = preferredVoice ||
                      voices.find(voice => voice.default && voice.lang.startsWith("en")) ||
                      voices.find(voice => voice.lang.startsWith("en"))

        this.utterance.lang = "en-US"
        this.utterance.rate = 1
        this.utterance.pitch = 1

        if (voice) {
          this.utterance.voice = voice
          this.utterance.lang = voice.lang
        }

      if (voice) this.utterance.voice = voice

    // Begin the candidate's turn only after the assistant finishes speaking.
    this.utterance.onend = () => {
      if (this.enabled) this.startListening()
    }

    this.utterance.onerror = () => {
      this.statusTarget.textContent =
        "Speech playback failed. Switch voice mode off and on to retry."
    }

    this.statusTarget.textContent = "Assistant speaking…"
    window.speechSynthesis.speak(this.utterance)
  }

  stop(event) {
    // Only header actions—Pause, Resume, Finish, and timer expiry—exit voice mode.
    // The hidden AI-reply form should keep the conversation loop running.
    const leavingVoiceMode =
      event?.type === "turbo:before-cache" ||
      (event?.type === "submit" &&
      Boolean(event.target.closest(".chat-top")))

    // Cancel speech without triggering the microphone handoff.
    if (this.utterance) {
      this.utterance.onend = null
      this.utterance.onerror = null
    }

    if ("speechSynthesis" in window) window.speechSynthesis.cancel()
    if (this.hasStatusTarget) this.statusTarget.textContent = ""
  }

  disconnect() {
    this.enabled = false
    this.stop()
  }

    // Locate the existing dictation controller on the current composer.
  get voiceController() {
    const composer = this.element.querySelector("#chat_composer")
    if (!composer) return null

    return this.application.getControllerForElementAndIdentifier(
      composer, "voice"
    )
  }

  // Configure each new End turn button when Turbo replaces the composer.
  endTurnTargetConnected(button) {
    button.hidden = !this.enabled
    button.disabled = true
  }

  // Reuse the microphone recording code that already works.
  async startListening() {
    if (!this.enabled) return

    const voice = this.voiceController

    // A disabled input means the chat is paused, expired, or waiting.
    if (!voice || voice.inputTarget.disabled) return

    this.statusTarget.textContent = "Requesting microphone…"
    await voice.start()

    // Permission may arrive after voice mode was switched off.
    if (!this.enabled || !this.element.isConnected) {
      if (voice.recorder?.state === "recording") voice.stop()
      return
    }

    if (voice.recorder?.state === "recording") {
      this.endTurnTarget.disabled = false
      this.statusTarget.textContent = "Listening… Press End turn when finished."
    } else {
      this.statusTarget.textContent =
        "Microphone unavailable. Check permission and try again."
    }
  }

  // Stop recording; the existing voice controller transcribes the answer.
  endTurn() {
    this.endTurnTarget.disabled = true

    const voice = this.voiceController
    if (voice?.recorder?.state === "recording") {
      // End turn authorizes automatic submission after transcription.
      this.autoSubmit = true
      voice.stop()
      this.statusTarget.textContent = "Transcribing your answer…"
    }
  }

    // Keep the selected mode when Turbo replaces the composer.
  voiceControlsTargetConnected(element) {
    element.hidden = !this.enabled
  }

  textModeTargetConnected(element) {
    element.hidden = Boolean(this.enabled)
  }

  updateModeDisplay() {
    if (this.hasVoiceControlsTarget) {
      this.voiceControlsTarget.hidden = !this.enabled
    }

    if (this.hasTextModeTarget) {
      this.textModeTarget.hidden = this.enabled
    }
  }

  // Return to text mode and preserve any transcription as a draft.
  changeMode() {
    this.autoSubmit = false
    this.toggleTarget.checked = false
    this.change()
  }

  // Receive voice:transcribed from the recording controller.
  submitTurn() {
    if (!this.enabled || !this.autoSubmit) return
    this.autoSubmit = false

    const voice = this.voiceController

    if (!voice || voice.inputTarget.disabled) {
      this.changeMode()
      return
    }

    const form = voice.inputTarget.form

    if (!form.checkValidity()) {
      this.changeMode()
      form.reportValidity()
      return
    }

    this.statusTarget.textContent = "Waiting for the assistant…"
    form.requestSubmit()
  }

  // Reveal the text composer when transcription fails.
  transcriptionFailed(event) {
    this.changeMode()
    this.statusTarget.textContent = event.detail.message
  }
}
