import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { quizAPI, courseAPI } from '../api/api';
import { showToast } from '../utils/toast';

interface Quiz {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  lessonId?: number;
  timeLimit?: number;
  totalQuestions: number;
  passingScore?: number;
  isActive: boolean;
  createdAt: string;
  course?: {
    title: string;
  };
}

interface Question {
  id: number;
  quizId: number;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  order: number;
}

interface Course {
  id: number;
  title: string;
  instructor: {
    firstName: string;
    lastName: string;
  };
}

function QuizManagement() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Form states
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    courseId: '',
    lessonId: '',
    timeLimit: '',
    passingScore: ''
  });

  const [questionForm, setQuestionForm] = useState({
    question: '',
    type: 'multiple_choice' as Question['type'],
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizzesRes, coursesRes] = await Promise.all([
        quizAPI.getAllQuizzes?.() || Promise.resolve({ data: [] }),
        courseAPI.getAllCourses()
      ]);

      setQuizzes(quizzesRes.data || []);
      setCourses(coursesRes.data.courses || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast.error('Failed to load quiz data');
    } finally {
      setLoading(false);
    }
  };

  const loadQuizDetails = async (quizId: number) => {
    try {
      const [quizRes, questionsRes] = await Promise.all([
        quizAPI.getQuiz(quizId.toString()),
        // In a real app, you'd have an endpoint to get questions
        Promise.resolve({ data: [] }) // Mock for now
      ]);

      setSelectedQuiz(quizRes.data);
      setQuestions(questionsRes.data || []);
      setShowQuizDetails(true);
    } catch (error) {
      console.error('Failed to load quiz details:', error);
      showToast.error('Failed to load quiz details');
    }
  };

  const createQuiz = async () => {
    if (!quizForm.title || !quizForm.courseId) {
      showToast.error('Please fill in all required fields');
      return;
    }

    try {
      await quizAPI.createQuiz({
        title: quizForm.title,
        description: quizForm.description,
        courseId: parseInt(quizForm.courseId),
        lessonId: quizForm.lessonId ? parseInt(quizForm.lessonId) : undefined,
        timeLimit: quizForm.timeLimit ? parseInt(quizForm.timeLimit) : undefined,
        passingScore: quizForm.passingScore ? parseInt(quizForm.passingScore) : undefined
      });

      showToast.success('Quiz created successfully!');
      setShowCreateModal(false);
      resetQuizForm();
      loadData();
    } catch (error: any) {
      console.error('Failed to create quiz:', error);
      showToast.error(error.response?.data?.error || 'Failed to create quiz');
    }
  };

  const addQuestion = async () => {
    if (!selectedQuiz || !questionForm.question) {
      showToast.error('Please fill in the question');
      return;
    }

    try {
      const questionData = {
        question: questionForm.question,
        type: questionForm.type,
        points: questionForm.points,
        options: questionForm.type === 'multiple_choice' ? questionForm.options.filter(opt => opt.trim()) : undefined,
        correctAnswer: questionForm.correctAnswer
      };

      await quizAPI.addQuestion(selectedQuiz.id.toString(), questionData);

      showToast.success('Question added successfully!');
      resetQuestionForm();
      loadQuizDetails(selectedQuiz.id);
    } catch (error: any) {
      console.error('Failed to add question:', error);
      showToast.error(error.response?.data?.error || 'Failed to add question');
    }
  };

  const resetQuizForm = () => {
    setQuizForm({
      title: '',
      description: '',
      courseId: '',
      lessonId: '',
      timeLimit: '',
      passingScore: ''
    });
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1
    });
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         (filter === 'active' && quiz.isActive) ||
                         (filter === 'inactive' && !quiz.isActive);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quiz Management</h1>
          <p className="text-slate-600 mt-1">Create and manage course quizzes</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Quiz
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
            />
          </div>

          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">{quiz.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{quiz.description}</p>
                </div>

                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  quiz.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {quiz.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-600 mb-4">
                <div className="flex justify-between">
                  <span>Course:</span>
                  <span className="font-medium">{quiz.course?.title || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Questions:</span>
                  <span className="font-medium">{quiz.totalQuestions}</span>
                </div>
                {quiz.timeLimit && (
                  <div className="flex justify-between">
                    <span>Time Limit:</span>
                    <span className="font-medium">{quiz.timeLimit} min</span>
                  </div>
                )}
                {quiz.passingScore && (
                  <div className="flex justify-between">
                    <span>Passing Score:</span>
                    <span className="font-medium">{quiz.passingScore}%</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => loadQuizDetails(quiz.id)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Manage Questions
                </button>
                <button className="px-3 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors">
                  Edit
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Quiz Modal */}
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
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Create New Quiz</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Quiz Title *
                    </label>
                    <input
                      type="text"
                      value={quizForm.title}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                      placeholder="Enter quiz title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Course *
                    </label>
                    <select
                      value={quizForm.courseId}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, courseId: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={quizForm.description}
                    onChange={(e) => setQuizForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none"
                    rows={3}
                    placeholder="Quiz description (optional)"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      value={quizForm.timeLimit}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, timeLimit: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                      placeholder="No limit"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      value={quizForm.passingScore}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, passingScore: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                      placeholder="70"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Lesson ID (Optional)
                    </label>
                    <input
                      type="number"
                      value={quizForm.lessonId}
                      onChange={(e) => setQuizForm(prev => ({ ...prev, lessonId: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                      placeholder="Link to lesson"
                    />
                  </div>
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
                  onClick={createQuiz}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Quiz
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Details Modal */}
      <AnimatePresence>
        {showQuizDetails && selectedQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQuizDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{selectedQuiz.title}</h3>
                    <p className="text-slate-600 mt-1">{selectedQuiz.description}</p>
                  </div>
                  <button
                    onClick={() => setShowQuizDetails(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-semibold text-slate-900">Questions ({questions.length})</h4>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Question
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No questions added yet. Add your first question to get started!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-slate-900">Q{index + 1}.</span>
                              <span className="text-sm text-slate-600 capitalize px-2 py-1 bg-slate-100 rounded">
                                {question.type.replace('_', ' ')}
                              </span>
                              <span className="text-sm text-slate-600">
                                {question.points} point{question.points !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <p className="text-slate-900 mb-3">{question.question}</p>

                            {question.type === 'multiple_choice' && question.options && (
                              <div className="space-y-1">
                                {question.options.map((option, optIndex) => (
                                  <div
                                    key={optIndex}
                                    className={`text-sm p-2 rounded ${
                                      question.correctAnswer === option
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    {option}
                                  </div>
                                ))}
                              </div>
                            )}

                            {question.type === 'true_false' && (
                              <div className="space-y-1">
                                {['True', 'False'].map((option) => (
                                  <div
                                    key={option}
                                    className={`text-sm p-2 rounded ${
                                      question.correctAnswer === option
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    {option}
                                  </div>
                                ))}
                              </div>
                            )}

                            {(question.type === 'short_answer' || question.type === 'essay') && (
                              <div className="text-sm text-slate-600">
                                Correct Answer: {question.correctAnswer}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <button className="p-2 text-slate-400 hover:text-slate-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button className="p-2 text-slate-400 hover:text-red-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 011-1v1M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Question Form */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Add New Question</h4>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                          Question Type
                        </label>
                        <select
                          value={questionForm.type}
                          onChange={(e) => setQuestionForm(prev => ({ ...prev, type: e.target.value as Question['type'] }))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="true_false">True/False</option>
                          <option value="short_answer">Short Answer</option>
                          <option value="essay">Essay</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                          Points
                        </label>
                        <input
                          type="number"
                          value={questionForm.points}
                          onChange={(e) => setQuestionForm(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Question
                      </label>
                      <textarea
                        value={questionForm.question}
                        onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none"
                        rows={3}
                        placeholder="Enter your question"
                      />
                    </div>

                    {questionForm.type === 'multiple_choice' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                          Options
                        </label>
                        <div className="space-y-2">
                          {questionForm.options.map((option, index) => (
                            <input
                              key={index}
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...questionForm.options];
                                newOptions[index] = e.target.value;
                                setQuestionForm(prev => ({ ...prev, options: newOptions }));
                              }}
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                              placeholder={`Option ${index + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Correct Answer
                      </label>
                      {questionForm.type === 'multiple_choice' ? (
                        <select
                          value={questionForm.correctAnswer}
                          onChange={(e) => setQuestionForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                        >
                          <option value="">Select correct option</option>
                          {questionForm.options.map((option, index) => (
                            <option key={index} value={option} disabled={!option.trim()}>
                              {option || `Option ${index + 1}`}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={questionForm.correctAnswer}
                          onChange={(e) => setQuestionForm(prev => ({ ...prev, correctAnswer: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none"
                          placeholder="Enter the correct answer"
                        />
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={addQuestion}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Add Question
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default QuizManagement;
