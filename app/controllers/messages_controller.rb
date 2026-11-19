class MessagesController < ApplicationController
  # Saves the candidate's message. The answer comes in two steps so nothing waits:
  # this request shows the message and a typing indicator at once, then the indicator
  # asks RepliesController for the AI answer.
  def create
    @chat = current_user.chats.find(params[:chat_id])

    if @chat.status == "completed"
      redirect_to chat_path(@chat),
                  alert: "This practice session is already complete.",
                  status: :see_other
      return
    end

    if @chat.time_up?
      redirect_to chat_path(@chat),
                  alert: "Time is up. Finish the practice to see your feedback.",
                  status: :see_other
      return
    end

    if @chat.paused?
      redirect_to chat_path(@chat),
                  alert: "The practice is paused. Resume it to keep going.",
                  status: :see_other
      return
    end

    # The previous message has no answer yet: show the page, it waits for the reply
    if @chat.reply_pending?
      redirect_to chat_path(@chat), status: :see_other
      return
    end

    @message = @chat.messages.build(message_params)
    @message.role = "user"

    if @message.save
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to chat_path(@chat), status: :see_other }
      end
    else
      respond_to do |format|
        format.turbo_stream { render :create, status: :unprocessable_entity }
        format.html do
          @messages = @chat.messages.order(:created_at, :id)
          render "chats/show", status: :unprocessable_entity
        end
      end
    end
  end

  private

  def message_params
    params.require(:message).permit(:content)
  end
end
