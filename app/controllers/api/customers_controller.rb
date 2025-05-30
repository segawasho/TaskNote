class Api::CustomersController < ApplicationController
  before_action :authenticate_user!

  def index
    render json: current_user.customers.where(deleted_at: nil)
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
    customer.update(deleted_at: Time.current)
    head :no_content
  end

  private

  def customer_params
    params.require(:customer).permit(:name, :customer_code, :deleted_at)
  end
end
