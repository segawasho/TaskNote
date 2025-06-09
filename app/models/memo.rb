class Memo < ApplicationRecord
  belongs_to :user
  belongs_to :customer, optional: true

  validates :title, presence: true, length: { maximum: 50 }
  validates :body, length: { maximum: 2000 }
end
