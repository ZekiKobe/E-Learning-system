import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import { getImageUrl } from '../utils/imageUtils';
import { showToast } from '../utils/toast';

interface WishlistItem {
  id: number;
  course: {
    id: number;
    title: string;
    description?: string;
    thumbnail?: string;
    price: number;
    rating?: number;
    totalRatings?: number;
    instructor: {
      firstName: string;
      lastName: string;
    };
    category?: { name: string };
  };
}

function Wishlist() {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const load = async () => {
      try {
        const res = await api.get<WishlistItem[]>('/wishlist');
        setItems(res.data || []);
      } catch (error) {
        console.error('Failed to load wishlist', error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token, navigate]);

  const remove = async (courseId: number) => {
    try {
      await api.delete(`/wishlist/${courseId}`);
      setItems((prev) => prev.filter((i) => i.course.id !== courseId));
      showToast.success('Removed from wishlist');
    } catch (error: any) {
      showToast.error(error?.response?.data?.error || 'Failed to remove');
    }
  };

  if (!token) {
    return null;
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading wishlist...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Wishlist</h1>
          <p className="text-sm text-slate-400">
            Courses you’ve saved to check out later.
          </p>
        </div>
        {items.length > 0 && (
          <span className="text-xs text-slate-400">
            {items.length} saved {items.length === 1 ? 'course' : 'courses'}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-8 text-center text-slate-300">
          <p className="mb-3">You haven’t saved any courses yet.</p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => {
            const c = item.course;
            const ratingNum = Number(c.rating);
            const showRating = Number.isFinite(ratingNum) && ratingNum > 0;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-slate-700/40 bg-slate-900/40 overflow-hidden shadow card-hover flex flex-col"
              >
                <Link to={`/courses/${c.id}`} className="flex-1 flex flex-col">
                  <div className="w-full h-40 bg-gradient-to-br from-blue-600/20 to-amber-500/20 relative overflow-hidden">
                    {c.thumbnail ? (
                      <img
                        src={getImageUrl(c.thumbnail)}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-1 flex-1 flex flex-col">
                    <h3 className="font-bold mb-1 line-clamp-2 text-[15px]">
                      {c.title}
                    </h3>
                    <p className="text-slate-400 text-xs mb-1">
                      {c.instructor.firstName} {c.instructor.lastName}
                    </p>
                    {showRating && (
                      <div className="flex items-center gap-1 text-xs text-amber-300 mb-1">
                        <span>{ratingNum.toFixed(1)}</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {c.totalRatings && (
                          <span className="text-slate-400 text-[11px]">
                            ({c.totalRatings.toLocaleString()})
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-700/40 text-sm">
                      <span className="font-extrabold">${c.price}</span>
                      <span className="text-xs text-slate-400">
                        {c.category?.name}
                      </span>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => remove(c.id)}
                  className="w-full px-4 py-2 text-xs font-semibold text-red-300 border-t border-slate-700/40 hover:bg-red-500/10"
                >
                  Remove
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export default Wishlist;


