Rails.application.routes.draw do
  namespace :api do
    post '/signup', to: 'registrations#create'
    post '/login',  to: 'sessions#create'
    delete '/logout', to: 'sessions#destroy'
    get '/current_user',  to: 'users#show'

    resources :roles, only: [:index]
    resources :industries, only: [:index]

    resources :users, only: [:index, :update]

    resources :categories
    resources :customers
    resources :statuses
    resources :tasks

    # 翔メモ dashboard/summary どうするか検討
  end

  # API以外のリクエスト（React SPA）は全部 index.html に返す
  get '*path', to: 'static#index', constraints: ->(req) { !req.xhr? && req.format.html? }
end
