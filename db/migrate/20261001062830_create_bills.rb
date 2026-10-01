class CreateBills < ActiveRecord::Migration[8.1]
  def change
    create_table :bills do |t|
      t.references :patient, null: false, foreign_key: true
      t.references :appointment, null: false, foreign_key: true
      t.decimal :total_amount
      t.decimal :paid_amount
      t.string :status
      t.string :payment_method
      t.date :due_date

      t.timestamps
    end
  end
end
