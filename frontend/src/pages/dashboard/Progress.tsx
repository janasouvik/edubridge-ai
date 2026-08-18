import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Progress: React.FC = () => {
  const { user } = useAuth();

  // Progress metrics
  const [learningGaps] = useState([
    { topic: 'Photosynthesis', subject: 'Biology', confidence: 0.85, status: 'Mastered' },
    { topic: 'Quadratic Equations', subject: 'Mathematics', confidence: 0.42, status: 'Needs Practice' },
    { topic: 'Newton’s Laws of Motion', subject: 'Physics', confidence: 0.70, status: 'Proficient' },
    { topic: 'Probability', subject: 'Mathematics', confidence: 0.35, status: 'Needs Practice' },
    { topic: 'Crop Production & Management', subject: 'Science', confidence: 0.90, status: 'Mastered' },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
              My Learning Progress
            </h1>
            <span className="p-1 bg-blue-50 text-blue-600 rounded-full text-xs">
              📊
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track your mastery across subjects, identify learning gaps, and review your learning streak.
          </p>
        </div>

        <Link
          to="/dashboard/practice"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          Strengthen Weak Topics →
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Learning Streak
          </span>
          <div className="text-2xl font-extrabold text-blue-600 font-heading flex items-center gap-1">
            <span>7 Days</span>
            <span className="text-amber-500 text-base">🔥</span>
          </div>
          <span className="text-[11px] text-slate-500">Active everyday this week</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overall Mastery
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 font-heading">
            64.4%
          </div>
          <span className="text-[11px] text-slate-500">Across 5 tracked topics</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Questions Solved
          </span>
          <div className="text-2xl font-extrabold text-slate-900 font-heading">
            28
          </div>
          <span className="text-[11px] text-slate-500">22 correct on first attempt</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Target Grade
          </span>
          <div className="text-2xl font-extrabold text-purple-600 font-heading">
            Class 10
          </div>
          <span className="text-[11px] text-slate-500">{user?.name || 'Student'}</span>
        </div>
      </div>

      {/* Topic Confidence Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 font-heading">
            Topic Mastery & Confidence Score
          </h2>
          <span className="text-xs text-slate-400">Updated automatically with every quiz attempt</span>
        </div>

        <div className="space-y-4">
          {learningGaps.map((gap, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 hover:bg-slate-100/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase text-blue-600">
                    {gap.subject}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {gap.topic}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      gap.confidence >= 0.75
                        ? 'bg-emerald-100 text-emerald-800'
                        : gap.confidence >= 0.5
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {gap.status}
                  </span>
                  <span className="text-sm font-extrabold text-slate-800 font-heading w-12 text-right">
                    {Math.round(gap.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    gap.confidence >= 0.75
                      ? 'bg-emerald-500'
                      : gap.confidence >= 0.5
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${gap.confidence * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
