import { useEffect, useState } from 'react';
import api from '../api/api';
import { showToast } from '../utils/toast';

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get<NotificationItem[]>('/notifications', { params: { limit: 50 } });
      setItems(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      showToast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (error) {
      showToast.error('Failed to mark all as read');
    }
  };

  const markRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      showToast.error('Failed to mark as read');
    }
  };

  const remove = async (id: number) => {
    try {
      await api.delete(`/notifications/${id}`);
      setItems((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      showToast.error('Failed to delete notification');
    }
  };

  if (loading) {
    return <div className="text-center py-12 admin-text-muted">Loading notifications...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Notifications</h1>
          <p className="text-sm admin-text-muted mt-1">
            Recent activity and system messages for your admin account.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={markAllRead}
            className="px-3 py-2 rounded-lg text-xs font-semibold border admin-border-subtle hover:bg-slate-900/5"
          >
            Mark all as read
          </button>
          <button
            onClick={fetchNotifications}
            className="px-3 py-2 rounded-lg text-xs font-semibold border admin-border-subtle hover:bg-slate-900/5"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((n) => (
          <div
            key={n.id}
            className={`admin-card rounded-xl border admin-border-subtle p-4 flex items-start justify-between gap-3 ${
              !n.read ? 'bg-blue-50/60' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 grid place-items-center text-xs font-semibold">
                {n.type.replace('_', ' ').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm">{n.title}</h2>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <p className="text-xs admin-text-muted mt-1">{n.message}</p>
                <p className="text-[11px] admin-text-muted mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!n.read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20"
                  title="Mark as read"
                >
                  ✓
                </button>
              )}
              <button
                onClick={() => remove(n.id)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20"
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center py-6 text-sm admin-text-muted">
            You have no notifications yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default Notifications;


