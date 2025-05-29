# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_05_25_230000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "industries", force: :cascade do |t|
    t.string "name", null: false
    t.integer "sort_order", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["sort_order"], name: "index_industries_on_sort_order"
  end

  create_table "role_categories", force: :cascade do |t|
    t.string "name", null: false
    t.integer "sort_order", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["sort_order"], name: "index_role_categories_on_sort_order"
  end

  create_table "roles", force: :cascade do |t|
    t.string "name", null: false
    t.bigint "role_category_id", null: false
    t.integer "sort_order", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["role_category_id"], name: "index_roles_on_role_category_id"
    t.index ["sort_order"], name: "index_roles_on_sort_order"
  end

  create_table "users", force: :cascade do |t|
    t.string "name", limit: 20, null: false
    t.string "password_digest", null: false
    t.boolean "is_admin", default: false, null: false
    t.string "email", null: false
    t.string "prefecture"
    t.string "city"
    t.string "utm_source"
    t.string "utm_medium"
    t.boolean "has_project_plan", default: false
    t.boolean "has_wbs_plan", default: false
    t.boolean "has_file_upload_plan", default: false
    t.boolean "has_full_package_plan", default: false
    t.boolean "has_annual_plan", default: false
    t.boolean "is_invited_user", default: false
    t.bigint "role_id", null: false
    t.bigint "industry_id"
    t.string "custom_role_description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["industry_id"], name: "index_users_on_industry_id"
    t.index ["role_id"], name: "index_users_on_role_id"
  end

  add_foreign_key "roles", "role_categories"
  add_foreign_key "users", "industries"
  add_foreign_key "users", "roles"
end
