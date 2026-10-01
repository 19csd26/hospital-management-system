import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import { medicalRecords, patients, doctors } from '../api';

function RecordForm({ initial, onSubmit, loading }) {
  const { data: patientData } = useQuery({ queryKey: ['patients-all'], queryFn: () => patients.list({ per_page: 100 }).then((r) => r.data) });
  const { data: doctorData } = useQuery({ queryKey: ['doctors-all'], queryFn: () => doctors.list({ per_page: 100 }).then((r) => r.data) });
  const [form, setForm] = useState(initial || { patient_id: '', doctor_id: '', diagnosis: '', prescription: '', notes: '', visit_date: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
            {doctorData?.doctors?.map((d) => <option key={d.id} value={d.id}>{d.user_name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date *</label>
        <input type="date" className="input" value={form.visit_date} onChange={(e) => set('visit_date', e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
        <textarea className="input resize-none" rows={3} value={form.diagnosis} onChange={(e) => set('diagnosis', e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Prescription</label>
        <textarea className="input resize-none" rows={3} value={form.prescription} onChange={(e) => set('prescription', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
        <textarea className="input resize-none" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Record'}
        </button>
      </div>
    </form>
  );
}

export default function MedicalRecordsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['medical-records', page],
    queryFn: () => medicalRecords.list({ page }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (form) => medicalRecords.create(form),
    onSuccess: () => { qc.invalidateQueries(['medical-records']); toast.success('Record created'); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.errors?.join(', ') || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }) => medicalRecords.update(id, form),
    onSuccess: () => { qc.invalidateQueries(['medical-records']); toast.success('Record updated'); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.errors?.join(', ') || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => medicalRecords.delete(id),
    onSuccess: () => { qc.invalidateQueries(['medical-records']); toast.success('Record deleted'); },
  });

  return (
    <Layout title="Medical Records">
      <div className="space-y-5">
        <div className="flex justify-end">
          <button onClick={() => setModal('create')} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Record
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {data?.medical_records?.map((r) => (
              <div key={r.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mt-0.5">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-gray-900">{r.patient_name}</p>
                        <span className="text-gray-400">•</span>
                        <p className="text-sm text-gray-500">Dr. {r.doctor_name}</p>
                        <span className="text-gray-400">•</span>
                        <p className="text-sm text-gray-500">{format(new Date(r.visit_date), 'MMM d, yyyy')}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Diagnosis</p>
                          <p className="text-sm text-gray-900">{r.diagnosis}</p>
                        </div>
                        {r.prescription && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Prescription</p>
                            <p className="text-sm text-gray-900">{r.prescription}</p>
                          </div>
                        )}
                        {r.notes && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Notes</p>
                            <p className="text-sm text-gray-700">{r.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => setModal({ type: 'edit', record: r })} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => confirm('Delete this record?') && deleteMutation.mutate(r.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {data?.medical_records?.length === 0 && (
              <div className="text-center py-16 text-gray-400">No medical records found</div>
            )}
          </div>
        )}
        {data?.meta && <div className="bg-white rounded-xl border"><Pagination meta={data.meta} onPageChange={setPage} /></div>}
      </div>

      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Add Medical Record" size="lg">
        <RecordForm onSubmit={(form) => createMutation.mutate(form)} loading={createMutation.isPending} />
      </Modal>
      <Modal isOpen={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit Medical Record" size="lg">
        {modal?.type === 'edit' && (
          <RecordForm
            initial={modal.record}
            onSubmit={(form) => updateMutation.mutate({ id: modal.record.id, form })}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>
    </Layout>
  );
}
