import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { practiceApi } from '../../api/practice';
import { scholarshipsApi } from '../../api/scholarships';
import type { PracticeQuestion, ScholarshipMatch } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [nextQuestion, setNextQuestion] = useState<PracticeQuestion | null>(null);
  const [scholarships, setScholarships] = useState<ScholarshipMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      if (isTeacher) {
        setLoading(false);
        return;
      }

      try {
        const [qRes, sRes] = await Promise.allSettled([
          practiceApi.getNextQuestion(),
          scholarshipsApi.getMatches(),
        ]);

        if (qRes.status === 'fulfilled') {
          setNextQuestion(qRes.value);
        }
        if (sRes.status === 'fulfilled') {
          setScholarships(sRes.value.matches.slice(0, 2));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [isTeacher]);

  if (isTeacher) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider">
              Educator Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
              Welcome, {user?.name}!
            </h1>
            <p className="text-blue-100 text-sm">
              Track student comprehension, identify repeated mistakes, and get AI-assisted intervention recommendations.
            </p>
          </div>
          <Link
            to="/dashboard/teacher-insights"
            className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm rounded-xl shadow-sm transition-colors whitespace-nowrap"
          >
            View Class Insights →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-full text-xs font-semibold">
            <span>✨ Welcome back, {user?.name || 'Learner'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            What would you like to master today?
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm">
            Ask any doubt to receive step-by-step grounded textbook explanations, or practice tailored questions.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/dashboard/doubt-solver"
              className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <span>Ask a Doubt</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              to="/dashboard/practice"
              className="px-5 py-2.5 bg-blue-800/60 hover:bg-blue-800/80 text-white text-xs sm:text-sm font-semibold rounded-xl border border-blue-400/30 transition-all"
            >
              Start Practice Session
            </Link>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-blue-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            💬
          </div>
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Grounded Doubt Solver
          </h3>
          <p className="text-xs text-slate-600">
            Get step-by-step answers with exact citations from NCERT textbooks.
          </p>
          <Link
            to="/dashboard/doubt-solver"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 pt-1"
          >
            Solve a doubt →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-emerald-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            🎯
          </div>
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Adaptive Practice
          </h3>
          <p className="text-xs text-slate-600">
            Questions generated according to your demonstrated learning gaps.
          </p>
          <Link
            to="/dashboard/practice"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-800 pt-1"
          >
            Practice now →
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-purple-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
            🎓
          </div>
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Scholarship Matcher
          </h3>
          <p className="text-xs text-slate-600">
            Find government and private scholarships matching your profile.
          </p>
          <Link
            to="/dashboard/scholarships"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-800 pt-1"
          >
            View matches →
          </Link>
        </div>
      </div>

      {/* Dynamic Content Section: Next Practice & Top Scholarships */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Practice Question Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 font-heading">
              🎯 Next Recommended Question
            </h2>
            <Link to="/dashboard/practice" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Go to practice →
            </Link>
          </div>

          {loading ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner size="sm" text="Loading practice question..." />
            </div>
          ) : nextQuestion ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 uppercase">
                  {nextQuestion.subject}
                </span>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                  Topic: {nextQuestion.topic}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                  {nextQuestion.difficulty}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {nextQuestion.question}
              </p>

              <Link
                to="/dashboard/practice"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
              >
                <span>Answer this question</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500">
              No pending questions. Click below to generate your next adaptive practice question.
              <div className="mt-3">
                <Link to="/dashboard/practice" className="text-blue-600 font-bold">Generate Question →</Link>
              </div>
            </div>
          )}
        </div>

        {/* Matched Scholarships Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 font-heading">
              🎓 Top Scholarships
            </h2>
            <Link to="/dashboard/scholarships" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner size="sm" text="Loading matches..." />
            </div>
          ) : scholarships.length > 0 ? (
            <div className="space-y-3">
              {scholarships.map((s) => (
                <div key={s.scholarship_id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {s.match_score}% Match
                    </span>
                    {s.deadline && (
                      <span className="text-[10px] text-slate-400">
                        Due: {s.deadline}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                    {s.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {s.provider}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500">
              Check your eligibility to view matched scholarships.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
