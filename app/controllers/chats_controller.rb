class ChatsController < ApplicationController
  def create
    @training = current_user.trainings.find(params[:training_id])
    @chat = @training.chats.create!(status: "in_progress")

    redirect_to chat_path(@chat), status: :see_other
  end

  def show
    @chat = current_user.chats.find(params[:id])
    @messages = @chat.messages.order(:created_at, :id)
    @message = Message.new
  end

  def destroy
    @chat = current_user.chats.find(params[:id])
    @training = @chat.training
    @chat.destroy!

    redirect_to training_path(@training),
                notice: "Practice deleted.",
                status: :see_other
  end
end
