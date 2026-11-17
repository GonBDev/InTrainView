class Grade < ApplicationRecord
  belongs_to :chat

  validates :criterion, presence: true
  validates :score, numericality: { only_integer: true, in: 0..10 }, allow_nil: true
end
