import { useEffect, useState } from 'react';
import api from '../api/api';
import { showToast } from '../utils/toast';

type PaymentStatus = 'initiated' | 'pending' | 'success' | 'failed';
type PaymentProvider = 'chapa' | 'telebirr';

interface PaymentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface PaymentCourse {
  id: number;
  title: string;
}

interface Payment {
  id: number;
  userId: number;
  courseId: number;
  amount: string;
  currency: string;
  provider: PaymentProvider;
  reference: string;
  status: PaymentStatus;
  createdAt: string;
  user?: PaymentUser;
  paymentCourse?: PaymentCourse;
}

function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [providerFilter, setProviderFilter] = useState<'all' | PaymentProvider>('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (providerFilter !== 'all') params.provider = providerFilter;
      const res = await api.get<Payment[]>('/payments/admin', { params });
      setPayments(res.data);
    } catch (error) {
      console.error('Failed to fetch payments', error);
      showToast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const statusOk = statusFilter === 'all' || p.status === statusFilter;
    const providerOk = providerFilter === 'all' || p.provider === providerFilter;
    return statusOk && providerOk;
  });

  if (loading) {
    return <div className="text-center py-12 admin-text-muted">Loading payments...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header + filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Payments</h1>
          <p className="text-sm admin-text-muted mt-1">
            View and filter all course payments across the platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg border admin-border-subtle bg-transparent text-sm"
          >
            <option value="all">All statuses</option>
            <option value="initiated">Initiated</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg border admin-border-subtle bg-transparent text-sm"
          >
            <option value="all">All providers</option>
            <option value="chapa">Chapa</option>
            <option value="telebirr">Telebirr</option>
          </select>
          <button
            onClick={fetchPayments}
            className="px-3 py-2 rounded-lg text-xs font-semibold border admin-border-subtle hover:bg-slate-900/5"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="admin-card rounded-2xl border admin-border-subtle p-4 md:p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/5">
              <tr className="text-xs uppercase tracking-wide admin-text-muted">
                <th className="px-4 py-3 font-semibold">Payment #</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Provider</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-t admin-border-subtle hover:bg-slate-900/5 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-xs">#{payment.id}</td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-semibold">
                      {payment.user
                        ? `${payment.user.firstName} ${payment.user.lastName}`
                        : `User #${payment.userId}`}
                    </div>
                    <div className="admin-text-muted">
                      {payment.user?.email ?? ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {payment.paymentCourse
                      ? payment.paymentCourse.title
                      : `Course #${payment.courseId}`}
                  </td>
                  <td className="px-4 py-3">
                    {payment.currency} {Number(payment.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      {payment.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        payment.status === 'success'
                          ? 'bg-green-500/10 text-green-500'
                          : payment.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-500'
                          : payment.status === 'initiated'
                          ? 'bg-slate-500/10 text-slate-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs admin-text-muted">
                    {new Date(payment.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPayments.length === 0 && (
          <p className="text-center py-6 text-sm admin-text-muted">
            No payments match your current filters.
          </p>
        )}
      </div>
    </div>
  );
}

export default Payments;


