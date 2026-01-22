import { useEffect, useState } from 'react';
import api from '../api/api';
import { showToast } from '../utils/toast';

interface EnrollmentAnalyticsItem {
  id: number;
  title: string;
  totalStudents: number;
  totalEnrollments: number;
  completedCount: number;
  completionRate: number;
  createdAt: string;
}

function EnrollmentAnalytics() {
  const [items, setItems] = useState<EnrollmentAnalyticsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get<EnrollmentAnalyticsItem[]>('/progress/admin/enrollment-analytics');
      setItems(res.data);
    } catch (error) {
      console.error('Failed to fetch enrollment analytics', error);
      showToast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 admin-text-muted">Loading analytics...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Enrollment Analytics</h1>
          <p className="text-sm admin-text-muted mt-1">
            See how learners are enrolling and completing courses.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-3 py-2 rounded-lg text-xs font-semibold border admin-border-subtle hover:bg-slate-900/5"
        >
          Refresh
        </button>
      </div>

      <div className="admin-card rounded-2xl border admin-border-subtle p-4 md:p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/5">
              <tr className="text-xs uppercase tracking-wide admin-text-muted">
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Enrollments</th>
                <th className="px-4 py-3 font-semibold">Completed</th>
                <th className="px-4 py-3 font-semibold">Completion Rate</th>
                <th className="px-4 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t admin-border-subtle hover:bg-slate-900/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-sm">{item.title}</div>
                    <div className="text-xs admin-text-muted">Course #{item.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    {item.totalEnrollments}{' '}
                    <span className="text-xs admin-text-muted">
                      (reported students: {item.totalStudents})
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.completedCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-slate-200/60 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${item.completionRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{item.completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs admin-text-muted">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && (
          <p className="text-center py-6 text-sm admin-text-muted">
            No enrollment data available yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default EnrollmentAnalytics;


