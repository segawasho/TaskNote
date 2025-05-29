
# TaskNote 開発構成 README
## Rails API + Vite React SPA

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

## 🔐 認証の仕組み（JWT＋Cookie）

- 会員登録 (`POST /api/signup`) / ログイン (`POST /api/login`) 時に `cookies.encrypted[:jwt]` にトークン保存
- Cookie属性:
  - `httponly: true`
  - `secure: Rails.env.production?`
  - `same_site: :lax`
- 認証チェック: `ApplicationController` で `current_user` を定義し、`authenticate_user!` で保護
- 認証付きAPI例: `GET /api/current_user`

---

## 🛠️ 開発・ビルド手順

### 開発時（ローカル分離）
- Rails API: `localhost:3001`
  ```bash
  bin/rails s -p 3001
  ```
- Vite（React）: `localhost:3000`
  ```bash
  npm run dev
  ```

### 本番想定ビルド（統合）
```bash
npm run build
```
- 出力先: `public/` 以下（vite.config.tsで設定）

---

## 🌐 CORS 設定（`config/initializers/cors.rb`）

```ruby
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

## 🐞 現在の課題（開発引き継ぎメモ）

- ログイン成功しても Cookie にトークンが保存されていない可能性あり
- その結果、`/api/current_user` にアクセスすると `Unauthorized` が返る
- Viteのproxy開発では Cookie（SameSite＋HttpOnly）の取り扱いに注意が必要

---

## ✅ 今後確認したいこと

- Cookie送信時に `credentials: 'include'` が `fetch` 側で有効になっているか？
- Cookieが保存されているか（DevTools > Application > Cookies）
- APIとReactが別ポートのため、CORSとSameSiteの相性に注意
- 本番ではポート統合 or サブドメイン + CORS構成の検討
