// Imports the base class that every Stimulus controller extends.
import { Controller } from "@hotwired/stimulus"

// Exports this controller so Stimulus can connect it to data-controller="voice".
export default class extends Controller {
  // Matches the elements marked with data-voice-target in your HTML.
  // Stimulus provides this.recordTarget, this.stopTarget, etc.
    static targets = ["record", "stop", "status", "playback", "input"]
    static values = { url: String }

  // async allows this method to use await while requesting microphone access.
  async start() {
    // Prevents another click on Record while permission or recording is pending.
    this.recordTarget.disabled = true

    // Updates the status paragraph in the page.
    this.statusTarget.textContent = "Requesting microphone access…"

    // Errors inside this block are handled by catch below.
    try {
      // Requests microphone permission and waits for an audio stream.
      // A stream represents the live audio coming from the microphone.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Permission may arrive after the user has navigated away.
      // isConnected tells us whether this controller's element is still in the DOM.
      if (!this.element.isConnected) {
        // Stops every microphone track so the microphone is released.
        stream.getTracks().forEach(track => track.stop())

        // Exits start() because there is no longer a page to update.
        return
      }

      // Stores the stream on this controller so other methods can release it.
      this.stream = stream

      // Starts a fresh array to collect the recorded audio pieces.
      this.chunks = []

      // Creates a recorder for the microphone stream.
      // The browser selects its default recording format.
      this.recorder = new MediaRecorder(stream)

      // Runs when the recorder makes a piece of recorded audio available.
      // The arrow function keeps "this" pointing to the Stimulus controller.
      this.recorder.addEventListener("dataavailable", event => {
        // Keeps audio pieces that contain data.
        if (event.data.size > 0) this.chunks.push(event.data)
      })

      // Runs after recording stops and the final audio data is delivered.
      this.recorder.addEventListener("stop", async () => {
        // Recording has finished, so release the microphone.
        this.releaseMicrophone()

        // Avoids updating the page if the user has already left.
        if (!this.element.isConnected) return

        // Combines the recorded chunks into one Blob, a binary data object.
        const audio = new Blob(this.chunks, {
          // Labels the Blob with the format actually used by the recorder.
          type: this.recorder.mimeType
        })

        // Releases the previous recording's temporary URL, if one exists.
        if (this.audioUrl) URL.revokeObjectURL(this.audioUrl)

        // Creates a temporary browser URL that points to the audio Blob.
        this.audioUrl = URL.createObjectURL(audio)

        // Gives the <audio> player the recording to play.
        this.playbackTarget.src = this.audioUrl

        // Makes the previously hidden player visible.
        this.playbackTarget.hidden = false

        // Allows the user to record another answer.
        // this.recordTarget.disabled = false

        // Explains that the recording is ready for playback.
        // this.statusTarget.textContent = "Recording ready. Press Play to listen."
        await this.transcribe(audio)
      })

      // Start capturing audio.
      this.recorder.start()

      // Show the Stop symbol and enable the button.
      this.updateButton(true)
      this.stopTarget.disabled = false

      // Shows the current recording state.
      this.statusTarget.textContent = "Listening… Press Stop when finished."
    } catch (error) {
        this.releaseMicrophone()

        // Restore the microphone symbol and allow another attempt.
        this.updateButton(false)
        this.recordTarget.disabled = false

        this.statusTarget.textContent =
          "Could not record. Check microphone permission and try again."
      }
    }

  // Called by the Stop button through data-action="voice#stop".
  stop() {
    // Prevents repeated Stop clicks while the recording is being finalized.
    this.stopTarget.disabled = true

    // Finalizing the recording happens asynchronously.
    this.statusTarget.textContent = "Preparing playback…"

    // Stops recording and triggers the final dataavailable event,
    // followed by the stop event handled above.
    this.recorder.stop()
  }

