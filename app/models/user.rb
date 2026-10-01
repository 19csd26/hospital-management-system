class User < ApplicationRecord
  has_secure_password
  has_one :doctor

  ROLES = %w[admin doctor nurse receptionist].freeze

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, inclusion: { in: ROLES }

  def admin? = role == "admin"
  def doctor? = role == "doctor"
end
