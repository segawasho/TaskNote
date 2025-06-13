class ApplicationController < ActionController::API
  include ActionController::Cookies

  def current_user
    return nil unless cookies.encrypted[:jwt]

    decoded = JsonWebToken.decode(cookies.encrypted[:jwt])
    if decoded
      @current_user = User.find_by(id: decoded[:user_id])
    else
      @current_user = nil
    end
  end

  def authenticate_user!
    render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user
  end

  def authorize_admin!
    render json: { error: 'Forbidden' }, status: :forbidden unless current_user&.is_admin
  end
end
