import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { practiceApi } from '../../api/practice';
import type { PracticeQuestion } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const ArrowIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const ChatIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const TargetIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17a5 5 0 100-10 5 5 0 000 10zM12 13a1 1 0 100-2 1 1 0 000 2z" />
  </svg>
);

const ContestIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const InsightIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6m4 6V7m4 10v-4M4 19h16" />
  </svg>
);

const difficultyStyles: Record<PracticeQuestion['difficulty'], { bg: string; text: string; border: string }> = {
  easy: { bg: 'var(--success-bg)', text: 'var(--success-text)', border: 'var(--success-border)' },
  medium: { bg: 'var(--warning-bg)', text: 'var(--warning-text)', border: 'var(--warning-border)' },
  hard: { bg: 'var(--danger-bg)', text: 'var(--danger-text)', border: 'var(--danger-border)' },
};

export const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [nextQuestion, setNextQuestion] = useState<PracticeQuestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      if (isTeacher) {
        setLoading(false);
        return;
      }

      try {
        const qRes = await practiceApi.getNextQuestion();
        setNextQuestion(qRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [isTeacher]);

  const firstName = useMemo(() => user?.name?.split(' ')[0] || 'Learner', [user?.name]);

  const actionCards = [
    {
      title: 'Grounded Doubt Solver',
      description: 'Work through confusing topics with step-by-step answers and textbook citations.',
      href: '/dashboard/doubt-solver',
      cta: 'Solve a doubt',
      icon: <ChatIcon />,
      accentBg: 'var(--brand-bg)',
      accentText: 'var(--brand-text)',
      accentBorder: 'var(--brand-border)',
    },
    {
      title: 'Adaptive Practice',
      description: 'Practice questions tuned to the concepts that need the most attention.',
      href: '/dashboard/practice',
      cta: 'Start practice',
      icon: <TargetIcon />,
      accentBg: 'var(--success-bg)',
      accentText: 'var(--success-text)',
      accentBorder: 'var(--success-border)',
    },
    {
      title: 'Daily Contest',
      description: 'Compete in daily domain challenges. Boost your rating and climb the leaderboard.',
      href: '/dashboard/contest',
      cta: 'Join contest',
      icon: <ContestIcon />,
      accentBg: 'rgba(245, 158, 11, 0.1)',
      accentText: 'var(--warning-text)',
      accentBorder: 'var(--warning-border)',
    },
  ];

  if (isTeacher) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8 animate-fade-up">
        <section
          className="overflow-hidden rounded-[1.75rem]"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="grid gap-0 lg:grid-cols-[1.45fr_0.9fr]">
            <div
              className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10"
              style={{
                backgroundColor: 'var(--bg-elevated)',
              }}
            >
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
                style={{
                  backgroundColor: 'var(--brand-bg)',
                  border: '1px solid var(--brand-border)',
                  color: 'var(--brand-text)',
                }}
              >
                Educator Portal
              </div>
              <h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
                Welcome, {user?.name || 'Teacher'}.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                Track class comprehension, spot repeated mistakes, and move quickly from insight to intervention.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/dashboard/teacher-insights"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--brand-text)',
                    boxShadow: 'var(--shadow-brand)',
                  }}
                >
                  View Class Insights
                  <ArrowIcon />
                </Link>
              </div>
            </div>

            <div className="grid gap-px sm:grid-cols-3 lg:grid-cols-1" style={{ backgroundColor: 'var(--border-default)' }}>
              {[
                ['Class Pulse', 'Live overview', 'Monitor accuracy and risk shifts.'],
                ['Interventions', 'Suggested next steps', 'Prioritize students who need help.'],
                ['Weak Topics', 'Pattern detection', 'See what the class is missing.'],
              ].map(([label, value, text]) => (
                <div key={label} className="p-5 sm:p-6" style={{ backgroundColor: 'var(--bg-surface)' }}>
                  <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <p className="mt-2 text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                  <p className="mt-1 text-xs leading-5" style={{ color: 'var(--text-muted)' }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ['Review flagged students', 'Open the risk list before your next class check-in.'],
            ['Plan small groups', 'Group learners by weak topic instead of overall score.'],
            ['Share practice', 'Send targeted practice after resolving a repeated misconception.'],
          ].map(([title, text]) => (
            <div
              key={title}
              className="rounded-2xl p-5 card-hover"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'var(--brand-bg)', color: 'var(--brand-text)', border: '1px solid var(--brand-border)' }}
              >
                <InsightIcon />
              </div>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
              <p className="mt-2 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{text}</p>
            </div>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8 animate-fade-up">
      {/* Hero banner */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
        <div
          className="relative overflow-hidden rounded-[1.75rem] p-5 sm:p-8 lg:p-10"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="relative z-10 max-w-3xl">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{
                backgroundColor: 'var(--brand-bg)',
                border: '1px solid var(--brand-border)',
                color: 'var(--brand-text)',
              }}
            >
              Dashboard
            </div>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl" style={{ color: 'var(--text-primary)' }}>
              Ready for today's learning, {firstName}?
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              Jump into a grounded explanation, continue adaptive practice, or compete in today's contest.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/dashboard/doubt-solver"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 focus:outline-none focus-ring hover-lift"
                style={{
                  backgroundColor: 'var(--brand-text)',
                  boxShadow: 'var(--shadow-brand)',
                }}
              >
                Ask a Doubt
                <ArrowIcon />
              </Link>
              <Link
                to="/dashboard/practice"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border px-5 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 focus:outline-none focus-ring hover-lift"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              >
                Start Practice Session
              </Link>
            </div>
          </div>
          <div
            className="absolute right-0 top-0 h-full w-1/2 pointer-events-none opacity-60"
            style={{
              background: 'radial-gradient(circle at 70% 35%, var(--brand-glow), transparent 60%), radial-gradient(circle at 45% 75%, rgba(16,185,129,0.15), transparent 50%)',
            }}
          />
        </div>

        <aside
          className="rounded-[1.75rem] p-5 sm:p-6"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>Today's Focus</p>
              <h2 className="mt-2 text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Keep momentum high</h2>
            </div>
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)', border: '1px solid var(--warning-border)' }}
            >
              <TargetIcon />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              ['7', 'day streak'],
              ['1247', 'rating'],
              ['1', 'next task'],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl px-3 py-4 text-center"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
              >
                <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                <p className="mt-1 text-[11px] font-semibold leading-4" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>

          <div
            className="mt-6 rounded-2xl p-4"
            style={{ backgroundColor: 'var(--brand-bg)', border: '1px solid var(--brand-border)' }}
          >
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Recommended next step</p>
            <p className="mt-1 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
              Answer one adaptive question, then join today's daily contest.
            </p>
          </div>
        </aside>
      </section>

      {/* Action Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        {actionCards.map((card, index) => (
          <Link
            key={card.title}
            to={card.href}
            className={`group rounded-2xl p-5 transition-all card-hover focus:outline-none focus-ring animate-fade-up stagger-${index + 1}`}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="flex min-h-full flex-col">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: card.accentBg, color: card.accentText, border: `1px solid ${card.accentBorder}` }}
              >
                {card.icon}
              </div>
              <h2 className="mt-4 text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>{card.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>{card.description}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold transition-colors" style={{ color: 'var(--text-primary)' }}>
                {card.cta}
                <ArrowIcon />
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* Practice Queue */}
      <section>
        <div
          className="rounded-[1.5rem] p-5 sm:p-6"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-muted)' }}>Practice Queue</p>
              <h2 className="mt-1 text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Next recommended question</h2>
            </div>
            <Link
              to="/dashboard/practice"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors"
              style={{
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
              }}
            >
              Go to practice
              <ArrowIcon />
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-56 items-center justify-center">
              <LoadingSpinner size="sm" text="Loading practice question..." />
            </div>
          ) : nextQuestion ? (
            <div className="pt-5">
              <div className="flex flex-wrap gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold uppercase"
                  style={{ backgroundColor: 'var(--brand-bg)', color: 'var(--brand-text)', border: `1px solid var(--brand-border)` }}
                >
                  {nextQuestion.subject}
                </span>
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                >
                  {nextQuestion.topic}
                </span>
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold uppercase"
                  style={{
                    backgroundColor: difficultyStyles[nextQuestion.difficulty].bg,
                    color: difficultyStyles[nextQuestion.difficulty].text,
                    border: `1px solid ${difficultyStyles[nextQuestion.difficulty].border}`,
                  }}
                >
                  {nextQuestion.difficulty}
                </span>
              </div>

              <div
                className="mt-5 rounded-2xl p-4 sm:p-5"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
              >
                <p className="text-base font-semibold leading-7" style={{ color: 'var(--text-primary)' }}>{nextQuestion.question}</p>
              </div>

              <Link
                to="/dashboard/practice"
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 focus:outline-none focus-ring"
                style={{
                  backgroundColor: 'var(--brand-text)',
                  boxShadow: 'var(--shadow-brand)',
                }}
              >
                Answer this question
                <ArrowIcon />
              </Link>
            </div>
          ) : (
            <div
              className="flex min-h-56 flex-col items-center justify-center rounded-2xl px-4 py-8 text-center"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
            >
              <h3 className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>No pending questions</h3>
              <p className="mt-2 max-w-sm text-sm leading-6" style={{ color: 'var(--text-secondary)' }}>
                Generate a fresh adaptive question when you are ready for another round.
              </p>
              <Link
                to="/dashboard/practice"
                className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-colors"
                style={{ backgroundColor: 'var(--brand-text)' }}
              >
                Generate Question
                <ArrowIcon />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