  // Receives the audio Blob created when recording stops.
  // async lets us wait for the upload and response using await.
  async transcribe(audio) {
    // Tell the user that the recording is being converted into text.
    this.statusTarget.textContent = "Transcribing your answer…"

    // Choose a filename extension matching the browser's audio format.
    let extension = "webm"
    if (audio.type.includes("mp4")) extension = "m4a"
    if (audio.type.includes("ogg")) extension = "ogg"

    // Build a multipart upload, like a form containing a file input.
    const formData = new FormData()

    // "audio" becomes params[:audio] in TranscriptionsController.
    // The third argument gives the uploaded file its name.
    formData.append("audio", audio, `answer.${extension}`)

    try {
      // Read this.urlValue from data-voice-url-value in the HTML.
      // Send the recording to POST /chats/:chat_id/transcriptions.
      const response = await fetch(this.urlValue, {
        method: "POST",
        headers: {
          // Ask Rails to respond with JSON.
          Accept: "application/json",

          // Include the authenticity token Rails uses to verify POST requests.
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').content
        },

        // The browser sets the multipart Content-Type and boundary automatically.
        body: formData
      })

      // Convert the JSON response into a JavaScript object.
      const data = await response.json()

      // fetch also resolves for HTTP errors such as 422 or 502.
      // Throwing here sends those failures to the catch block.
      if (!response.ok) throw new Error(data.error || "Transcription failed.")

      // The user may have left the page while waiting for the response.
      if (!this.element.isConnected) return

      // Read the transcription and remove spaces at its beginning and end.
      // ?. handles a response where text is missing or null.
      const text = data.text?.trim()

      // Stop here if the returned transcription is empty.
      if (!text) throw new Error("No speech was detected. Please record again.")

      // Read whatever is currently in the answer box.
      const draft = this.inputTarget.value

      // Append the transcription on a new line when a draft already exists.
      // Otherwise, fill the empty answer box with the transcription.
      this.inputTarget.value = draft.trim() ? `${draft}\n${text}` : text

      // Setting .value in JavaScript doesn't fire an input event automatically.
      // Dispatch one so the existing chat#autosize action resizes the text area.
      // bubbles: true lets the event travel through the surrounding DOM.
      this.inputTarget.dispatchEvent(new Event("input", { bubbles: true }))

      // Place the cursor in the answer box for reviewing or editing.
      this.inputTarget.focus()

      // Let the user choose when to submit the reviewed answer.
      this.statusTarget.textContent = "Review your answer, then press Send."

      // Announce that transcription has finished and the text box is filled.
      this.dispatch("transcribed")
    } catch (error) {
      // Avoid updating controls after the user has left the page.
      if (!this.element.isConnected) return

      // Display an upload, server, or empty-transcription error.
      this.statusTarget.textContent =
        `Could not transcribe. ${error.message}`

        this.dispatch("transcription-error", {
          detail: { message: this.statusTarget.textContent }
        })
    } finally {
      if (this.element.isConnected) {
        // Restore the microphone after transcription succeeds or fails.
        this.updateButton(false)
        this.recordTarget.disabled = false
      }
    }
  }



  // A shared helper for releasing access to the microphone.
  releaseMicrophone() {
    // ?. skips this operation if no stream has been assigned.
    // Stopping each track releases the microphone.
    this.stream?.getTracks().forEach(track => track.stop())
  }

  // Release recording resources when leaving the page.
  disconnect() {
    if (this.recorder?.state === "recording") this.recorder.stop()
    this.releaseMicrophone()
    if (this.audioUrl) URL.revokeObjectURL(this.audioUrl)
  }

  // Clicking the microphone starts recording; clicking again stops it.
  toggle() {
    if (this.recorder?.state === "recording") {
      this.stop()
    } else {
      this.start()
    }
  }

  // Update the button's symbol and accessible description.
  updateButton(recording) {
    const label = recording ? "Stop recording" : "Start recording"

    this.recordTarget.textContent = recording ? "■" : "🎤"
    this.recordTarget.setAttribute("aria-label", label)
    this.recordTarget.setAttribute("title", label)
    this.recordTarget.setAttribute("aria-pressed", String(recording))
  }
} // Closes the controller class after all its methods.
