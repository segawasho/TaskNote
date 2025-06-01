class Api::RegistrationsController < ApplicationController
  # POST /api/signup
  def create
    user = User.new(user_params)
    if user.save
      token = JsonWebToken.encode(user_id: user.id)
      # lib/json_web_token.rb の処理にて「jwt（有効15分）」を発行
      refresh_token = JsonWebToken.refresh_encode(user_id: user.id)
      # lib/json_web_token.rb の処理にて「refresh_token（有効14日）」を発行

      # 👇 jwt＆refresh_token両方をCookieに HttpOnly 付きでセット
      cookies.encrypted[:jwt] = {
        value: token,
        httponly: true,
        secure: false,     # 本番では true
        same_site: :lax    # 本番では :lax か :none（要CORS対応）
      }

      cookies.encrypted[:refresh_token] = {
        value: refresh_token,
        httponly: true,
        secure: false,
        same_site: :lax
      }

      render json: { user: user.slice(:id, :email, :name) }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(
      :name, :email, :password, :password_confirmation,
      :role_id, :industry_id, :custom_role_description
    )
  end
end
