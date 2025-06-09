Rails.application.routes.draw do
  namespace :api do
    post '/signup', to: 'registrations#create'
    post '/login',  to: 'sessions#create'
    post '/refresh_token', to: 'tokens#create'
    delete '/logout', to: 'sessions#destroy'
    get '/current_user',  to: 'users#show'

    resources :roles, only: [:index]
    resources :industries, only: [:index]

    resources :users, only: [:index, :update]

    resources :categories
    resources :customers
    resources :statuses do
      collection do
        patch :reorder
      end
    end
    resources :tasks, only: [:index, :create, :update, :destroy] do
      resources :progress_comments, only: [:index]
    end
    resources :progress_comments, only: [:create, :update, :destroy]

    # 翔メモ dashboard/summary どうするか検討
  end

  # API以外のリクエスト（React SPA）は全部 index.html に返す
  get '*path', to: 'static#index', constraints: ->(req) { !req.xhr? && req.format.html? }
end
