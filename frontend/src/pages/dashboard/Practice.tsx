import React, { useState, useEffect } from 'react';
import { practiceApi } from '../../api/practice';
import type { PracticeQuestion, PracticeResult } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const Practice: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState(0);

  const fetchNextQuestion = async () => {
    setError(null);
    setResult(null);
    setUserAnswer('');
    setLoading(true);

    try {
      const q = await practiceApi.getNextQuestion();
      setCurrentQuestion(q);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch practice question.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextQuestion();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || !userAnswer.trim()) return;

    setError(null);
    setSubmitting(true);

    try {
      const res = await practiceApi.submitAnswer({
        question_id: currentQuestion.question_id,
        answer: userAnswer.trim(),
      });

      setResult(res);
      if (res.correct) {
        setStreakCount((prev) => prev + 1);
      } else {
        setStreakCount(0);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to submit answer.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
              Adaptive Practice Generator
            </h1>
            <span className="p-1 bg-emerald-50 text-emerald-600 rounded-full text-xs" title="Adaptive Difficulty">
              🎯
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Questions automatically target your learning gaps and adjust difficulty based on performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-center gap-1.5">
            <span>🔥 Streak:</span>
            <span>{streakCount} in a row</span>
          </div>

          <button
            onClick={fetchNextQuestion}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
          >
            Skip Question
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold">×</button>
        </div>
      )}

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" text="Analyzing learning gaps and generating custom question..." />
        </div>
      ) : currentQuestion ? (
        <div className="space-y-6">
          {/* Question Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg uppercase">
                  {currentQuestion.subject}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg">
                  Topic: {currentQuestion.topic}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Difficulty:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    currentQuestion.difficulty === 'easy'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentQuestion.difficulty === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Question #{currentQuestion.question_id}
              </span>
              <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            {/* Answer Form (if not yet submitted) */}
            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div>
                  <label htmlFor="answer" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Answer
                  </label>
                  <input
                    id="answer"
                    type="text"
                    required
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !userAnswer.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-xs shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2"
                  >
                    {submitting ? <LoadingSpinner size="sm" /> : <span>Submit Answer</span>}
                  </button>
                </div>
              </form>
            ) : (
              /* Answer Result & Explanation */
              <div
                className={`p-6 rounded-2xl border space-y-4 ${
                  result.correct
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-red-50/70 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{result.correct ? '🎉' : '💡'}</span>
                    <div>
                      <h3
                        className={`text-base font-bold ${
                          result.correct ? 'text-emerald-900' : 'text-red-900'
                        }`}
                      >
                        {result.correct ? 'Correct Answer!' : 'Not quite right'}
                      </h3>
                      <p className="text-xs text-slate-600">
                        Topic: <strong className="text-slate-900">{result.topic}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-500 block">
                      Topic Confidence:
                    </span>
                    <span className="text-base font-extrabold text-blue-600 font-heading">
                      {Math.round(result.updated_confidence * 100)}%
                    </span>
                  </div>
                </div>

                {!result.correct && (
                  <div className="bg-white/80 p-3 rounded-xl border border-red-200 text-xs sm:text-sm text-slate-800">
                    <strong>Correct Answer:</strong> {result.correct_answer}
                  </div>
                )}

                <div className="bg-white/90 p-4 rounded-xl border border-slate-200 space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Explanation
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {result.explanation}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={fetchNextQuestion}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <span>Next Adaptive Question</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <p className="text-sm text-slate-600">No questions available right now.</p>
          <button
            onClick={fetchNextQuestion}
            className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
