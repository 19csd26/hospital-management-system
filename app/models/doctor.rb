class Doctor < ApplicationRecord
  belongs_to :user
  belongs_to :department
  has_many :appointments
  has_many :medical_records
  has_many :admissions
  has_many :patients, through: :appointments

  STATUS = %w[active inactive on_leave].freeze

  validates :specialization, presence: true
  validates :license_number, presence: true, uniqueness: true
  validates :status, inclusion: { in: STATUS }
  validates :consultation_fee, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
end
