class CreateProgressComments < ActiveRecord::Migration[7.1]
  def change
    create_table :progress_comments do |t|
      t.references :task, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text :content

      t.timestamps
    end
  end
end
