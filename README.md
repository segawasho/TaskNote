# TaskNote 開発構成 README

## 概要

TaskNote は Rails API + Vite React SPA で構築された業務タスク＆メモ管理アプリです。
タスク管理に使える「顧客」「カテゴリ」「ステータス」はそれぞれユーザー自身がマスタとして登録してお使い頂ける柔軟な設計です。

---

## 📦 技術スタック

- バックエンド: Ruby on Rails (APIモード)
  - バージョン: Rails 7.1.3, Ruby 3.1.4
- フロントエンド: React + Vite
  - React 18.2.0, Vite 4.5.2
  - TailwindCSS 3.3.5
- DB: PostgreSQL
- パッケージ管理: npm
- 認証方式: JWT + Cookie（HttpOnly, SameSite=Lax）

---

## 📚 フロントエンド依存パッケージ

- 本アプリでは以下の主要ライブラリを使用しています：
  - [`@dnd-kit`](https://github.com/clauderic/dnd-kit): タスクやマスタのドラッグ＆ドロップ UI を実現
    - core: v6.3.1
    - sortable: v10.0.0
    - utilities: v3.2.2
  - [`chart.js`](https://www.chartjs.org/): ダッシュボード等でのグラフ描画用（v4.4.9）
  - [`react-chartjs-2`](https://react-chartjs-2.js.org/): React 向けの chart.js ラッパー（v5.3.0）

- その他、主要な依存ライブラリ：
  - React 18.2.0 / Vite 4.5.2 / React Router DOM 6.30.1 / TailwindCSS 3.3.5 など

### 🎯 バージョン固定について

- `package.json` ではすべての依存関係を `"^"` なしで**明示的なバージョン指定**としています。
  - これにより、開発・本番環境間の差異や破壊的変更による依存バグを防ぎ、**安定したビルド環境**を維持します。
  - 例: `"react": "18.2.0"`（`^18.2.0`ではない）

---

## 🔐 認証の仕組み（JWT + Refreshトークン）

- 会員登録（`POST /api/signup`）やログイン（`POST /api/login`）時にトークンを発行
  - `cookies.encrypted[:jwt]`: 短命トークン（例：15分間有効）
  - `cookies.encrypted[:refresh_token]`: 長命トークン（例：14日間有効、毎朝4時で一律失効）
- Cookie の属性：
  - `httponly: true`
  - `secure: Rails.env.production?`
  - `same_site: :lax`
- `ApplicationController` に `current_user` / `authenticate_user!` を定義
- 認証付きAPI例：`GET /api/current_user`

---

## ♻️ リフレッシュトークンの更新と失効

- JWTが失効して401を返した際、React側（app/javascript/components/api.js）で自動的に `POST /api/refresh_token` を叩いて再取得を試みる。
- サーバー側（`tokens_controller.rb`）でリフレッシュトークンの有効性を検証し、JWTを再発行。
- 更新成功時は `Token refreshed` を返し、React側は再実行。
- 失敗（例：リフレッシュトークンの有効期限切れ）の場合は `cookies.delete(:jwt)` `cookies.delete(:refresh_token)` でクッキー削除、ログアウトを促す。
- トークンの有効期限は以下のように設定：

```rb
# lib/json_web_token.rb
def self.refresh_token_expiration
  today_4am = Time.zone.now.beginning_of_day + 4.hours
  Time.zone.now > today_4am ? (today_4am + 1.day) : today_4am
end
```

> 毎日「日本時間の午前4時」でリフレッシュトークンを一律失効。  
> 例：6/1 22時にログイン → 有効期限は6/2 4:00AM。

---

## 🍪 認証・セッション管理設定（JWT + Cookie）

Rails APIモードで Cookie ベースのセッションを利用するため、以下の設定が必要です。

### Cookie の保存設定（`sessions_controller.rb` など）

```rb
cookies.encrypted[:jwt] = {
  value: token,
  httponly: true,
  secure: false, # 本番では trueにする！
  same_site: :lax
}

cookies.encrypted[:refresh_token] = {
  value: refresh_token,
  httponly: true,
  secure: false,
  same_site: :lax,
  expires: JsonWebToken.refresh_token_expiration
}
```

### Rails APIモードで Cookie を有効にする（`config/application.rb`）

```rb
config.middleware.use ActionDispatch::Cookies
config.middleware.use ActionDispatch::Session::CookieStore
```

---

## 🛠️ 開発・ビルド手順

### 開発環境（ローカル・ポート分離）

#### Rails API（port: 3001）

```bash
bin/rails s -p 3001
```

#### React / Vite（port: 3000）

```bash
npm run dev
```

### 本番想定ビルド（統合）
#### ※sessions_controller.rbのsecure設定直してから行う

```bash
npm run build
```

---

## 🌐 CORS 設定（`config/initializers/cors.rb`）

```rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:3000'
    resource '/api/*',
      credentials: true,
      methods: [:get, :post, :patch, :put, :delete, :options]
  end
end
```

---

## ⚙️ Vite 設定（`vite.config.ts`）

```ts
export default defineConfig({
  plugins: [react()],
  root: 'app/javascript', // JSXなどのルート
  build: {
    outDir: '../../public', // ✅ public配下にビルドファイルを出力
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': '/app/javascript',
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
```

---

## 🔁 ルーティング（`config/routes.rb`）

```rb
namespace :api do
  post '/signup', to: 'registrations#create'
  post '/login', to: 'sessions#create'
  post '/refresh_token', to: 'tokens#create'
  delete '/logout', to: 'sessions#destroy'
  get '/current_user', to: 'users#show'

  resources :roles, only: [:index]
  resources :industries, only: [:index]

  resources :users, only: [:index, :update]

  resources :categories
  resources :customers
  resources :statuses
  resources :tasks
end

# React SPA 用
get '*path', to: 'static#index', constraints: ->(req) { !req.xhr? && req.format.html? }
```

---

## 🐞 開発引き継ぎメモ
