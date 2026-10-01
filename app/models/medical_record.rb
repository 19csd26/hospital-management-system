class MedicalRecord < ApplicationRecord
  belongs_to :patient
  belongs_to :doctor

  validates :diagnosis, presence: true
  validates :visit_date, presence: true
end
