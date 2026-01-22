import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import { getImageUrl } from '../utils/imageUtils';
import { showToast } from '../utils/toast';
import { useCartStore } from '../store/cartStore';
import heroCover from '../assets/ecover.png';
import { useThemeStore } from '../store/themeStore';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Course {
  id: number;
  title: string;
  thumbnail?: string;
  price: number;
  shortDescription?: string;
  description?: string;
  rating?: number;
  totalRatings?: number;
  totalStudents?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  instructor: {
    firstName: string;
    lastName: string;
  };
  category: {
    name: string;
  };
}

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
    role: 'Software Engineer at Google',
    avatar: 'https://i.pravatar.cc/80?img=12',
    rating: 5
  },
  {
    quote: 'I love how practical the courses are. I can apply what I learn immediately. The instructors are amazing and always available to help.',
    name: 'Maria Lopez',
    role: 'Product Manager at Meta',
    avatar: 'https://i.pravatar.cc/80?img=15',
    rating: 5
  },
  {
    quote: 'The progress tracking and certificates really motivated me to complete courses. Now I have tangible proof of my skills!',
    name: 'Samuel Green',
    role: 'UX Designer at Adobe',
    avatar: 'https://i.pravatar.cc/80?img=20',
    rating: 5
  },
  {
    quote: 'This platform transformed my career completely. The quality of instruction and the supportive community made all the difference.',
    name: 'Emily Chen',
    role: 'Data Scientist at Amazon',
    avatar: 'https://i.pravatar.cc/80?img=25',
    rating: 5
  },
  {
    quote: 'Incredible platform with world-class instructors. I gained practical skills that I use every day in my job.',
    name: 'David Rodriguez',
    role: 'Full Stack Developer',
    avatar: 'https://i.pravatar.cc/80?img=30',
    rating: 5
  }
];

function TestimonialsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  // Auto-play functionality
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [currentIndex, isPaused]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div
      className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="overflow-hidden rounded-2xl">
        <motion.div
          className="flex"
          animate={{ x: -currentIndex * 100 + '%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.name} className="w-full flex-shrink-0 px-2 sm:px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: index === currentIndex ? 1 : 0.7,
                  scale: index === currentIndex ? 1 : 0.95
                }}
                transition={{ duration: 0.3 }}
                className={`bg-card rounded-2xl p-6 sm:p-8 md:p-12 border border-border shadow-lg`}
              >
                <div className="flex justify-center text-warning mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-2xl"
                    >
                      ★
                    </motion.span>
                  ))}
                </div>
                <blockquote className={`text-primary mb-6 sm:mb-8 text-lg sm:text-xl md:text-2xl leading-relaxed text-center font-medium`}>
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-primary"
                  />
                  <div className="text-center">
                    <div className="font-bold text-primary text-base sm:text-lg">
                      {testimonial.name}
                    </div>
                    <div className="text-secondary text-xs sm:text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
        aria-label="Previous testimonial"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-primary/80 hover:bg-primary text-primary-foreground rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
        aria-label="Next testimonial"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
              index === currentIndex
                ? 'bg-primary scale-125'
                : 'bg-muted-foreground/50 hover:bg-primary/70'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function Landing() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { addItem } = useCartStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);

  const trendingCourses = courses.filter((c) => c.isTrending);
  const featuredCourses = courses.filter((c) => c.isFeatured);

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchCourses();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchCourses();
    }
  }, [selectedCategory]);

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
      const params: any = { status: 'published', limit: 12 };
      if (selectedCategory && categories.length > 0) {
        const category = categories.find(c => c.name === selectedCategory);
        if (category) params.categoryId = category.id;
      }
      const response = await api.get('/courses', { params });
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const renderCourseCard = (course: Course, index: number, variant: 'featured' | 'grid' = 'grid') => {
    const ratingNum = Number(course.rating);
    const showRating = Number.isFinite(ratingNum) && ratingNum > 0;
    const isFree = Number(course.price) === 0;

    if (variant === 'featured') {
      return (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.05, y: -8 }}
          className="flex-shrink-0 w-72 snap-start"
        >
          <Link
            to={`/courses/${course.id}`}
            className="block rounded-2xl border border-primary bg-primary shadow-lg card-hover overflow-hidden"
          >
            <div className={`w-full h-44 ${isDark ? 'bg-secondary' : 'bg-secondary'} relative overflow-hidden`}>
              {course.thumbnail ? (
                <img
                  src={getImageUrl(course.thumbnail)}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-current opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 rounded-full ${isDark ? 'bg-primary text-secondary' : 'bg-primary text-secondary'} text-xs font-semibold`}>
                  Featured
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className={`font-bold mb-2 line-clamp-2 ${isDark ? 'text-primary' : 'text-primary'} text-lg`}>
                {course.title}
              </h3>
              <p className={`text-secondary text-sm mb-1`}>
                {course.instructor.firstName} {course.instructor.lastName}
              </p>
              <div className="flex items-center gap-2 mb-3">
                {showRating && (
                  <>
                    <span className="text-warning font-bold">{ratingNum.toFixed(1)}</span>
                    <div className="flex text-warning">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-sm">★</span>
                      ))}
                    </div>
                    <span className="text-muted text-sm">
                      ({course.totalRatings?.toLocaleString()})
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${isDark ? 'text-primary' : 'text-primary'}`}>
                  {isFree ? 'Free' : `$${course.price}`}
                </span>
                <button
                  onClick={(e) => isFree ? handleEnroll(e, course.id) : handleAddToCart(e, course)}
                  className="btn-primary px-4 py-2"
                >
                  {isFree ? 'Enroll' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </Link>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={course.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ scale: 1.02, y: -4 }}
        className="group"
      >
        <Link
          to={`/courses/${course.id}`}
          className="block rounded-xl border border-primary bg-primary shadow-sm card-hover overflow-hidden"
        >
          <div className={`w-full h-36 ${isDark ? 'bg-secondary' : 'bg-secondary'} relative overflow-hidden`}>
            {course.thumbnail ? (
              <img
                src={getImageUrl(course.thumbnail)}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center text-3xl ${isDark ? 'bg-tertiary' : 'bg-tertiary'}`}>📚</div>
            )}
            {course.isTrending && (
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 rounded-full bg-error text-bg-primary text-xs font-bold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                  Hot
                </span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className={`font-semibold mb-1 line-clamp-2 ${isDark ? 'text-primary' : 'text-primary'} group-hover:text-accent transition-colors`}>
              {course.title}
            </h3>
            <p className={`text-secondary text-sm mb-2`}>
              {course.instructor.firstName} {course.instructor.lastName}
            </p>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                {showRating ? (
                  <>
                    <span className="text-warning font-medium text-sm">{ratingNum.toFixed(1)}</span>
                    <span className="text-warning text-sm">★</span>
                    <span className="text-muted text-xs">({course.totalRatings})</span>
                  </>
                ) : (
                  <span className={`px-2 py-0.5 rounded-full ${isDark ? 'bg-accent-light text-accent' : 'bg-accent-light text-accent'} text-xs font-medium`}>
                    New
                  </span>
                )}
              </div>
              {course.totalStudents && (
                <span className="text-muted text-xs">
                  {course.totalStudents.toLocaleString()} students
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold ${isDark ? 'text-primary' : 'text-primary'}`}>
                {isFree ? 'Free' : `$${course.price}`}
              </span>
              {isFree ? (
                <button
                  onClick={(e) => handleEnroll(e, course.id)}
                  className="btn-primary px-3 py-1.5 text-xs"
                >
                  Enroll
                </button>
              ) : (
                <button
                  onClick={(e) => handleAddToCart(e, course)}
                  className="btn-outline px-3 py-1.5 text-xs"
                >
                  Add to cart
                </button>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-primary' : 'bg-gradient-to-br from-accent-light via-bg-primary to-secondary'}`}>
      {/* Hero Section */}
      <motion.section
        className="relative overflow-hidden pt-16 pb-20"
        style={{ y }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className={`absolute top-20 left-10 w-72 h-72 ${isDark ? 'bg-accent/20' : 'bg-accent/10'} rounded-full blur-3xl animate-pulse`} />
          <div className={`absolute bottom-20 right-10 w-96 h-96 ${isDark ? 'bg-warning/20' : 'bg-warning/10'} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }} />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ${isDark ? 'bg-gradient-to-r from-accent/30 via-warning/30 to-success/30' : 'bg-gradient-to-r from-accent/20 via-warning/20 to-success/20'} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-accent-light border-accent text-accent' : 'bg-accent-light border-accent text-accent'} font-medium text-sm mb-6`}
              >
                <span className={`w-2 h-2 ${isDark ? 'bg-accent' : 'bg-accent'} rounded-full animate-pulse`}></span>
                🚀 Learn from industry experts
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`text-4xl md:text-6xl font-bold ${isDark ? 'text-primary' : 'text-primary'} mb-6 leading-tight`}
              >
                Master New Skills with
                <span className="block gradient-text">
                  Expert-Led Courses
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`text-lg ${isDark ? 'text-secondary' : 'text-secondary'} mb-8 max-w-xl`}
              >
                Join millions of learners worldwide. Access high-quality courses, interactive quizzes, and earn certificates to boost your career.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
              >
                <Link
                  to="/courses"
                  className="btn-primary px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Explore Courses
                </Link>
                <Link
                  to="/register"
                  className="btn-outline px-8 py-4"
                >
                  Start Learning Free
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="grid grid-cols-3 gap-8 max-w-md mx-auto lg:mx-0"
              >
                {[
                  { value: '50K+', label: 'Students' },
                  { value: '1,200+', label: 'Courses' },
                  { value: '98%', label: 'Satisfaction' }
                ].map((stat, index) => (
                  <div key={stat.label} className="text-center">
                    <div className={`text-2xl font-bold ${isDark ? 'text-primary' : 'text-primary'}`}>{stat.value}</div>
                    <div className={`text-sm ${isDark ? 'text-secondary' : 'text-secondary'}`}>{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative max-w-lg mx-auto">
                <div className="relative">
                  <img
                    src={heroCover}
                    alt="E-Learning Platform"
                    className="w-full h-auto rounded-2xl shadow-2xl"
                  />

                  {/* Floating Cards */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-4 -right-4 bg-primary rounded-xl p-4 shadow-lg border border-primary"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
                        <span className="text-success text-xl">✓</span>
                      </div>
                      <div>
                        <div className={`font-semibold ${isDark ? 'text-primary' : 'text-primary'}`}>Certificate</div>
                        <div className={`text-sm ${isDark ? 'text-secondary' : 'text-secondary'}`}>Earned!</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-4 -left-4 bg-primary rounded-xl p-4 shadow-lg border border-primary"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent-light rounded-lg flex items-center justify-center">
                        <span className="text-accent text-xl">🎯</span>
                      </div>
                      <div>
                        <div className={`font-semibold ${isDark ? 'text-primary' : 'text-primary'}`}>Progress</div>
                        <div className={`text-sm ${isDark ? 'text-secondary' : 'text-secondary'}`}>85% Complete</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className={`py-20 ${isDark ? 'bg-secondary' : 'bg-primary'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-primary' : 'text-primary'} mb-4`}>
              Why Choose Our Platform?
            </h2>
            <p className={`text-lg ${isDark ? 'text-secondary' : 'text-secondary'} max-w-2xl mx-auto`}>
              Experience learning like never before with our cutting-edge features designed for modern learners.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'HD Video Content',
                description: 'Crystal clear videos with expert instructors and interactive elements.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Interactive Quizzes',
                description: 'Test your knowledge with engaging quizzes and instant feedback.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Certificates',
                description: 'Earn recognized certificates to showcase your achievements.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Fast & Modern',
                description: 'Lightning-fast platform with beautiful, responsive design.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: 'Community Support',
                description: 'Connect with instructors and fellow learners in our community.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Learn Anywhere',
                description: 'Access your courses on any device, anytime, anywhere.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Progress Tracking',
                description: 'Monitor your learning journey with detailed progress analytics.'
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: 'Personalized Learning',
                description: 'Tailored recommendations based on your interests and goals.'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`bg-primary border border-primary rounded-xl p-6 shadow-sm card-hover`}
              >
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-bg-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className={`font-semibold ${isDark ? 'text-primary' : 'text-primary'} mb-2`}>{feature.title}</h3>
                <p className={`text-secondary text-sm leading-relaxed`}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      {featuredCourses.length > 0 && (
        <section className={`py-20 ${isDark ? 'bg-tertiary' : 'bg-secondary'}`}>
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-primary' : 'text-primary'} mb-4`}>
                Featured Courses
              </h2>
              <p className={`text-lg ${isDark ? 'text-secondary' : 'text-secondary'}`}>
                Discover our most popular courses loved by thousands of students
              </p>
            </motion.div>

            <div className="relative">
              <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory">
                {featuredCourses.slice(0, 6).map((course, index) => renderCourseCard(course, index, 'featured'))}
              </div>

              {featuredCourses.length > 3 && (
                <>
                  <button
                    onClick={() => {
                      const container = document.querySelector('.snap-x');
                      if (container) {
                        container.scrollBy({ left: -320, behavior: 'smooth' });
                      }
                    }}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 ${isDark ? 'bg-primary border-primary' : 'bg-primary border-primary'} rounded-full shadow-lg flex items-center justify-center hover:bg-tertiary transition-colors z-10`}
                  >
                    <svg className={`w-6 h-6 ${isDark ? 'text-primary' : 'text-primary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const container = document.querySelector('.snap-x');
                      if (container) {
                        container.scrollBy({ left: 320, behavior: 'smooth' });
                      }
                    }}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 ${isDark ? 'bg-primary border-primary' : 'bg-primary border-primary'} rounded-full shadow-lg flex items-center justify-center hover:bg-tertiary transition-colors z-10`}
                  >
                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}



      {/* Categories Section */}
      <section className={`py-20 ${isDark ? 'bg-secondary' : 'bg-secondary'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-primary' : 'text-primary'} mb-4`}>
              Explore by Category
            </h2>
            <p className={`text-lg ${isDark ? 'text-secondary' : 'text-secondary'}`}>
              Find the perfect course in your area of interest
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {categories.slice(0, 12).map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedCategory(category.name)}
                className={`p-6 rounded-xl border-2 transition-all duration-300 text-center ${
                  selectedCategory === category.name
                    ? 'border-accent bg-accent-light text-accent'
                    : `border-primary ${isDark ? 'bg-primary hover:bg-tertiary' : 'bg-primary hover:bg-tertiary'} ${isDark ? 'text-primary hover:text-primary' : 'text-primary hover:text-primary'}`
                }`}
              >
                <div className="w-8 h-8 mb-2 flex items-center justify-center">
                  <svg className="w-6 h-6 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="font-semibold text-sm">{category.name}</div>
              </motion.button>
            ))}
          </div>

          {selectedCategory && (
            <div className="text-center">
              <Link
                to={`/courses?category=${selectedCategory}`}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3"
              >
                View All {selectedCategory} Courses
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Popular Courses Grid */}
      <section className={`py-20 ${isDark ? 'bg-primary' : 'bg-primary'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-primary' : 'text-primary'} mb-4`}>
              Popular Courses
            </h2>
            <p className={`text-lg ${isDark ? 'text-secondary' : 'text-secondary'}`}>
              Join thousands of learners in these trending courses
            </p>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mb-12"
          >
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 p-1 bg-secondary/50 rounded-xl backdrop-blur-sm max-w-full overflow-x-auto">
              <button
                onClick={() => setSelectedCategory(null)}
                disabled={loading}
                className={`px-3 py-2 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === null
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-secondary hover:text-primary hover:bg-background/50 disabled:opacity-50'
                }`}
              >
                All Courses
              </button>
              {categories.slice(0, 8).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  disabled={loading}
                  className={`px-3 py-2 sm:px-4 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 whitespace-nowrap ${
                    selectedCategory === category.name
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-secondary hover:text-primary hover:bg-background/50 disabled:opacity-50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="loading-skeleton rounded-xl h-80"></div>
              ))}
            </div>
          ) : (
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {courses.slice(0, 8).map((course, index) => renderCourseCard(course, index))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/courses"
              className="btn-primary inline-flex items-center gap-2 px-8 py-4"
            >
              View All Courses
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`py-20 ${isDark ? 'bg-background' : 'bg-background'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-primary' : 'text-primary'} mb-4`}>
              What Our Students Say
            </h2>
            <p className={`text-lg ${isDark ? 'text-secondary' : 'text-secondary'}`}>
              Join thousands of satisfied learners who transformed their careers with us
            </p>
          </motion.div>

          <TestimonialsSlider />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent via-warning to-success relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-bg-primary"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Future?
            </h2>
            <p className="text-2xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join over 50,000 learners who have already upgraded their skills and advanced their careers with our expert-led courses.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                to="/register"
                className="px-8 py-4 bg-bg-primary text-accent font-bold rounded-xl hover:bg-secondary transition-colors shadow-lg transform hover:scale-105"
              >
                Start Learning Today - It's Free!
              </Link>
              <Link
                to="/courses"
                className="px-8 py-4 border-2 border-bg-primary/30 text-bg-primary font-semibold rounded-xl hover:bg-bg-primary/10 transition-colors"
              >
                Browse All Courses
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-bg-primary/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2 text-bg-primary">50K+</div>
                <div className="text-bg-primary/80">Active Learners</div>
              </div>
              <div className="bg-bg-primary/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2 text-bg-primary">1,200+</div>
                <div className="text-bg-primary/80">Expert Courses</div>
              </div>
              <div className="bg-bg-primary/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2 text-bg-primary">98%</div>
                <div className="text-bg-primary/80">Satisfaction Rate</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

export default Landing;
