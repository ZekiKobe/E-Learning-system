import { useEffect, useState } from 'react';
import api from '../api/api';
import { showToast } from '../utils/toast';

interface AnnouncementCourse {
  id: number;
  title: string;
}

interface Announcement {
  id: number;
  courseId: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  course?: AnnouncementCourse;
}

function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState('');

  useEffect(() => {
    // By default, we can show nothing until a course is chosen
    setLoading(false);
  }, []);

  const fetchAnnouncements = async () => {
    if (!courseId) {
      showToast.error('Enter a course ID to load announcements.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.get<Announcement[]>(`/announcements/course/${courseId}`);
      setAnnouncements(res.data);
    } catch (error) {
      console.error('Failed to fetch announcements', error);
      showToast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 admin-text-muted">Loading announcements...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Announcements</h1>
          <p className="text-sm admin-text-muted mt-1">
            View course announcements as students see them.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="Course ID"
            className="px-3 py-2 rounded-lg border admin-border-subtle bg-transparent text-sm w-32"
          />
          <button
            onClick={fetchAnnouncements}
            className="px-3 py-2 rounded-lg text-xs font-semibold border admin-border-subtle hover:bg-slate-900/5"
          >
            Load
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="admin-card rounded-xl border admin-border-subtle p-4 shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-sm flex items-center gap-2">
                  {a.title}
                  {a.isPinned && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600">
                      Pinned
                    </span>
                  )}
                </h2>
                <p className="text-xs admin-text-muted">
                  Course #{a.courseId} ·{' '}
                  {new Date(a.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-sm whitespace-pre-line">{a.content}</p>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="text-center py-6 text-sm admin-text-muted">
            No announcements for this course yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default Announcements;


