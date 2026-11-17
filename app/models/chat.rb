class Chat < ApplicationRecord
  belongs_to :traning

  has_many :messages, dependent: :destroy
  has_many :grades, dependent: :destroy
end
