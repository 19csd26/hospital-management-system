puts "Seeding database..."

# Departments
departments = [
  { name: "Cardiology", description: "Heart and cardiovascular system", head_doctor: "Dr. Sarah Johnson", phone: "+1-555-0101" },
  { name: "Neurology", description: "Brain and nervous system", head_doctor: "Dr. Michael Chen", phone: "+1-555-0102" },
  { name: "Orthopedics", description: "Musculoskeletal system", head_doctor: "Dr. Emily Davis", phone: "+1-555-0103" },
  { name: "Pediatrics", description: "Children's healthcare", head_doctor: "Dr. James Wilson", phone: "+1-555-0104" },
  { name: "Emergency", description: "Emergency and trauma care", head_doctor: "Dr. Lisa Martinez", phone: "+1-555-0105" },
  { name: "Radiology", description: "Medical imaging", head_doctor: "Dr. Robert Taylor", phone: "+1-555-0106" }
]

dept_records = departments.map { |d| Department.find_or_create_by!(name: d[:name]) { |dep| dep.assign_attributes(d) } }
puts "Created #{dept_records.count} departments"

# Admin user
admin = User.find_or_create_by!(email: "admin@hospital.com") do |u|
  u.name = "System Administrator"
  u.password = "password123"
  u.role = "admin"
  u.phone = "+1-555-0001"
end
puts "Created admin user: admin@hospital.com / password123"

# Doctor users
doctor_data = [
  { name: "Dr. Sarah Johnson", email: "sarah.johnson@hospital.com", specialization: "Interventional Cardiology", dept: "Cardiology", fee: 200, exp: 15 },
  { name: "Dr. Michael Chen", email: "michael.chen@hospital.com", specialization: "Clinical Neurology", dept: "Neurology", fee: 250, exp: 12 },
  { name: "Dr. Emily Davis", email: "emily.davis@hospital.com", specialization: "Sports Medicine", dept: "Orthopedics", fee: 180, exp: 10 },
  { name: "Dr. James Wilson", email: "james.wilson@hospital.com", specialization: "Pediatric Care", dept: "Pediatrics", fee: 150, exp: 8 },
  { name: "Dr. Lisa Martinez", email: "lisa.martinez@hospital.com", specialization: "Emergency Medicine", dept: "Emergency", fee: 300, exp: 18 }
]

doctor_data.each_with_index do |dd, i|
  user = User.find_or_create_by!(email: dd[:email]) do |u|
    u.name = dd[:name]
    u.password = "password123"
    u.role = "doctor"
    u.phone = "+1-555-010#{i + 1}"
  end
  dept = Department.find_by!(name: dd[:dept])
  Doctor.find_or_create_by!(license_number: "LIC#{1000 + i}") do |d|
    d.user = user
    d.department = dept
    d.specialization = dd[:specialization]
    d.experience_years = dd[:exp]
    d.consultation_fee = dd[:fee]
    d.status = "active"
  end
end
puts "Created #{Doctor.count} doctors"

# Patients
patient_data = [
  { name: "Alice Brown", email: "alice.brown@email.com", phone: "+1-555-1001", dob: "1985-03-15", gender: "female", blood_group: "A+" },
  { name: "Bob Smith", email: "bob.smith@email.com", phone: "+1-555-1002", dob: "1972-07-22", gender: "male", blood_group: "O-" },
  { name: "Carol White", email: "carol.white@email.com", phone: "+1-555-1003", dob: "1990-11-08", gender: "female", blood_group: "B+" },
  { name: "David Lee", email: "david.lee@email.com", phone: "+1-555-1004", dob: "1965-05-30", gender: "male", blood_group: "AB+" },
  { name: "Emma Johnson", email: "emma.johnson@email.com", phone: "+1-555-1005", dob: "2001-09-12", gender: "female", blood_group: "O+" },
  { name: "Frank Garcia", email: "frank.garcia@email.com", phone: "+1-555-1006", dob: "1958-01-25", gender: "male", blood_group: "A-" },
  { name: "Grace Kim", email: "grace.kim@email.com", phone: "+1-555-1007", dob: "1995-06-18", gender: "female", blood_group: "B-" },
  { name: "Henry Adams", email: "henry.adams@email.com", phone: "+1-555-1008", dob: "1980-12-03", gender: "male", blood_group: "AB-" }
]

