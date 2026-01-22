import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { discussionAPI } from '../api/api';
import { showToast } from '../utils/toast';

interface Discussion {
  id: number;
  title: string;
  content: string;
  upvotes: number;
  resolved: boolean;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
  };
  replies?: Reply[];
  _count?: {
    replies: number;
  };
}

interface Reply {
  id: number;
  content: string;
  upvotes: number;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    role: string;
  };
}

function Discussions() {
  const { courseId } = useParams();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved' | 'my-posts'>('all');

  // Form states
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadDiscussions();
    }
  }, [courseId, filter]);

  const loadDiscussions = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const response = await discussionAPI.getCourseDiscussions(courseId);
      let data = response.data || [];

      // Apply filters
      if (filter === 'unresolved') {
        data = data.filter((d: Discussion) => !d.resolved);
      } else if (filter === 'resolved') {
        data = data.filter((d: Discussion) => d.resolved);
      } else if (filter === 'my-posts') {
        // In a real app, you'd get current user ID and filter
        data = data.filter((d: Discussion) => d.user.id === 1); // Mock user ID
      }

      // Sort: pinned first, then by creation date
      data.sort((a: Discussion, b: Discussion) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setDiscussions(data);
    } catch (error) {
      console.error('Failed to load discussions:', error);
      showToast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const loadDiscussionDetails = async (discussionId: number) => {
    try {
      const response = await discussionAPI.getDiscussion(discussionId);
      setSelectedDiscussion(response.data);
    } catch (error) {
      console.error('Failed to load discussion details:', error);
      showToast.error('Failed to load discussion details');
    }
  };

  const createDiscussion = async () => {
    if (!courseId || !newDiscussionTitle.trim() || !newDiscussionContent.trim()) return;

    try {
      setSubmitting(true);
      await discussionAPI.createDiscussion({
        courseId: parseInt(courseId),
        title: newDiscussionTitle,
        content: newDiscussionContent
      });

      showToast.success('Discussion created successfully!');
      setShowCreateModal(false);
      setNewDiscussionTitle('');
      setNewDiscussionContent('');
      loadDiscussions();
    } catch (error: any) {
      console.error('Failed to create discussion:', error);
      showToast.error(error.response?.data?.error || 'Failed to create discussion');
    } finally {
      setSubmitting(false);
    }
  };

  const upvoteDiscussion = async (discussionId: number) => {
    try {
      await discussionAPI.upvoteDiscussion(discussionId);
      // Update local state
      setDiscussions(prev => prev.map(d =>
        d.id === discussionId ? { ...d, upvotes: d.upvotes + 1 } : d
      ));
      if (selectedDiscussion?.id === discussionId) {
        setSelectedDiscussion(prev => prev ? { ...prev, upvotes: prev.upvotes + 1 } : null);
      }
    } catch (error) {
      console.error('Failed to upvote:', error);
      showToast.error('Failed to upvote');
    }
  };

  const resolveDiscussion = async (discussionId: number) => {
    try {
      await discussionAPI.resolveDiscussion(discussionId);
      setDiscussions(prev => prev.map(d =>
        d.id === discussionId ? { ...d, resolved: !d.resolved } : d
      ));
      if (selectedDiscussion?.id === discussionId) {
        setSelectedDiscussion(prev => prev ? { ...prev, resolved: !prev.resolved } : null);
      }
      showToast.success('Discussion status updated');
    } catch (error) {
      console.error('Failed to update discussion:', error);
      showToast.error('Failed to update discussion');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const filteredDiscussions = discussions.filter(discussion =>
    discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discussion.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Q&A Discussions</h1>
              <p className="text-slate-600 mt-1">Ask questions and help fellow learners</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ask Question
              </button>
              <Link
                to={`/learn/${courseId}`}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Back to Course
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-8">
              <h3 className="font-semibold text-slate-900 mb-4">Filters</h3>

              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                />
              </div>

              {/* Filter Tabs */}
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Discussions', count: discussions.length },
                  { value: 'unresolved', label: 'Unresolved', count: discussions.filter(d => !d.resolved).length },
                  { value: 'resolved', label: 'Resolved', count: discussions.filter(d => d.resolved).length },
                  { value: 'my-posts', label: 'My Posts', count: discussions.filter(d => d.user.id === 1).length }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value as any)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      filter === option.value
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{option.label}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {option.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <AnimatePresence>
                {selectedDiscussion ? (
                  /* Discussion Detail View */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Back Button */}
                    <button
                      onClick={() => setSelectedDiscussion(null)}
                      className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to discussions
                    </button>

                    {/* Main Discussion */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-semibold text-sm">
                              {selectedDiscussion.user.firstName[0]}{selectedDiscussion.user.lastName[0]}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-slate-900">
                                {selectedDiscussion.user.firstName} {selectedDiscussion.user.lastName}
                              </span>
                              {selectedDiscussion.user.role === 'instructor' && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  Instructor
                                </span>
                              )}
                              <span className="text-slate-500 text-sm">
                                {formatDate(selectedDiscussion.createdAt)}
                              </span>
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 mb-3">
                              {selectedDiscussion.title}
                            </h2>

                            <p className="text-slate-700 leading-relaxed mb-4">
                              {selectedDiscussion.content}
                            </p>

                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => upvoteDiscussion(selectedDiscussion.id)}
                                className="flex items-center gap-2 px-3 py-1 text-slate-600 hover:text-blue-600 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                                <span className="text-sm">{selectedDiscussion.upvotes}</span>
                              </button>

                              {selectedDiscussion.user.role === 'instructor' && (
                                <button
                                  onClick={() => resolveDiscussion(selectedDiscussion.id)}
                                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    selectedDiscussion.resolved
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}
                                >
                                  {selectedDiscussion.resolved ? '✓ Resolved' : 'Mark Resolved'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Replies Section */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-900">
                          Replies ({selectedDiscussion.replies?.length || 0})
                        </h3>
                        <button
                          onClick={() => setShowReplyModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add Reply
                        </button>
                      </div>

                      {selectedDiscussion.replies && selectedDiscussion.replies.length > 0 ? (
                        <div className="space-y-4">
                          {selectedDiscussion.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-slate-600 font-semibold text-xs">
                                  {reply.user.firstName[0]}{reply.user.lastName[0]}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium text-slate-900 text-sm">
                                    {reply.user.firstName} {reply.user.lastName}
                                  </span>
                                  {reply.user.role === 'instructor' && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                      Instructor
                                    </span>
                                  )}
                                  <span className="text-slate-500 text-xs">
                                    {formatDate(reply.createdAt)}
                                  </span>
                                </div>

                                <p className="text-slate-700 text-sm leading-relaxed">
                                  {reply.content}
                                </p>

                                <div className="flex items-center gap-4 mt-3">
                                  <button className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors text-xs">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                    <span>{reply.upvotes}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          No replies yet. Be the first to answer this question!
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  /* Discussions List View */
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {filteredDiscussions.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No discussions found</h3>
                        <p className="text-slate-600 mb-6">
                          {searchTerm ? 'Try adjusting your search terms.' : 'Be the first to ask a question!'}
                        </p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Ask a Question
                        </button>
                      </div>
                    ) : (
                      filteredDiscussions.map((discussion) => (
                        <motion.div
                          key={discussion.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => {
                            setSelectedDiscussion(discussion);
                            loadDiscussionDetails(discussion.id);
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 font-semibold text-sm">
                                {discussion.user.firstName[0]}{discussion.user.lastName[0]}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-slate-900">
                                  {discussion.user.firstName} {discussion.user.lastName}
                                </span>
                                {discussion.user.role === 'instructor' && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    Instructor
                                  </span>
                                )}
                                <span className="text-slate-500 text-sm">
                                  {formatDate(discussion.createdAt)}
                                </span>
                                {discussion.pinned && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                    📌 Pinned
                                  </span>
                                )}
                              </div>

                              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
                                {discussion.title}
                              </h3>

                              <p className="text-slate-600 mb-4 line-clamp-2">
                                {discussion.content}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      upvoteDiscussion(discussion.id);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1 text-slate-600 hover:text-blue-600 transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                    <span className="text-sm">{discussion.upvotes}</span>
                                  </button>

                                  <div className="flex items-center gap-1 text-slate-500 text-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span>{discussion._count?.replies || 0} replies</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {discussion.resolved && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                                      ✓ Resolved
                                    </span>
                                  )}
                                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Create Discussion Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Ask a Question</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Question Title
                  </label>
                  <input
                    type="text"
                    value={newDiscussionTitle}
                    onChange={(e) => setNewDiscussionTitle(e.target.value)}
                    placeholder="What is your question about?"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Details
                  </label>
                  <textarea
                    value={newDiscussionContent}
                    onChange={(e) => setNewDiscussionContent(e.target.value)}
                    placeholder="Provide more context about your question..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none"
                    rows={6}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={createDiscussion}
                  disabled={!newDiscussionTitle.trim() || !newDiscussionContent.trim() || submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Posting...' : 'Post Question'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Modal */}
      <AnimatePresence>
        {showReplyModal && selectedDiscussion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReplyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Reply to Question</h3>
              <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-1">{selectedDiscussion.title}</h4>
                <p className="text-slate-600 text-sm line-clamp-2">{selectedDiscussion.content}</p>
              </div>

              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your answer..."
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none"
                rows={6}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // In a real app, you'd call an API to create reply
                    showToast.success('Reply posted successfully!');
                    setShowReplyModal(false);
                    setReplyContent('');
                  }}
                  disabled={!replyContent.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Reply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Discussions;
