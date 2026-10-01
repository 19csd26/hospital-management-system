class Admission < ApplicationRecord
  belongs_to :patient
  belongs_to :room
  belongs_to :doctor

  STATUSES = %w[admitted discharged transferred].freeze

  validates :admitted_at, presence: true
  validates :status, inclusion: { in: STATUSES }
end
