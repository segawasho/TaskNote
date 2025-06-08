class Api::StatusesController < ApplicationController
  before_action :authenticate_user!

  # 一覧取得（自分のステータス + 完了固定）
  def index
    statuses = current_user.statuses.order(:sort_order, :id)
    render json: statuses
  end

  # 作成（fixedは必ずfalse、バリデーションで最大9件制限あり）
  def create
    max_sort_order = current_user.statuses.where(fixed: false).maximum(:sort_order).to_i
    status = current_user.statuses.build(status_params.merge(fixed: false, sort_order: max_sort_order + 1))

    if status.save
      render json: status, status: :created
    else
      render json: { errors: status.errors.full_messages }, status: :unprocessable_entity
    end
  end


  # 更新（fixed:true のステータスは編集不可）
  def update
    status = current_user.statuses.find(params[:id])

    if status.fixed
      render json: { error: 'このステータスは固定のため編集できません' }, status: :unprocessable_entity
      return
    end

    if status.update(status_params)
      render json: status
    else
      render json: { errors: status.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def reorder
    reorder_params[:statuses].each do |status_param|
      status = current_user.statuses.find(status_param[:id])
      status.update(sort_order: status_param[:sort_order]) unless status.fixed
    end
    head :no_content
  end


  # 削除（固定ステータスは不可。タスクに紐づいてる場合も不可）
  def destroy
    status = current_user.statuses.find(params[:id])

    if status.fixed
      render json: { error: 'このステータスは固定のため削除できません' }, status: :unprocessable_entity
      return
    end

    if current_user.statuses.where(fixed: false).count <= 1
      render json: { error: 'ステータスは「完了」を含めて最低2つ必要です（完了以外をすべて削除することはできません）' }, status: :unprocessable_entity
      return
    end

    if status.tasks.exists?
      render json: { error: 'このステータスはタスクに使われている為削除できません。' }, status: :unprocessable_entity
      return
    end

    status.destroy!
    head :no_content
  end

  private

  def status_params
    params.require(:status).permit(:name)
  end

  def reorder_params
    params.permit(statuses: [:id, :sort_order])
  end
end
