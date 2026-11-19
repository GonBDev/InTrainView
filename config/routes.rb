Rails.application.routes.draw do
  devise_for :users
  resource :profile, only: [:show, :update]
  root to: "pages#home"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
  #
  resources :trainings do
    resources :chats, only: [:create]
  end

  # For chats. update is Finish (grading). pause and resume stop and restart the timer.
  resources :chats, only: [:show, :update, :destroy] do
    member do
      patch :pause
      patch :resume
    end
    resources :messages, only: [:create]
    resource :reply, only: [:create]
    resources :transcriptions, only: [:create]
  end
end
