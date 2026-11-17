class Training < ApplicationRecord
  belongs_to :user

  has_many :chats, dependent: :destroy

  CHALLENGE_TYPES = %w[interview negotiation].freeze
  validates :challenge_type, inclusion: { in: CHALLENGE_TYPES }
end
