class Project < ApplicationRecord
  belongs_to :user
  belongs_to :customer, optional: true
  has_many :tasks, dependent: :destroy

  validates :name, presence: true
end
