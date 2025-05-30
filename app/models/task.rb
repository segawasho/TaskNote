class Task < ApplicationRecord
  belongs_to :user
  belongs_to :category
  belongs_to :customer
  belongs_to :status

  validates :title, presence: true, length: { maximum: 50 }
  validates :due_date, presence: true
end
