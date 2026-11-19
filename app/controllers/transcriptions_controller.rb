class TranscriptionsController < ApplicationController
  def create
    # Restrict transcription to a chat owned by the signed-in user.
    @chat = current_user.chats.find(params[:chat_id])

    if @chat.status == "completed"
      render json: { error: "This practice session is complete." },
             status: :unprocessable_entity
      return
    end

    # The browser will upload the recording under the name "audio".
    audio = params[:audio]

    unless audio.is_a?(ActionDispatch::Http::UploadedFile) && audio.size.positive?
      render json: { error: "Please provide a recording." },
             status: :unprocessable_entity
      return
    end

    # Send the uploaded temporary file to the transcription model.
    transcription = RubyLLM.transcribe(
      audio.tempfile.path,
      model: "whisper-1"
    )

    # Return text for the browser to place in the answer box.
    render json: { text: transcription.text }
  rescue RubyLLM::Error, Faraday::Error => e
    Rails.logger.warn("Transcription failed: #{e.class}")

    render json: { error: "Could not transcribe the recording. Please try again." },
           status: :bad_gateway
  end
end
