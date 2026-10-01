module Api
  module V1
    class MedicalRecordsController < ApplicationController
      before_action :set_record, only: %i[show update destroy]

      def index
        records = MedicalRecord.includes(:patient, :doctor => :user)
        records = records.where(patient_id: params[:patient_id]) if params[:patient_id].present?
        records = records.order(visit_date: :desc).page(params[:page]).per(params[:per_page] || 10)
        render json: {
          medical_records: records.map { |r| record_json(r) },
          meta: pagination_meta(records)
        }
      end

      def show
        render json: record_json(@record)
      end

      def create
        record = MedicalRecord.new(record_params)
        if record.save
          render json: record_json(record), status: :created
        else
          render json: { errors: record.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @record.update(record_params)
          render json: record_json(@record)
        else
          render json: { errors: @record.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @record.destroy
        head :no_content
      end

      private

      def set_record
        @record = MedicalRecord.includes(:patient, :doctor => :user).find(params[:id])
      end

      def record_json(record)
        record.as_json.merge(
          patient_name: record.patient.name,
          doctor_name: record.doctor.user.name
        )
      end

      def record_params
        params.permit(:patient_id, :doctor_id, :diagnosis, :prescription, :notes, :visit_date)
      end
    end
  end
end
