class ChangeProgressRateDefaultInTasks < ActiveRecord::Migration[7.1]
  def change
    change_column_default :tasks, :progress_rate, from: nil, to: 0
  end
end
