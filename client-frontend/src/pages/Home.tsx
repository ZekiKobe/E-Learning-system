import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { getImageUrl } from '../utils/imageUtils';
import { showToast } from '../utils/toast';
import { useCartStore } from '../store/cartStore';

interface Course {
  id: number;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  thumbnail?: string;
  price: number;
  rating?: number | string | null;
  totalRatings?: number;
  totalStudents?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  level?: string;
  duration?: number;
  language?: string;
  createdAt?: string;
  instructor: {
    firstName: string;
    lastName: string;
  };
  category: {
    name: string;
    id: number;
  };
}

interface Category {
  id: number;
  name: string;
  courseCount?: number;
}

function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { theme } = useThemeStore();
  const { addItem } = useCartStore();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load filters from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const price = searchParams.get('price');
    const rating = searchParams.get('rating');
    const level = searchParams.get('level');
    const language = searchParams.get('language');
    const duration = searchParams.get('duration');
    const sort = searchParams.get('sort');

    if (category) setSelectedCategory(Number(category));
    if (search) setSearchTerm(search);
    if (price) setPriceFilter(price);
    if (rating) setRatingFilter(rating);
    if (level) setLevelFilter(level);
    if (language) setLanguageFilter(language);
    if (duration) setDurationFilter(duration);
    if (sort) setSortBy(sort);
  }, [searchParams]);

  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchCourses();
    // Update URL params
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    if (selectedCategory) params.set('category', selectedCategory.toString());
    if (priceFilter !== 'all') params.set('price', priceFilter);
    if (ratingFilter !== 'all') params.set('rating', ratingFilter);
    if (levelFilter !== 'all') params.set('level', levelFilter);
    if (languageFilter !== 'all') params.set('language', languageFilter);
    if (durationFilter !== 'all') params.set('duration', durationFilter);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    setSearchParams(params);
  }, [debouncedSearchTerm, selectedCategory, priceFilter, ratingFilter, levelFilter, languageFilter, durationFilter, sortBy]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: any = { status: 'published', limit: 100 };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (selectedCategory) params.categoryId = selectedCategory;
      const response = await api.get('/courses', { params });
      let filtered = response.data.courses || [];

      // Client-side filters
      if (priceFilter === 'free') filtered = filtered.filter((c: Course) => c.price === 0);
      if (priceFilter === 'paid') filtered = filtered.filter((c: Course) => c.price > 0);
      if (ratingFilter === '4+') filtered = filtered.filter((c: Course) => Number(c.rating || 0) >= 4);
      if (ratingFilter === '3+') filtered = filtered.filter((c: Course) => Number(c.rating || 0) >= 3);
      if (levelFilter !== 'all') filtered = filtered.filter((c: Course) => c.level?.toLowerCase() === levelFilter.toLowerCase());
      if (languageFilter !== 'all') filtered = filtered.filter((c: Course) => c.language?.toLowerCase() === languageFilter.toLowerCase());
      if (durationFilter !== 'all') {
        const hours = Number(durationFilter.replace('+', ''));
        filtered = filtered.filter((c: Course) => (c.duration || 0) >= hours);
      }

      // Sort courses
      filtered.sort((a: Course, b: Course) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case 'oldest':
            return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          case 'popular':
            return (b.totalStudents || 0) - (a.totalStudents || 0);
          case 'rating':
            return Number(b.rating || 0) - Number(a.rating || 0);
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          default:
            return 0;
        }
      });

      setCourses(filtered);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = useMemo(() => courses, [courses]);

  const handleEnroll = async (e: React.MouseEvent, courseId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await api.post(`/courses/${courseId}/enroll`);
      showToast.success('Successfully enrolled in course!');
      navigate(`/learn/${courseId}`);
    } catch (error: any) {
      showToast.error(error?.response?.data?.error || 'Failed to enroll');
    }
  };

  const handleAddToCart = (e: React.MouseEvent, course: Course) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: course.id,
      title: course.title,
      price: course.price,
      thumbnail: course.thumbnail,
    });
    showToast.success('Added to cart');
    navigate('/cart');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setPriceFilter('all');
    setRatingFilter('all');
    setLevelFilter('all');
    setLanguageFilter('all');
    setDurationFilter('all');
    setSortBy('newest');
    setSearchParams(new URLSearchParams());
  };

  const renderCourseCard = (course: Course, index: number) => {
    const ratingNum = Number(course.rating);
    const showRating = Number.isFinite(ratingNum) && ratingNum > 0;
    const isFree = Number(course.price) === 0;

    return (
      <motion.div
        key={course.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.02, y: -4 }}
        className="group"
      >
        <Link
          to={`/courses/${course.id}`}
          className="block bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="w-full h-48 bg-muted relative overflow-hidden">
            {course.thumbnail ? (
              <img
                src={getImageUrl(course.thumbnail)}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center text-4xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {course.isFeatured && (
                <span className="px-2 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold">
                  Featured
                </span>
              )}
              {course.isTrending && (
                <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                  Hot
                </span>
              )}
            </div>

            {/* Duration badge */}
            {course.duration && (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 rounded-full bg-black/70 text-white text-xs font-semibold backdrop-blur-sm">
                  {course.duration}h
                </span>
              </div>
            )}
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-primary line-clamp-2 flex-1 group-hover:text-primary/80 transition-colors">
                {course.title}
              </h3>
            </div>

            <p className="text-secondary text-sm mb-2">
              {course.instructor.firstName} {course.instructor.lastName}
            </p>

            <p className="text-secondary text-sm mb-3 line-clamp-2">
              {course.shortDescription || course.description}
            </p>

            {/* Rating and students */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {showRating ? (
                  <>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-sm">★</span>
                      ))}
                    </div>
                    <span className="text-secondary font-medium text-sm">
                      {ratingNum.toFixed(1)}
                    </span>
                    {course.totalRatings && (
                      <span className="text-muted-foreground text-xs">
                        ({course.totalRatings.toLocaleString()})
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground text-sm">No ratings yet</span>
                )}
              </div>
              {course.totalStudents && (
                <span className="text-muted-foreground text-sm">
                  {course.totalStudents.toLocaleString()} students
                </span>
              )}
            </div>

            {/* Level and language */}
            <div className="flex items-center gap-2 mb-4">
              {course.level && (
                <span className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium capitalize">
                  {course.level}
                </span>
              )}
              {course.language && (
                <span className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                  {course.language}
                </span>
              )}
            </div>

            {/* Price and CTA */}
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">
                {isFree ? 'Free' : `$${course.price}`}
              </span>
              {isFree ? (
                <button
                  onClick={(e) => handleEnroll(e, course.id)}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Enroll Now
                </button>
              ) : (
                <button
                  onClick={(e) => handleAddToCart(e, course)}
                  className="px-4 py-2 border border-border text-secondary font-semibold rounded-lg hover:bg-accent transition-colors"
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Discover Your Next Course
            </h1>
            <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto">
              Explore thousands of courses taught by expert instructors. Find the perfect course to advance your career.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for courses, instructors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 pr-12 text-lg rounded-xl border-2 border-border bg-background shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { value: '1,200+', label: 'Courses' },
                { value: '50K+', label: 'Students' },
                { value: '500+', label: 'Instructors' },
                { value: '98%', label: 'Satisfaction' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-secondary">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-64 flex-shrink-0"
          >
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-primary">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-primary mb-3">Category</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === null
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-secondary hover:bg-accent'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-secondary hover:bg-accent'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <h4 className="font-medium text-primary mb-3">Price</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Prices' },
                    { value: 'free', label: 'Free' },
                    { value: 'paid', label: 'Paid' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPriceFilter(option.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        priceFilter === option.value
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-secondary hover:bg-accent'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="font-medium text-primary mb-3">Rating</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Ratings' },
                    { value: '4+', label: '4+ Stars' },
                    { value: '3+', label: '3+ Stars' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRatingFilter(option.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        ratingFilter === option.value
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-secondary hover:bg-accent'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div className="mb-6">
                <h4 className="font-medium text-primary mb-3">Level</h4>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Levels' },
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setLevelFilter(option.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        levelFilter === option.value
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-secondary hover:bg-accent'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filters Toggle */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Filters
              </button>
            </div>

            {/* Mobile Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden mb-6 bg-card rounded-xl border border-border p-6 shadow-sm"
                >
                  {/* Mobile filter content - similar to sidebar but in a single column */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-primary mb-2">Category</h4>
                      <select
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <h4 className="font-medium text-primary mb-2">Price</h4>
                      <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                      >
                        <option value="all">All Prices</option>
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>

                    <div>
                      <h4 className="font-medium text-primary mb-2">Rating</h4>
                      <select
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                      >
                        <option value="all">All Ratings</option>
                        <option value="4+">4+ Stars</option>
                        <option value="3+">3+ Stars</option>
                      </select>
                    </div>

                    <div>
                      <h4 className="font-medium text-primary mb-2">Level</h4>
                      <select
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                      >
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <button
                      onClick={clearFilters}
                      className="text-primary hover:text-primary/80 font-medium text-sm"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-primary">
                  {loading ? 'Loading...' : `${filteredCourses.length} Courses Found`}
                </h2>
                {debouncedSearchTerm && (
                  <p className="text-slate-600 mt-1">
                    Showing results for "{debouncedSearchTerm}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-secondary">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm bg-background"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Course Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="h-48 bg-muted animate-pulse"></div>
                    <div className="p-5">
                      <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-muted rounded animate-pulse mb-3 w-3/4"></div>
                      <div className="h-3 bg-muted rounded animate-pulse mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-muted rounded animate-pulse w-16"></div>
                        <div className="h-8 bg-muted rounded animate-pulse w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredCourses.map((course, index) => renderCourseCard(course, index))}
              </motion.div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-primary mb-2">No courses found</h3>
                <p className="text-secondary mb-6">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

