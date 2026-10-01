import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';
import { appointments, patients, doctors } from '../api';

function AppointmentForm({ initial, onSubmit, loading }) {
  const { data: patientData } = useQuery({ queryKey: ['patients-all'], queryFn: () => patients.list({ per_page: 100 }).then((r) => r.data) });
  const { data: doctorData } = useQuery({ queryKey: ['doctors-all'], queryFn: () => doctors.list({ per_page: 100 }).then((r) => r.data) });
  const [form, setForm] = useState(initial || { patient_id: '', doctor_id: '', appointment_date: '', status: 'scheduled', notes: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
        <select className="input" value={form.patient_id} onChange={(e) => set('patient_id', e.target.value)} required>
          <option value="">Select patient</option>
          {patientData?.patients?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
        <select className="input" value={form.doctor_id} onChange={(e) => set('doctor_id', e.target.value)} required>
          <option value="">Select doctor</option>
          {doctorData?.doctors?.map((d) => <option key={d.id} value={d.id}>{d.user_name} — {d.specialization}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date & Time *</label>
        <input type="datetime-local" className="input" value={form.appointment_date} onChange={(e) => set('appointment_date', e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
          {['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea className="input resize-none" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Appointment'}
        </button>
      </div>
    </form>
  );
}

export default function AppointmentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', page, filterStatus],
    queryFn: () => appointments.list({ page, status: filterStatus || undefined }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (form) => appointments.create(form),
    onSuccess: () => { qc.invalidateQueries(['appointments']); toast.success('Appointment created'); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.errors?.join(', ') || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }) => appointments.update(id, form),
    onSuccess: () => { qc.invalidateQueries(['appointments']); toast.success('Appointment updated'); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.errors?.join(', ') || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => appointments.delete(id),
    onSuccess: () => { qc.invalidateQueries(['appointments']); toast.success('Appointment deleted'); },
    onError: () => toast.error('Failed to delete'),
  });

  const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];

  return (
    <Layout title="Appointments">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1.5">
              <button onClick={() => setFilterStatus('')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filterStatus ? 'bg-primary-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
                All
              </button>
              {statuses.map((s) => (
                <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filterStatus === s ? 'bg-primary-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setModal('create')} className="btn-primary">
            <Plus className="w-4 h-4" /> New Appointment
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-header">Patient</th>
                  <th className="table-header">Doctor</th>
                  <th className="table-header">Date & Time</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Notes</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-12"><div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></td></tr>
                ) : data?.appointments?.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No appointments found</td></tr>
                ) : data?.appointments?.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <p className="font-medium">{apt.patient_name}</p>
                      <p className="text-xs text-gray-500">{apt.patient_phone}</p>
                    </td>
                    <td className="table-cell">
                      <p className="font-medium">{apt.doctor_name}</p>
                      <p className="text-xs text-gray-500">{apt.doctor_specialization}</p>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(apt.appointment_date), 'MMM d, yyyy HH:mm')}
                      </div>
                    </td>
                    <td className="table-cell"><StatusBadge status={apt.status} /></td>
                    <td className="table-cell text-gray-500 max-w-xs truncate">{apt.notes || '—'}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setModal({ type: 'edit', appointment: apt })} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirm('Delete this appointment?') && deleteMutation.mutate(apt.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={data?.meta} onPageChange={setPage} />
        </div>
      </div>

      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="New Appointment" size="md">
        <AppointmentForm onSubmit={(form) => createMutation.mutate(form)} loading={createMutation.isPending} />
      </Modal>
      <Modal isOpen={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit Appointment" size="md">
        {modal?.type === 'edit' && (
          <AppointmentForm
            initial={{ ...modal.appointment, appointment_date: modal.appointment.appointment_date?.slice(0, 16) }}
            onSubmit={(form) => updateMutation.mutate({ id: modal.appointment.id, form })}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>
    </Layout>
  );
}
