class Api::ProjectsController < ApplicationController
  before_action :authenticate_user!

  def index
    projects = current_user.projects.includes(:customer)
    render json: projects.as_json(include: {
      customer: { only: [:id, :name, :customer_code] }
    })
  end

  def show
    project = current_user.projects.includes(:customer, :tasks).find(params[:id])
    render json: project.as_json(include: {
      customer: { only: [:id, :name, :customer_code] },
      tasks: { only: [:id, :title, :start_date, :due_date] }
    })
  end

  def create
    project = current_user.projects.build(project_params)
    if project.save
      render json: project, status: :created
    else
      render json: { errors: project.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    project = current_user.projects.find(params[:id])
    if project.update(project_params)
      render json: project
    else
      render json: { errors: project.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    project = current_user.projects.find(params[:id])
    project.destroy
    head :no_content
  end

  private

  def project_params
    params.require(:project).permit(
      :name, :description, :start_date, :end_date, :customer_id
    )
  end
end
