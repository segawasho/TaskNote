class RemoveDeletedAtFromCategories < ActiveRecord::Migration[7.1]
  def change
    remove_column :categories, :deleted_at, :datetime
  end
end
