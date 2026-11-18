class ChatsController < ApplicationController
  def create
    @training = current_user.trainings.find(params[:training_id])
    @chat = @training.chats.create!(status: "in_progress")

    redirect_to chat_path(@chat), status: :see_other
  end

  def create # Handles the request to start a practice session.
    @training = current_user.trainings.find(params[:training_id]) # Finds a training owned by the signed-in user.

    @chat = Chat.new(status: "in_progress") # Builds an unsaved chat with its starting status.
    @chat.training = @training # Connects the chat to its training and, through it, its owner.

    if @chat.save # Saves the chat and checks whether its validations passed.
      create_opening_message # Asks the AI for the first question and saves it.
      redirect_to chat_path(@chat), status: :see_other # Opens the saved chat after the POST request.
    else # Handles a chat that could not be saved.
      @chats = @training.chats.includes(:messages).order(created_at: :desc, id: :desc) # Reloads practice history for the training view.
      render "trainings/show", status: :unprocessable_entity # Displays the training page with a validation failure status.
    end # Finishes the save-success or save-failure branch.
  end # Finishes the create action.

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

  def update
    @chat = current_user.chats.find(params[:id])

    unless @chat.messages.where(role: "user").exists?
      redirect_to chat_path(@chat),
                  alert: "Answer at least one question before finishing.",
                  status: :see_other
      return
    end

    @chat.generate_grades!

    redirect_to chat_path(@chat),
                notice: "Practice completed.",
                status: :see_other
  end

  private # Makes the following helper available only inside the controller.

  def create_opening_message # Generates the coach's opening turn for the new chat.
    rubyllm_chat = RubyLLM.chat(model: "gpt-4.1") # Starts an AI conversation using the lesson's model.
    rubyllm_chat.with_instructions(Message.system_prompt(@training)) # Supplies the practice mode and job details.

    response = rubyllm_chat.ask( # Requests the first coach message.
      "Begin the practice session. Briefly introduce yourself and ask your first question." # Tells the coach how to begin.
    ) # Completes the request and assigns its result to response.

    @chat.messages.create!( # Saves the reply in this chat and raises an error if saving fails.
      role: "assistant", # Identifies the message as the coach's turn.
      content: response.content # Stores the text returned by the AI.
    ) # Completes creation of the saved opening message.
  end # Finishes the opening-message helper.
end
