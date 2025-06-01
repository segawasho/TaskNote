class Api::TokensController < ApplicationController
  before_action :authenticate_user!, except: [:create]
  # POST /api/refresh_token
  # フロントエンドからは非同期的に叩かれる（ユーザー操作不要）

  def create
    refresh_token = cookies.encrypted[:refresh_token]

    payload = JsonWebToken.decode(refresh_token)
    # refresh_tokenをCookieから取り出して中身を復号

    if payload && (user = User.find_by(id: payload['user_id']))
      # user_idが正しければ、新しい jwt を再発行 → Cookieにセット
      token = JsonWebToken.encode(user_id: user.id)
      cookies.encrypted[:jwt] = {
        value: token,
        httponly: true,
        secure: Rails.env.production?,
        same_site: :lax
      }

      render json: { message: 'Token refreshed' }, status: :ok
    else
      cookies.delete(:jwt)
      cookies.delete(:refresh_token)
      render json: { error: 'Invalid refresh token' }, status: :unauthorized
    end
  end
end
