import React, { useState, useEffect } from 'react';

/**
 * TODO: backend contest/rating endpoints not available yet.
 * All data below is mock/local. This needs backend models and endpoints for:
 * - Contest (daily, domain-scoped, with start/end times)
 * - ContestParticipation (student answers, scoring)
 * - Rating (Elo-style, per student, updated after each contest)
 * - Leaderboard (ranked list per domain)
 */

interface MockContest {
  id: number;
  title: string;
  domain: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: number;
  status: 'upcoming' | 'live' | 'completed';
  questions?: MockQuestion[];
}

interface MockQuestion {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
}

interface MockRating {
  current: number;
  change: number;
  rank: number;
  totalParticipants: number;
}

const MOCK_RATING: MockRating = {
  current: 1247,
  change: +32,
  rank: 14,
  totalParticipants: 156,
};

const MOCK_CONTESTS: MockContest[] = [
  {
    id: 1,
    title: "Daily Science Challenge",
    domain: "Science",
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    startTime: "6:00 PM",
    endTime: "6:30 PM",
    participants: 89,
    status: 'live',
    questions: [
      {
        id: 1,
        text: "Which organelle is known as the 'powerhouse of the cell'?",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
        correctIndex: 1,
      },
      {
        id: 2,
        text: "What is the SI unit of force?",
        options: ["Joule", "Watt", "Newton", "Pascal"],
        correctIndex: 2,
      },
      {
        id: 3,
        text: "Which element has the atomic number 6?",
        options: ["Nitrogen", "Oxygen", "Carbon", "Boron"],
        correctIndex: 2,
      },
      {
        id: 4,
        text: "The process of conversion of solid directly to gas is called?",
        options: ["Evaporation", "Condensation", "Sublimation", "Deposition"],
        correctIndex: 2,
      },
      {
        id: 5,
        text: "Which vitamin is produced when skin is exposed to sunlight?",
        options: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"],
        correctIndex: 3,
      },
    ],
  },
  {
    id: 2,
    title: "Mathematics Sprint",
    domain: "Mathematics",
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    startTime: "7:00 PM",
    endTime: "7:30 PM",
    participants: 64,
    status: 'upcoming',
  },
  {
    id: 3,
    title: "Physics Rapid Fire",
    domain: "Physics",
    date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    startTime: "6:00 PM",
    endTime: "6:30 PM",
    participants: 112,
    status: 'completed',
  },
];

export const Contest: React.FC = () => {
  const [selectedContest, setSelectedContest] = useState<MockContest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 min in seconds

  // Timer for contest
  useEffect(() => {
    if (selectedContest && !submitted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [selectedContest, submitted, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    if (!submitted) {
      setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    }
  };

  const handleSubmitContest = () => {
    setSubmitted(true);
  };

  const getScore = () => {
    if (!selectedContest?.questions) return 0;
    return selectedContest.questions.reduce((acc, q) => {
      return acc + (selectedAnswers[q.id] === q.correctIndex ? 1 : 0);
    }, 0);
  };

  // Contest detail/participation view
  if (selectedContest) {
    const questions = selectedContest.questions || [];
    const currentQ = questions[currentQuestionIndex];

    return (
      <div className="max-w-4xl mx-auto space-y-6">
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
              onClick={() => { setSelectedContest(null); setSubmitted(false); setSelectedAnswers({}); setCurrentQuestionIndex(0); }}
              className="text-xs font-semibold flex items-center gap-1 transition-colors"
              style={{ color: 'var(--brand-text)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to contests
            </button>
            {!submitted && (
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
            {selectedContest.domain} • {selectedContest.date}
          </p>
        </div>

        {/* Results view */}
        {submitted ? (
          <div
            className="p-8 rounded-2xl text-center space-y-6"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-extrabold"
              style={{
                backgroundColor: 'var(--brand-bg)',
                color: 'var(--brand-text)',
                border: '2px solid var(--brand-border)',
              }}
            >
              {getScore()}/{questions.length}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold font-heading" style={{ color: 'var(--text-primary)' }}>
                Contest Complete!
              </h2>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                You scored {getScore()} out of {questions.length} questions correctly.
              </p>
            </div>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-extrabold" style={{ color: 'var(--brand-text)' }}>
                  {MOCK_RATING.current + (getScore() > 3 ? 25 : -10)}
                </div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>New Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold" style={{ color: getScore() > 3 ? 'var(--success-text)' : 'var(--danger-text)' }}>
                  {getScore() > 3 ? '+25' : '-10'}
                </div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Rating Change</div>
              </div>
            </div>
          </div>
        ) : currentQ ? (
          /* Question view */
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-1.5 rounded-full transition-colors"
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
                {currentQ.text}
              </h2>

              <div className="space-y-3">
                {currentQ.options.map((option, idx) => (
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

              <div className="flex justify-between pt-2">
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
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover-lift"
                    style={{ backgroundColor: 'var(--success-text)', boxShadow: 'var(--shadow-sm)' }}
                  >
                    Submit Contest
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
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
                {MOCK_RATING.current}
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: MOCK_RATING.change > 0 ? 'var(--success-text)' : 'var(--danger-text)' }}
              >
                {MOCK_RATING.change > 0 ? '+' : ''}{MOCK_RATING.change}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-4">
            <div className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>#{MOCK_RATING.rank}</div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Rank</div>
          </div>
          <div className="text-center px-4" style={{ borderLeft: '1px solid var(--border-subtle)' }}>
            <div className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{MOCK_RATING.totalParticipants}</div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Players</div>
          </div>
        </div>
      </div>

      {/* Contest Cards */}
      <div className="grid gap-4">
        {MOCK_CONTESTS.map((contest) => {
          const statusColors = {
            live: { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-border)', label: '🔴 LIVE' },
            upcoming: { bg: 'var(--warning-bg)', text: 'var(--warning-text)', border: 'var(--warning-border)', label: '⏳ Upcoming' },
            completed: { bg: 'var(--bg-secondary)', text: 'var(--text-muted)', border: 'var(--border-default)', label: '✓ Completed' },
          };
          const sc = statusColors[contest.status];

          return (
            <div
              key={contest.id}
              className="p-5 rounded-2xl card-hover cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
              }}
              onClick={() => {
                if (contest.status !== 'completed' && contest.questions) {
                  setSelectedContest(contest);
                  setTimeLeft(1800);
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
                    {contest.date} • {contest.startTime} – {contest.endTime}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{contest.participants}</div>
                    <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Participants</div>
                  </div>
                  {contest.status !== 'completed' && contest.questions && (
                    <button
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover-lift"
                      style={{ backgroundColor: 'var(--brand-text)', boxShadow: 'var(--shadow-brand)' }}
                    >
                      {contest.status === 'live' ? 'Join Now' : 'View'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
