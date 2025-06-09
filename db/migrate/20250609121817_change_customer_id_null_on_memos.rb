class ChangeCustomerIdNullOnMemos < ActiveRecord::Migration[7.1]
  def change
    change_column_null :memos, :customer_id, true
  end
end
