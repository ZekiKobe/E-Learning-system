import { useEffect, useState } from 'react';
import api from '../api/api';
import { showToast } from '../utils/toast';
import { ConfirmModal } from '../components/ConfirmModal';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  status: string;
  level: string;
  totalStudents: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  instructor: {
    firstName: string;
    lastName: string;
  };
  category: {
    id?: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

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

function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    level: 'Beginner',
    language: 'English',
    status: 'draft'
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  // Lesson management state
  const [showLessonsModal, setShowLessonsModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    content: '',
    videoUrl: '',
    duration: '',
    order: '',
    isPreview: false
  });
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/courses', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShowModal(false);
      setEditingCourse(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        categoryId: '',
        level: 'Beginner',
        language: 'English',
        status: 'draft'
      });
      setThumbnailFile(null);
      fetchCourses();
    } catch (error: any) {
      showToast.error(error.response?.data?.error || 'Failed to save course');
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price.toString(),
      categoryId: course.category?.id ? String(course.category.id) : '',
      level: course.level,
      language: 'English',
      status: course.status
    });
    setShowModal(true);
  };

  const handleDeleteCourse = async (id: number) => {
    try {
      await api.delete(`/courses/${id}`);
      showToast.success('Course deleted.');
      fetchCourses();
    } catch (error: any) {
      showToast.error(error.response?.data?.error || 'Failed to delete course');
    } finally {
      setCourseToDelete(null);
    }
  };

  const toggleCourseFlag = async (course: Course, field: 'isFeatured' | 'isTrending') => {
    try {
      const payload: any = {
        [field]: !course[field]
      };
      await api.put(`/courses/${course.id}`, payload);
      showToast.success(
        `${field === 'isFeatured' ? 'Featured' : 'Trending'} flag ${!course[field] ? 'enabled' : 'disabled'}.`
      );
      fetchCourses();
    } catch (error: any) {
      showToast.error(error.response?.data?.error || 'Failed to update course flags');
    }
  };

  // Lesson management functions
  const handleManageLessons = async (courseId: number) => {
    setSelectedCourseId(courseId);
    setShowLessonsModal(true);
    await fetchLessons(courseId);
  };

  const fetchLessons = async (courseId: number) => {
    try {
      const response = await api.get(`/lessons/course/${courseId}`);
      setLessons(response.data || []);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      setLessons([]);
    }
  };

  const handleAddLesson = () => {
    setEditingLesson(null);
    setLessonFormData({
      title: '',
      description: '',
      type: 'video',
      content: '',
      videoUrl: '',
      duration: '',
      order: String(lessons.length + 1),
      isPreview: false
    });
    setShowLessonForm(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonFormData({
      title: lesson.title,
      description: lesson.description || '',
      type: lesson.type,
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration ? String(lesson.duration) : '',
      order: String(lesson.order),
      isPreview: lesson.isPreview
    });
    setShowLessonForm(true);
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    try {
      if (editingLesson) {
        const payload: any = {
          title: lessonFormData.title,
          description: lessonFormData.description || undefined,
          type: lessonFormData.type,
          order: parseInt(lessonFormData.order) || 0,
          isPreview: lessonFormData.isPreview
        };
        if (lessonFormData.type === 'text' && lessonFormData.content) payload.content = lessonFormData.content;
        if (lessonFormData.duration) payload.duration = parseInt(lessonFormData.duration);
        await api.put(`/lessons/${editingLesson.id}`, payload);
      } else {
        if (lessonFormData.type === 'video' && (lessonFormData as any)._videoFile) {
          const fd = new FormData();
          fd.append('title', lessonFormData.title);
          if (lessonFormData.description) fd.append('description', lessonFormData.description);
          fd.append('type', lessonFormData.type);
          fd.append('order', String(parseInt(lessonFormData.order) || 0));
          fd.append('isPreview', String(lessonFormData.isPreview));
          if (lessonFormData.duration) fd.append('duration', String(parseInt(lessonFormData.duration)));
          fd.append('video', (lessonFormData as any)._videoFile);
          await api.post(`/lessons/course/${selectedCourseId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        } else {
          const payload: any = {
            title: lessonFormData.title,
            description: lessonFormData.description || undefined,
            type: lessonFormData.type,
            order: parseInt(lessonFormData.order) || 0,
            isPreview: lessonFormData.isPreview
          };
          if (lessonFormData.type === 'text' && lessonFormData.content) payload.content = lessonFormData.content;
          if (lessonFormData.duration) payload.duration = parseInt(lessonFormData.duration);
          await api.post(`/lessons/course/${selectedCourseId}`, payload);
        }
      }

      setShowLessonForm(false);
      setEditingLesson(null);
      if (selectedCourseId) {
        await fetchLessons(selectedCourseId);
      }
    } catch (error: any) {
      showToast.error(error.response?.data?.error || 'Failed to save lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    try {
      await api.delete(`/lessons/${lessonId}`);
      if (selectedCourseId) {
        await fetchLessons(selectedCourseId);
      }
      showToast.success('Lesson deleted.');
    } catch (error: any) {
      showToast.error(error.response?.data?.error || 'Failed to delete lesson');
    } finally {
      setLessonToDelete(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12 admin-text-muted">Loading courses...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Courses</h1>
          <p className="text-sm admin-text-muted mt-1">
            Manage all courses, pricing, and lesson content from a single place.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-500 shadow-sm hover:shadow-md"
        >
          + Add Course
        </button>
      </div>

      {/* Table card */}
      <div className="admin-card rounded-2xl border admin-border-subtle p-4 md:p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/5">
              <tr className="text-xs uppercase tracking-wide admin-text-muted">
                <th className="px-3 py-3 font-semibold">Title</th>
                <th className="px-3 py-3 font-semibold">Instructor</th>
                <th className="px-3 py-3 font-semibold">Category</th>
                <th className="px-3 py-3 font-semibold">Price</th>
                <th className="px-3 py-3 font-semibold">Students</th>
                <th className="px-3 py-3 font-semibold">Featured</th>
                <th className="px-3 py-3 font-semibold">Trending</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr
                  key={course.id}
                  className="border-t admin-border-subtle hover:bg-slate-900/5 transition-colors"
                >
                  <td className="px-3 py-3 font-medium">{course.title}</td>
                  <td className="px-3 py-3">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </td>
                  <td className="px-3 py-3">{course.category.name}</td>
                  <td className="px-3 py-3">${course.price}</td>
                  <td className="px-3 py-3">{course.totalStudents}</td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => toggleCourseFlag(course, 'isFeatured')}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        course.isFeatured
                          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40'
                          : 'bg-slate-800/60 text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      {course.isFeatured ? 'Featured' : 'Set Featured'}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => toggleCourseFlag(course, 'isTrending')}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        course.isTrending
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800/60 text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      {course.isTrending ? 'Trending' : 'Set Trending'}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        course.status === 'published'
                          ? 'bg-green-500/10 text-green-500'
                          : course.status === 'draft'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 hover:bg-blue-600/20"
                        title="Edit course"
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
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleManageLessons(course.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20"
                        title="Manage lessons"
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
                          <rect x="3" y="4" width="18" height="16" rx="2" />
                          <path d="M7 8h10" />
                          <path d="M7 12h6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCourseToDelete(course.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600/10 text-red-600 hover:bg-red-600/20"
                        title="Delete course"
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
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <rect x="5" y="6" width="14" height="14" rx="2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl admin-card border admin-border-subtle backdrop-blur p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-extrabold mb-4">
              {editingCourse ? 'Edit Course' : 'Create Course'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border admin-border-subtle bg-transparent placeholder:text-slate-400 text-sm"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-xl border admin-border-subtle bg-transparent placeholder:text-slate-400 text-sm"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Thumbnail Image {editingCourse && <span className="text-xs text-slate-400">(leave empty to keep current)</span>}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  className="w-full file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-slate-200 file:text-slate-900 text-sm"
                />
                <p className="text-xs admin-text-muted mt-1">PNG/JPG, up to 10MB.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border admin-border-subtle bg-transparent placeholder:text-slate-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border admin-border-subtle bg-transparent text-sm"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border admin-border-subtle bg-transparent text-sm"
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
              <div>
                <label className="block mb-2 text-sm font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border admin-border-subtle bg-transparent text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border admin-border-subtle text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
                >
                  {editingCourse ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lessons Management Modal */}
      {showLessonsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
          onClick={() => {
            setShowLessonsModal(false);
            setShowLessonForm(false);
            setSelectedCourseId(null);
          }}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl admin-card border admin-border-subtle backdrop-blur p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold">Manage Lessons</h2>
              <div className="flex gap-2">
                <button onClick={handleAddLesson} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm">+ Add Lesson</button>
                <button onClick={() => {
                  setShowLessonsModal(false);
                  setShowLessonForm(false);
                  setSelectedCourseId(null);
                }} className="px-4 py-2 rounded-lg bg-slate-800/60 text-sm">Close</button>
              </div>
            </div>

            {!showLessonForm ? (
              <div className="overflow-x-auto rounded-xl border admin-border-subtle">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/5">
                    <tr className="text-xs uppercase tracking-wide admin-text-muted">
                      <th className="px-3 py-3 font-semibold">Order</th>
                      <th className="px-3 py-3 font-semibold">Title</th>
                      <th className="px-3 py-3 font-semibold">Type</th>
                      <th className="px-3 py-3 font-semibold">Duration</th>
                      <th className="px-3 py-3 font-semibold">Preview</th>
                      <th className="px-3 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-4 text-center text-slate-400">No lessons found. Add your first lesson!</td>
                      </tr>
                    ) : (
                      lessons.map((lesson) => (
                        <tr key={lesson.id} className="border-t border-slate-800">
                          <td className="px-3 py-3">{lesson.order}</td>
                          <td className="px-3 py-3">{lesson.title}</td>
                          <td className="px-3 py-3 capitalize">{lesson.type}</td>
                          <td className="px-3 py-3">{lesson.duration ? `${lesson.duration} min` : '-'}</td>
                          <td className="px-3 py-3">
                            {lesson.isPreview ? (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">Yes</span>
                            ) : (
                              <span className="text-slate-400">No</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => handleEditLesson(lesson)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/10 text-blue-400 hover:bg-blue-600/20"
                                title="Edit lesson"
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
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setLessonToDelete(lesson.id)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600/10 text-red-400 hover:bg-red-600/20"
                                title="Delete lesson"
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
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <path d="M10 11v6" />
                                  <path d="M14 11v6" />
                                  <rect x="5" y="6" width="14" height="14" rx="2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>
                <h3 className="text-md font-extrabold mb-4">{editingLesson ? 'Edit Lesson' : 'Create Lesson'}</h3>
                <form onSubmit={handleLessonSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-2 text-slate-300">Title</label>
                    <input
                      type="text"
                      value={lessonFormData.title}
                      onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-600/60 bg-slate-900/60 placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-slate-300">Description</label>
                    <textarea
                      value={lessonFormData.description}
                      onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-600/60 bg-slate-900/60 placeholder:text-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-slate-300">Type</label>
                      <select
                        value={lessonFormData.type}
                        onChange={(e) => setLessonFormData({ ...lessonFormData, type: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-600/60 bg-slate-900/60"
                      >
                        <option value="video">Video</option>
                        <option value="text">Text</option>
                        <option value="quiz">Quiz</option>
                        <option value="assignment">Assignment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-slate-300">Order</label>
                      <input
                        type="number"
                        value={lessonFormData.order}
                        onChange={(e) => setLessonFormData({ ...lessonFormData, order: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-600/60 bg-slate-900/60 placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                  {lessonFormData.type === 'video' && (
                    <div>
                      <label className="block mb-2 text-slate-300">Upload Video</label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          (lessonFormData as any)._videoFile = file || null;
                          setLessonFormData({ ...lessonFormData });
                        }}
                        className="w-full file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-slate-800 file:text-slate-200 text-slate-300"
                      />
                      <p className="text-xs text-slate-400 mt-1">MP4/MOV, up to 500MB.</p>
                    </div>
                  )}
                  {lessonFormData.type === 'text' && (
                    <div>
                      <label className="block mb-2 text-slate-300">Content</label>
                      <textarea
                        value={lessonFormData.content}
                        onChange={(e) => setLessonFormData({ ...lessonFormData, content: e.target.value })}
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl border border-slate-600/60 bg-slate-900/60 placeholder:text-slate-500"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-slate-300">Duration (minutes)</label>
                      <input
                        type="number"
                        value={lessonFormData.duration}
                        onChange={(e) => setLessonFormData({ ...lessonFormData, duration: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-600/60 bg-slate-900/60 placeholder:text-slate-500"
                      />
                    </div>
                    <div className="flex items-center pt-8">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lessonFormData.isPreview}
                          onChange={(e) => setLessonFormData({ ...lessonFormData, isPreview: e.target.checked })}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-slate-300">Preview Lesson (free to view)</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLessonForm(false);
                        setEditingLesson(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-slate-800/60"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">
                      {editingLesson ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Confirm delete course */}
      <ConfirmModal
        open={courseToDelete !== null}
        title="Delete course?"
        description="This will remove the course and its lessons. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => courseToDelete !== null && handleDeleteCourse(courseToDelete)}
        onClose={() => setCourseToDelete(null)}
      />

      {/* Confirm delete lesson */}
      <ConfirmModal
        open={lessonToDelete !== null}
        title="Delete lesson?"
        description="Students will no longer see this lesson in the course outline."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => lessonToDelete !== null && handleDeleteLesson(lessonToDelete)}
        onClose={() => setLessonToDelete(null)}
      />
    </div>
  );
}

export default Courses;

