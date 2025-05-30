class User < ApplicationRecord
  has_secure_password

  has_many :tasks, dependent: :destroy
  has_many :statuses, dependent: :destroy
  has_many :categories, dependent: :destroy
  has_many :customers, dependent: :destroy

  after_create :create_default_statuses

  belongs_to :role
  belongs_to :industry, optional: true

  validates :name, presence: true, length: { maximum: 20 }
  validates :email, presence: true, uniqueness: true

  private

  def create_default_statuses
    %w[未着手 完了].each do |name|
      Status.find_or_create_by!(user_id: id, name: name)
    end
  end
end
