import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { quizAPI } from '../api/api';
import { useThemeStore } from '../store/themeStore';
import { showToast } from '../utils/toast';

interface Question {
  id: number;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  timeLimit?: number;
  totalQuestions: number;
  passingScore?: number;
  questions: Question[];
}

interface QuizAttempt {
  id: number;
  quizId: number;
  answers: Record<number, any>;
  score?: number;
  passed?: boolean;
  timeSpent: number;
  completedAt?: string;
}

interface QuizResult {
  attempt: QuizAttempt;
  quiz: Quiz;
  score: number;
  passed: boolean;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
}

function Quiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [timeLeft]);

  const loadQuiz = async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      const [quizResponse, attemptResponse] = await Promise.all([
        quizAPI.getQuiz(quizId),
        quizAPI.startAttempt(quizId).catch(() => null)
      ]);

      const quizData = quizResponse.data;
      setQuiz(quizData);

      if (quizData.timeLimit) {
        setTimeLeft(quizData.timeLimit * 60); // Convert minutes to seconds
      }

      if (attemptResponse) {
        setAttempt(attemptResponse.data);
        setAnswers(attemptResponse.data.answers || {});
      }

      setStartTime(Date.now());
    } catch (error: any) {
      console.error('Failed to load quiz:', error);
      showToast.error(error.response?.data?.error || 'Failed to load quiz');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !attempt) return;

    try {
      setSubmitting(true);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const submitData = {
        answers,
        timeSpent
      };

      const response = await quizAPI.submitAttempt(String(attempt.id), submitData);
      const resultData = response.data;

      setResults(resultData);
      setShowResults(true);
      showToast.success('Quiz submitted successfully!');
    } catch (error: any) {
      console.error('Failed to submit quiz:', error);
      showToast.error(error.response?.data?.error || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-secondary">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-2">Quiz Not Found</h2>
          <p className="text-secondary mb-6">The quiz you're looking for doesn't exist.</p>
          <Link to="/my-courses" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    const scorePercentage = Math.round((results.score / results.quiz.questions.reduce((sum, q) => sum + q.points, 0)) * 100);
    const passed = results.passed;

    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            {/* Header */}
            <div className={`px-8 py-6 ${passed ? 'bg-green-50 border-b border-green-200' : 'bg-red-50 border-b border-red-200'}`}>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  passed ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {passed ? (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-primary mb-2">Quiz Complete!</h1>
                <p className={`text-lg ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {passed ? 'Congratulations! You passed the quiz.' : 'You didn\'t pass this time. Keep learning!'}
                </p>
              </div>
            </div>

            {/* Results */}
            <div className="px-8 py-6">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{scorePercentage}%</div>
                  <div className="text-sm text-secondary">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {results.correctAnswers}/{results.totalQuestions}
                  </div>
                  <div className="text-sm text-secondary">Correct Answers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{formatTime(results.timeSpent)}</div>
                  <div className="text-sm text-secondary">Time Spent</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-secondary mb-2">
                  <span>Progress</span>
                  <span>{scorePercentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(scorePercentage)}`}
                    style={{ width: `${scorePercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/my-courses"
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Back to Courses
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(answers).length;
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-lg font-semibold text-primary">{quiz.title}</h1>
              <p className="text-sm text-secondary">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <div className={`px-3 py-1 rounded-lg font-mono text-sm ${
                  timeLeft < 300 ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {formatTime(timeLeft)}
                </div>
              )}

              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-secondary hover:text-primary transition-colors"
              >
                Exit Quiz
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pb-4">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-secondary mt-2">
              <span>{answeredQuestions} answered</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Questions Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-4 sticky top-24">
              <h3 className="font-semibold text-primary mb-4">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                {quiz.questions.map((question, index) => {
                  const isAnswered = answers[question.id] !== undefined;
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`aspect-square rounded-lg border-2 text-sm font-medium transition-all ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : isAnswered
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-border hover:border-primary/50 text-secondary'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card rounded-xl border border-border p-8"
              >
                {/* Question */}
                <div className="mb-8">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-semibold text-primary pr-4">
                      {currentQuestion.question}
                    </h2>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex-shrink-0">
                      {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-4">
                    {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name={`question-${currentQuestion.id}`}
                              value={option}
                              checked={answers[currentQuestion.id] === option}
                              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-primary">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {currentQuestion.type === 'true_false' && (
                      <div className="space-y-3">
                        {['True', 'False'].map((option) => (
                          <label key={option} className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name={`question-${currentQuestion.id}`}
                              value={option}
                              checked={answers[currentQuestion.id] === option}
                              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-primary">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {(currentQuestion.type === 'short_answer' || currentQuestion.type === 'essay') && (
                      <div>
                        <textarea
                          value={answers[currentQuestion.id] || ''}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          placeholder={currentQuestion.type === 'short_answer' ? 'Enter your answer...' : 'Write your detailed answer...'}
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none"
                          rows={currentQuestion.type === 'essay' ? 6 : 3}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <div className="text-sm text-slate-600">
                    {currentQuestionIndex + 1} of {quiz.questions.length}
                  </div>

                  {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={submitting}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Next
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
