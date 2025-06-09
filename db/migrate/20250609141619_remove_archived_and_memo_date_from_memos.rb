class RemoveArchivedAndMemoDateFromMemos < ActiveRecord::Migration[7.1]
  def change
    remove_column :memos, :archived, :boolean
    remove_column :memos, :memo_date, :date
  end
end
