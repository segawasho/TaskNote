class ChangeTasksColumnsToNullable < ActiveRecord::Migration[7.1]
  def change
    change_column_null :tasks, :customer_id, true
    change_column_null :tasks, :category_id, true
    change_column_null :tasks, :status_id, true
  end
end
