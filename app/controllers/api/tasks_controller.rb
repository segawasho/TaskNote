class Api::TasksController < ApplicationController
  before_action :authenticate_user!

  def index
    tasks = current_user.tasks.includes(:category, :customer, :status)

    render json: tasks.as_json(include: [:category, :customer, :status])
  end

  def create
    task = current_user.tasks.build(task_params)
    if task.save
      render json: task, status: :created
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    task = current_user.tasks.find(params[:id])
    if task.update(task_params)
      render json: task
    else
      render json: { errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    task = current_user.tasks.find(params[:id])
    task.destroy
    head :no_content
  end

  private

  def task_params
    params.require(:task).permit(
      :title, :description, :due_date,
      :customer_id, :category_id, :status_id, :project_id, :start_date,
      :progress_rate
    )
  end
end
