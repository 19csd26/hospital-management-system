module Api
  module V1
    class DashboardController < ApplicationController
      def stats
        render json: {
          total_patients: Patient.count,
          total_doctors: Doctor.count,
          total_departments: Department.count,
          total_appointments: Appointment.count,
          today_appointments: Appointment.today.count,
          available_rooms: Room.where(status: "available").count,
          occupied_rooms: Room.where(status: "occupied").count,
          pending_bills: Bill.where(status: "pending").sum(:total_amount),
          recent_appointments: recent_appointments,
          appointments_by_status: appointments_by_status,
          monthly_revenue: monthly_revenue
        }
      end

      private

      def recent_appointments
        Appointment.includes(:patient, :doctor => :user)
          .order(appointment_date: :desc)
          .limit(5)
          .map do |a|
            {
              id: a.id,
              patient_name: a.patient.name,
              doctor_name: a.doctor.user.name,
              appointment_date: a.appointment_date,
              status: a.status
            }
          end
      end

      def appointments_by_status
        Appointment.group(:status).count
      end

      def monthly_revenue
        Bill.where(status: "paid")
          .where(created_at: 6.months.ago..Time.current)
          .group_by { |b| b.created_at.strftime("%Y-%m") }
          .transform_values { |bills| bills.sum(&:paid_amount) }
      end
    end
  end
end
