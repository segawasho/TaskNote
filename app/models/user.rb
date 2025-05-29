class User < ApplicationRecord
  has_secure_password

  belongs_to :role
  belongs_to :industry, optional: true

  validates :name, presence: true, length: { maximum: 20 }
  validates :email, presence: true, uniqueness: true
end
