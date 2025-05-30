class CreateTaskRelatedTables < ActiveRecord::Migration[7.1]
  def change
    create_table :categories do |t|
      t.string :name, null: false
      t.timestamps
    end

    create_table :customers do |t|
      t.string :name, null: false
      t.timestamps
    end

    create_table :statuses, id: false do |t|
      t.primary_key :id
      t.string :name, null: false
      t.timestamps
    end

    # IDを固定で挿入したいので、ここで初期データも登録
    reversible do |dir|
      dir.up do
        execute "INSERT INTO statuses (id, name, created_at, updated_at) VALUES (1, '未着手', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
        execute "INSERT INTO statuses (id, name, created_at, updated_at) VALUES (10, '完了', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
      end
    end

    create_table :tasks do |t|
      t.string :title, null: false
      t.text :description
      t.date :due_date

      t.references :user, null: false, foreign_key: true
      t.references :category, null: false, foreign_key: true
      t.references :customer, null: false, foreign_key: true
      t.references :status, null: false, foreign_key: true

      t.timestamps
    end
  end
end
