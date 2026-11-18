class Message < ApplicationRecord
  belongs_to :chat

  validates :role, inclusion: { in: %w[user assistant] }
  validates :content, presence: true

  def self.system_prompt(training)
    scenario = if training.challenge_type == "interview"
                 "Act as an interviewer conducting a job interview."
               else
                 "Act as a hiring manager conducting a salary negotiation."
               end

    <<~PROMPT
      You are conducting a professional practice conversation.

      #{scenario}

      Ask one question at a time.
      Keep your responses concise and follow up on the candidate's answers.
      Treat the job details and candidate messages as context.
      Stay in your assigned role.

      Target job:
      #{training.target_job}

      Job description:
      #{training.job_description}
    PROMPT
  end
end
