import React, { useState, useEffect } from 'react';
import { contestApi, type Contest as ApiContest, type ContestDetail, type RatingData, type ContestSubmitResult } from '../../api/contests';

export const Contest: React.FC = () => {
  const [contests, setContests] = useState<ApiContest[]>([]);
  const [rating, setRating] = useState<RatingData | null>(null);
  
  const [selectedContest, setSelectedContest] = useState<ContestDetail | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<ContestSubmitResult | null>(null);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load contest list and rating on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contestsData, ratingData] = await Promise.all([
          contestApi.listContests(),
          contestApi.getMyRating()
        ]);
        setContests(contestsData);
        setRating(ratingData);
      } catch (error) {
        console.error("Failed to fetch contest data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Timer for active contest
  useEffect(() => {
    if (selectedContest && !submitResult && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && selectedContest && !submitResult && !submitting) {
      // Auto-submit when time is up
      handleSubmitContest();
    }
  }, [selectedContest, submitResult, timeLeft, submitting]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleJoinContest = async (contest: ApiContest) => {
    try {
      setLoading(true);
      const detail = await contestApi.getContestDetail(contest.id);
      setSelectedContest(detail);
      setTimeLeft(contest.duration_minutes * 60);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setSubmitResult(null);
    } catch (error) {
      console.error("Failed to load contest details", error);
      alert("Failed to load contest details");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    if (!submitResult) {
      setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    }
  };

  const handleSubmitContest = async () => {
    if (!selectedContest || submitting) return;
    setSubmitting(true);
    try {
      // Map option index (0,1,2,3) to letter (A,B,C,D)
      const formattedAnswers: Record<string, string> = {};
      Object.entries(selectedAnswers).forEach(([qId, optIdx]) => {
        formattedAnswers[qId] = String.fromCharCode(65 + optIdx);
      });
      
      const result = await contestApi.submitContest(selectedContest.id, formattedAnswers);
      setSubmitResult(result);
      
      // Update rating in header
      setRating(prev => prev ? {
        ...prev,
        current: result.new_rating,
        change: result.rating_change,
      } : null);
      
    } catch (error) {
      console.error("Failed to submit contest", error);
      alert("Failed to submit contest. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreDisplay = () => {
    if (!submitResult) return "0/0";
    return `${submitResult.score}/${submitResult.total}`;
  };

  const handleBackToList = () => {
    setSelectedContest(null);
    setSubmitResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    // Reload contests to update participant counts/status if needed
    contestApi.listContests().then(setContests).catch(console.error);
  };

  if (loading && !selectedContest) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Contest detail/participation view
  if (selectedContest) {
    const questions = selectedContest.questions || [];
    const currentQ = questions[currentQuestionIndex];

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
        {/* Contest Header */}
        <div
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToList}
              className="text-xs font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
              style={{ color: 'var(--brand-text)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to contests
            </button>
            {!submitResult && (
              <div
                className="px-3 py-1.5 rounded-lg text-sm font-bold"
                style={{
                  backgroundColor: timeLeft < 300 ? 'var(--danger-bg)' : 'var(--warning-bg)',
                  color: timeLeft < 300 ? 'var(--danger-text)' : 'var(--warning-text)',
                  border: `1px solid ${timeLeft < 300 ? 'var(--danger-border)' : 'var(--warning-border)'}`,
                }}
              >
                ⏱ {formatTime(timeLeft)}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-extrabold font-heading" style={{ color: 'var(--text-primary)' }}>
            {selectedContest.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {selectedContest.domain} • Duration: {selectedContest.duration_minutes} mins
          </p>
        </div>

        {/* Results view */}
        {submitResult ? (
          <div
            className="p-8 rounded-2xl text-center space-y-6"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-extrabold"
              style={{
                backgroundColor: 'var(--brand-bg)',
                color: 'var(--brand-text)',
                border: '2px solid var(--brand-border)',
              }}
            >
              {getScoreDisplay()}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold font-heading" style={{ color: 'var(--text-primary)' }}>
                Contest Complete!
              </h2>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                You scored {submitResult.score} out of {submitResult.total} questions correctly.
              </p>
            </div>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-extrabold" style={{ color: 'var(--brand-text)' }}>
                  {submitResult.new_rating}
                </div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>New Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold" style={{ color: submitResult.rating_change >= 0 ? 'var(--success-text)' : 'var(--danger-text)' }}>
                  {submitResult.rating_change > 0 ? '+' : ''}{submitResult.rating_change}
                </div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Rating Change</div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
               <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Detailed Results</h3>
               <div className="space-y-4 text-left">
                  {submitResult.detailed_results?.map((res, i) => (
                    <div key={i} className="p-4 rounded-xl border" style={{ 
                      borderColor: res.is_correct ? 'var(--success-border)' : 'var(--danger-border)',
                      backgroundColor: res.is_correct ? 'var(--success-bg)' : 'var(--danger-bg)' 
                    }}>
                      <div className="font-bold flex items-center gap-2 mb-2" style={{ color: res.is_correct ? 'var(--success-text)' : 'var(--danger-text)' }}>
                        {res.is_correct ? '✅ Correct' : '❌ Incorrect'} - Question {i + 1}
                      </div>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                        <strong>Correct Answer:</strong> {res.correct_option}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <strong>Explanation:</strong> {res.explanation}
                      </p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        ) : currentQ ? (
          /* Question view */
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="flex items-center gap-2 flex-wrap">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-1.5 rounded-full transition-colors min-w-[10px]"
                  style={{
                    backgroundColor: idx <= currentQuestionIndex ? 'var(--brand-text)' : 'var(--border-default)',
                  }}
                />
              ))}
            </div>

            <div
              className="p-6 rounded-2xl space-y-5"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>

              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {currentQ.question_text}
              </h2>

              <div className="space-y-3">
                {[currentQ.option_a, currentQ.option_b, currentQ.option_c, currentQ.option_d].map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(currentQ.id, idx)}
                    className="w-full text-left p-4 rounded-xl text-sm font-medium transition-all"
                    style={{
                      backgroundColor: selectedAnswers[currentQ.id] === idx ? 'var(--brand-bg)' : 'var(--bg-secondary)',
                      border: `1px solid ${selectedAnswers[currentQ.id] === idx ? 'var(--brand-border)' : 'var(--border-default)'}`,
                      color: selectedAnswers[currentQ.id] === idx ? 'var(--brand-text)' : 'var(--text-primary)',
                    }}
                  >
                    <span className="font-bold mr-2" style={{ color: 'var(--text-muted)' }}>
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
                  style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                >
                  Previous
                </button>
                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex((i) => i + 1)}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover-lift"
                    style={{ backgroundColor: 'var(--brand-text)', boxShadow: 'var(--shadow-brand)' }}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitContest}
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover-lift disabled:opacity-50"
                    style={{ backgroundColor: 'var(--success-text)', boxShadow: 'var(--shadow-sm)' }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Contest'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
            No questions found for this contest.
          </div>
        )}
      </div>
    );
  }

  // Contest list/landing view
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading" style={{ color: 'var(--text-primary)' }}>
            Daily Contests
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Compete daily, improve your rating, climb the leaderboard.
          </p>
        </div>
      </div>

      {/* Rating Card */}
      {rating && (
        <div
          className="p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--brand-text), #6366f1)',
                boxShadow: 'var(--shadow-brand)',
              }}
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Your Rating
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-heading" style={{ color: 'var(--text-primary)' }}>
                  {rating.current}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: rating.change > 0 ? 'var(--success-text)' : (rating.change < 0 ? 'var(--danger-text)' : 'var(--text-muted)') }}
                >
                  {rating.change > 0 ? '+' : ''}{rating.change}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center px-4">
              <div className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>#{rating.rank}</div>
              <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Rank</div>
            </div>
            <div className="text-center px-4" style={{ borderLeft: '1px solid var(--border-subtle)' }}>
              <div className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{rating.totalParticipants}</div>
              <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Players</div>
            </div>
          </div>
        </div>
      )}

      {/* Contest Cards */}
      <div className="grid gap-4">
        {contests.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-gray-300">
            <p style={{ color: 'var(--text-secondary)' }}>No contests available for your grade.</p>
          </div>
        ) : (
          contests.map((contest) => {
            const statusColors = {
              live: { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-border)', label: '🔴 LIVE' },
              upcoming: { bg: 'var(--warning-bg)', text: 'var(--warning-text)', border: 'var(--warning-border)', label: '⏳ Upcoming' },
              completed: { bg: 'var(--bg-secondary)', text: 'var(--text-muted)', border: 'var(--border-default)', label: '✓ Completed' },
            };
            const sc = statusColors[contest.status] || statusColors.completed;
            const formattedDate = new Date(contest.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            const formattedTime = new Date(contest.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

            return (
              <div
                key={contest.id}
                className={`p-5 rounded-2xl ${contest.status !== 'completed' ? 'card-hover cursor-pointer' : 'opacity-75'}`}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onClick={() => {
                  if (contest.status !== 'completed') {
                    handleJoinContest(contest);
                  }
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase"
                        style={{ backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                      >
                        {sc.label}
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{ backgroundColor: 'var(--brand-bg)', color: 'var(--brand-text)' }}
                      >
                        {contest.domain}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      {contest.title}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      {formattedDate} • {formattedTime} • {contest.duration_minutes} mins
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{contest.participants}</div>
                      <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Participants</div>
                    </div>
                    {contest.status !== 'completed' && (
                      <button
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover-lift"
                        style={{ backgroundColor: 'var(--brand-text)', boxShadow: 'var(--shadow-brand)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinContest(contest);
                        }}
                      >
                        {contest.status === 'live' ? 'Join Now' : 'View'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
