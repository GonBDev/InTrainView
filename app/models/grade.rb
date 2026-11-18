class Grade < ApplicationRecord
  belongs_to :chat

  CRITERIA = {
    "interview" => [
      "Industry knowledge",
      "Clarity",
      "Tone",
      "Adaptability",
      "Evidence and examples"
    ],
    "negotiation" => [
      "Clarity of request",
      "Assertiveness",
      "Justification",
      "Handling objections",
      "Win-win orientation"
    ]
  }.freeze

  validates :criterion, presence: true
  validates :score,
            numericality: { only_integer: true, in: 0..10 },
            allow_nil: true
  validates :advice, presence: true
end
