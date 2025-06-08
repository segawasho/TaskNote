class AddCustomerCodeToCustomers < ActiveRecord::Migration[7.1]
  def change
    add_column :customers, :customer_code, :string
  end
end
