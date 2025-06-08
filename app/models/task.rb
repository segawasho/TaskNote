class Task < ApplicationRecord
  belongs_to :user
  belongs_to :category
  belongs_to :customer
  belongs_to :status

  scope :done, -> { where(status_id: 10) }
  scope :not_done, -> { where.not(status_id: 10) }

  validates :title, presence: true, length: { maximum: 50 }
  validates :due_date, presence: true
end
