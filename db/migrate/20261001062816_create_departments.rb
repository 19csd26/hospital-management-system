class CreateDepartments < ActiveRecord::Migration[8.1]
  def change
    create_table :departments do |t|
      t.string :name
      t.text :description
      t.string :head_doctor
      t.string :phone

      t.timestamps
    end
  end
end
