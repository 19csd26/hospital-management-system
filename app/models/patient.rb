class Patient < ApplicationRecord
  has_many :appointments
  has_many :medical_records
  has_many :admissions
  has_many :bills
  has_many :doctors, through: :appointments

  GENDERS = %w[male female other].freeze
  BLOOD_GROUPS = %w[A+ A- B+ B- AB+ AB- O+ O-].freeze

  validates :name, presence: true
  validates :email, uniqueness: true, allow_nil: true
  validates :gender, inclusion: { in: GENDERS }, allow_nil: true
  validates :blood_group, inclusion: { in: BLOOD_GROUPS }, allow_nil: true
end
