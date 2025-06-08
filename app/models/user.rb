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
    statuses_data = [
      { name: '未着手', fixed: false, sort_order: 1 },
      { name: '完了', fixed: true, sort_order: 999 } # 完了は常に最後
    ]

    statuses_data.each do |status_attrs|
      statuses.create!(status_attrs)
    end
  end


end
