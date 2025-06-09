class Api::ProgressCommentsController < ApplicationController
  before_action :authenticate_user!

  def index
    comments = current_user.progress_comments.where(task_id: params[:task_id]).order(created_at: :desc)
    render json: comments
  rescue => e
    Rails.logger.error "🔥コメント取得エラー: #{e.message}"
    render json: [], status: :ok
  end

  def create
    comment = current_user.progress_comments.build(progress_comment_params)
    if comment.save
      render json: comment, status: :created
    else
      render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    comment = current_user.progress_comments.find(params[:id])
    if comment.update(progress_comment_params)
      render json: comment
    else
      render json: { errors: comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    comment = current_user.progress_comments.find(params[:id])
    comment.destroy
    head :no_content
  end

  private

  def progress_comment_params
    params.require(:progress_comment).permit(:task_id, :content)
  end
end
