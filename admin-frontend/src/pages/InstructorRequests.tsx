import { useEffect, useState } from 'react';
import api from '../api/api';
import { showToast } from '../utils/toast';
import { ConfirmModal } from '../components/ConfirmModal';

interface InstructorRequest {
  id: number;
  message?: string;
  status: string;
  rejectionReason?: string;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

function InstructorRequests() {
  const [requests, setRequests] = useState<InstructorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [rejectReason, setRejectReason] = useState<{ [key: number]: string }>({});
  const [requestToConfirm, setRequestToConfirm] = useState<{
    id: number;
    type: 'approve' | 'reject';
  } | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/instructor-requests/all');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/instructor-requests/${id}/approve`);
      showToast.success('Request approved! User is now an instructor.');
      fetchRequests();
    } catch (error: any) {
      showToast.error(error.response?.data?.error || 'Failed to approve request');
    } finally {
      setRequestToConfirm(null);
    }
  };

  const handleReject = async (id: number) => {
    const reason = rejectReason[id] || '';
    if (!reason.trim()) {
      showToast.error('Please provide a rejection reason');
      return;
    }

    try {
      await api.post(`/instructor-requests/${id}/reject`, { rejectionReason: reason });
      showToast.success('Request rejected.');
      fetchRequests();
      setRejectReason({ ...rejectReason, [id]: '' });
    } catch (error: any) {
      showToast.error(error.response?.data?.error || 'Failed to reject request');
    } finally {
      setRequestToConfirm(null);
    }
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

  if (loading) {
    return <div className="text-center py-12 admin-text-muted">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Instructor Requests</h1>
          <p className="text-sm admin-text-muted mt-1">
            Review and approve instructor applications.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border admin-border-subtle ${
              filter === 'all' ? 'admin-badge-accent' : 'bg-transparent'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border admin-border-subtle ${
              filter === 'pending' ? 'admin-badge-accent' : 'bg-transparent'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border admin-border-subtle ${
              filter === 'approved' ? 'admin-badge-accent' : 'bg-transparent'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border admin-border-subtle ${
              filter === 'rejected' ? 'admin-badge-accent' : 'bg-transparent'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="admin-card rounded-xl border admin-border-subtle p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">
                  {request.user
                    ? `${request.user.firstName} ${request.user.lastName}`
                    : `User #${request.id}`}
                </h3>
                {request.user && (
                  <p className="text-slate-400 text-sm">{request.user.email}</p>
                )}
                <p className="text-slate-400 text-xs mt-1">
                  Requested on {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                request.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                request.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {request.status.toUpperCase()}
              </span>
            </div>

            {request.message && (
              <p className="text-slate-300 mb-4 p-3 rounded-lg bg-slate-800/60">
                {request.message}
              </p>
            )}

            {request.status === 'rejected' && request.rejectionReason && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-300">
                  <strong>Rejection Reason:</strong> {request.rejectionReason}
                </p>
              </div>
            )}

            {request.status === 'pending' && (
              <div className="space-y-3">
                <div>
                  <label className="block mb-2 text-slate-300 text-sm">Rejection Reason (if rejecting)</label>
                  <textarea
                    value={rejectReason[request.id] || ''}
                    onChange={(e) => setRejectReason({ ...rejectReason, [request.id]: e.target.value })}
                    placeholder="Optional: Provide reason for rejection..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-600/60 bg-slate-800/60 placeholder:text-slate-500 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setRequestToConfirm({ id: request.id, type: 'approve' })
                    }
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-green-600/10 text-green-400 hover:bg-green-600/20"
                    title="Approve request"
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
                      <path d="M12 22A10 10 0 1 1 22 12" />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      setRequestToConfirm({ id: request.id, type: 'reject' })
                    }
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-red-600/10 text-red-400 hover:bg-red-600/20"
                    title="Reject request"
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
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredRequests.length === 0 && (
          <p className="text-center py-12 admin-text-muted">No requests found.</p>
        )}
      </div>

      <ConfirmModal
        open={requestToConfirm !== null}
        title={
          requestToConfirm?.type === 'approve'
            ? 'Approve instructor request?'
            : 'Reject instructor request?'
        }
        description={
          requestToConfirm?.type === 'approve'
            ? 'The user will gain instructor permissions.'
            : 'The user will be notified that their request was rejected.'
        }
        confirmLabel={
          requestToConfirm?.type === 'approve' ? 'Approve' : 'Reject'
        }
        variant={requestToConfirm?.type === 'approve' ? 'default' : 'danger'}
        onConfirm={() => {
          if (!requestToConfirm) return;
          if (requestToConfirm.type === 'approve') {
            handleApprove(requestToConfirm.id);
          } else {
            handleReject(requestToConfirm.id);
          }
        }}
        onClose={() => setRequestToConfirm(null)}
      />
    </div>
  );
}

export default InstructorRequests;

