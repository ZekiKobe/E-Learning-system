import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

interface Enrollment {
  id: number;
  progress: number;
  completed: boolean;
  enrolledAt?: string;
  course: {
    id: number;
    title: string;
    thumbnail?: string;
  };
}

function StudentDashboard() {
  const { user, token } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    void fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    try {
      const res = await api.get<Enrollment[]>('/users/me/enrollments');
      setEnrollments(res.data || []);
    } catch {
      // handled by generic error UI later if needed
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  if (loading) {
    return (
      <div className="space-y-6 py-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-2">
            <div className="loading-skeleton h-8 w-64"></div>
            <div className="loading-skeleton h-4 w-96"></div>
          </div>
          <div className="loading-skeleton h-10 w-32"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-primary border border-primary rounded-lg p-4 shadow-sm">
              <div className="loading-skeleton h-3 w-24 mb-2"></div>
              <div className="loading-skeleton h-8 w-16"></div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.2fr] gap-4">
          <div className="bg-primary border border-primary rounded-lg p-6 shadow-sm">
            <div className="loading-skeleton h-6 w-48 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="loading-skeleton h-16 w-full rounded-lg"></div>
              ))}
            </div>
          </div>
          <div className="bg-primary border border-primary rounded-lg p-6 shadow-sm">
            <div className="loading-skeleton h-6 w-32 mb-4"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="loading-skeleton h-4 w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter((e) => e.completed).length;
  const inProgress = totalCourses - completedCourses;
  const avgProgress =
    totalCourses > 0
      ? Math.round(
          enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalCourses
        )
      : 0;

  const recent = [...enrollments]
    .sort((a, b) => {
      const da = a.enrolledAt ? new Date(a.enrolledAt).getTime() : 0;
      const db = b.enrolledAt ? new Date(b.enrolledAt).getTime() : 0;
      return db - da;
    })
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 py-2"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text text-primary">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''} 👋
          </h1>
          <p className="text-secondary mt-1">
            Track your learning progress and jump back into your courses.
          </p>
        </div>
        <button
          onClick={() => navigate('/courses')}
          className="btn-primary self-start md:self-auto"
        >
          Browse Courses
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-primary border border-primary rounded-lg p-4 shadow-sm card-hover">
          <div className="text-muted text-xs font-medium mb-1 uppercase tracking-wide">Enrolled Courses</div>
          <div className="text-2xl font-bold text-primary">{totalCourses}</div>
        </div>
        <div className="bg-primary border border-primary rounded-lg p-4 shadow-sm card-hover">
          <div className="text-muted text-xs font-medium mb-1 uppercase tracking-wide">In Progress</div>
          <div className="text-2xl font-bold text-primary">{inProgress}</div>
        </div>
        <div className="bg-primary border border-primary rounded-lg p-4 shadow-sm card-hover">
          <div className="text-muted text-xs font-medium mb-1 uppercase tracking-wide">Completed</div>
          <div className="text-2xl font-bold text-success">{completedCourses}</div>
        </div>
        <div className="bg-primary border border-primary rounded-lg p-4 shadow-sm card-hover">
          <div className="text-muted text-xs font-medium mb-1 uppercase tracking-wide">Avg. Progress</div>
          <div className="text-2xl font-bold text-accent">{avgProgress}%</div>
        </div>
      </div>

      {/* Recent courses */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.2fr] gap-4">
        <div className="bg-primary border border-primary rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary">Continue Learning</h2>
            <Link
              to="/my-courses"
              className="text-sm text-accent hover:text-accent-hover font-semibold transition-colors"
            >
              View all →
            </Link>
          </div>
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-tertiary rounded-full mb-4">
                <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-muted">You haven't enrolled in any courses yet.</p>
              <Link
                to="/courses"
                className="inline-block mt-4 text-accent hover:text-accent-hover font-semibold transition-colors"
              >
                Browse courses →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between gap-4 p-4 bg-secondary border border-primary rounded-lg card-hover"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary text-sm mb-2">
                      {enrollment.course.title}
                    </h3>
                    <div className="w-full h-2 bg-tertiary rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progress || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted">
                      {enrollment.progress}% complete
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/learn/${enrollment.course.id}`)}
                    className="btn-primary px-4 py-2 text-sm"
                  >
                    {enrollment.completed ? 'Review' : 'Resume'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-primary border border-primary rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold text-primary mb-4">Quick Links</h2>
          <div className="space-y-3">
            <Link
              to="/my-courses"
              className="flex items-center gap-3 p-3 bg-secondary border border-primary rounded-lg hover:bg-tertiary transition-colors group"
            >
              <div className="w-8 h-8 bg-accent-light rounded-lg flex items-center justify-center group-hover:bg-accent group-hover:text-bg-primary transition-colors">
                <svg className="w-4 h-4 text-accent group-hover:text-bg-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-primary font-medium">My Courses</span>
            </Link>
            <Link
              to="/teach"
              className="flex items-center gap-3 p-3 bg-secondary border border-primary rounded-lg hover:bg-tertiary transition-colors group"
            >
              <div className="w-8 h-8 bg-warning-light rounded-lg flex items-center justify-center group-hover:bg-warning group-hover:text-bg-primary transition-colors">
                <svg className="w-4 h-4 text-warning group-hover:text-bg-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="text-primary font-medium">Become an Instructor</span>
            </Link>
            <Link
              to="/courses"
              className="flex items-center gap-3 p-3 bg-secondary border border-primary rounded-lg hover:bg-tertiary transition-colors group"
            >
              <div className="w-8 h-8 bg-success-light rounded-lg flex items-center justify-center group-hover:bg-success group-hover:text-bg-primary transition-colors">
                <svg className="w-4 h-4 text-success group-hover:text-bg-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-primary font-medium">Explore all courses</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default StudentDashboard;


