class CreateRoleCategories < ActiveRecord::Migration[7.1]
  def change
    create_table :role_categories do |t|
      t.string :name, null: false
      t.integer :sort_order, null: false, default: 0
      t.timestamps
    end

    add_index :role_categories, :sort_order
  end
end
