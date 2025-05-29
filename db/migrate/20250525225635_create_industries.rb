class CreateIndustries < ActiveRecord::Migration[7.1]
  def change
    create_table :industries do |t|
      t.string :name, null: false
      t.integer :sort_order, null: false, default: 0
      t.timestamps
    end

    add_index :industries, :sort_order
  end
end
