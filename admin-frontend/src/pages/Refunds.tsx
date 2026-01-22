import { useEffect, useState } from 'react';
import api from '../api/api';
import { showToast } from '../utils/toast';

type RefundStatus = 'requested' | 'approved' | 'rejected' | 'processed';

interface RefundPayment {
  id: number;
  amount: number;
  currency: string;
  createdAt: string;
}

interface Refund {
  id: number;
  userId: number;
  paymentId: number;
  amount: number;
  reason: string;
  status: RefundStatus;
  adminNotes?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  payment?: RefundPayment;
}

function Refunds() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | RefundStatus>('all');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await api.get<Refund[]>('/refunds/all');
      setRefunds(res.data);
    } catch (error) {
      console.error('Failed to fetch refunds', error);
      showToast.error('Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id: number, nextStatus: RefundStatus) => {
    try {
      let adminNotes: string | undefined;

      if (nextStatus === 'rejected') {
        // eslint-disable-next-line no-alert
        const note = window.prompt('Add a note for rejecting this refund (optional):') ?? '';
        adminNotes = note.trim() || undefined;
      }

      setProcessingId(id);
      await api.put(`/refunds/${id}/process`, { status: nextStatus, adminNotes });
      showToast.success(
        nextStatus === 'approved'
          ? 'Refund approved.'
          : nextStatus === 'processed'
          ? 'Refund marked as processed.'
          : 'Refund rejected.'
      );
      fetchRefunds();
    } catch (error: any) {
      showToast.error(error?.response?.data?.error || 'Failed to update refund');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRefunds =
    statusFilter === 'all'
      ? refunds
      : refunds.filter((r) => r.status === statusFilter);

  if (loading) {
    return <div className="text-center py-12 admin-text-muted">Loading refunds...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header + filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Refunds</h1>
          <p className="text-sm admin-text-muted mt-1">
            Manage refund requests and keep track of processed payments.
          </p>
        </div>
        <div className="flex gap-2">
          {(['all', 'requested', 'approved', 'processed', 'rejected'] as const).map((val) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val === 'all' ? 'all' : val)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border admin-border-subtle capitalize ${
                statusFilter === val
                  ? 'admin-badge-accent'
                  : 'bg-transparent text-slate-500 hover:bg-slate-900/5'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Table card */}
      <div className="admin-card rounded-2xl border admin-border-subtle p-4 md:p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/5">
              <tr className="text-xs uppercase tracking-wide admin-text-muted">
                <th className="px-4 py-3 font-semibold">Refund #</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.map((refund) => (
                <tr
                  key={refund.id}
                  className="border-t admin-border-subtle hover:bg-slate-900/5 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">#{refund.id}</td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-semibold">
                      #{refund.payment?.id ?? refund.paymentId}{' '}
                      <span className="admin-text-muted">
                        · {new Date(refund.payment?.createdAt ?? refund.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {refund.payment?.currency ?? 'ETB'} {Number(refund.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-xs line-clamp-2">{refund.reason}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        refund.status === 'requested'
                          ? 'bg-amber-500/10 text-amber-500'
                          : refund.status === 'approved'
                          ? 'bg-blue-500/10 text-blue-500'
                          : refund.status === 'processed'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {refund.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      {refund.status === 'requested' && (
                        <>
                          <button
                            onClick={() => handleProcess(refund.id, 'approved')}
                            disabled={processingId === refund.id}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 disabled:opacity-60"
                            title="Approve refund"
                          >
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9 12l2 2 4-4" />
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleProcess(refund.id, 'rejected')}
                            disabled={processingId === refund.id}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 disabled:opacity-60"
                            title="Reject refund"
                          >
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M15 9l-6 6" />
                              <path d="M9 9l6 6" />
                            </svg>
                          </button>
                        </>
                      )}
                      {refund.status === 'approved' && (
                        <button
                          onClick={() => handleProcess(refund.id, 'processed')}
                          disabled={processingId === refund.id}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 disabled:opacity-60"
                          title="Mark as processed"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 13l4 4L19 7" />
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredRefunds.length === 0 && (
          <p className="text-center py-6 text-sm admin-text-muted">
            No refunds match your current filters.
          </p>
        )}
      </div>
    </div>
  );
}

export default Refunds;


