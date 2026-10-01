import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Heart, Calendar,
  FileText, CreditCard, Plus, Edit2, Stethoscope, Clock,
  AlertCircle, TrendingUp, Activity
} from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import { patients, appointments, doctors } from '../api';

// ── Appointment booking form ──────────────────────────────────────────────────
function BookAppointmentForm({ patientId, onSubmit, loading }) {
  const { data: doctorData } = useQuery({
    queryKey: ['doctors-all'],
    queryFn: () => doctors.list({ per_page: 100 }).then((r) => r.data),
  });

  const [form, setForm] = useState({
    patient_id: patientId,
    doctor_id: '',
    appointment_date: '',
    status: 'scheduled',
    notes: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const selectedDoctor = doctorData?.doctors?.find((d) => String(d.id) === String(form.doctor_id));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-5">
      {/* Doctor selector with preview card */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Doctor *</label>
        <select
          className="input"
          value={form.doctor_id}
          onChange={(e) => set('doctor_id', e.target.value)}
          required
        >
          <option value="">Choose a doctor...</option>
          {doctorData?.doctors?.filter((d) => d.status === 'active').map((d) => (
            <option key={d.id} value={d.id}>
              {d.user_name} — {d.specialization} ({d.department_name})
            </option>
          ))}
        </select>

        {selectedDoctor && (
          <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-blue-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-blue-900 text-sm">{selectedDoctor.user_name}</p>
              <p className="text-xs text-blue-600">{selectedDoctor.specialization} · {selectedDoctor.department_name}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-blue-500">Consultation fee</p>
              <p className="font-bold text-blue-900">${selectedDoctor.consultation_fee}</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Date & Time *</label>
        <input
          type="datetime-local"
          className="input"
          value={form.appointment_date}
          min={new Date().toISOString().slice(0, 16)}
          onChange={(e) => set('appointment_date', e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason / Notes</label>
        <textarea
          className="input resize-none"
          rows={3}
          placeholder="Describe the reason for visit..."
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
        {loading ? 'Booking...' : 'Confirm Appointment'}
      </button>
    </form>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────
function Tab({ label, icon: Icon, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count !== undefined && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${active ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PatientViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [showBooking, setShowBooking] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patients.get(id).then((r) => r.data),
  });

  const bookMutation = useMutation({
    mutationFn: (form) => appointments.create(form),
    onSuccess: () => {
      qc.invalidateQueries(['patient', id]);
      toast.success('Appointment booked successfully');
      setShowBooking(false);
    },
    onError: (e) => toast.error(e.response?.data?.errors?.join(', ') || 'Booking failed'),
  });

  if (isLoading) {
    return (
      <Layout title="Patient Details">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (isError || !data?.patient) {
    return (
      <Layout title="Patient Details">
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
          <AlertCircle className="w-10 h-10" />
          <p>Patient not found.</p>
          <button onClick={() => navigate('/patients')} className="btn-secondary text-sm">Back to Patients</button>
        </div>
      </Layout>
    );
  }

  const { patient, appointments: appts = [], medical_records: records = [], bills = [], stats = {} } = data;

  const age = patient.date_of_birth
    ? differenceInYears(new Date(), new Date(patient.date_of_birth))
    : null;

  const initials = patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Layout title="Patient Details">
      <div className="space-y-6">
        {/* Back link */}
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patients
        </button>

        {/* ── Profile header card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Coloured banner */}
          <div className="h-24 bg-gradient-to-r from-primary-600 to-blue-400" />

          <div className="px-6 pb-6">
            {/* Avatar + actions row */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold text-primary-600 bg-blue-50">
                {initials}
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => navigate(`/patients?edit=${patient.id}`)}
                  className="btn-secondary text-sm py-2"
                >
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
                <button
                  onClick={() => setShowBooking(true)}
                  className="btn-primary text-sm py-2"
                >
                  <Plus className="w-4 h-4" /> Book Appointment
                </button>
              </div>
            </div>

            {/* Name & basic info */}
            <div className="flex flex-wrap gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  Patient ID #{patient.id}
                  {age !== null && <span className="ml-2">· {age} years old</span>}
                  {patient.gender && <span className="ml-2 capitalize">· {patient.gender}</span>}
                </p>
              </div>
              {patient.blood_group && (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" /> {patient.blood_group}
                  </span>
                </div>
              )}
            </div>

            {/* Contact info grid */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              {patient.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{patient.email}</span>
                </div>
              )}
              {patient.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{patient.phone}</span>
                </div>
              )}
              {patient.date_of_birth && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{format(new Date(patient.date_of_birth), 'MMM d, yyyy')}</span>
                </div>
              )}
              {patient.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{patient.address}</span>
                </div>
              )}
            </div>

            {/* Emergency contact */}
            {(patient.emergency_contact || patient.emergency_phone) && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-gray-500">Emergency:</span>
                <span className="font-medium text-gray-800">{patient.emergency_contact}</span>
                {patient.emergency_phone && (
                  <span className="text-gray-500">· {patient.emergency_phone}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Appointments', value: stats.total_appointments || 0, icon: Calendar, color: 'blue' },
            { label: 'Upcoming', value: stats.upcoming_appointments || 0, icon: Clock, color: 'green' },
            { label: 'Medical Records', value: stats.total_records || 0, icon: FileText, color: 'purple' },
            {
              label: 'Outstanding Balance',
              value: `$${Number(stats.outstanding || 0).toLocaleString()}`,
              icon: CreditCard,
              color: stats.outstanding > 0 ? 'red' : 'green',
            },
          ].map((s) => {
            const colors = {
              blue: 'bg-blue-50 text-blue-600',
              green: 'bg-green-50 text-green-600',
              purple: 'bg-purple-50 text-purple-600',
              red: 'bg-red-50 text-red-600',
            };
            return (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[s.color]}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto px-4">
            <Tab label="Overview" icon={Activity} active={tab === 'overview'} onClick={() => setTab('overview')} />
            <Tab label="Appointments" icon={Calendar} count={appts.length} active={tab === 'appointments'} onClick={() => setTab('appointments')} />
            <Tab label="Medical Records" icon={FileText} count={records.length} active={tab === 'records'} onClick={() => setTab('records')} />
            <Tab label="Billing" icon={CreditCard} count={bills.length} active={tab === 'billing'} onClick={() => setTab('billing')} />
          </div>

          <div className="p-6">
            {/* ── Overview tab ── */}
            {tab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Latest appointment */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Latest Appointment</h3>
                  {appts.length > 0 ? (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-gray-900">{appts[0].doctor_name}</p>
                        <StatusBadge status={appts[0].status} />
                      </div>
                      <p className="text-sm text-gray-500">{appts[0].doctor_specialization}</p>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(appts[0].appointment_date), 'EEEE, MMM d yyyy · HH:mm')}
                      </p>
                      {appts[0].notes && <p className="text-sm text-gray-600 mt-2 italic">"{appts[0].notes}"</p>}
                    </div>
                  ) : (
                    <EmptyState icon={Calendar} label="No appointments yet" action="Book Appointment" onAction={() => setShowBooking(true)} />
                  )}
                </div>

                {/* Latest medical record */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Latest Diagnosis</h3>
                  {records.length > 0 ? (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-gray-900">{records[0].diagnosis}</p>
                        <span className="text-xs text-gray-500">{format(new Date(records[0].visit_date), 'MMM d, yyyy')}</span>
                      </div>
                      <p className="text-sm text-gray-500">Dr. {records[0].doctor_name}</p>
                      {records[0].prescription && (
                        <p className="text-sm text-gray-700 mt-2">
                          <span className="font-medium text-gray-600">Rx:</span> {records[0].prescription}
                        </p>
                      )}
                    </div>
                  ) : (
                    <EmptyState icon={FileText} label="No medical records" />
                  )}
                </div>

                {/* Personal details */}
                <div className="lg:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Personal Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Full Name', value: patient.name },
                      { label: 'Date of Birth', value: patient.date_of_birth ? format(new Date(patient.date_of_birth), 'MMM d, yyyy') : '—' },
                      { label: 'Gender', value: patient.gender || '—', capitalize: true },
                      { label: 'Blood Group', value: patient.blood_group || '—' },
                      { label: 'Email', value: patient.email || '—' },
                      { label: 'Phone', value: patient.phone || '—' },
                      { label: 'Emergency Contact', value: patient.emergency_contact || '—' },
                      { label: 'Emergency Phone', value: patient.emergency_phone || '—' },
                    ].map((item) => (
                      <div key={item.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                        <p className={`text-sm font-medium text-gray-900 ${item.capitalize ? 'capitalize' : ''}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  {patient.address && (
                    <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Address</p>
                      <p className="text-sm font-medium text-gray-900">{patient.address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Appointments tab ── */}
            {tab === 'appointments' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">{appts.length} appointment{appts.length !== 1 ? 's' : ''} total</p>
                  <button onClick={() => setShowBooking(true)} className="btn-primary text-sm py-2">
                    <Plus className="w-4 h-4" /> Book Appointment
                  </button>
                </div>

                {appts.length === 0 ? (
                  <EmptyState icon={Calendar} label="No appointments yet" action="Book Appointment" onAction={() => setShowBooking(true)} />
                ) : (
                  <div className="space-y-3">
                    {appts.map((apt) => (
                      <div key={apt.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                        {/* Status stripe */}
                        <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${
                          apt.status === 'completed' ? 'bg-gray-300' :
                          apt.status === 'cancelled' ? 'bg-red-300' :
                          apt.status === 'confirmed' ? 'bg-green-400' : 'bg-blue-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <p className="font-semibold text-gray-900">{apt.doctor_name}</p>
                              <p className="text-sm text-gray-500">{apt.doctor_specialization}</p>
                            </div>
                            <StatusBadge status={apt.status} />
                          </div>
                          <p className="text-sm text-gray-600 mt-2 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {format(new Date(apt.appointment_date), 'EEEE, MMMM d, yyyy · h:mm a')}
                          </p>
                          {apt.notes && (
                            <p className="text-sm text-gray-500 mt-1 italic">"{apt.notes}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Medical Records tab ── */}
            {tab === 'records' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">{records.length} record{records.length !== 1 ? 's' : ''} total</p>

                {records.length === 0 ? (
                  <EmptyState icon={FileText} label="No medical records found" />
                ) : (
                  <div className="space-y-4">
                    {records.map((r) => (
                      <div key={r.id} className="p-5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                          <div>
                            <p className="font-semibold text-gray-900 text-base">{r.diagnosis}</p>
                            <p className="text-sm text-gray-500 mt-0.5">Dr. {r.doctor_name}</p>
                          </div>
                          <span className="text-sm text-gray-400 whitespace-nowrap">
                            {format(new Date(r.visit_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {r.prescription && (
                            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Prescription</p>
                              <p className="text-sm text-green-900">{r.prescription}</p>
                            </div>
                          )}
                          {r.notes && (
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Notes</p>
                              <p className="text-sm text-blue-900">{r.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Billing tab ── */}
            {tab === 'billing' && (
              <div className="space-y-4">
                {/* Summary row */}
                <div className="grid grid-cols-3 gap-4 mb-2">
                  {[
                    { label: 'Total Billed', value: `$${Number(stats.total_billed || 0).toLocaleString()}`, color: 'text-gray-900' },
                    { label: 'Total Paid', value: `$${Number(stats.total_paid || 0).toLocaleString()}`, color: 'text-green-700' },
                    { label: 'Outstanding', value: `$${Number(stats.outstanding || 0).toLocaleString()}`, color: stats.outstanding > 0 ? 'text-red-600' : 'text-green-700' },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {bills.length === 0 ? (
                  <EmptyState icon={CreditCard} label="No billing records found" />
                ) : (
                  <div className="overflow-hidden rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="table-header">Date</th>
                          <th className="table-header">Total</th>
                          <th className="table-header">Paid</th>
                          <th className="table-header">Outstanding</th>
                          <th className="table-header">Method</th>
                          <th className="table-header">Status</th>
                          <th className="table-header">Due</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {bills.map((b) => (
                          <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                            <td className="table-cell text-gray-500">{format(new Date(b.created_at), 'MMM d, yyyy')}</td>
                            <td className="table-cell font-medium">${Number(b.total_amount).toLocaleString()}</td>
                            <td className="table-cell text-green-700">${Number(b.paid_amount || 0).toLocaleString()}</td>
                            <td className={`table-cell font-medium ${b.outstanding_amount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                              ${Number(b.outstanding_amount || 0).toLocaleString()}
                            </td>
                            <td className="table-cell capitalize text-gray-500">{b.payment_method || '—'}</td>
                            <td className="table-cell"><StatusBadge status={b.status} /></td>
                            <td className="table-cell text-gray-500">{b.due_date ? format(new Date(b.due_date), 'MMM d, yyyy') : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Book Appointment Modal ── */}
      <Modal isOpen={showBooking} onClose={() => setShowBooking(false)} title="Book Appointment" size="md">
        <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-blue-900 text-sm">{patient.name}</p>
            {patient.blood_group && <p className="text-xs text-blue-600">Blood Group: {patient.blood_group}</p>}
          </div>
        </div>
        <BookAppointmentForm
          patientId={patient.id}
          onSubmit={(form) => bookMutation.mutate(form)}
          loading={bookMutation.isPending}
        />
      </Modal>
    </Layout>
  );
}

// ── Small empty-state helper ──────────────────────────────────────────────────
function EmptyState({ icon: Icon, label, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm">{label}</p>
      {action && (
        <button onClick={onAction} className="btn-primary text-sm py-2 mt-1">
          <Plus className="w-4 h-4" /> {action}
        </button>
      )}
    </div>
  );
}
