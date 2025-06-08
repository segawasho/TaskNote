class AddIsActiveAndRemoveDeletedAtFromStatuses < ActiveRecord::Migration[7.1]
  def change
    add_column :statuses, :is_active, :boolean, default: true, null: false
    remove_column :statuses, :deleted_at, :datetime
  end
end
