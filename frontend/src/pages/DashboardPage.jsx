import { useQuery } from '@tanstack/react-query';
import { Users, UserRound, Calendar, Building2, Bed, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Layout from '../components/layout/Layout';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import { dashboard } from '../api';

const PIE_COLORS = ['#3b82f6', '#10b981', '#6b7280', '#ef4444', '#f59e0b'];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboard.stats().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const revenueData = data?.monthly_revenue
    ? Object.entries(data.monthly_revenue).map(([month, amount]) => ({ month, amount }))
    : [];

  const statusData = data?.appointments_by_status
    ? Object.entries(data.appointments_by_status).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <Layout title="Dashboard">
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
        <StatCard title="Total Patients" value={data?.total_patients || 0} icon={Users} color="blue" />
        <StatCard title="Doctors" value={data?.total_doctors || 0} icon={UserRound} color="green" />
        <StatCard title="Departments" value={data?.total_departments || 0} icon={Building2} color="purple" />
        <StatCard title="Today's Appointments" value={data?.today_appointments || 0} icon={Calendar} color="yellow" />
        <StatCard
          title="Available Rooms"
          value={`${data?.available_rooms || 0} / ${(data?.available_rooms || 0) + (data?.occupied_rooms || 0)}`}
          icon={Bed}
          color="indigo"
          subtitle={`${data?.occupied_rooms || 0} occupied`}
        />
        <StatCard
          title="Pending Bills"
          value={`$${(data?.pending_bills || 0).toLocaleString()}`}
          icon={DollarSign}
          color="red"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue chart */}
        <div className="card lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Appointments by status */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Appointments by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend formatter={(v) => <span className="text-xs capitalize">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No appointment data yet</div>
          )}
        </div>
      </div>

      {/* Recent appointments table */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Appointments</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Patient</th>
                <th className="table-header">Doctor</th>
                <th className="table-header">Date & Time</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.recent_appointments?.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell font-medium">{apt.patient_name}</td>
                  <td className="table-cell text-gray-600">{apt.doctor_name}</td>
                  <td className="table-cell text-gray-600">
                    {format(new Date(apt.appointment_date), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="table-cell"><StatusBadge status={apt.status} /></td>
                </tr>
              ))}
              {!data?.recent_appointments?.length && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400 text-sm">No appointments yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
