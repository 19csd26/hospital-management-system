class CreateAdmissions < ActiveRecord::Migration[8.1]
  def change
    create_table :admissions do |t|
      t.references :patient, null: false, foreign_key: true
      t.references :room, null: false, foreign_key: true
      t.references :doctor, null: false, foreign_key: true
      t.datetime :admitted_at
      t.datetime :discharged_at
      t.string :status
      t.text :notes
      t.decimal :total_cost

      t.timestamps
    end
  end
end
