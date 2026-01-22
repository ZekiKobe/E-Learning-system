import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import { showToast } from '../utils/toast';
import { useCartStore } from '../store/cartStore';
import { useThemeStore } from '../store/themeStore';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  level: string;
  language: string;
  rating?: number | string | null;
  totalStudents?: number;
  instructor: {
    firstName: string;
    lastName: string;
    bio?: string;
  };
  category: {
    name: string;
  };
  lessons: Array<{
    id: number;
    title: string;
    type: string;
    duration?: number;
    isPreview: boolean;
  }>;
}

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [provider, setProvider] = useState<'chapa' | 'telebirr'>('chapa');
  const [inWishlist, setInWishlist] = useState(false);
  const [updatingWishlist, setUpdatingWishlist] = useState(false);
  const { addItem } = useCartStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    void fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      const baseCourse = res.data.course as Course;
      setEnrollment(res.data.enrollment);

      try {
        const lessonsRes = await api.get(`/lessons/course/${id}`);
        baseCourse.lessons = lessonsRes.data || [];
      } catch {
        baseCourse.lessons = baseCourse.lessons || [];
      }

      setCourse(baseCourse);

      // Check wishlist status if logged in
      if (token) {
        try {
          const wish = await api.get<{ inWishlist: boolean }>(
            `/wishlist/check/${id}`,
          );
          setInWishlist(wish.data.inWishlist);
        } catch {
          // ignore
        }
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setCourse(null);
      }
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      setEnrollment({ progress: 0, completed: false });
      showToast.success('Successfully enrolled in course!');
      navigate(`/learn/${id}`);
    } catch (error: any) {
      showToast.error(error?.response?.data?.error || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handleBuyNow = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const resp = await api.post('/payments/checkout', {
        courseId: Number(id),
        provider,
      });
      const url = resp.data?.checkoutUrl;
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      showToast.error(error?.response?.data?.error || 'Failed to start payment');
    }
  };

  const handleAddToCart = () => {
    if (!course) return;
    const isFree = Number(course.price) === 0;
    if (isFree) {
      // Free courses should be enrolled directly instead of going through cart
      void (async () => {
        try {
          if (!token) {
            navigate('/login');
            return;
          }
          await api.post(`/courses/${course.id}/enroll`);
          showToast.success('Successfully enrolled in course!');
          navigate(`/learn/${course.id}`);
        } catch (error: any) {
          showToast.error(error?.response?.data?.error || 'Failed to enroll');
        }
      })();
      return;
    }
    addItem({
      id: course.id,
      title: course.title,
      price: course.price,
      thumbnail: (course as any).thumbnail, // in case it's present
    });
    showToast.success('Added to cart');
    navigate('/cart');
  };

  const toggleWishlist = async () => {
    if (!id) return;
    if (!token) {
      navigate('/login');
      return;
    }
    setUpdatingWishlist(true);
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/${id}`);
        setInWishlist(false);
        showToast.success('Removed from wishlist');
        window.dispatchEvent(new CustomEvent('wishlist-updated'));
      } else {
        await api.post(`/wishlist/${id}`);
        setInWishlist(true);
        showToast.success('Added to wishlist');
        window.dispatchEvent(new CustomEvent('wishlist-updated'));
      }
    } catch (error: any) {
      showToast.error(error?.response?.data?.error || 'Wishlist action failed');
    } finally {
      setUpdatingWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-400">
        Loading course...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12 text-slate-400">
        Course not found
      </div>
    );
  }

  const totalDuration = (course.lessons || []).reduce(
    (sum, l) => sum + (l.duration || 0),
    0
  );
  const ratingNum = Number(course.rating);
  const showRating = Number.isFinite(ratingNum) && ratingNum > 0;

  const cardClass = isDark
    ? 'rounded-xl border border-slate-700/40 bg-slate-900/40'
    : 'rounded-xl border border-slate-200 bg-white/90';

  const subtleCardClass = isDark
    ? 'rounded-lg bg-slate-800/60 border border-slate-700/40'
    : 'rounded-lg bg-slate-50 border border-slate-200';

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero header */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1 gradient-text">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-slate-300 text-sm">
                <span>
                  By {course.instructor.firstName} {course.instructor.lastName}
                </span>
                <span>•</span>
                <span>{course.category.name}</span>
            {showRating && (
              <>
                <span>•</span>
                <span className="text-amber-300">
                  <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {ratingNum.toFixed(1)}
                </span>
              </>
            )}
              </div>
            </div>
            <button
          type="button"
          onClick={toggleWishlist}
          disabled={updatingWishlist}
          className={`mt-1 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
            inWishlist
              ? 'border-amber-400/70 bg-amber-400/10 text-amber-300'
              : 'border-slate-600/70 bg-slate-900/40 text-slate-200 hover:bg-slate-800/80'
          }`}
        >
          <span>{inWishlist ? '♥' : '♡'}</span>
          <span>{inWishlist ? 'Saved to wishlist' : 'Save to wishlist'}</span>
        </button>
      </div>

      {/* Main split: about/instructor left, pricing card right */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)] gap-6 items-start">
        {/* Left: about + instructor */}
        <div className="space-y-4">
          <div className={`${cardClass} p-6`}>
            <h2 className="text-xl font-semibold mb-2">About this course</h2>
            <p className="text-slate-300 leading-relaxed text-sm md:text-base">
              {course.description}
            </p>
          </div>

          <div className={`${cardClass} p-5 flex flex-col md:flex-row md:items-center gap-4`}>
            <div className="w-12 h-12 rounded-full bg-blue-600/30 flex items-center justify-center text-lg font-semibold text-white">
              {course.instructor.firstName?.[0] ||
                course.instructor.lastName?.[0] ||
                'I'}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                {course.instructor.firstName} {course.instructor.lastName}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {course.instructor.bio || 'Instructor on E-Learning platform.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: pricing / actions */}
        <div className={`lg:sticky lg:top-20 h-max ${cardClass} p-5 shadow`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-3xl font-extrabold">
              {Number(course.price) === 0 ? 'Free' : `$${course.price}`}
            </span>
            {Number(course.price) > 0 && (
              <button
                type="button"
                onClick={handleAddToCart}
                className="px-3 py-1.5 rounded-full border border-slate-600/60 text-xs text-slate-200 hover:bg-slate-800/80"
              >
                Add to cart
              </button>
            )}
          </div>
          {enrollment ? (
            <button
              onClick={() => navigate(`/learn/${course.id}`)}
              className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-blue-600"
            >
              Continue Learning
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Payment Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) =>
                    setProvider(e.target.value as 'chapa' | 'telebirr')
                  }
                  className="w-full rounded-lg bg-slate-800/60 border border-slate-700/60 px-3 py-2"
                >
                  <option value="chapa">Chapa</option>
                  <option value="telebirr">Telebirr</option>
                </select>
              </div>
              <button
                onClick={handleBuyNow}
                className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-amber-500"
              >
                Buy Now
              </button>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-slate-700 disabled:opacity-60"
              >
                {enrolling ? 'Processing...' : 'Enroll (free/demo)'}
              </button>
            </div>
          )}
          <div className="mt-4 space-y-2 text-slate-300 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>{(course.lessons || []).length} Lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⏱️</span>
              <span>{totalDuration} Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5 12.083 12.083 0 015.84 10.578L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7" />
              </svg>
              <span>{course.level} Level</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🌐</span>
              <span>{course.language}</span>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Secondary split: lessons left, highlights right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lessons list */}
        <div className={`${cardClass} p-6`}>
          <h2 className="text-xl font-semibold mb-3">Course content</h2>
          <div className="space-y-2">
            {(course.lessons || []).map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex gap-3 p-3 rounded-lg border border-slate-700/40"
              >
                <span className="font-semibold text-blue-300 text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{lesson.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="capitalize">{lesson.type}</span>
                    {lesson.duration && <span>{lesson.duration} min</span>}
                    {lesson.isPreview && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-200 text-[11px] font-medium">
                        Preview
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-xs mt-3">
            {(course.lessons || []).length} lessons • {totalDuration} minutes
            total
          </p>
        </div>

        {/* Highlights / key info */}
        <div className={`${cardClass} p-6 space-y-4`}>
          <h2 className="text-xl font-semibold mb-1">Course highlights</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className={`${subtleCardClass} px-3 py-3`}>
              <p className="text-xs text-slate-400">Level</p>
              <p className="font-medium text-slate-100 mt-1">{course.level}</p>
            </div>
            <div className={`${subtleCardClass} px-3 py-3`}>
              <p className="text-xs text-slate-400">Language</p>
              <p className="font-medium text-slate-100 mt-1">
                {course.language}
              </p>
            </div>
            <div className={`${subtleCardClass} px-3 py-3`}>
              <p className="text-xs text-slate-400">Total lessons</p>
              <p className="font-medium text-slate-100 mt-1">
                {(course.lessons || []).length}
              </p>
            </div>
            <div className={`${subtleCardClass} px-3 py-3`}>
              <p className="text-xs text-slate-400">Total duration</p>
              <p className="font-medium text-slate-100 mt-1">
                {totalDuration} min
              </p>
            </div>
            {typeof course.totalStudents === 'number' && (
              <div className={`${subtleCardClass} px-3 py-3`}>
                <p className="text-xs text-slate-400">Enrolled learners</p>
                <p className="font-medium text-slate-100 mt-1">
                  {course.totalStudents.toLocaleString()}
                </p>
              </div>
            )}
            {showRating && (
              <div className={`${subtleCardClass} px-3 py-3`}>
                <p className="text-xs text-slate-400">Rating</p>
                <p className="font-medium text-amber-300 mt-1">
                  <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {ratingNum.toFixed(1)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`${cardClass} p-6 backdrop-blur-sm`}>
        <h2 className="text-xl font-semibold mb-4">Student reviews</h2>
        <ReviewsList courseId={Number(id)} />
      </div>
      </div>
    </div>
  );
}

function ReviewsList({ courseId }: { courseId: number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchReviews();
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/course/${courseId}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-slate-400">
        Loading reviews...
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-4 text-slate-400">
        No reviews yet. Be the first to review!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="border-b border-slate-700/40 pb-4 last:border-0"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center font-bold">
              {review.user?.firstName?.[0] || 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">
                  {review.user?.firstName} {review.user?.lastName}
                </span>
                <div className="flex text-amber-400">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              {review.comment && (
                <p className="text-slate-300 text-sm">{review.comment}</p>
              )}
              <p className="text-slate-400 text-xs mt-1">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CourseDetail;


