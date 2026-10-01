class CreateRooms < ActiveRecord::Migration[8.1]
  def change
    create_table :rooms do |t|
      t.references :department, null: false, foreign_key: true
      t.string :room_number
      t.string :room_type
      t.string :status
      t.integer :floor
      t.integer :capacity
      t.decimal :rate_per_day

      t.timestamps
    end
  end
end