patients = patient_data.map do |pd|
  Patient.find_or_create_by!(email: pd[:email]) do |p|
    p.name = pd[:name]
    p.phone = pd[:phone]
    p.date_of_birth = pd[:dob]
    p.gender = pd[:gender]
    p.blood_group = pd[:blood_group]
    p.address = "123 Main St, City, State"
    p.emergency_contact = "Next of Kin"
    p.emergency_phone = "+1-555-9999"
  end
end
puts "Created #{patients.count} patients"

# Rooms
room_data = [
  { dept: "Cardiology", number: "101", type: "private", floor: 1, capacity: 1, rate: 500 },
  { dept: "Cardiology", number: "102", type: "general", floor: 1, capacity: 4, rate: 200 },
  { dept: "Neurology", number: "201", type: "private", floor: 2, capacity: 1, rate: 450 },
  { dept: "Emergency", number: "E01", type: "emergency", floor: 0, capacity: 2, rate: 800 },
  { dept: "Emergency", number: "ICU1", type: "icu", floor: 0, capacity: 1, rate: 1200 },
  { dept: "Orthopedics", number: "301", type: "general", floor: 3, capacity: 4, rate: 180 },
  { dept: "Pediatrics", number: "401", type: "private", floor: 4, capacity: 1, rate: 400 }
]

room_data.each_with_index do |rd, i|
  dept = Department.find_by!(name: rd[:dept])
  Room.find_or_create_by!(room_number: rd[:number]) do |r|
    r.department = dept
    r.room_type = rd[:type]
    r.status = i < 3 ? "available" : "occupied"
    r.floor = rd[:floor]
    r.capacity = rd[:capacity]
    r.rate_per_day = rd[:rate]
  end
end
puts "Created #{Room.count} rooms"

# Appointments
doctors = Doctor.all.to_a
statuses = %w[scheduled confirmed completed cancelled]

patients.first(5).each_with_index do |patient, i|
  doctor = doctors[i % doctors.length]
  date = i < 2 ? (i + 1).days.from_now : (i - 2).days.ago
  Appointment.create!(
    patient: patient,
    doctor: doctor,
    appointment_date: date,
    status: i < 2 ? "scheduled" : statuses[i % statuses.length],
    notes: "Routine checkup"
  )
end
puts "Created #{Appointment.count} appointments"

# Medical records
patients.first(3).each_with_index do |patient, i|
  doctor = doctors[i % doctors.length]
  MedicalRecord.create!(
    patient: patient,
    doctor: doctor,
    diagnosis: ["Hypertension", "Migraine", "Fracture"][i],
    prescription: ["Lisinopril 10mg", "Sumatriptan 50mg", "Ibuprofen 400mg"][i],
    notes: "Follow-up in 2 weeks",
    visit_date: (i + 1).weeks.ago
  )
end
puts "Created #{MedicalRecord.count} medical records"

# Bills
appointments = Appointment.where(status: "completed").to_a
appointments.first(2).each_with_index do |apt, i|
  Bill.create!(
    patient: apt.patient,
    appointment: apt,
    total_amount: apt.doctor.consultation_fee,
    paid_amount: i == 0 ? apt.doctor.consultation_fee : 0,
    status: i == 0 ? "paid" : "pending",
    payment_method: i == 0 ? "card" : nil,
    due_date: 7.days.from_now
  )
end
puts "Created #{Bill.count} bills"

puts "\nSeeding complete!"
puts "Login: admin@hospital.com / password123"
