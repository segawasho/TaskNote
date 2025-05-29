class CreateRoles < ActiveRecord::Migration[7.1]
  def change
    create_table :roles do |t|
      t.string :name, null: false
      t.references :role_category, null: false, foreign_key: true
      t.integer :sort_order, null: false, default: 0
      t.timestamps
    end

    add_index :roles, :sort_order
  end
end
