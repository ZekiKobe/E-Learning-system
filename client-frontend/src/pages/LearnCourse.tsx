import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api, { API_ORIGIN, notesAPI, bookmarkAPI, discussionAPI, resourceAPI, progressAPI } from '../api/api';
import { showToast } from '../utils/toast';
import { getImageUrl } from '../utils/imageUtils';

interface Lesson {
  id: number;
  title: string;
  description?: string;
  type: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isPreview: boolean;
}

interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string;
  instructor: {
    firstName: string;
    lastName: string;
  };
  category: {
    name: string;
  };
  lessons: Lesson[];
}

interface LessonProgressItem {
  id: number;
  lessonId: number;
  completed: boolean;
  completedAt?: string;
  lastWatchedAt?: string;
  watchTime?: number;
}

interface CourseProgressResponse {
  enrollment: {
    id: number;
    progress: number;
    completed: boolean;
    completedAt?: string;
  };
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  lessonProgress: LessonProgressItem[];
}

interface Note {
  id: number;
  content: string;
  timestamp?: number;
  createdAt: string;
}

interface Bookmark {
  id: number;
  timestamp: number;
  note?: string;
  createdAt: string;
}

interface Discussion {
  id: number;
  title: string;
  content: string;
  upvotes: number;
  resolved: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface Resource {
  id: number;
  title: string;
  type: string;
  url?: string;
  size?: number;
}

function LearnCourse() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'bookmarks' | 'discussions' | 'resources'>('overview');

  // Video player states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Progress and completion
  const [courseProgress, setCourseProgress] = useState<{
    percentage: number;
    completedCount: number;
    totalLessons: number;
    completed: boolean;
    completedAt?: string;
  }>({ percentage: 0, completedCount: 0, totalLessons: 0, completed: false });
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [lessonProgress, setLessonProgress] = useState<Record<number, number>>({});

