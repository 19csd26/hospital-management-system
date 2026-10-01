class Room < ApplicationRecord
  belongs_to :department
  has_many :admissions

  TYPES = %w[general private icu emergency ot].freeze
  STATUSES = %w[available occupied maintenance].freeze

  validates :room_number, presence: true, uniqueness: true
  validates :room_type, inclusion: { in: TYPES }
  validates :status, inclusion: { in: STATUSES }
end
