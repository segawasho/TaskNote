class AddSortOrderToStatuses < ActiveRecord::Migration[7.1]
  def change
    add_column :statuses, :sort_order, :integer, default: 0, null: false
  end
end
