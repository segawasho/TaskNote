class Api::SessionsController < ApplicationController
  # POST /api/login
  def create
    user = User.find_by(email: params[:email])
    # Email/Passwordでログイン

    if user&.authenticate(params[:password])
      token = JsonWebToken.encode(user_id: user.id)
      # lib/json_web_token.rb の処理にて「jwt（有効15分）」を発行
      refresh_token = JsonWebToken.refresh_encode(user_id: user.id)
      # lib/json_web_token.rb の処理にて「refresh_token（毎日日本時間AM4時に失効）」を発行

      # 👇 jwt＆refresh_token両方をCookieに HttpOnly 付きでセット

      cookies.encrypted[:jwt] = {
        value: token,
        httponly: true,
        secure: false,     # 本番では trueにする！
        same_site: :lax
      }

      cookies.encrypted[:refresh_token] = {
        value: refresh_token,
        httponly: true,
        secure: false,     # 本番では trueにする！
        same_site: :lax
      }

      render json: { user: user.slice(:id, :email, :name) }, status: :ok
    else
      render json: { error: 'メールアドレスまたはパスワードが違います' }, status: :unauthorized
    end
  end

  # DELETE /api/logout
  # 👇 両Cookie削除（クライアントのセッション無効化）
  def destroy
    cookies.delete(:jwt)
    cookies.delete(:refresh_token)
    head :no_content
  end
end
