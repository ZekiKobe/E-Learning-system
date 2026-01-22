import axios from 'axios';

export const API_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';

// Base origin (without /api) for static assets like /uploads/videos/*
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string; role?: string }) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => api.put('/auth/change-password', data),
};

// Course API
export const courseAPI = {
  getAllCourses: (params?: any) => api.get('/courses', { params }),
  getCourse: (id: string) => api.get(`/courses/${id}`),
  createCourse: (data: any) => api.post('/courses', data),
  updateCourse: (id: string, data: any) => api.put(`/courses/${id}`, data),
  deleteCourse: (id: string) => api.delete(`/courses/${id}`),
  enrollCourse: (id: string) => api.post(`/courses/${id}/enroll`),
  getMyCourses: () => api.get('/courses/my-courses'),
  getInstructorCourses: () => api.get('/courses/instructor'),
};

// Category API
export const categoryAPI = {
  getAllCategories: () => api.get('/categories'),
  createCategory: (data: any) => api.post('/categories', data),
  updateCategory: (id: string, data: any) => api.put(`/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/categories/${id}`),
};

// Quiz API
export const quizAPI = {
  createQuiz: (data: any) => api.post('/quizzes', data),
  getQuiz: (id: string) => api.get(`/quizzes/${id}`),
  addQuestion: (quizId: string, data: any) => api.post(`/quizzes/${quizId}/questions`, data),
  startAttempt: (quizId: string) => api.post(`/quizzes/${quizId}/attempts`),
  submitAttempt: (attemptId: string, data: any) => api.put(`/quizzes/attempts/${attemptId}`, data),
  getUserAttempts: (quizId: string) => api.get(`/quizzes/${quizId}/attempts`),
};

// Assignment API
export const assignmentAPI = {
  createAssignment: (data: any) => api.post('/assignments', data),
  getCourseAssignments: (courseId: string) => api.get(`/assignments/course/${courseId}`),
  submitAssignment: (assignmentId: string, data: any) => api.post(`/assignments/${assignmentId}/submit`, data),
  gradeAssignment: (submissionId: string, data: any) => api.put(`/assignments/submissions/${submissionId}/grade`, data),
  getAssignmentSubmissions: (assignmentId: string) => api.get(`/assignments/${assignmentId}/submissions`),
};

// Progress API
export const progressAPI = {
  updateLessonProgress: (lessonId: string, data: any) => api.put(`/progress/lessons/${lessonId}`, data),
  getLessonProgress: (lessonId: string) => api.get(`/progress/lessons/${lessonId}`),
  getCourseProgress: (courseId: string) => api.get(`/progress/courses/${courseId}`),
};

// Discussion API
export const discussionAPI = {
  createDiscussion: (data: any) => api.post('/discussions', data),
  getCourseDiscussions: (courseId: string) => api.get(`/discussions/course/${courseId}`),
  getDiscussion: (id: string) => api.get(`/discussions/${id}`),
  upvoteDiscussion: (id: string) => api.post(`/discussions/${id}/upvote`),
  resolveDiscussion: (id: string) => api.put(`/discussions/${id}/resolve`),
  pinDiscussion: (id: string) => api.put(`/discussions/${id}/pin`),
};

// Notification API
export const notificationAPI = {
  getNotifications: (params?: any) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};

// Notes API
export const notesAPI = {
  createNote: (data: any) => api.post('/notes', data),
  getLessonNotes: (lessonId: string) => api.get(`/notes/lesson/${lessonId}`),
  getUserNotes: () => api.get('/notes'),
  updateNote: (id: string, data: any) => api.put(`/notes/${id}`, data),
  deleteNote: (id: string) => api.delete(`/notes/${id}`),
};

// Bookmarks API
export const bookmarkAPI = {
  createBookmark: (data: any) => api.post('/bookmarks', data),
  getLessonBookmarks: (lessonId: string) => api.get(`/bookmarks/lesson/${lessonId}`),
  getUserBookmarks: () => api.get('/bookmarks'),
  deleteBookmark: (id: string) => api.delete(`/bookmarks/${id}`),
};

// Announcements API
export const announcementAPI = {
  createAnnouncement: (data: any) => api.post('/announcements', data),
  getCourseAnnouncements: (courseId: string) => api.get(`/announcements/course/${courseId}`),
  updateAnnouncement: (id: string, data: any) => api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id: string) => api.delete(`/announcements/${id}`),
};

// Resources API
export const resourceAPI = {
  createResource: (data: any) => api.post('/resources', data),
  getCourseResources: (courseId: string) => api.get(`/resources/course/${courseId}`),
  downloadResource: (id: string) => api.post(`/resources/${id}/download`),
  deleteResource: (id: string) => api.delete(`/resources/${id}`),
};

// Wishlist API
export const wishlistAPI = {
  addToWishlist: (courseId: string) => api.post('/wishlist', { courseId }),
  removeFromWishlist: (courseId: string) => api.delete(`/wishlist/${courseId}`),
  getWishlist: () => api.get('/wishlist'),
};

// Review API
export const reviewAPI = {
  createReview: (data: any) => api.post('/reviews', data),
  getCourseReviews: (courseId: string) => api.get(`/reviews/course/${courseId}`),
  updateReview: (id: string, data: any) => api.put(`/reviews/${id}`, data),
  deleteReview: (id: string) => api.delete(`/reviews/${id}`),
};

// Payment API
export const paymentAPI = {
  createPayment: (data: any) => api.post('/payments', data),
  getUserPayments: () => api.get('/payments'),
  validateCoupon: (data: any) => api.post('/coupons/validate', data),
};

// Instructor Request API
export const instructorRequestAPI = {
  createRequest: (data: any) => api.post('/instructor-requests', data),
  getMyRequests: () => api.get('/instructor-requests/my-requests'),
};

// Certificate API
export const certificateAPI = {
  getCertificates: () => api.get('/certificates'),
  getCertificate: (id: string) => api.get(`/certificates/${id}`),
  generateCertificate: (courseId: string) => api.post(`/certificates/generate/${courseId}`),
  downloadCertificate: (id: string) => api.get(`/certificates/${id}/download`, { responseType: 'blob' }),
};

// Refund API
export const refundAPI = {
  createRefund: (data: any) => api.post('/refunds', data),
  getUserRefunds: () => api.get('/refunds'),
};

