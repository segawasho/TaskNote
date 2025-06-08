class RemoveDeletedAtFromCustomers < ActiveRecord::Migration[7.1]
  def change
    remove_column :customers, :deleted_at, :datetime
  end
end
