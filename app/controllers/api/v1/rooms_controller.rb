module Api
  module V1
    class RoomsController < ApplicationController
      before_action :set_room, only: %i[show update destroy]

      def index
        rooms = Room.includes(:department)
        rooms = rooms.where(status: params[:status]) if params[:status].present?
        rooms = rooms.where(department_id: params[:department_id]) if params[:department_id].present?
        rooms = rooms.where(room_type: params[:room_type]) if params[:room_type].present?
        rooms = rooms.order(:room_number).page(params[:page]).per(params[:per_page] || 20)
        render json: {
          rooms: rooms.map { |r| r.as_json.merge(department_name: r.department.name) },
          meta: pagination_meta(rooms)
        }
      end

      def show
        render json: @room.as_json.merge(department_name: @room.department.name)
      end

      def create
        room = Room.new(room_params)
        if room.save
          render json: room, status: :created
        else
          render json: { errors: room.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @room.update(room_params)
          render json: @room
        else
          render json: { errors: @room.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @room.destroy
        head :no_content
      end

      private

      def set_room
        @room = Room.includes(:department).find(params[:id])
      end

      def room_params
        params.permit(:department_id, :room_number, :room_type, :status, :floor, :capacity, :rate_per_day)
      end
    end
  end
end
