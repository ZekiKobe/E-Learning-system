import { useEffect, useState } from 'react';
import api from '../api/api';
import { showToast } from '../utils/toast';

interface ReviewUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface ReviewCourse {
  id: number;
  title: string;
}

interface Review {
  id: number;
  userId: number;
  courseId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user?: ReviewUser;
  reviewedCourse?: ReviewCourse;
}

function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<'all' | '1+' | '3+' | '4+'>('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get<Review[]>('/reviews/admin');
      setReviews(res.data);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
      showToast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // eslint-disable-next-line no-alert
      const confirmed = window.confirm('Delete this review? This cannot be undone.');
      if (!confirmed) return;

      setDeletingId(id);
      await api.delete(`/reviews/${id}`);
      showToast.success('Review deleted.');
      fetchReviews();
    } catch (error: any) {
      showToast.error(error?.response?.data?.error || 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (ratingFilter === 'all') return true;
    if (ratingFilter === '1+') return r.rating >= 1;
    if (ratingFilter === '3+') return r.rating >= 3;
    if (ratingFilter === '4+') return r.rating >= 4;
    return true;
  });

  if (loading) {
    return <div className="text-center py-12 admin-text-muted">Loading reviews...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header + filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Course Reviews</h1>
          <p className="text-sm admin-text-muted mt-1">
            Monitor and moderate student feedback across all courses.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs admin-text-muted">Rating:</span>
          {(['all', '1+', '3+', '4+'] as const).map((val) => (
            <button
              key={val}
              onClick={() => setRatingFilter(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border admin-border-subtle ${
                ratingFilter === val
                  ? 'admin-badge-accent'
                  : 'bg-transparent text-slate-500 hover:bg-slate-900/5'
              }`}
            >
              {val === 'all' ? 'All' : `${val} stars`}
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
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold">Rating</th>
                <th className="px-4 py-3 font-semibold">Comment</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr
                  key={review.id}
                  className="border-t admin-border-subtle hover:bg-slate-900/5 transition-colors"
                >
                  <td className="px-4 py-3 text-xs">
                    <div className="font-semibold">
                      {review.user
                        ? `${review.user.firstName} ${review.user.lastName}`
                        : `User #${review.userId}`}
                    </div>
                    <div className="admin-text-muted">
                      {review.user?.email ?? ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {review.reviewedCourse
                      ? review.reviewedCourse.title
                      : `Course #${review.courseId}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500">
                      {review.rating.toFixed(1)} ★
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-md">
                    <p className="text-xs line-clamp-2">{review.comment}</p>
                  </td>
                  <td className="px-4 py-3 text-xs admin-text-muted">
                    {new Date(review.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 disabled:opacity-60"
                      title="Delete review"
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
                        <path d="M3 6h18" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                        <rect x="5" y="6" width="14" height="14" rx="2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredReviews.length === 0 && (
          <p className="text-center py-6 text-sm admin-text-muted">
            No reviews match your current filters.
          </p>
        )}
      </div>
    </div>
  );
}

export default Reviews;


