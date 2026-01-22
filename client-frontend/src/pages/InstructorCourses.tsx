import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { showToast } from '../utils/toast';

interface Course {
  id: number;
  title: string;
  price: number;
  status: string;
  category?: { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
}

interface Lesson {
  id: number;
  title: string;
  type: string;
  duration?: number;
  order: number;
  isPreview: boolean;
}

function InstructorCourses() {
  const { user, token } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    level: 'Beginner',
    language: 'English',
    status: 'draft',
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [manageLessonsFor, setManageLessonsFor] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [lessonForm, setLessonForm] = useState<{
    title: string;
    description: string;
    type: 'video' | 'text';
    duration: string;
    order: string;
    isPreview: boolean;
  }>({
    title: '',
    description: '',
    type: 'video',
    duration: '',
    order: '',
    isPreview: false,
  });
  const [lessonVideoFile, setLessonVideoFile] = useState<File | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!(user?.role === 'instructor' || user?.role === 'admin')) {
      navigate('/teach');
      return;
    }
    void fetchData();
  }, [token, user, navigate]);

  const fetchData = async () => {
    try {
      const [mine, cats] = await Promise.all([
        api.get('/courses/mine'),
        api.get('/categories'),
      ]);
      setCourses(mine.data || []);
      setCategories(cats.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('price', formData.price);
      if (formData.categoryId) fd.append('categoryId', String(formData.categoryId));
      fd.append('level', formData.level);
      fd.append('language', formData.language);
      fd.append('status', formData.status);
      if (thumbnailFile) fd.append('thumbnail', thumbnailFile);

      await api.post('/courses', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        price: '',
        categoryId: '',
        level: 'Beginner',
        language: 'English',
        status: 'draft',
      });
      setThumbnailFile(null);
      showToast.success('Course created successfully!');
      void fetchData();
    } catch (error: any) {
      showToast.error(error?.response?.data?.error || 'Failed to create course');
    }
  };

  const openLessonManager = async (course: Course) => {
    setManageLessonsFor(course);
    setLessons([]);
    setLessonVideoFile(null);
    setLessonForm({
      title: '',
      description: '',
      type: 'video',
      duration: '',
      order: String((lessons[lessons.length - 1]?.order || 0) + 1),
      isPreview: false,
    });
    setLoadingLessons(true);
    try {
      const res = await api.get<Lesson[]>(`/lessons/course/${course.id}`);
      setLessons(res.data || []);
    } catch (error) {
      console.error('Failed to load lessons', error);
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manageLessonsFor) return;

    try {
      const fd = new FormData();
      fd.append('title', lessonForm.title);
      fd.append('description', lessonForm.description);
      fd.append('type', lessonForm.type);
      fd.append('duration', lessonForm.duration || '0');
      fd.append('order', lessonForm.order || String(lessons.length + 1));
      fd.append('isPreview', String(lessonForm.isPreview));
      if (lessonVideoFile && lessonForm.type === 'video') {
        fd.append('video', lessonVideoFile);
      }

      const res = await api.post<Lesson>(
        `/lessons/course/${manageLessonsFor.id}`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      setLessons((prev) => [...prev, res.data].sort((a, b) => a.order - b.order));
      showToast.success('Lesson created');
      setLessonForm({
        title: '',
        description: '',
        type: 'video',
        duration: '',
        order: String((res.data.order || lessons.length + 1) + 1),
        isPreview: false,
      });
      setLessonVideoFile(null);
    } catch (error: any) {
      showToast.error(error?.response?.data?.error || 'Failed to create lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      showToast.success('Lesson deleted');
    } catch (error: any) {
      showToast.error(error?.response?.data?.error || 'Failed to delete lesson');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-border bg-card p-4 sm:p-5 backdrop-blur-sm shadow-lg"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4"
      >
        <h1 className="text-xl font-extrabold gradient-text text-primary">My Courses</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow hover:shadow-lg transform hover:scale-105 active:scale-95"
        >
          + Create Course
        </button>
      </motion.div>

      <div className="grid gap-3 sm:gap-4">
        {courses.map((c, index) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, x: 5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-border p-4 bg-background hover:bg-accent/50 transition-all duration-200 gap-3"
          >
            <div className="space-y-1 flex-1 min-w-0">
              <div className="font-bold text-primary truncate">{c.title}</div>
              <div className="text-secondary text-sm">
                ${c.price} • {c.category?.name || 'Uncategorized'} • {c.status}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => openLessonManager(c)}
                className="px-3 py-1.5 rounded bg-blue-600 text-xs text-white hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Lessons
              </button>
              <button
                onClick={() => navigate(`/courses/${c.id}`)}
                className="px-3 py-1.5 rounded bg-secondary text-xs text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                View
              </button>
            </div>
          </motion.div>
        ))}
        {courses.length === 0 && (
          <div className="text-center text-slate-400 py-6">
            No courses yet. Create your first course.
          </div>
        )}
      </div>

      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="w-full max-w-xl rounded-2xl border border-border bg-card backdrop-blur-xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-extrabold mb-4 text-primary">Create Course</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block mb-2 text-secondary">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block mb-2 text-secondary">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              <div>
                <label className="block mb-2 text-secondary">Thumbnail</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setThumbnailFile(e.target.files?.[0] || null)
                  }
                  className="w-full file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-secondary file:text-secondary-foreground text-secondary file:hover:bg-secondary/80 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-secondary">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-secondary">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({ ...formData, level: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-secondary">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow hover:shadow-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Lesson manager modal */}
      {manageLessonsFor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4"
          onClick={() => setManageLessonsFor(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="w-full max-w-4xl rounded-2xl border border-border bg-card backdrop-blur-xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <div>
                <h2 className="text-lg font-extrabold text-primary">
                  Manage lessons – {manageLessonsFor.title}
                </h2>
                <p className="text-xs text-secondary">
                  Add videos or text lessons and control order and preview.
                </p>
              </div>
              <button
                onClick={() => setManageLessonsFor(null)}
                className="px-3 py-1.5 rounded-lg bg-secondary text-xs text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-4 overflow-y-auto">
              {/* Existing lessons list */}
              <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm">Lessons</h3>
                  {loadingLessons && (
                    <span className="text-[11px] text-secondary">Loading…</span>
                  )}
                </div>
                {lessons.length === 0 && !loadingLessons && (
                  <p className="text-xs text-secondary">
                    No lessons yet. Create your first lesson on the right.
                  </p>
                )}
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/40 bg-slate-900/70 px-3 py-2 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-secondary-foreground">
                            #{lesson.order}
                          </span>
                          <span className="text-[10px] uppercase text-blue-300">
                            {lesson.type}
                          </span>
                          {lesson.isPreview && (
                            <span className="px-1.5 py-0.5 rounded-full bg-blue-600/20 text-blue-200 text-[10px] font-semibold">
                              Preview
                            </span>
                          )}
                        </div>
                        <p className="font-semibold truncate text-primary">{lesson.title}</p>
                        {lesson.duration && (
                          <p className="text-[11px] text-secondary">
                            {lesson.duration} min
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="w-8 h-8 rounded-full bg-red-500/10 text-red-300 flex items-center justify-center hover:bg-red-500/20"
                        aria-label="Delete lesson"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create lesson form */}
              <div className="rounded-xl border border-border bg-background p-4 space-y-3">
                <h3 className="font-semibold text-sm mb-1 text-primary">Create lesson</h3>
                <form onSubmit={handleCreateLesson} className="space-y-3 text-xs">
                  <div>
                    <label className="block mb-1 text-secondary text-xs">
                      Title
                    </label>
                    <input
                      type="text"
                      value={lessonForm.title}
                      onChange={(e) =>
                        setLessonForm({ ...lessonForm, title: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all duration-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-secondary text-xs">
                      Description (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={lessonForm.description}
                      onChange={(e) =>
                        setLessonForm({
                          ...lessonForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all duration-200 text-xs resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-secondary text-xs">
                        Type
                      </label>
                      <select
                        value={lessonForm.type}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            type: e.target.value as 'video' | 'text',
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all duration-200 text-xs"
                      >
                        <option value="video">Video</option>
                        <option value="text">Text</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-secondary text-xs">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={lessonForm.duration}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            duration: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all duration-200 text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block mb-1 text-secondary text-xs">
                        Order
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={lessonForm.order}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            order: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all duration-200 text-xs"
                      />
                    </div>
                    <label className="flex items-center gap-2 mt-4 text-secondary text-xs">
                      <input
                        type="checkbox"
                        checked={lessonForm.isPreview}
                        onChange={(e) =>
                          setLessonForm({
                            ...lessonForm,
                            isPreview: e.target.checked,
                          })
                        }
                        className="rounded border-border bg-background focus:ring-primary focus:ring-2"
                      />
                      Mark as free preview
                    </label>
                  </div>

                  {lessonForm.type === 'video' && (
                    <div>
                      <label className="block mb-1 text-secondary text-xs">
                        Video file
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          setLessonVideoFile(e.target.files?.[0] || null)
                        }
                        className="w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-secondary file:text-secondary-foreground text-secondary file:hover:bg-secondary/80 transition-colors text-xs"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setManageLessonsFor(null)}
                      className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-200 transform hover:scale-105 active:scale-95 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-blue-600 text-xs text-white hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow hover:shadow-lg"
                    >
                      Save lesson
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default InstructorCourses;


