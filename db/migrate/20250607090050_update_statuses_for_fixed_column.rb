class UpdateStatusesForFixedColumn < ActiveRecord::Migration[7.1]
  def change
    # is_activeを削除
    remove_column :statuses, :is_active, :boolean

    # fixedを追加（完了用）
    add_column :statuses, :fixed, :boolean, null: false, default: false
  end
end
