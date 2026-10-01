class CreateDoctors < ActiveRecord::Migration[8.1]
  def change
    create_table :doctors do |t|
      t.references :user, null: false, foreign_key: true
      t.references :department, null: false, foreign_key: true
      t.string :specialization
      t.string :license_number
      t.integer :experience_years
      t.decimal :consultation_fee
      t.string :status

      t.timestamps
    end
    add_index :doctors, :license_number, unique: true
  end
end
