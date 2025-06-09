class Api::DashboardController < ApplicationController
  before_action :authenticate_user!

  def summary
    user_id = current_user.id
    today = Time.zone.today
    incomplete_status_ids = Status.where(fixed: false).pluck(:id) # 未完了ステータス

    # 1. ステータス別（未完了かつ期限が本日以前）
    tasks = Task.where(user_id: current_user.id, status_id: incomplete_status_ids).where("due_date <= ?", today)
    status_counts = tasks.group(:status_id).count
    statuses = Status.where(id: status_counts.keys).pluck(:id, :name).to_h
    status_chart = status_counts.map { |id, count| { label: statuses[id], value: count } }

    # 2. 期限別分類（未完了のみ）
    all_tasks = Task.where(user_id: current_user.id, status_id: incomplete_status_ids)
    due_bar_chart = [
      { label: "期限切れ", value: all_tasks.where("DATE(due_date) < ?", today).count },
      { label: "本日",     value: all_tasks.where("DATE(due_date) = ?", today).count },
      { label: "明日以降", value: all_tasks.where("DATE(due_date) > ?", today).count }
    ]

    # 3. 顧客ごとの件数（未完了）
    customer_tasks = all_tasks.where.not(customer_id: nil)
    customer_counts = customer_tasks.group(:customer_id).count
    customers = Customer.where(id: customer_counts.keys).pluck(:id, :customer_code, :name)
    customer_map = customers.to_h { |id, code, name| [id, { code: code, name: name }] }

    customer_task_table = customer_counts.map do |customer_id, count|
      tasks = all_tasks.where(customer_id: customer_id).pluck(:title, :due_date)
      {
        customer_code: customer_map[customer_id][:code],
        name: customer_map[customer_id][:name],
        count: count,
        tasks: tasks.map { |title, due| { title: title, due_date: due } }
      }
    end


    render json: {
      status_chart: status_chart,
      due_bar_chart: due_bar_chart,
      customer_task_table: customer_task_table
    }
  end
end
