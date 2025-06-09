class Api::MemosController < ApplicationController
  before_action :authenticate_user!

  def index
    memos = current_user.memos
    memos = memos.where(customer_id: params[:customer_id]) if params[:customer_id].present?
    memos = memos.where("title ILIKE ?", "%#{params[:title]}%") if params[:title].present?
    memos = memos.where("body ILIKE ?", "%#{params[:body]}%") if params[:body].present?

    render json: memos.order(updated_at: :asc)
  end

  def show
    memo = current_user.memos.find(params[:id])
    render json: memo
  end

  def create
    memo = current_user.memos.build(memo_params)
    if memo.save
      render json: memo, status: :created
    else
      render json: { errors: memo.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    memo = current_user.memos.find(params[:id])
    if memo.update(memo_params)
      render json: memo
    else
      render json: { errors: memo.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    memo = current_user.memos.find(params[:id])
    memo.destroy
    head :no_content
  end

  private

  def memo_params
    params.require(:memo).permit(:title, :body, :customer_id)
  end
end
