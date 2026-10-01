import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';
import { doctors, departments } from '../api';

function DoctorForm({ initial, onSubmit, loading }) {
  const { data: deptData } = useQuery({ queryKey: ['departments'], queryFn: () => departments.list().then((r) => r.data) });
  const [form, setForm] = useState(initial || {
    user_id: '', department_id: '', specialization: '', license_number: '',
    experience_years: '', consultation_fee: '', status: 'active'
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
          <select className="input" value={form.department_id} onChange={(e) => set('department_id', e.target.value)} required>
            <option value="">Select department</option>
            {deptData?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
          <input className="input" value={form.specialization} onChange={(e) => set('specialization', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
          <input className="input" value={form.license_number} onChange={(e) => set('license_number', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
          <input type="number" className="input" value={form.experience_years} onChange={(e) => set('experience_years', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee ($)</label>
          <input type="number" step="0.01" className="input" value={form.consultation_fee} onChange={(e) => set('consultation_fee', e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Doctor'}
        </button>
      </div>
    </form>
  );
}

export default function DoctorsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['doctors', page, search],
    queryFn: () => doctors.list({ page, q: search || undefined }).then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }) => doctors.update(id, form),
    onSuccess: () => { qc.invalidateQueries(['doctors']); toast.success('Doctor updated'); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.errors?.join(', ') || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => doctors.delete(id),
    onSuccess: () => { qc.invalidateQueries(['doctors']); toast.success('Doctor removed'); },
    onError: () => toast.error('Failed to delete'),
  });

  return (
    <Layout title="Doctors">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input className="input pl-9" placeholder="Search doctors..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        {/* Doctor cards grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {data?.doctors?.map((doc) => (
              <div key={doc.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{doc.user_name}</p>
                      <p className="text-sm text-gray-500">{doc.specialization}</p>
                    </div>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Department</span>
                    <span className="font-medium text-gray-900">{doc.department_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Experience</span>
                    <span className="font-medium text-gray-900">{doc.experience_years || 0} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consultation Fee</span>
                    <span className="font-medium text-gray-900">${doc.consultation_fee || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>License</span>
                    <span className="font-medium text-gray-900 text-xs">{doc.license_number}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setModal({ type: 'edit', doctor: doc })}
                    className="flex-1 btn-secondary justify-center py-1.5 text-xs"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => confirm(`Remove Dr. ${doc.user_name}?`) && deleteMutation.mutate(doc.id)}
                    className="flex-1 btn-danger justify-center py-1.5 text-xs"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            ))}
            {data?.doctors?.length === 0 && (
              <div className="col-span-3 text-center py-16 text-gray-400">No doctors found</div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit Doctor" size="lg">
        {modal?.type === 'edit' && (
          <DoctorForm
            initial={modal.doctor}
            onSubmit={(form) => updateMutation.mutate({ id: modal.doctor.id, form })}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>
    </Layout>
  );
}
