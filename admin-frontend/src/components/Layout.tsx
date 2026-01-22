import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import api from '../api/api';

function Layout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get<{ count: number }>('/notifications/unread/count');
        setUnreadCount(res.data.count);
      } catch {
        // ignore
      }
    };
    fetchUnread();
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      label: 'Dashboard',
      to: '/',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-6H3v6z" />
        </svg>
      )
    },
    {
      label: 'Courses',
      to: '/courses',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20" />
          <path d="M4 4h16v12H4z" />
          <path d="M8 4v12" />
        </svg>
      )
    },
    {
      label: 'Users',
      to: '/users',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      label: 'Categories',
      to: '/categories',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    },
    {
      label: 'Instructor Requests',
      to: '/instructor-requests',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4h16v12H4z" />
          <path d="M4 10h16" />
          <path d="M8 4v12" />
          <path d="M2 20h20" />
        </svg>
      )
    },
    {
      label: 'Refunds',
      to: '/refunds',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12A9 9 0 1 1 12 3" />
          <polyline points="21 3 21 12 12 12" />
        </svg>
      )
    },
    {
      label: 'Payments',
      to: '/payments',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
          <path d="M16 15h.01" />
          <path d="M12 15h.01" />
        </svg>
      )
    },
    {
      label: 'Reviews',
      to: '/reviews',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 5a2 2 0 0 1 2-2h16v11H7l-4 4z" />
          <path d="M12 8h6" />
          <path d="M8 8h.01" />
        </svg>
      )
    },
    {
      label: 'Analytics',
      to: '/analytics/enrollments',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="M7 14l3-3 4 4 5-7" />
          <circle cx="7" cy="14" r="1" />
          <circle cx="10" cy="11" r="1" />
          <circle cx="14" cy="15" r="1" />
          <circle cx="19" cy="8" r="1" />
        </svg>
      )
    },
    {
      label: 'Announcements',
      to: '/announcements',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 11v-2a4 4 0 0 1 4-4h11" />
          <path d="M3 13v2a4 4 0 0 0 4 4h1" />
          <path d="M8 21h1a4 4 0 0 0 4-4v-2" />
          <path d="M8 3h12v7a4 4 0 0 1-4 4H8z" />
        </svg>
      )
    },
    {
      label: 'Quizzes',
      to: '/quizzes',
      icon: (
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 11H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4" />
          <path d="M9 11V9a3 3 0 0 1 6 0v2" />
          <circle cx="12" cy="16" r="1" />
        </svg>
      )
    }
  ];

  const NavLinks = () => (
    <ul className="flex-1 p-4 space-y-1">
      {navItems.map((item) => (
        <li key={item.to}>
          <Link
            to={item.to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-semibold text-sm transition ${
              isActive(item.to)
                ? 'admin-badge-accent border admin-border-subtle shadow-sm'
                : 'hover:bg-slate-800/10'
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="inline-flex items-center justify-center rounded-md bg-slate-900/5 text-slate-500 w-7 h-7">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );

  const SidebarFooter = () => (
    <div className="p-4 border-t admin-border-subtle space-y-3">
      <button
        onClick={toggleTheme}
        className="w-full px-3 py-2 rounded-lg font-semibold border admin-border-subtle flex items-center justify-between text-sm"
      >
        <span>Theme</span>
        <span className="inline-flex items-center gap-1 capitalize">
          <span className="w-4 h-4 rounded-full border admin-border-subtle" />
          {theme}
        </span>
      </button>
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold">
          {user?.firstName?.[0]}
          {user?.lastName?.[0]}
        </div>
        <div className="min-w-0">
          <div className="mb-0.5 text-sm truncate">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="mb-2 text-xs text-muted-foreground capitalize truncate">{user?.role}</div>
          <button
            onClick={() => {
              logout();
              setSidebarOpen(false);
            }}
            className="px-3 py-1.5 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-all duration-200 transform hover:scale-105 active:scale-95 text-xs"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  const TopNav = () => (
    <header className="flex items-center justify-between gap-4 px-2 pb-4 md:pb-6">
      <div>
        <h1 className="text-lg md:text-2xl font-extrabold tracking-tight">All Contacts</h1>
        <p className="text-xs md:text-sm admin-text-muted mt-1">
          Overview of tickets, users and recent activity.
        </p>
      </div>
      <div className="flex items-center gap-3">
        {/* Search pill */}
        <div className="hidden sm:flex items-center gap-3 pl-4 pr-2 py-2 rounded-full bg-card text-card-foreground shadow-lg border border-border">
          <svg
            className="w-4 h-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            placeholder="Search"
            className="bg-transparent text-xs md:text-sm outline-none placeholder:text-slate-200/80 text-slate-50 w-32 md:w-64"
          />
          <span className="inline-flex items-center justify-center rounded-full border border-slate-200/70 px-4 py-1 text-[10px] font-medium text-slate-50/90 bg-[#434f63]">
            K
          </span>
        </div>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative inline-flex items-center justify-center w-9 h-9 rounded-full border admin-border-subtle bg-white/80 text-slate-700"
          aria-label="Notifications"
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
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Theme / sun button */}
        <button
          onClick={toggleTheme}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 shadow-md text-white"
          aria-label="Toggle theme"
        >
          ☼
        </button>

        {/* User pill with dropdown */}
        <div className="hidden sm:inline-flex relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((open) => !open)}
            className="inline-flex items-center gap-3 pl-2 pr-5 py-2 rounded-full bg-card text-card-foreground shadow-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div className="w-8 h-8 rounded-full bg-primary shadow-inner" />
            <div className="text-xs text-left">
              <div className="font-semibold leading-tight">
                {user?.firstName} {user?.lastName ?? 'User'}
              </div>
              <div className="text-[11px] text-muted-foreground leading-tight">
                {user?.role ?? 'admin'}
              </div>
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 rounded-xl bg-card shadow-lg border border-border text-xs text-card-foreground z-30">
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-accent rounded-t-xl transition-colors"
                onClick={() => setUserMenuOpen(false)}
              >
                Profile
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-b-xl"
                onClick={() => {
                  logout();
                  setUserMenuOpen(false);
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen admin-shell">
      <div className="mx-auto max-w-[1400px] flex">
        {/* Sidebar - desktop */}
        <nav className="hidden md:flex flex-col w-64 shrink-0 min-h-screen sticky top-0 border-r border-border bg-card backdrop-blur">
          <div className="p-6 border-b border-border flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-primary">E-Learning Admin</h2>
              <p className="text-xs text-muted-foreground mt-1">Control center</p>
            </div>
          </div>
          <NavLinks />
          <SidebarFooter />
        </nav>

        {/* Mobile top bar + slide-over sidebar */}
        <div className="flex-1 flex flex-col md:hidden">
          <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0 z-20">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg border border-border bg-background"
              aria-label="Open menu"
            >
              <span className="block w-5 h-0.5 bg-current mb-1" />
              <span className="block w-5 h-0.5 bg-current mb-1" />
              <span className="block w-5 h-0.5 bg-current" />
            </button>
            <div className="text-sm font-semibold">E-Learning Admin</div>
            <button
              onClick={toggleTheme}
              className="px-2 py-1 rounded-lg text-xs border border-border bg-background capitalize transition-colors hover:bg-accent"
            >
              {theme}
            </button>
          </header>

          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <nav
                className="absolute left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-primary">E-Learning Admin</h2>
                    <p className="text-xs text-muted-foreground mt-1">Control center</p>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg border border-border bg-background"
                    aria-label="Close menu"
                  >
                    ✕
                  </button>
                </div>
                <NavLinks />
                <SidebarFooter />
              </nav>
            </div>
          )}

          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>

        {/* Main content for desktop */}
        <main className="hidden md:flex flex-1 flex-col p-4 md:p-6">
          <TopNav />
          <div className="admin-card rounded-2xl border admin-border-subtle p-4 md:p-5 shadow-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;

