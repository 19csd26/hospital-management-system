module Api
  module V1
    class PatientsController < ApplicationController
      before_action :set_patient, only: %i[show update destroy]

      def index
        patients = Patient.all
        patients = patients.where("name ILIKE ? OR email ILIKE ?", "%#{params[:q]}%", "%#{params[:q]}%") if params[:q].present?
        patients = patients.order(created_at: :desc).page(params[:page]).per(params[:per_page] || 10)
        render json: { patients: patients.as_json, meta: pagination_meta(patients) }
      end

      def show
        render json: {
          patient: @patient.as_json,
          appointments: @patient.appointments.includes(:doctor => :user).order(appointment_date: :desc).map { |a|
            a.as_json.merge(
              doctor_name: a.doctor.user.name,
              doctor_specialization: a.doctor.specialization
            )
          },
          medical_records: @patient.medical_records.includes(:doctor => :user).order(visit_date: :desc).map { |r|
            r.as_json.merge(doctor_name: r.doctor.user.name)
          },
          bills: @patient.bills.order(created_at: :desc).map { |b|
            b.as_json.merge(outstanding_amount: b.outstanding_amount)
          },
          stats: {
            total_appointments: @patient.appointments.count,
            upcoming_appointments: @patient.appointments.upcoming.count,
            total_records: @patient.medical_records.count,
            total_billed: @patient.bills.sum(:total_amount),
            total_paid: @patient.bills.sum(:paid_amount),
            outstanding: @patient.bills.sum(:total_amount) - @patient.bills.sum(:paid_amount)
          }
        }
      end

      def create
        patient = Patient.new(patient_params)
        if patient.save
          render json: patient, status: :created
        else
          render json: { errors: patient.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @patient.update(patient_params)
          render json: @patient
        else
          render json: { errors: @patient.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @patient.destroy
        head :no_content
      end

      private

      def set_patient
        @patient = Patient.find(params[:id])
      end

      def patient_params
        params.permit(:name, :email, :phone, :date_of_birth, :gender, :blood_group, :address, :emergency_contact, :emergency_phone)
      end
    end
  end
end
