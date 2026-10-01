module Api
  module V1
    class AppointmentsController < ApplicationController
      before_action :set_appointment, only: %i[show update destroy]

      def index
        appointments = Appointment.includes(:patient, :doctor => :user)
        appointments = appointments.where(patient_id: params[:patient_id]) if params[:patient_id].present?
        appointments = appointments.where("doctors.id = ?", params[:doctor_id]).joins(:doctor) if params[:doctor_id].present?
        appointments = appointments.where(status: params[:status]) if params[:status].present?
        appointments = appointments.where(appointment_date: Date.parse(params[:date]).all_day) if params[:date].present?
        appointments = appointments.order(appointment_date: :desc).page(params[:page]).per(params[:per_page] || 10)
        render json: {
          appointments: appointments.map { |a| appointment_json(a) },
          meta: pagination_meta(appointments)
        }
      end

      def show
        render json: appointment_json(@appointment)
      end

      def create
        appointment = Appointment.new(appointment_params)
        if appointment.save
          render json: appointment_json(appointment), status: :created
        else
          render json: { errors: appointment.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @appointment.update(appointment_params)
          render json: appointment_json(@appointment)
        else
          render json: { errors: @appointment.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @appointment.destroy
        head :no_content
      end

      private

      def set_appointment
        @appointment = Appointment.includes(:patient, :doctor => :user).find(params[:id])
      end

      def appointment_json(appointment)
        appointment.as_json.merge(
          patient_name: appointment.patient.name,
          patient_phone: appointment.patient.phone,
          doctor_name: appointment.doctor.user.name,
          doctor_specialization: appointment.doctor.specialization
        )
      end

      def appointment_params
        params.permit(:doctor_id, :patient_id, :appointment_date, :status, :notes)
      end
    end
  end
end
