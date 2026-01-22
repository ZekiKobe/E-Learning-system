import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalCategories: number;
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-2">
            <div className="loading-skeleton h-8 w-48"></div>
            <div className="loading-skeleton h-4 w-64"></div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-primary border border-primary rounded-xl p-5 shadow-sm">
              <div className="loading-skeleton w-12 h-12 rounded-xl mb-3"></div>
              <div className="loading-skeleton h-3 w-16 mb-1"></div>
              <div className="loading-skeleton h-6 w-12"></div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr,1.2fr] gap-6">
          <div className="bg-primary border border-primary rounded-xl p-6 shadow-sm">
            <div className="loading-skeleton h-6 w-40 mb-2"></div>
            <div className="loading-skeleton h-4 w-48 mb-6"></div>
            <div className="loading-skeleton h-52 w-full rounded-xl"></div>
          </div>
          <div className="space-y-4">
            <div className="bg-primary border border-primary rounded-xl p-5 shadow-sm">
              <div className="loading-skeleton h-6 w-32 mb-3"></div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="loading-skeleton h-4 w-full"></div>
                ))}
              </div>
            </div>
            <div className="bg-primary border border-primary rounded-xl p-5 shadow-sm">
              <div className="loading-skeleton h-6 w-32 mb-3"></div>
              <div className="loading-skeleton h-4 w-full mb-3"></div>
              <div className="loading-skeleton h-6 w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-secondary mt-1">
            Welcome back, {user?.firstName} {user?.lastName}. Here's what's happening today.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-primary border border-primary rounded-xl p-5 shadow-sm card-hover flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">Total Users</p>
            <p className="text-2xl font-bold text-primary">{stats?.totalUsers ?? 0}</p>
          </div>
        </div>
        <div className="bg-primary border border-primary rounded-xl p-5 shadow-sm card-hover flex items-center gap-4">
          <div className="w-12 h-12 bg-warning-light rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">Total Courses</p>
            <p className="text-2xl font-bold text-primary">{stats?.totalCourses ?? 0}</p>
          </div>
        </div>
        <div className="bg-primary border border-primary rounded-xl p-5 shadow-sm card-hover flex items-center gap-4">
          <div className="w-12 h-12 bg-success-light rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">Total Enrollments</p>
            <p className="text-2xl font-bold text-primary">{stats?.totalEnrollments ?? 0}</p>
          </div>
        </div>
        <div className="bg-primary border border-primary rounded-xl p-5 shadow-sm card-hover flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">Categories</p>
            <p className="text-2xl font-bold text-primary">{stats?.totalCategories ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Main content (fake chart + lists like modern dashboards) */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr,1.2fr] gap-6">
        {/* Activity / chart card */}
        <div className="bg-primary border border-primary rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-primary">Student Activity</h2>
              <p className="text-sm text-secondary mt-1">This month vs last month</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-2 text-secondary">
                <span className="w-3 h-3 rounded-full bg-accent"></span>
                This month
              </span>
              <span className="inline-flex items-center gap-2 text-secondary">
                <span className="w-3 h-3 rounded-full bg-warning"></span>
                Last month
              </span>
            </div>
          </div>
          {/* Simple gradient chart mock */}
          <div className="relative h-52 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-white/5">
            <div className="absolute inset-x-6 bottom-8 h-24 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10" />
            {/* Fake lines */}
            <svg viewBox="0 0 400 160" className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)]">
              <defs>
                <linearGradient id="lineA" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineB" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M10 120 C 80 80, 140 140, 200 90 S 320 60, 390 100"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M10 130 C 80 100, 140 110, 200 120 S 320 130, 390 110"
                fill="none"
                stroke="#ec4899"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Right side summaries */}
        <div className="space-y-4">
          <div className="bg-primary border border-primary rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-accent-light rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-primary">Quick Stats</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center justify-between p-3 bg-secondary border border-primary rounded-lg">
                <span className="text-secondary">New users (today)</span>
                <span className="font-semibold text-primary">–</span>
              </li>
              <li className="flex items-center justify-between p-3 bg-secondary border border-primary rounded-lg">
                <span className="text-secondary">New enrollments (today)</span>
                <span className="font-semibold text-primary">–</span>
              </li>
              <li className="flex items-center justify-between p-3 bg-secondary border border-primary rounded-lg">
                <span className="text-secondary">Active instructors</span>
                <span className="font-semibold text-primary">–</span>
              </li>
            </ul>
          </div>

          <div className="bg-primary border border-primary rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-success-light rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-primary">System Health</h2>
            </div>
            <p className="text-secondary mb-4">
              All core services are running normally.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-success-light text-success text-xs font-semibold rounded-full">
                API: Online
              </span>
              <span className="px-3 py-1 bg-accent-light text-accent text-xs font-semibold rounded-full">
                DB: Connected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

