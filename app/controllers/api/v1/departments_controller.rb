module Api
  module V1
    class DepartmentsController < ApplicationController
      before_action :set_department, only: %i[show update destroy]

      def index
        departments = Department.all.order(:name)
        render json: departments.map { |d|
          d.as_json.merge(doctors_count: d.doctors.count, available_rooms: d.rooms.where(status: "available").count)
        }
      end

      def show
        render json: @department.as_json.merge(
          doctors: @department.doctors.includes(:user).map { |d| { id: d.id, name: d.user.name, specialization: d.specialization } },
          rooms: @department.rooms.as_json
        )
      end

      def create
        department = Department.new(department_params)
        if department.save
          render json: department, status: :created
        else
          render json: { errors: department.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @department.update(department_params)
          render json: @department
        else
          render json: { errors: @department.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @department.destroy
        head :no_content
      end

      private

      def set_department
        @department = Department.find(params[:id])
      end

      def department_params
        params.permit(:name, :description, :head_doctor, :phone)
      end
    end
  end
end
