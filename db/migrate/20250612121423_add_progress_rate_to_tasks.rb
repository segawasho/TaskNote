class AddProgressRateToTasks < ActiveRecord::Migration[7.1]
  def change
    add_column :tasks, :progress_rate, :integer
  end
end
