class Api::StatusesController < ApplicationController
  before_action :authenticate_user!

  def index
    # 自分のカスタム＋共通マスタ（ID:1,10）を合わせて返す
    statuses = Status
      .where(user_id: current_user.id, deleted_at: nil)
      .or(Status.where(user_id: nil, name: ['未着手', '完了']))
    render json: statuses
  end


  def create
    status = current_user.statuses.build(status_params)
    if status.save
      render json: status, status: :created
    else
      render json: { errors: status.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    status = current_user.statuses.find(params[:id])
    if status.update(status_params)
      render json: status
    else
      render json: { errors: status.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    status = current_user.statuses.find(params[:id])
    status.update(deleted_at: Time.current)
    head :no_content
  end

  private

  def status_params
    params.require(:status).permit(:name, :deleted_at)
  end
end