  // Features data
  const [notes, setNotes] = useState<Note[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [bookmarkNote, setBookmarkNote] = useState('');

  // Review states
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  useEffect(() => {
    if (currentLesson) {
      loadLessonFeatures();
    }
  }, [currentLesson]);

  const fetchCourseData = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const [courseResponse, lessonsResponse, progressResponse] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/lessons/course/${courseId}`),
        api.get<CourseProgressResponse>(`/progress/courses/${courseId}`).catch(() => null)
      ]);

      setCourse(courseResponse.data.course);
      const sortedLessons = lessonsResponse.data.sort((a: Lesson, b: Lesson) => a.order - b.order);
      setLessons(sortedLessons);

      if (sortedLessons.length > 0) {
        setCurrentLesson(sortedLessons[0]);
      }

      // Handle progress data
      if (progressResponse) {
        const data = progressResponse.data;
        setCourseProgress({
          percentage: data.progressPercentage ?? data.enrollment?.progress ?? 0,
          completedCount: data.completedLessons,
          totalLessons: data.totalLessons,
          completed: data.enrollment?.completed ?? false,
          completedAt: data.enrollment?.completedAt
        });
        setCompletedLessonIds(
          (data.lessonProgress || [])
            .filter((lp) => lp.completed)
            .map((lp) => lp.lessonId)
        );

        // Set lesson progress watch times
        const progressMap: Record<number, number> = {};
        (data.lessonProgress || []).forEach((lp: LessonProgressItem) => {
          if (lp.watchTime) {
            progressMap[lp.lessonId] = lp.watchTime;
          }
        });
        setLessonProgress(progressMap);
      }
    } catch (error) {
      console.error('Failed to fetch course data:', error);
      showToast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const loadLessonFeatures = async () => {
    if (!currentLesson || !courseId) return;

    try {
      const [notesRes, bookmarksRes, discussionsRes, resourcesRes] = await Promise.all([
        notesAPI.getLessonNotes(currentLesson.id),
        bookmarkAPI.getLessonBookmarks(currentLesson.id),
        discussionAPI.getCourseDiscussions(courseId),
        resourceAPI.getCourseResources(courseId)
      ]);

      setNotes(notesRes.data || []);
      setBookmarks(bookmarksRes.data || []);
      setDiscussions(discussionsRes.data || []);
      setResources(resourcesRes.data || []);
    } catch (error) {
      console.error('Failed to load lesson features:', error);
    }
  };

  const handleVideoPlay = () => setIsPlaying(true);
  const handleVideoPause = () => setIsPlaying(false);
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const markLessonComplete = async (lesson: Lesson) => {
    if (!lesson) return;

    try {
      await progressAPI.updateLessonProgress(lesson.id, { completed: true });
      setCompletedLessonIds(prev => prev.includes(lesson.id) ? prev : [...prev, lesson.id]);
      setCourseProgress(prev => ({
        ...prev,
        completedCount: prev.completedCount + (completedLessonIds.includes(lesson.id) ? 0 : 1),
        percentage: Math.round(((prev.completedCount + (completedLessonIds.includes(lesson.id) ? 0 : 1)) / prev.totalLessons) * 100)
      }));

      showToast.success('Lesson marked as complete!');
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
      showToast.error('Failed to update progress');
    }
  };

  const addNote = async () => {
    if (!currentLesson || !noteContent.trim()) return;

    try {
      const timestamp = Math.floor(currentTime);
      await notesAPI.createNote({
        lessonId: currentLesson.id,
        content: noteContent,
        timestamp
      });

      setNotes(prev => [...prev, {
        id: Date.now(), // Temporary ID
        content: noteContent,
        timestamp,
        createdAt: new Date().toISOString()
      }]);

      setNoteContent('');
      setShowNoteModal(false);
      showToast.success('Note added successfully!');
    } catch (error) {
      console.error('Failed to add note:', error);
      showToast.error('Failed to add note');
    }
  };

  const addBookmark = async () => {
    if (!currentLesson) return;

    try {
      const timestamp = Math.floor(currentTime);
      await bookmarkAPI.createBookmark({
        lessonId: currentLesson.id,
        timestamp,
        note: bookmarkNote || undefined
      });

      setBookmarks(prev => [...prev, {
        id: Date.now(), // Temporary ID
        timestamp,
        note: bookmarkNote,
        createdAt: new Date().toISOString()
      }]);

      setBookmarkNote('');
      setShowBookmarkModal(false);
      showToast.success('Bookmark added!');
    } catch (error) {
      console.error('Failed to add bookmark:', error);
      showToast.error('Failed to add bookmark');
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedRating || !courseId) return;
    setSubmittingReview(true);
    try {
      await api.post(`/reviews/course/${courseId}`, {
        rating: selectedRating,
        comment: reviewComment
      });
      showToast.success('Review submitted successfully!');
      setSelectedRating(0);
      setReviewComment('');
    } catch (error: any) {
      showToast.error(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    const container = video.parentElement as HTMLElement | null;
    if (!container) return;

    const doc: any = document;
    const elem: any = container;

    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      setIsFullscreen(true);
    } else {
      if (doc.exitFullscreen) doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
      setIsFullscreen(false);
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const getVideoSrc = (path?: string) => {
    if (!path) return undefined;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_ORIGIN}${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Not Found</h2>
          <p className="text-slate-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  const totalDuration = lessons.reduce((s, l) => s + (l.duration || 0), 0);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div>
                <h1 className="text-lg font-semibold text-slate-900 line-clamp-1">
                  {course.title}
                </h1>
                {currentLesson && (
                  <p className="text-sm text-slate-600">
                    Lesson {currentLesson.order} • {currentLesson.title}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Progress */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-sm text-slate-600">
                  {courseProgress.completedCount}/{courseProgress.totalLessons} lessons
                </div>
                <div className="w-32 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${courseProgress.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {courseProgress.percentage}%
                </span>
              </div>

              <Link
                to={`/courses/${courseId}`}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                Course Info
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <AnimatePresence>
            {(sidebarOpen || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="lg:relative fixed left-0 top-16 lg:top-0 z-30 lg:z-auto w-80 lg:w-80 h-[calc(100vh-4rem)] lg:h-auto bg-card border-r border-border overflow-y-auto"
              >
                <div className="p-6">
                  {/* Course Info */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      {course.thumbnail && (
                        <img
                          src={getImageUrl(course.thumbnail)}
                          alt={course.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-slate-900">{course.title}</h3>
                        <p className="text-sm text-slate-600">
                          {course.instructor.firstName} {course.instructor.lastName}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between">
                        <span>Progress</span>
                        <span>{courseProgress.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${courseProgress.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between">
                        <span>Lessons</span>
                        <span>{courseProgress.completedCount}/{courseProgress.totalLessons}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lessons List */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4">Course Content</h4>
                    <div className="space-y-2">
                      {lessons.map((lesson, index) => {
                        const isCompleted = completedLessonIds.includes(lesson.id);
                        const isCurrent = currentLesson?.id === lesson.id;
                        const watchProgress = lessonProgress[lesson.id] || 0;
                        const progressPercent = lesson.duration ? (watchProgress / lesson.duration) * 100 : 0;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setCurrentLesson(lesson);
                              setSidebarOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-lg transition-all ${
                              isCurrent
                                ? 'bg-blue-50 border border-blue-200'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium">
                                {isCompleted ? (
                                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <span className={isCurrent ? 'text-blue-600' : 'text-slate-400'}>
                                    {index + 1}
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h5 className={`text-sm font-medium line-clamp-2 ${
                                  isCurrent ? 'text-blue-900' : 'text-slate-900'
                                }`}>
                                  {lesson.title}
                                </h5>
                                <div className="flex items-center gap-2 mt-1">
                                  {lesson.duration && (
                                    <span className="text-xs text-slate-500">{lesson.duration}min</span>
                                  )}
                                  {lesson.isPreview && (
                                    <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                                      Preview
                                    </span>
                                  )}
                                </div>

                                {/* Progress bar for current lesson */}
                                {isCurrent && duration > 0 && (
                                  <div className="mt-2">
                                    <div className="w-full bg-slate-200 rounded-full h-1">
                                      <div
                                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                        style={{ width: `${(currentTime / duration) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}

                                {/* Watch progress for completed lessons */}
                                {!isCurrent && watchProgress > 0 && progressPercent < 100 && (
                                  <div className="mt-2">
                                    <div className="w-full bg-slate-200 rounded-full h-1">
                                      <div
                                        className="bg-slate-400 h-1 rounded-full"
                                        style={{ width: `${progressPercent}%` }}
                                      ></div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                      {Math.floor(watchProgress)}min watched
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Video Player */}
            {currentLesson && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border overflow-hidden mb-6"
              >
                {currentLesson.videoUrl ? (
                  <div className="relative bg-black group">
                    <video
                      ref={videoRef}
                      src={getVideoSrc(currentLesson.videoUrl)}
                      className="w-full aspect-video"
                      onPlay={handleVideoPlay}
                      onPause={handleVideoPause}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onLoadedMetadata={handleVideoLoadedMetadata}
                      onEnded={() => markLessonComplete(currentLesson)}
                    />

                    {/* Custom Controls Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="w-full bg-white/20 rounded-full h-1 cursor-pointer"
                             onClick={(e) => {
                               const rect = e.currentTarget.getBoundingClientRect();
                               const percent = (e.clientX - rect.left) / rect.width;
                               handleSeek(percent * duration);
                             }}>
                          <div
                            className="bg-white h-1 rounded-full transition-all duration-100"
                            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={togglePlayPause}
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                          >
                            {isPlaying ? (
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 4a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1H6zM12 4a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V5a1 1 0 00-1-1h-1z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8 5.14v9.72a1 1 0 001.555.832l6-4.5a1 1 0 000-1.664l-6-4.5A1 1 0 008 5.14z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleVolumeChange(volume > 0 ? 0 : 1)}
                              className="text-white hover:text-blue-400 transition-colors"
                            >
                              {volume === 0 ? '🔇' : '🔊'}
                            </button>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={volume}
                              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                              className="w-16"
                            />
                          </div>

                          <div className="text-white text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={playbackRate}
                            onChange={(e) => changePlaybackRate(Number(e.target.value))}
                            className="bg-black/50 text-white text-sm rounded px-2 py-1 border border-white/20"
                          >
                            {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                              <option key={rate} value={rate}>{rate}x</option>
                            ))}
                          </select>

                          <button
                            onClick={toggleFullscreen}
                            className="text-white hover:text-blue-400 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Video Actions */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setShowBookmarkModal(true)}
                        className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                        title="Add Bookmark"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => setShowNoteModal(true)}
                        className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                        title="Add Note"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-100 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-slate-600">No video content available</p>
                    </div>
                  </div>
                )}

                {/* Lesson Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">
                        {currentLesson.title}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>Lesson {currentLesson.order} of {lessons.length}</span>
                        {currentLesson.duration && (
                          <span>{currentLesson.duration} minutes</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => markLessonComplete(currentLesson)}
                      disabled={completedLessonIds.includes(currentLesson.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        completedLessonIds.includes(currentLesson.id)
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {completedLessonIds.includes(currentLesson.id) ? 'Completed ✓' : 'Mark Complete'}
                    </button>
                  </div>

                  {currentLesson.description && (
                    <div className="prose prose-slate max-w-none mb-6">
                      <p>{currentLesson.description}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Tabs Section */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200">
                <div className="flex">
                  {[
                    {
                      id: 'overview',
                      label: 'Overview',
                      icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      )
                    },
                    {
                      id: 'notes',
                      label: 'Notes',
                      icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      ),
                      count: notes.length
                    },
                    {
                      id: 'bookmarks',
                      label: 'Bookmarks',
                      icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      ),
                      count: bookmarks.length
                    },
                    {
                      id: 'discussions',
                      label: 'Q&A',
                      icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      ),
                      count: discussions.length
                    },
                    {
                      id: 'resources',
                      label: 'Resources',
                      icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                        </svg>
                      ),
                      count: resources.length
                    }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Course Description */}
                    {course.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">About This Course</h3>
                        <div className="prose prose-slate max-w-none">
                          <p>{course.description}</p>
                        </div>
                      </div>
                    )}

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900">{lessons.length}</div>
                        <div className="text-sm text-slate-600">Lessons</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900">{totalDuration}</div>
                        <div className="text-sm text-slate-600">Minutes</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900">{courseProgress.totalLessons}</div>
                        <div className="text-sm text-slate-600">Enrolled</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900">{course.category.name}</div>
                        <div className="text-sm text-slate-600">Category</div>
                      </div>
                    </div>

                    {/* Instructor */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Instructor</h3>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                          <span className="text-slate-600 font-semibold">
                            {course.instructor.firstName[0]}{course.instructor.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {course.instructor.firstName} {course.instructor.lastName}
                          </div>
                          <div className="text-sm text-slate-600">Course Instructor</div>
                        </div>
                      </div>
                    </div>

                    {/* Rating Section */}
                    <div className="border-t border-slate-200 pt-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Rate This Course</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setSelectedRating(star)}
                              className={`text-2xl hover:scale-110 transition-transform ${
                                selectedRating >= star ? 'text-yellow-400' : 'text-slate-300'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share your thoughts about this course..."
                            className="w-full px-4 py-3 border border-slate-200 rounded-lg resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                            rows={4}
                          />

                          <div className="flex justify-end">
                            <button
                              onClick={handleSubmitReview}
                              disabled={!selectedRating || submittingReview}
                              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Your Notes</h3>
                      <button
                        onClick={() => setShowNoteModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Note
                      </button>
                    </div>

                    {notes.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        No notes yet. Add your first note to remember important points!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notes.map((note) => (
                          <div key={note.id} className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="text-sm text-slate-600">
                                {note.timestamp && `At ${formatTime(note.timestamp)}`}
                              </div>
                              <div className="text-xs text-slate-500">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <p className="text-slate-900">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'bookmarks' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Bookmarks</h3>
                      <button
                        onClick={() => setShowBookmarkModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Bookmark
                      </button>
                    </div>

                    {bookmarks.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        No bookmarks yet. Bookmark important moments in the video!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookmarks.map((bookmark) => (
                          <div key={bookmark.id} className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <button
                                onClick={() => handleSeek(bookmark.timestamp)}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Jump to {formatTime(bookmark.timestamp)}
                              </button>
                              <div className="text-xs text-slate-500">
                                {new Date(bookmark.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            {bookmark.note && (
                              <p className="text-slate-900">{bookmark.note}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'discussions' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Q&A</h3>
                      <Link
                        to={`/courses/${courseId}/discussions`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View All Discussions
                      </Link>
                    </div>

                    {discussions.slice(0, 5).map((discussion) => (
                      <div key={discussion.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-900">{discussion.title}</h4>
                          {discussion.resolved && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Resolved
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm mb-2 line-clamp-2">{discussion.content}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{discussion.user.firstName} {discussion.user.lastName}</span>
                          <div className="flex items-center gap-3">
                            <span>{discussion.upvotes} upvotes</span>
                            <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Course Resources</h3>

                    {resources.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        No resources available for this course.
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {resources.map((resource) => (
                          <div key={resource.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 text-lg">📄</span>
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">{resource.title}</div>
                                {resource.size && (
                                  <div className="text-sm text-slate-600">{resource.size} MB</div>
                                )}
                              </div>
                            </div>
                            <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showNoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Note</h3>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note here..."
                className="w-full px-4 py-3 border border-slate-200 rounded-lg resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                rows={4}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={addNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showBookmarkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBookmarkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Bookmark</h3>
              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-600 mb-1">Current time:</div>
                <div className="font-medium text-slate-900">{formatTime(currentTime)}</div>
              </div>
              <textarea
                value={bookmarkNote}
                onChange={(e) => setBookmarkNote(e.target.value)}
                placeholder="Add a note (optional)..."
                className="w-full px-4 py-3 border border-slate-200 rounded-lg resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                rows={3}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowBookmarkModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={addBookmark}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Bookmark
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LearnCourse;

