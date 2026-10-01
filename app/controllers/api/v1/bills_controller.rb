module Api
  module V1
    class BillsController < ApplicationController
      before_action :set_bill, only: %i[show update destroy]

      def index
        bills = Bill.includes(:patient, :appointment)
        bills = bills.where(patient_id: params[:patient_id]) if params[:patient_id].present?
        bills = bills.where(status: params[:status]) if params[:status].present?
        bills = bills.order(created_at: :desc).page(params[:page]).per(params[:per_page] || 10)
        render json: {
          bills: bills.map { |b| bill_json(b) },
          meta: pagination_meta(bills),
          summary: { total: bills.sum(:total_amount), paid: bills.sum(:paid_amount) }
        }
      end

      def show
        render json: bill_json(@bill)
      end

      def create
        bill = Bill.new(bill_params)
        if bill.save
          render json: bill_json(bill), status: :created
        else
          render json: { errors: bill.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @bill.update(bill_params)
          render json: bill_json(@bill)
        else
          render json: { errors: @bill.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @bill.destroy
        head :no_content
      end

      private

      def set_bill
        @bill = Bill.includes(:patient, :appointment).find(params[:id])
      end

      def bill_json(bill)
        bill.as_json.merge(
          patient_name: bill.patient.name,
          outstanding_amount: bill.outstanding_amount
        )
      end

      def bill_params
        params.permit(:patient_id, :appointment_id, :total_amount, :paid_amount, :status, :payment_method, :due_date)
      end
    end
  end
end
