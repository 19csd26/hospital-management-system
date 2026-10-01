Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post "auth/login", to: "auth#login"
      post "auth/register", to: "auth#register"
      get "auth/me", to: "auth#me"

      get "dashboard/stats", to: "dashboard#stats"

      resources :patients
      resources :doctors
      resources :departments
      resources :appointments
      resources :medical_records
      resources :rooms
      resources :bills
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
