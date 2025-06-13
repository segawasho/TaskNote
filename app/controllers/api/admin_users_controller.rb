class Api::AdminUsersController < ApplicationController
  before_action :authenticate_user!
  before_action :authorize_admin!

  # GET /api/admin_users
  def index
    users = User.all.order(:id)
    render json: users.as_json(only: [:id, :name, :email, :is_admin])
  end

  # PATCH /api/admin_users/:id
  def update
    user = User.find(params[:id])
    if user.update(user_params)
      render json: user.as_json(only: [:id, :name, :email, :is_admin])
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/admin_users/:id
  def destroy
    user = User.find(params[:id])
    user.destroy
    head :no_content
  end

  private

  def authorize_admin!
    render json: { error: 'Forbidden' }, status: :forbidden unless current_user.is_admin
  end

  def user_params
    params.require(:user).permit(:name, :email, :role_id, :industry_id, :is_admin)
  end
end
