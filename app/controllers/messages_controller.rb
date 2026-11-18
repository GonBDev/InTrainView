class MessagesController < ApplicationController
  def create
    @chat = current_user.chats.find(params[:chat_id])
    @message = @chat.messages.build(message_params)
    @message.role = "user"

    if @message.save
      create_assistant_message
      redirect_to chat_path(@chat), status: :see_other
    else
      @messages = @chat.messages.order(:created_at, :id)
      render "chats/show", status: :unprocessable_entity
    end
  end

  private

  def message_params
    params.require(:message).permit(:content)
  end

  def create_assistant_message
    rubyllm_chat = RubyLLM.chat(model: "gpt-4.1")
    rubyllm_chat.with_instructions(Message.system_prompt(@chat.training))

    @chat.messages.where.not(id: @message.id).order(:created_at, :id).each do |message|
      rubyllm_chat.add_message(role: message.role, content: message.content)
    end

    response = rubyllm_chat.ask(@message.content)

    @chat.messages.create!(
      role: "assistant",
      content: response.content
    )
  end
end
