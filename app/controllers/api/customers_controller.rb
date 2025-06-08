class Api::CustomersController < ApplicationController
  before_action :authenticate_user!

  def index
    render json: current_user.customers
  end

  def create
    customer = current_user.customers.build(customer_params)
    if customer.save
      render json: customer, status: :created
    else
      render json: { errors: customer.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    customer = current_user.customers.find(params[:id])
    if customer.update(customer_params)
      render json: customer
    else
      render json: { errors: customer.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    customer = current_user.customers.find(params[:id])

    if customer.tasks.exists?
      render json: { error: 'この顧客はタスクに使われている為削除できません。' }, status: :unprocessable_entity
      return
    end

    customer.destroy!
    head :no_content
  end

  private

  def customer_params
    params.require(:customer).permit(:name, :customer_code, :deleted_at)
  end
end
