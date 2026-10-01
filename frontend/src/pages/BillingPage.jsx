import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import StatusBadge from '../components/ui/StatusBadge';
import { bills, patients, appointments } from '../api';

function BillForm({ initial, onSubmit, loading }) {
  const { data: patientData } = useQuery({ queryKey: ['patients-all'], queryFn: () => patients.list({ per_page: 100 }).then((r) => r.data) });
  const [form, setForm] = useState(initial || { patient_id: '', total_amount: '', paid_amount: '0', status: 'pending', payment_method: '', due_date: '' });
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount ($) *</label>
          <input type="number" step="0.01" className="input" value={form.total_amount} onChange={(e) => set('total_amount', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount ($)</label>
          <input type="number" step="0.01" className="input" value={form.paid_amount} onChange={(e) => set('paid_amount', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
            {['pending', 'paid', 'partial', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select className="input" value={form.payment_method} onChange={(e) => set('payment_method', e.target.value)}>
            <option value="">Select</option>
            {['cash', 'card', 'insurance', 'upi'].map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input type="date" className="input" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Bill'}</button>
      </div>
    </form>
  );
}

export default function BillingPage() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['bills', page, filterStatus],
    queryFn: () => bills.list({ page, status: filterStatus || undefined }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (form) => bills.create(form),
    onSuccess: () => { qc.invalidateQueries(['bills']); toast.success('Bill created'); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.errors?.join(', ') || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }) => bills.update(id, form),
    onSuccess: () => { qc.invalidateQueries(['bills']); toast.success('Bill updated'); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.errors?.join(', ') || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => bills.delete(id),
    onSuccess: () => { qc.invalidateQueries(['bills']); toast.success('Bill deleted'); },
  });

  return (
    <Layout title="Billing">
      <div className="space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <p className="text-sm text-gray-500">Total Billed</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">${Number(data?.summary?.total || 0).toLocaleString()}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-green-700 mt-1">${Number(data?.summary?.paid || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {['', 'pending', 'paid', 'partial', 'cancelled'].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filterStatus === s ? 'bg-primary-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
          <button onClick={() => setModal('create')} className="btn-primary"><Plus className="w-4 h-4" /> New Bill</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-header">Patient</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">Paid</th>
                  <th className="table-header">Outstanding</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Method</th>
                  <th className="table-header">Due Date</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan={8} className="text-center py-12"><div className="inline-block w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></td></tr>
                ) : data?.bills?.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{b.patient_name}</td>
                    <td className="table-cell">${Number(b.total_amount).toLocaleString()}</td>
                    <td className="table-cell text-green-700">${Number(b.paid_amount || 0).toLocaleString()}</td>
                    <td className="table-cell text-red-600">${Number(b.outstanding_amount || 0).toLocaleString()}</td>
                    <td className="table-cell"><StatusBadge status={b.status} /></td>
                    <td className="table-cell capitalize text-gray-600">{b.payment_method || '—'}</td>
                    <td className="table-cell text-gray-600">{b.due_date ? format(new Date(b.due_date), 'MMM d, yyyy') : '—'}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setModal({ type: 'edit', bill: b })} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => confirm('Delete this bill?') && deleteMutation.mutate(b.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && data?.bills?.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No bills found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination meta={data?.meta} onPageChange={setPage} />
        </div>
      </div>

      <Modal isOpen={modal === 'create'} onClose={() => setModal(null)} title="New Bill" size="md">
        <BillForm onSubmit={(form) => createMutation.mutate(form)} loading={createMutation.isPending} />
      </Modal>
      <Modal isOpen={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit Bill" size="md">
        {modal?.type === 'edit' && (
          <BillForm initial={modal.bill} onSubmit={(form) => updateMutation.mutate({ id: modal.bill.id, form })} loading={updateMutation.isPending} />
        )}
      </Modal>
    </Layout>
  );
}
