class Api::RegistrationsController < ApplicationController
  # POST /api/signup
  def create
    user = User.new(user_params)
    if user.save
      # JWT トークンの生成
      token = JsonWebToken.encode(user_id: user.id)

      # Cookie にトークンを保存（環境に合わせたセキュリティ設定付き）
      cookies.encrypted[:jwt] = {
        value: token,
        httponly: true,
        secure: false,     # 本番では true
        same_site: :lax    # 本番では :lax か :none（要CORS対応）
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
