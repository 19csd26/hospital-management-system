# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_10_01_062830) do
  create_table "admissions", force: :cascade do |t|
    t.integer "patient_id", null: false
    t.integer "room_id", null: false
    t.integer "doctor_id", null: false
    t.datetime "admitted_at"
    t.datetime "discharged_at"
    t.string "status"
    t.text "notes"
    t.decimal "total_cost"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["doctor_id"], name: "index_admissions_on_doctor_id"
    t.index ["patient_id"], name: "index_admissions_on_patient_id"
    t.index ["room_id"], name: "index_admissions_on_room_id"
  end

  create_table "appointments", force: :cascade do |t|
    t.integer "doctor_id", null: false
    t.integer "patient_id", null: false
    t.datetime "appointment_date"
    t.string "status"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["doctor_id"], name: "index_appointments_on_doctor_id"
    t.index ["patient_id"], name: "index_appointments_on_patient_id"
  end

  create_table "bills", force: :cascade do |t|
    t.integer "patient_id", null: false
    t.integer "appointment_id", null: false
    t.decimal "total_amount"
    t.decimal "paid_amount"
    t.string "status"
    t.string "payment_method"
    t.date "due_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["appointment_id"], name: "index_bills_on_appointment_id"
    t.index ["patient_id"], name: "index_bills_on_patient_id"
  end

  create_table "departments", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.string "head_doctor"
    t.string "phone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "doctors", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "department_id", null: false
    t.string "specialization"
    t.string "license_number"
    t.integer "experience_years"
    t.decimal "consultation_fee"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["department_id"], name: "index_doctors_on_department_id"
    t.index ["license_number"], name: "index_doctors_on_license_number", unique: true
    t.index ["user_id"], name: "index_doctors_on_user_id"
  end

  create_table "medical_records", force: :cascade do |t|
    t.integer "patient_id", null: false
    t.integer "doctor_id", null: false
    t.text "diagnosis"
    t.text "prescription"
    t.text "notes"
    t.date "visit_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["doctor_id"], name: "index_medical_records_on_doctor_id"
    t.index ["patient_id"], name: "index_medical_records_on_patient_id"
  end

  create_table "patients", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "phone"
    t.date "date_of_birth"
    t.string "gender"
    t.string "blood_group"
    t.text "address"
    t.string "emergency_contact"
    t.string "emergency_phone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_patients_on_email", unique: true
  end

  create_table "rooms", force: :cascade do |t|
    t.integer "department_id", null: false
    t.string "room_number"
    t.string "room_type"
    t.string "status"
    t.integer "floor"
    t.integer "capacity"
    t.decimal "rate_per_day"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["department_id"], name: "index_rooms_on_department_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "password_digest"
    t.string "role"
    t.string "phone"
    t.string "avatar"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  add_foreign_key "admissions", "doctors"
  add_foreign_key "admissions", "patients"
  add_foreign_key "admissions", "rooms"
  add_foreign_key "appointments", "doctors"
  add_foreign_key "appointments", "patients"
  add_foreign_key "bills", "appointments"
  add_foreign_key "bills", "patients"
  add_foreign_key "doctors", "departments"
  add_foreign_key "doctors", "users"
  add_foreign_key "medical_records", "doctors"
  add_foreign_key "medical_records", "patients"
  add_foreign_key "rooms", "departments"
end
