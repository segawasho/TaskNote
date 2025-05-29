class Api::IndustriesController < ApplicationController
  def index
    industries = Industry.order(:sort_order)
    render json: industries.as_json(only: [:id, :name, :sort_order])
  end
end
