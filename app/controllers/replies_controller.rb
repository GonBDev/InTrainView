# The AI's answer to the last message of a chat, added to the page by a Turbo Stream.
class RepliesController < ApplicationController
  def create
    @chat = current_user.chats.find(params[:chat_id])

    begin
      @reply = @chat.generate_reply!
    rescue StandardError => e
      Rails.logger.error("Chat reply failed: #{e.class}: #{e.message}")
      reply_failed
      return
    end

    if @reply
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to chat_path(@chat), status: :see_other }
      end
    else
      # Nothing to answer (already answered or finished): show the page as it is now
      redirect_to chat_path(@chat), status: :see_other
    end
  end

  private

  # The candidate's message is saved. The page shows a "Try again" button.
  def reply_failed
    respond_to do |format|
      format.turbo_stream { render :failed, status: :service_unavailable }
      format.html do
        redirect_to chat_path(@chat),
                    alert: "The coach could not answer. Try again in a moment.",
                    status: :see_other
      end
    end
  end
end
