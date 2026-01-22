import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import Footer from './Footer';
import { showToast } from '../utils/toast';
import { useThemeStore } from '../store/themeStore';
import api from '../api/api';
import { useCartStore } from '../store/cartStore';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote: "The best learning experience I've had online. The UI is beautiful and the content is top-tier. I landed my dream job within 3 months!",
    name: 'Alex Johnson',
    role: 'Frontend Developer',
    avatar: 'AJ',
    rating: 5
  },
  {
    quote: "Incredible platform! The instructors are experts and the courses are well-structured. Highly recommend to anyone looking to upskill.",
    name: 'Sarah Chen',
    role: 'Data Scientist',
    avatar: 'SC',
    rating: 5
  },
  {
    quote: "This platform changed my career trajectory completely. The quality of education and community support is unmatched.",
    name: 'Michael Rodriguez',
    role: 'UX Designer',
    avatar: 'MR',
    rating: 5
  },
  {
    quote: "Outstanding courses with practical applications. The hands-on projects really helped me build a strong portfolio.",
    name: 'Emma Thompson',
    role: 'Full Stack Developer',
    avatar: 'ET',
    rating: 5
  }
];

function TestimonialsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme } = useThemeStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="overflow-hidden rounded-2xl">
        <motion.div
          className="flex"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={index} className="w-full flex-shrink-0 px-4">
              <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-lg text-secondary mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-primary">{testimonial.name}</div>
                    <div className="text-sm text-secondary">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentIndex
                ? 'bg-primary scale-125'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-all duration-200 shadow-lg"
        aria-label="Previous testimonial"
      >
        <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-all duration-200 shadow-lg"
        aria-label="Next testimonial"
      >
        <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const [wishlistCount, setWishlistCount] = useState(0);
  const { items: cartItems } = useCartStore();

  const handleLogout = () => {
    logout();
    showToast.success('Logged out successfully');
    navigate('/');
    setSidebarOpen(false);
    setUserMenuOpen(false);
  };

  const closeSidebar = () => setSidebarOpen(false);

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Load wishlist count for logged-in users
  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (!user) {
        setWishlistCount(0);
        return;
      }
      try {
        const res = await api.get<any[]>('/wishlist');
        setWishlistCount(res.data?.length || 0);
      } catch {
        // ignore
      }
    };

    fetchWishlistCount();

    const handler = () => {
      fetchWishlistCount();
    };

    window.addEventListener('wishlist-updated', handler);
    return () => {
      window.removeEventListener('wishlist-updated', handler);
    };
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col client-shell">
      {/* Top accent strip */}
      <div className="bg-gradient-to-r from-blue-600 to-amber-500 h-1 w-full"></div>
      
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/40 shadow-lg"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between gap-4 py-3"
          >
            {/* Left: Logo and Explore */}
            <div className="flex items-center gap-6 flex-shrink-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded hover:bg-slate-800/60 transition"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <Link to="/" className="flex items-center gap-1 group">
                <div className="relative">
                  <svg className="w-4 h-4 text-blue-400 absolute -top-2 left-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-2xl font-bold text-blue-200 lowercase tracking-tight">elearning</span>
                </div>
              </Link>
              
              <Link to="/courses" className="hidden lg:block text-sm font-normal text-slate-300 hover:text-blue-300 transition">
                Explore
              </Link>
            </div>

            {/* Center: Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[600px] mx-4">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for anything"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/60 text-slate-200 placeholder:text-slate-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </form>

            {/* Right: Navigation and Actions */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* Navigation Links - Desktop */}
              <nav className="hidden lg:flex items-center gap-4">
                <Link to="/courses" className="text-sm font-normal text-slate-300 hover:text-blue-300 transition whitespace-nowrap">
                  Plans & Pricing
                </Link>
                <Link to="/courses" className="text-sm font-normal text-slate-300 hover:text-blue-300 transition whitespace-nowrap">
                  E-Learning Business
                </Link>
                <Link to="/teach" className="text-sm font-normal text-slate-300 hover:text-amber-400 transition whitespace-nowrap">
                  Teach on E-Learning
                </Link>
              </nav>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-secondary hover:bg-tertiary border border-primary transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Wishlist icon with count */}
              {user && (
                <button
                  onClick={() => navigate('/wishlist')}
                  className="relative p-2 rounded hover:bg-slate-800/60 transition"
                  aria-label="Wishlist"
                >
                  <svg
                    className="w-5 h-5 text-slate-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364 4.318 12.682a4.5 4.5 0 010-6.364z"
                    />
                  </svg>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-amber-500 text-[10px] font-bold text-slate-900 flex items-center justify-center px-0.5">
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </button>
              )}

              {/* Shopping Cart - navigates to cart page */}
              <button
                onClick={() => navigate('/cart')}
                className="p-2 rounded hover:bg-slate-800/60 transition relative"
                aria-label="Cart"
              >
                <svg className="w-6 h-6 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-blue-500 text-[10px] font-bold text-slate-900 flex items-center justify-center px-0.5">
                    {cartItems.length > 9 ? '9+' : cartItems.length}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative flex items-center gap-3">
                  <Link
                    to="/my-courses"
                    className="hidden xl:block text-sm font-normal text-slate-300 hover:text-blue-300 transition"
                  >
                    My Courses
                  </Link>

                  {/* User avatar pill */}
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800/80 transition text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600/70 text-white flex items-center justify-center text-sm font-semibold">
                      {user.firstName?.[0] || user.lastName?.[0] || 'U'}
                    </div>
                    <div className="hidden sm:flex flex-col leading-tight">
                      <span className="text-xs font-semibold text-slate-100 max-w-[120px] truncate">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">
                        {user.role}
                      </span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        userMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown – desktop avatar menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-11 w-72 rounded-2xl border border-slate-700/50 bg-slate-900/95 shadow-2xl overflow-hidden z-50"
                      >
                        {/* Header with avatar, name, email */}
                        <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-700/50 bg-slate-900/95">
                          <div className="w-10 h-10 rounded-full bg-blue-600/70 text-white flex items-center justify-center text-sm font-semibold">
                            {user.firstName?.[0] || user.lastName?.[0] || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-100 truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {/* Main links */}
                        <div className="py-2 text-sm text-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              navigate('/my-courses');
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-slate-800/80"
                          >
                            My learning
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              navigate('/cart');
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-slate-800/80"
                          >
                            My cart
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              navigate('/wishlist');
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-slate-800/80"
                          >
                            Wishlist
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              navigate('/instructor/dashboard');
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-slate-800/80"
                          >
                            Instructor dashboard
                          </button>
                        </div>

                        <div className="py-2 border-t border-slate-800/60 text-sm text-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              navigate('/notifications');
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-slate-800/80"
                          >
                            Notifications
                          </button>
                        </div>

                        <div className="py-2 border-t border-slate-800/60 text-xs text-slate-300">
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              navigate('/settings');
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-slate-800/80"
                          >
                            Account settings
                          </button>
                        </div>

                        <div className="py-2 border-t border-slate-800/60">
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              navigate('/profile');
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-slate-100 hover:bg-slate-800/80"
                          >
                            Edit profile
                          </button>
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-red-600/10 border-t border-slate-800/60"
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // On mobile, auth actions live in the sidebar; keep these only on >= sm
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-bold text-blue-300 border border-blue-500/60 rounded hover:bg-blue-500/10 transition whitespace-nowrap"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-amber-500 rounded hover:from-blue-700 hover:to-amber-600 transition whitespace-nowrap shadow-lg"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Globe Icon */}
              <button className="hidden lg:block p-2 rounded border border-slate-700/60 hover:bg-slate-800/60 transition">
                <svg className="w-5 h-5 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Mobile Sidebar (left) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
              className="fixed inset-0 z-50 sm:hidden bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.1, ease: 'linear' }}
              className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700/40 shadow-2xl rounded-r-2xl z-50 sm:hidden"
              onClick={(e) => e.stopPropagation()}
            >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/40">
              <Link to="/" onClick={closeSidebar} className="text-blue-200 font-extrabold text-xl tracking-tight">
                E-Learning
              </Link>
                <button
                onClick={closeSidebar}
                className="p-2 rounded-lg hover:bg-slate-800/60 transition"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex-1 overflow-y-auto p-6 space-y-2">
              <Link
                to="/courses"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                  location.pathname === '/courses'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'text-slate-100/90 hover:bg-slate-800/60 hover:text-blue-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6l-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h6l2-2h4a2 2 0 002-2V6a2 2 0 00-2-2h-4z" />
                </svg>
                <span>Courses</span>
              </Link>

              {user ? (
                <>
                  {user.role === 'student' && (
                    <Link
                      to="/teach"
                      onClick={closeSidebar}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                        location.pathname === '/teach'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'text-amber-400 hover:bg-slate-800/60 hover:text-amber-300'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5 12.083 12.083 0 015.84 10.578L12 14z" />
                      </svg>
                      <span>Teach</span>
                    </Link>
                  )}
                  {(user.role === 'instructor' || user.role === 'admin') && (
                    <Link
                      to="/instructor/courses"
                      onClick={closeSidebar}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                        location.pathname === '/instructor/courses'
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                          : 'text-slate-100/90 hover:bg-slate-800/60 hover:text-blue-200'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8M8 8h8M4 6h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                      </svg>
                      <span>My Teaching</span>
                    </Link>
                  )}
                  <Link
                    to="/my-courses"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                      location.pathname === '/my-courses'
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-100/90 hover:bg-slate-800/60 hover:text-blue-200'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19.5A2.5 2.5 0 006.5 22H18a2 2 0 002-2v-7M4 19.5V7a2 2 0 012-2h8m-10 14.5L14 5m0 0h6m-6 0v6" />
                    </svg>
                    <span>My Courses</span>
                  </Link>
                  <div className="pt-4 mt-4 border-t border-slate-700/40">
                    <div className="px-4 py-2 text-slate-300 text-sm">
                      {user.firstName} {user.lastName}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full mt-2 px-4 py-3 rounded-lg font-semibold text-white bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 transition"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/teach"
                    onClick={closeSidebar}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                      location.pathname === '/teach'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-amber-400 hover:bg-slate-800/60 hover:text-amber-300'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5 12.083 12.083 0 015.84 10.578L12 14z" />
                    </svg>
                    <span>Teach</span>
                  </Link>
                  <div className="pt-4 mt-4 border-t border-slate-700/40 space-y-2">
                    <Link
                      to="/login"
                      onClick={closeSidebar}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                        location.pathname === '/login'
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                          : 'text-slate-100/90 hover:bg-slate-800/60 hover:text-blue-200'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Login</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeSidebar}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-amber-500 text-center shadow"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Sign Up</span>
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        </motion.div>
        </>
        )}
      </AnimatePresence>

      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 py-10 ${location.pathname === '/' ? '' : 'max-w-[1200px]'}`}>{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;

