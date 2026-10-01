class Appointment < ApplicationRecord
  belongs_to :doctor
  belongs_to :patient
  has_one :bill

  STATUSES = %w[scheduled confirmed completed cancelled no_show].freeze

  validates :appointment_date, presence: true
  validates :status, inclusion: { in: STATUSES }

  scope :upcoming, -> { where("appointment_date >= ?", Time.current).where(status: %w[scheduled confirmed]) }
  scope :today, -> { where(appointment_date: Time.current.beginning_of_day..Time.current.end_of_day) }
end
