class Api::SessionsController < ApplicationController
  # POST /api/login
  def create
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      token = JsonWebToken.encode(user_id: user.id)

      cookies.encrypted[:jwt] = {
        value: token,
        httponly: true,
        secure: false,     # 本番では true
        same_site: :lax    # 本番では :lax か :none（要CORS対応）
      }

      render json: { user: user.slice(:id, :email, :name) }, status: :ok
    else
      render json: { error: 'メールアドレスまたはパスワードが違います' }, status: :unauthorized
    end
  end

  # DELETE /api/logout
  def destroy
    cookies.delete(:jwt)
    cookies.delete(:refresh_token) # refresh_tokenを後で使う場合に備えて
    head :no_content
  end
end
