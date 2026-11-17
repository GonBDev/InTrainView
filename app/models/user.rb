class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :trainings, dependent: :destroy
  has_many :chats, through: :trainings
end
