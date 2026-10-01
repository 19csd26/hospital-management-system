module Api
  module V1
    class DoctorsController < ApplicationController
      before_action :set_doctor, only: %i[show update destroy]

      def index
        doctors = Doctor.includes(:user, :department)
        doctors = doctors.where(department_id: params[:department_id]) if params[:department_id].present?
        doctors = doctors.where(status: params[:status]) if params[:status].present?
        doctors = doctors.joins(:user).where("users.name ILIKE ?", "%#{params[:q]}%") if params[:q].present?
        doctors = doctors.order("users.name").page(params[:page]).per(params[:per_page] || 10)
        render json: {
          doctors: doctors.map { |d| doctor_json(d) },
          meta: pagination_meta(doctors)
        }
      end

      def show
        render json: {
          doctor: doctor_json(@doctor),
          upcoming_appointments: @doctor.appointments.upcoming.includes(:patient).limit(10).map { |a|
            a.as_json.merge(patient_name: a.patient.name)
          }
        }
      end

      def create
        doctor = Doctor.new(doctor_params)
        if doctor.save
          render json: doctor_json(doctor), status: :created
        else
          render json: { errors: doctor.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @doctor.update(doctor_params)
          render json: doctor_json(@doctor)
        else
          render json: { errors: @doctor.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @doctor.destroy
        head :no_content
      end

      private

      def set_doctor
        @doctor = Doctor.includes(:user, :department).find(params[:id])
      end

      def doctor_json(doctor)
        doctor.as_json.merge(
          user_name: doctor.user.name,
          user_email: doctor.user.email,
          user_phone: doctor.user.phone,
          user_avatar: doctor.user.avatar,
          department_name: doctor.department.name
        )
      end

      def doctor_params
        params.permit(:user_id, :department_id, :specialization, :license_number, :experience_years, :consultation_fee, :status)
      end
    end
  end
end
