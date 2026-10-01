import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Bed } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';
import { rooms, departments } from '../api';

const ROOM_TYPES = ['general', 'private', 'icu', 'emergency', 'ot'];
const ROOM_TYPE_COLORS = { general: 'bg-blue-50 text-blue-700', private: 'bg-purple-50 text-purple-700', icu: 'bg-red-50 text-red-700', emergency: 'bg-orange-50 text-orange-700', ot: 'bg-gray-50 text-gray-700' };

function RoomForm({ initial, onSubmit, loading }) {
  const { data: deptData } = useQuery({ queryKey: ['departments'], queryFn: () => departments.list().then((r) => r.data) });
  const [form, setForm] = useState(initial || { department_id: '', room_number: '', room_type: 'general', status: 'available', floor: '', capacity: '', rate_per_day: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
          <select className="input" value={form.department_id} onChange={(e) => set('department_id', e.target.value)} required>
            <option value="">Select</option>
            {deptData?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
          <input className="input" value={form.room_number} onChange={(e) => set('room_number', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
          <select className="input" value={form.room_type} onChange={(e) => set('room_type', e.target.value)}>
            {ROOM_TYPES.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
          <input type="number" className="input" value={form.floor} onChange={(e) => set('floor', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
          <input type="number" className="input" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Day ($)</label>
          <input type="number" step="0.01" className="input" value={form.rate_per_day} onChange={(e) => set('rate_per_day', e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Room'}</button>
      </div>
    </form>
  );
}

export default function RoomsPage() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['rooms', page, filterStatus],
    queryFn: () => rooms.list({ page, status: filterStatus || undefined, per_page: 20 }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (form) => rooms.create(form),
    onSuccess: () => { qc.invalidateQueries(['rooms']); toast.success('Room created'); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.errors?.join(', ') || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }) => rooms.update(id, form),
    onSuccess: () => { qc.invalidateQueries(['rooms']); toast.success('Room updated'); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.errors?.join(', ') || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => rooms.delete(id),
    onSuccess: () => { qc.invalidateQueries(['rooms']); toast.success('Room deleted'); },
  });

  const stats = { available: data?.rooms?.filter((r) => r.status === 'available').length || 0, occupied: data?.rooms?.filter((r) => r.status === 'occupied').length || 0, maintenance: data?.rooms?.filter((r) => r.status === 'maintenance').length || 0 };

  return (
    <Layout title="Rooms & Wards">
      <div className="space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[{ label: 'Available', count: stats.available, color: 'bg-green-50 border-green-200 text-green-700' }, { label: 'Occupied', count: stats.occupied, color: 'bg-red-50 border-red-200 text-red-700' }, { label: 'Maintenance', count: stats.maintenance, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' }].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {['', 'available', 'occupied', 'maintenance'].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filterStatus === s ? 'bg-primary-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
          <button onClick={() => setModal('create')} className="btn-primary"><Plus className="w-4 h-4" /> Add Room</button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data?.rooms?.map((room) => (
              <div key={room.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <Bed className="w-5 h-5 text-indigo-600" />
                  </div>
                  <StatusBadge status={room.status} />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-1">Room {room.room_number}</p>
                <p className="text-sm text-gray-500 mb-3">{room.department_name}</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className={`badge ${ROOM_TYPE_COLORS[room.room_type] || 'bg-gray-100 text-gray-700'} capitalize`}>{room.room_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Floor</span>
                    <span className="font-medium">{room.floor ?? '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Capacity</span>
                    <span className="font-medium">{room.capacity || '—'} beds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rate</span>
                    <span className="font-medium">${room.rate_per_day}/day</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button onClick={() => setModal({ type: 'edit', room })} className="flex-1 btn-secondary justify-center py-1.5 text-xs"><Edit2 className="w-3 h-3" /> Edit</button>
                  <button onClick={() => confirm(`Delete room ${room.room_number}?`) && deleteMutation.mutate(room.id)} className="flex-1 btn-danger justify-center py-1.5 text-xs"><Trash2 className="w-3 h-3" /> Delete</button>
                </div>
              </div>
            ))}
            {data?.rooms?.length === 0 && <div className="col-span-4 text-center py-16 text-gray-400">No rooms found</div>}
          </div>
        )}
      </div>

      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="Add Room" size="md">
        <RoomForm onSubmit={(form) => createMutation.mutate(form)} loading={createMutation.isPending} />
      </Modal>
      <Modal isOpen={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit Room" size="md">
        {modal?.type === 'edit' && (
          <RoomForm initial={modal.room} onSubmit={(form) => updateMutation.mutate({ id: modal.room.id, form })} loading={updateMutation.isPending} />
        )}
      </Modal>
    </Layout>
  );
}
