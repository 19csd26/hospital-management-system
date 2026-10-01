class CreatePatients < ActiveRecord::Migration[8.1]
  def change
    create_table :patients do |t|
      t.string :name
      t.string :email
      t.string :phone
      t.date :date_of_birth
      t.string :gender
      t.string :blood_group
      t.text :address
      t.string :emergency_contact
      t.string :emergency_phone

      t.timestamps
    end
    add_index :patients, :email, unique: true
  end
end
