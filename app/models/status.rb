class Status < ApplicationRecord
  belongs_to :user, optional: true
  has_many :tasks, dependent: :restrict_with_exception

  validates :name, presence: true
  validate :custom_status_limit

  private

  def custom_status_limit
    return if user.nil?  # 共通マスタはスルー

    if user.statuses.where.not(name: ['未着手', '完了']).count >= 8
      errors.add(:base, "作成できるステータスは最大8件までです（未着手・完了除く）")
    end
  end
end
