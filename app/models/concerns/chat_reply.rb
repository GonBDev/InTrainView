# The AI's answer to the candidate's last message.
module ChatReply
  extend ActiveSupport::Concern

  # True while the last message is from the candidate and has no answer yet
  def reply_pending?
    in_progress? && messages.order(:created_at, :id).last&.role == "user"
  end

  # Asks the AI to answer the last message and saves its reply.
  # Returns the saved message, or nil when there is nothing to answer
  # (already answered by another request, or the practice is finished).
  def generate_reply!
    return unless reply_pending?

    history = messages.order(:created_at, :id).to_a
    last = history.pop

    llm = RubyLLM.chat(model: "gpt-4.1")
    llm.with_instructions(Message.system_prompt(training))
    history.each { |message| llm.add_message(role: message.role, content: message.content) }
    response = llm.ask(last.content)

    reply = nil
    # The AI call is done, the lock only covers the save so pause and Finish are never blocked
    with_lock do
      reply = messages.create!(role: "assistant", content: response.content) if reply_pending?
    end
    reply
  end
end
