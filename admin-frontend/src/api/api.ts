import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

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
  getProfile: () => api.get('/auth/profile'),
};

// Admin Dashboard API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getAllCategories: () => api.get('/admin/categories'),
  createCategory: (data: any) => api.post('/admin/categories', data),
  updateCategory: (id: string, data: any) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
};

// Course Management API
export const courseAPI = {
  getAllCourses: (params?: any) => api.get('/courses', { params }),
  getCourse: (id: string) => api.get(`/courses/${id}`),
  updateCourse: (id: string, data: any) => api.put(`/courses/${id}`, data),
  deleteCourse: (id: string) => api.delete(`/courses/${id}`),
};

// Quiz Management API
export const quizAPI = {
  createQuiz: (data: any) => api.post('/quizzes', data),
  getQuiz: (id: string) => api.get(`/quizzes/${id}`),
  addQuestion: (quizId: string, data: any) => api.post(`/quizzes/${quizId}/questions`, data),
  getUserAttempts: (quizId: string) => api.get(`/quizzes/${quizId}/attempts`),
};

// Assignment Management API
export const assignmentAPI = {
  createAssignment: (data: any) => api.post('/assignments', data),
  getCourseAssignments: (courseId: string) => api.get(`/assignments/course/${courseId}`),
  gradeAssignment: (submissionId: string, data: any) => api.put(`/assignments/submissions/${submissionId}/grade`, data),
  getAssignmentSubmissions: (assignmentId: string) => api.get(`/assignments/${assignmentId}/submissions`),
};

// Discussion Management API
export const discussionAPI = {
  getCourseDiscussions: (courseId: string) => api.get(`/discussions/course/${courseId}`),
  getDiscussion: (id: string) => api.get(`/discussions/${id}`),
  resolveDiscussion: (id: string) => api.put(`/discussions/${id}/resolve`),
  pinDiscussion: (id: string) => api.put(`/discussions/${id}/pin`),
};

// Notification Management API
export const notificationAPI = {
  getNotifications: (params?: any) => api.get('/notifications', { params }),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};

// Resource Management API
export const resourceAPI = {
  createResource: (data: any) => api.post('/resources', data),
  getCourseResources: (courseId: string) => api.get(`/resources/course/${courseId}`),
  deleteResource: (id: string) => api.delete(`/resources/${id}`),
};

// Announcement Management API
export const announcementAPI = {
  createAnnouncement: (data: any) => api.post('/announcements', data),
  getCourseAnnouncements: (courseId: string) => api.get(`/announcements/course/${courseId}`),
  updateAnnouncement: (id: string, data: any) => api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id: string) => api.delete(`/announcements/${id}`),
};

// Coupon Management API
export const couponAPI = {
  createCoupon: (data: any) => api.post('/coupons', data),
  getAllCoupons: () => api.get('/coupons'),
  updateCoupon: (id: string, data: any) => api.put(`/coupons/${id}`, data),
  validateCoupon: (data: any) => api.post('/coupons/validate', data),
};

// Payment Management API
export const paymentAPI = {
  getAllPayments: () => api.get('/payments'),
  getUserPayments: (userId: string) => api.get(`/payments/user/${userId}`),
};

// Refund Management API
export const refundAPI = {
  getAllRefunds: () => api.get('/refunds'),
  updateRefundStatus: (id: string, data: any) => api.put(`/refunds/${id}`, data),
};

// Review Management API
export const reviewAPI = {
  getAllReviews: () => api.get('/reviews'),
  getCourseReviews: (courseId: string) => api.get(`/reviews/course/${courseId}`),
  deleteReview: (id: string) => api.delete(`/reviews/${id}`),
};

// Instructor Request Management API
export const instructorRequestAPI = {
  getAllRequests: () => api.get('/instructor-requests'),
  approveRequest: (id: string) => api.put(`/instructor-requests/${id}/approve`),
  rejectRequest: (id: string, data: any) => api.put(`/instructor-requests/${id}/reject`, data),
};

// Enrollment Analytics API
export const analyticsAPI = {
  getEnrollmentAnalytics: () => api.get('/progress/admin/enrollment-analytics'),
};

