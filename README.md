# TaskNote 開発構成 README

## Rails API + Vite React SPA

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

## 🔐 認証の仕組み（JWT + Cookie）

- 会員登録（`POST /api/signup`）やログイン（`POST /api/login`）時に `cookies.encrypted[:jwt]` にトークンを保存
- Cookie の属性：
  - `httponly: true`
  - `secure: Rails.env.production?`
  - `same_site: :lax`
- `ApplicationController` に `current_user` / `authenticate_user!` を定義
- 認証付きAPI例：`GET /api/current_user`

---

## 🍪 認証・セッション管理設定（JWT + Cookie）

Rails APIモードで Cookie ベースのセッションを利用するため、以下の設定が必要です。

### Cookie の保存設定（`sessions_controller.rb` など）

```rb
cookies.encrypted[:jwt] = {
  value: token,
  httponly: true,
  secure: false,     # 本番では true にする
  same_site: :lax    # 本番では :lax または :none（CORS構成により調整）
}
```

- `httponly`: JSからアクセス不可にする
- `secure`: 本番環境では HTTPS 接続に限定するため true にする
- `same_site`: 開発中は :lax、本番でドメインをまたぐ場合は :none（CORS対応必須）

### Rails APIモードで Cookie を有効にする（`config/application.rb`）

```rb
config.middleware.use ActionDispatch::Cookies
config.middleware.use ActionDispatch::Session::CookieStore
```

> Rails API モードではこれらのミドルウェアが無効化されているため、明示的に追加が必要です。

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

```bash
npm run build
```

- 出力先：`public/` 以下（`vite.config.ts` にて指定）

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
  root: 'app/javascript',
  build: {
    outDir: '../../public',
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
  delete '/logout', to: 'sessions#destroy'
  get '/current_user', to: 'users#show'

  resources :roles, only: [:index]
  resources :industries, only: [:index]
end

# React SPA 用
get '*path', to: 'static#index', constraints: ->(req) { !req.xhr? && req.format.html? }
```

---

## 🗃️ 主なDBテーブル構成（schema.rb抜粋）

### users
- name, email, password_digest
- role_id, industry_id（外部キー）
- プラン利用状況（has_project_plan 等）

### roles / role_categories
- name
- role_category_id（rolesに外部キー）

### industries
- name

---

## 📁 構成とチェックすべきファイル

### React側
- `app/javascript/index.jsx`：Reactルート
- `app/javascript/components/App.jsx`：ルーティング定義
- `app/javascript/components/Login.jsx`：ログインフォーム
- `app/javascript/components/Signup.jsx`：会員登録フォーム
- `app/javascript/styles/tailwind.css`

### Rails側
- `app/controllers/api/sessions_controller.rb`
- `app/controllers/api/registrations_controller.rb`
- `app/controllers/api/users_controller.rb`
- `app/controllers/application_controller.rb`
- `lib/json_web_token.rb`
- `config/routes.rb`
- `config/initializers/cors.rb`

---

## 🐞 開発引き継ぎメモ

- Viteのproxy開発では Cookie（SameSite＋HttpOnly）の取り扱いに注意が必要
- Cookie送信時に `credentials: 'include'` が `fetch` 側で有効になっているか？
- Cookieが保存されているか（DevTools > Application > Cookies）
- APIとReactが別ポートのため、CORSとSameSiteの相性に注意
- 本番ではポート統合 or サブドメイン + CORS構成の検討
