class Customer < ApplicationRecord
  belongs_to :user
  has_many :tasks, dependent: :nullify
  has_many :projects, dependent: :nullify
  has_many :memos # メモに必須じゃないので、dependent: :destroyは無し。

  validates :name, presence: true, uniqueness: { scope: :user_id }, length: { maximum: 15 }

  # customer_codeのバリデーション
  VALID_CUSTOMER_CODE_REGEX = /\A[a-zA-Z0-9\-_\.]{0,6}\z/
  validates :customer_code,
    format: { with: VALID_CUSTOMER_CODE_REGEX, message: 'は英数字と記号（-_.）のみ、最大6文字までで入力してください' },
    allow_blank: true
end
