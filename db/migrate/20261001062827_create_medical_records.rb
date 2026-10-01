class CreateMedicalRecords < ActiveRecord::Migration[8.1]
  def change
    create_table :medical_records do |t|
      t.references :patient, null: false, foreign_key: true
      t.references :doctor, null: false, foreign_key: true
      t.text :diagnosis
      t.text :prescription
      t.text :notes
      t.date :visit_date

      t.timestamps
    end
  end
end
