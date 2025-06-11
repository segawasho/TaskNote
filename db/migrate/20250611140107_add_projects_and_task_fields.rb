class AddProjectsAndTaskFields < ActiveRecord::Migration[7.1]
  def change
    # projects テーブル新規作成
    create_table :projects do |t|
      t.string :name, null: false
      t.text :description
      t.date :start_date
      t.date :end_date
      t.references :customer, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.timestamps
    end

    # tasks テーブルに紐付けカラムを追加
    change_table :tasks do |t|
      t.references :project, foreign_key: true
      t.date :start_date
    end
  end
end
