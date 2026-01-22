import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
}

interface Course {
  id: number;
  title: string;
  price: number;
  totalStudents: number;
  rating: number;
  status: string;
}

function InstructorDashboard() {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || (user?.role !== 'instructor' && user?.role !== 'admin')) {
      return;
    }
    fetchDashboardData();
  }, [token, user]);

  const fetchDashboardData = async () => {
    try {
      const [coursesRes, statsRes] = await Promise.all([
        api.get('/courses/mine'),
        api.get('/users/me/stats')
      ]);
      setCourses(coursesRes.data || []);
      
      // Calculate stats from courses
      const totalCourses = coursesRes.data?.length || 0;
      const totalStudents = coursesRes.data?.reduce((sum: number, c: Course) => sum + (c.totalStudents || 0), 0) || 0;
      const totalRevenue = coursesRes.data?.reduce((sum: number, c: Course) => sum + (c.price * (c.totalStudents || 0) * 0.7), 0) || 0; // 70% split
      const ratings = coursesRes.data?.filter((c: Course) => c.rating > 0).map((c: Course) => c.rating) || [];
      const averageRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
      
      setStats({ totalCourses, totalStudents, totalRevenue, averageRating });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!token || (user?.role !== 'instructor' && user?.role !== 'admin')) {
    return <div className="text-center py-12 text-slate-400">Access denied. Instructor access required.</div>;
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Instructor Dashboard</h1>
        <Link to="/instructor/courses" className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700">
          Manage Courses
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-5">
          <div className="text-slate-400 text-sm mb-1">Total Courses</div>
          <div className="text-3xl font-extrabold">{stats?.totalCourses || 0}</div>
        </div>
        <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-5">
          <div className="text-slate-400 text-sm mb-1">Total Students</div>
          <div className="text-3xl font-extrabold">{stats?.totalStudents || 0}</div>
        </div>
        <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-5">
          <div className="text-slate-400 text-sm mb-1">Total Revenue</div>
          <div className="text-3xl font-extrabold">${(stats?.totalRevenue || 0).toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-5">
          <div className="text-slate-400 text-sm mb-1">Average Rating</div>
          <div className="text-3xl font-extrabold flex items-center gap-2">
            {(stats?.averageRating || 0).toFixed(1)}
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Recent Courses */}
      <div className="rounded-xl border border-slate-700/40 bg-slate-900/40 p-5">
        <h2 className="text-xl font-bold mb-4">My Courses</h2>
        {courses.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="mb-4">You haven't created any courses yet.</p>
            <Link to="/instructor/courses" className="inline-block px-5 py-3 rounded-lg font-semibold text-white bg-blue-600">
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.slice(0, 5).map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-700/40">
                <div className="flex-1">
                  <h3 className="font-bold">{course.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                    <span>${course.price}</span>
                    <span>•</span>
                    <span>{course.totalStudents || 0} students</span>
                    <span>•</span>
                    <span className="capitalize">{course.status}</span>
                    {course.rating > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {course.rating.toFixed(1)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Link to={`/courses/${course.id}`} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700">
                  View
                </Link>
              </div>
            ))}
            {courses.length > 5 && (
              <Link to="/instructor/courses" className="block text-center text-blue-400 hover:text-blue-300 mt-4">
                View all {courses.length} courses →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default InstructorDashboard;

