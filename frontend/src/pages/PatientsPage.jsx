import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, Eye, User } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import { patients } from '../api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function PatientForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState(initial || {
    name: '', email: '', phone: '', date_of_birth: '', gender: '',
    blood_group: '', address: '', emergency_contact: '', emergency_phone: ''
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input type="date" className="input" value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select className="input" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
          <select className="input" value={form.blood_group} onChange={(e) => set('blood_group', e.target.value)}>
            <option value="">Select</option>
            {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea className="input resize-none" rows={2} value={form.address} onChange={(e) => set('address', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
          <input className="input" value={form.emergency_contact} onChange={(e) => set('emergency_contact', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
          <input className="input" value={form.emergency_phone} onChange={(e) => set('emergency_phone', e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Patient'}
        </button>
      </div>
    </form>
  );
}

export default function PatientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | 'create' | {type:'edit',patient} | {type:'view',patient}

  const { data, isLoading } = useQuery({
    queryKey: ['patients', page, search],
    queryFn: () => patients.list({ page, q: search || undefined }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (form) => patients.create(form),
    onSuccess: () => { qc.invalidateQueries(['patients']); toast.success('Patient created'); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.errors?.join(', ') || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }) => patients.update(id, form),
    onSuccess: () => { qc.invalidateQueries(['patients']); toast.success('Patient updated'); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.errors?.join(', ') || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => patients.delete(id),
    onSuccess: () => { qc.invalidateQueries(['patients']); toast.success('Patient deleted'); },
    onError: () => toast.error('Failed to delete patient'),
  });

  const handleDelete = (patient) => {
    if (confirm(`Delete patient ${patient.name}?`)) deleteMutation.mutate(patient.id);
  };

  return (
    <Layout title="Patients">
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button onClick={() => setModal('create')} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Patient
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-header">Patient</th>
                  <th className="table-header">Contact</th>
                  <th className="table-header">DOB / Age</th>
                  <th className="table-header">Blood Group</th>
                  <th className="table-header">Gender</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-12"><div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></td></tr>
                ) : data?.patients?.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No patients found</td></tr>
                ) : data?.patients?.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-gray-600">{p.phone || '—'}</td>
                    <td className="table-cell text-gray-600">
                      {p.date_of_birth ? format(new Date(p.date_of_birth), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="table-cell">
                      {p.blood_group ? (
                        <span className="badge bg-red-100 text-red-800">{p.blood_group}</span>
                      ) : '—'}
                    </td>
                    <td className="table-cell capitalize text-gray-600">{p.gender || '—'}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setModal({ type: 'edit', patient: p })} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
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

      {/* Create Modal */}
      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Add New Patient" size="lg">
        <PatientForm onSubmit={(form) => createMutation.mutate(form)} loading={createMutation.isPending} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit Patient" size="lg">
        {modal?.type === 'edit' && (
          <PatientForm
            initial={modal.patient}
            onSubmit={(form) => updateMutation.mutate({ id: modal.patient.id, form })}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>
    </Layout>
  );
}
