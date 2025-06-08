class Status < ApplicationRecord
  belongs_to :user, optional: true
  has_many :tasks, dependent: :restrict_with_exception

  validates :name, presence: true, uniqueness: { scope: :user_id }, length: { maximum: 6 }
  validate :custom_status_limit, on: :create
  validate :name_change_restriction, on: :update

  FIXED_STATUS_NAME = '完了'

  scope :fixed,  -> { where(user_id: nil) }


  private

  # ユーザーごとの登録可能数：完了を除く最大9件（未着手含む）
  def custom_status_limit
    return if user.nil?

    custom_count = user.statuses
                      .where(fixed: false)
                      .count

    if custom_count >= 9
      errors.add(:base, '作成できるステータスは最大9件までです（完了を除く）')
    end
  end

  # fixedがtrue（完了）は名前変更禁止
  def name_change_restriction
    return unless fixed_changed = self.fixed_was == true && self.name_changed?

    errors.add(:name, 'は変更できません（固定ステータス）')
  end
end
