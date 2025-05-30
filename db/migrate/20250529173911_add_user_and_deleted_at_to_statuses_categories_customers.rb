class AddUserAndDeletedAtToStatusesCategoriesCustomers < ActiveRecord::Migration[7.1]
  def change
    # statuses
    add_reference :statuses, :user, foreign_key: true, null: true
    add_column :statuses, :deleted_at, :datetime

    # categories
    add_reference :categories, :user, null: false, foreign_key: true
    add_column :categories, :deleted_at, :datetime

    # customers
    add_reference :customers, :user, null: false, foreign_key: true
    add_column :customers, :deleted_at, :datetime
  end
end
