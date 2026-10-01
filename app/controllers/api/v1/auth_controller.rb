module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!, only: [ :login, :register ]

      def login
        user = User.find_by(email: params[:email])
        if user&.authenticate(params[:password])
          token = JwtService.encode(user_id: user.id)
          render json: { token:, user: user_json(user) }
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def register
        user = User.new(register_params)
        if user.save
          token = JwtService.encode(user_id: user.id)
          render json: { token:, user: user_json(user) }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def me
        render json: { user: user_json(current_user) }
      end

      private

      def register_params
        params.permit(:name, :email, :password, :password_confirmation, :role, :phone)
      end

      def user_json(user)
        user.as_json(only: %i[id name email role phone avatar created_at])
      end
    end
  end
end
