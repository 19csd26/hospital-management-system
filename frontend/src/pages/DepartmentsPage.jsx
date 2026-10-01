import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Building2, Users, Bed } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Modal from '../components/ui/Modal';
import { departments } from '../api';

function DeptForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState(initial || { name: '', description: '', head_doctor: '', phone: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea className="input resize-none" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Head Doctor</label>
          <input className="input" value={form.head_doctor} onChange={(e) => set('head_doctor', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Department'}</button>
      </div>
    </form>
  );
}

const DEPT_ICONS_BG = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-yellow-100', 'bg-red-100', 'bg-indigo-100'];
const DEPT_ICONS_TEXT = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-yellow-600', 'text-red-600', 'text-indigo-600'];

export default function DepartmentsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departments.list().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (form) => departments.create(form),
    onSuccess: () => { qc.invalidateQueries(['departments']); toast.success('Department created'); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.errors?.join(', ') || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }) => departments.update(id, form),
    onSuccess: () => { qc.invalidateQueries(['departments']); toast.success('Department updated'); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.errors?.join(', ') || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => departments.delete(id),
    onSuccess: () => { qc.invalidateQueries(['departments']); toast.success('Department deleted'); },
  });

  return (
    <Layout title="Departments">
      <div className="space-y-5">
        <div className="flex justify-end">
          <button onClick={() => setModal('create')} className="btn-primary"><Plus className="w-4 h-4" /> Add Department</button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {data?.map((dept, i) => (
              <div key={dept.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 ${DEPT_ICONS_BG[i % DEPT_ICONS_BG.length]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Building2 className={`w-6 h-6 ${DEPT_ICONS_TEXT[i % DEPT_ICONS_TEXT.length]}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{dept.name}</h3>
                    {dept.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{dept.description}</p>}
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  {dept.head_doctor && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Head Doctor</span>
                      <span className="font-medium text-gray-900">{dept.head_doctor}</span>
                    </div>
                  )}
                  {dept.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium text-gray-900">{dept.phone}</span>
                    </div>
                  )}
                  <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span><strong>{dept.doctors_count}</strong> Doctors</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Bed className="w-4 h-4" />
                      <span><strong>{dept.available_rooms}</strong> Available Rooms</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button onClick={() => setModal({ type: 'edit', dept })} className="flex-1 btn-secondary justify-center py-1.5 text-xs"><Edit2 className="w-3 h-3" /> Edit</button>
                  <button onClick={() => confirm(`Delete ${dept.name}?`) && deleteMutation.mutate(dept.id)} className="flex-1 btn-danger justify-center py-1.5 text-xs"><Trash2 className="w-3 h-3" /> Delete</button>
                </div>
              </div>
            ))}
            {data?.length === 0 && <div className="col-span-3 text-center py-16 text-gray-400">No departments found</div>}
          </div>
        )}
      </div>

      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Add Department" size="md">
        <DeptForm onSubmit={(form) => createMutation.mutate(form)} loading={createMutation.isPending} />
      </Modal>
      <Modal isOpen={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit Department" size="md">
        {modal?.type === 'edit' && (
          <DeptForm initial={modal.dept} onSubmit={(form) => updateMutation.mutate({ id: modal.dept.id, form })} loading={updateMutation.isPending} />
        )}
      </Modal>
    </Layout>
  );
}
