const statusConfig = {
  // appointments
  scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
  confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
  completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
  no_show: { color: 'bg-yellow-100 text-yellow-800', label: 'No Show' },
  // rooms
  available: { color: 'bg-green-100 text-green-800', label: 'Available' },
  occupied: { color: 'bg-red-100 text-red-800', label: 'Occupied' },
  maintenance: { color: 'bg-yellow-100 text-yellow-800', label: 'Maintenance' },
  // doctors
  active: { color: 'bg-green-100 text-green-800', label: 'Active' },
  inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
  on_leave: { color: 'bg-yellow-100 text-yellow-800', label: 'On Leave' },
  // bills
  pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
  partial: { color: 'bg-blue-100 text-blue-800', label: 'Partial' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  return (
    <span className={`badge ${config.color}`}>
      {config.label}
    </span>
  );
}
