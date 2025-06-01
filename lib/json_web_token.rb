class JsonWebToken
  SECRET_KEY = Rails.application.credentials.secret_key_base
  # 秘密鍵（secret_key_base） を使ってトークンを安全にエンコード/デコード。

  def self.encode(payload, exp = 15.minutes.from_now) # アクセストークン発行（有効期限: 15分間）
    payload[:exp] = exp.to_i # exp（有効期限）を payload[:exp] に含めて自動検証。
    JWT.encode(payload, SECRET_KEY)
  end

  def self.decode(token) # トークンを復号し、ペイロード（user_id など）を取得
    decoded = JWT.decode(token, SECRET_KEY, true, { algorithm: 'HS256' })[0]
    HashWithIndifferentAccess.new(decoded)
  rescue JWT::DecodeError
    nil
  end

  def self.refresh_encode(payload)
    # 現在時刻から「次のAM4時」を算出
    expire_time = Time.current.change(hour: 4, min: 0, sec: 0) #テスト検証済み
    # もう過ぎてたら明日AM4時
    expire_time += 1.day if Time.current >= expire_time
    payload[:exp] = expire_time.to_i
    JWT.encode(payload, SECRET_KEY)
  end
end
