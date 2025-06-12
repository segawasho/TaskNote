class Task < ApplicationRecord
  belongs_to :user
  belongs_to :project, optional: true
  belongs_to :category, optional: true
  belongs_to :customer, optional: true
  belongs_to :status, optional: true
  has_many :progress_comments, dependent: :destroy

  validates :title, presence: true, length: { maximum: 50 }
end
