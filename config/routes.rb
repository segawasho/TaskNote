Rails.application.routes.draw do
  namespace :api do
    post '/signup', to: 'registrations#create'
    post '/login',  to: 'sessions#create'
    delete '/logout', to: 'sessions#destroy'
    get '/current_user',  to: 'users#show'
    resources :roles, only: [:index]
    resources :industries, only: [:index]
  end

  # API以外のリクエスト（React SPA）は全部 index.html に返す
  get '*path', to: 'static#index', constraints: ->(req) { !req.xhr? && req.format.html? }
end
