class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :name, limit: 20, null: false
      t.string :password_digest, null: false
      t.boolean :is_admin, null: false, default: false

      t.string :email, null: false
      t.string :prefecture
      t.string :city
      t.string :utm_source
      t.string :utm_medium

      # プラン系（初期値はすべて false）
      t.boolean :has_project_plan, default: false
      t.boolean :has_wbs_plan, default: false
      t.boolean :has_file_upload_plan, default: false
      t.boolean :has_full_package_plan, default: false
      t.boolean :has_annual_plan, default: false
      t.boolean :is_invited_user, default: false

      # 職種・業種・自由記述
      t.references :role, null: false, foreign_key: true
      t.references :industry, foreign_key: true
      t.string :custom_role_description

      t.timestamps
    end

    add_index :users, :email, unique: true
  end
end
