class Api::UsersController < ApplicationController
  before_action :authenticate_user!

  # GET /api/current_user
  def show
    render json: {
      user: {
        id: current_user.id,
        email: current_user.email,
        name: current_user.name,
        is_admin: current_user.is_admin
      }
    }
  end
end
