class Bill < ApplicationRecord
  belongs_to :patient
  belongs_to :appointment, optional: true

  STATUSES = %w[pending paid partial cancelled].freeze
  PAYMENT_METHODS = %w[cash card insurance upi].freeze

  validates :total_amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :status, inclusion: { in: STATUSES }

  def outstanding_amount
    (total_amount || 0) - (paid_amount || 0)
  end
end
