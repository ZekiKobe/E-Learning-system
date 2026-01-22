import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { assignmentAPI } from '../api/api';
import { showToast } from '../utils/toast';

interface Assignment {
  id: number;
  title: string;
  description: string;
  instructions?: string;
  dueDate?: string;
  maxPoints: number;
  allowFileUpload: boolean;
  allowTextSubmission: boolean;
  courseId: number;
  lessonId?: number;
}

interface Submission {
  id: number;
  assignmentId: number;
  content?: string;
  fileUrl?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: {
    firstName: string;
    lastName: string;
  };
}

function Assignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Submission form
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (assignmentId) {
      loadAssignment();
    }
  }, [assignmentId]);

  const loadAssignment = async () => {
    if (!assignmentId) return;

    try {
      setLoading(true);
      // In a real app, you'd have an endpoint to get assignment details
      // For now, we'll simulate with basic data
      const mockAssignment: Assignment = {
        id: parseInt(assignmentId),
        title: 'Final Project Submission',
        description: 'Submit your completed project with all requirements met.',
        instructions: 'Please submit a ZIP file containing your project code, documentation, and any required assets. Include a README file with setup instructions.',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        maxPoints: 100,
        allowFileUpload: true,
        allowTextSubmission: true,
        courseId: 1
      };

      setAssignment(mockAssignment);

      // Check if already submitted (mock)
      const mockSubmission: Submission | null = null; // Set to mock data if needed
      setSubmission(mockSubmission);
    } catch (error) {
      console.error('Failed to load assignment:', error);
      showToast.error('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showToast.error('File size must be less than 10MB');
      return;
    }

    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.rar', '.jpg', '.png', '.gif'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(fileExtension)) {
      showToast.error('File type not allowed. Please upload PDF, DOC, TXT, ZIP, or image files.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!assignment) return;

    if (assignment.allowTextSubmission && !textContent.trim() && !selectedFile) {
      showToast.error('Please provide either text content or upload a file');
      return;
    }

    if (!assignment.allowTextSubmission && !selectedFile) {
      showToast.error('Please upload a file');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      if (textContent.trim()) {
        formData.append('content', textContent);
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await assignmentAPI.submitAssignment(assignment.id, formData);

      showToast.success('Assignment submitted successfully!');

      // Reload to show submitted state
      loadAssignment();
    } catch (error: any) {
      console.error('Failed to submit assignment:', error);
      showToast.error(error.response?.data?.error || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !submission;
  };

  const getDaysLeft = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Assignment Not Found</h2>
          <p className="text-slate-600 mb-6">The assignment you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{assignment.title}</h1>
              <p className="text-slate-600 mt-1">{assignment.description}</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assignment Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Assignment Details</h2>

              {assignment.instructions && (
                <div className="mb-6">
                  <h3 className="font-medium text-slate-900 mb-2">Instructions</h3>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700">{assignment.instructions}</p>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-900">Points: </span>
                  <span className="text-slate-600">{assignment.maxPoints} points</span>
                </div>
                <div>
                  <span className="font-medium text-slate-900">Due: </span>
                  <span className={`${
                    isOverdue(assignment.dueDate!) ? 'text-red-600' : 'text-slate-600'
                  }`}>
                    {formatDate(assignment.dueDate!)}
                    {isOverdue(assignment.dueDate!) && ' (Overdue)'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Submission Status */}
            {submission ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-green-900">Assignment Submitted</h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-green-900">Submitted: </span>
                    <span className="text-green-700">{formatDate(submission.submittedAt)}</span>
                  </div>

                  {submission.content && (
                    <div>
                      <span className="font-medium text-green-900">Text Submission: </span>
                      <p className="text-green-700 mt-1 p-3 bg-white rounded border">{submission.content}</p>
                    </div>
                  )}

                  {submission.fileUrl && (
                    <div>
                      <span className="font-medium text-green-900">File Submitted: </span>
                      <a
                        href={submission.fileUrl}
                        className="text-blue-600 hover:text-blue-700 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download submitted file
                      </a>
                    </div>
                  )}

                  {submission.grade !== undefined && (
                    <div className="pt-3 border-t border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-green-900">Grade: </span>
                        <span className="text-lg font-bold text-green-900">
                          {submission.grade}/{assignment.maxPoints}
                        </span>
                      </div>
                      {submission.feedback && (
                        <div className="mt-2">
                          <span className="font-medium text-green-900">Feedback: </span>
                          <p className="text-green-700 mt-1 p-3 bg-white rounded border">{submission.feedback}</p>
                        </div>
                      )}
                      {submission.gradedBy && (
                        <div className="text-xs text-green-600 mt-1">
                          Graded by {submission.gradedBy.firstName} {submission.gradedBy.lastName} on {formatDate(submission.gradedAt!)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Submission Form */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-6"
              >
                <h3 className="text-xl font-semibold text-slate-900 mb-6">Submit Assignment</h3>

                <div className="space-y-6">
                  {/* Text Submission */}
                  {assignment.allowTextSubmission && (
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Text Response (Optional)
                      </label>
                      <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Write your response here..."
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none"
                        rows={6}
                      />
                    </div>
                  )}

                  {/* File Upload */}
                  {assignment.allowFileUpload && (
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        File Upload {assignment.allowTextSubmission ? '(Optional)' : '(Required)'}
                      </label>

                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          dragActive
                            ? 'border-blue-500 bg-blue-50'
                            : selectedFile
                            ? 'border-green-500 bg-green-50'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        {selectedFile ? (
                          <div className="space-y-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-green-900">{selectedFile.name}</p>
                              <p className="text-sm text-green-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                              onClick={() => setSelectedFile(null)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Remove file
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">Drop your file here, or click to browse</p>
                              <p className="text-sm text-slate-600">PDF, DOC, DOCX, TXT, ZIP up to 10MB</p>
                            </div>
                            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Choose File
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileSelect(file);
                                }}
                                accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.png,.gif"
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || (!textContent.trim() && !selectedFile)}
                      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? 'Submitting...' : 'Submit Assignment'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Due Date Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-xl border p-6 ${
                isOverdue(assignment.dueDate!)
                  ? 'bg-red-50 border-red-200'
                  : getDaysLeft(assignment.dueDate!) <= 1
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <h4 className="font-semibold text-slate-900 mb-2">Due Date</h4>
              <div className="text-lg font-bold text-slate-900 mb-1">
                {formatDate(assignment.dueDate!)}
              </div>
              <div className={`text-sm ${
                isOverdue(assignment.dueDate!)
                  ? 'text-red-700'
                  : getDaysLeft(assignment.dueDate!) <= 1
                  ? 'text-yellow-700'
                  : 'text-blue-700'
              }`}>
                {isOverdue(assignment.dueDate!)
                  ? 'Overdue'
                  : getDaysLeft(assignment.dueDate!) === 0
                  ? 'Due today'
                  : `${getDaysLeft(assignment.dueDate!)} days left`
                }
              </div>
            </motion.div>

            {/* Grading Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <h4 className="font-semibold text-slate-900 mb-4">Grading</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Maximum Points:</span>
                  <span className="font-medium text-slate-900">{assignment.maxPoints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Submission Types:</span>
                  <div className="text-right">
                    {assignment.allowTextSubmission && <div className="text-slate-900">Text</div>}
                    {assignment.allowFileUpload && <div className="text-slate-900">File Upload</div>}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <h4 className="font-semibold text-slate-900 mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  ← Back to Course
                </button>
                <button
                  onClick={() => navigate('/my-courses')}
                  className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  My Courses
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Assignment;
