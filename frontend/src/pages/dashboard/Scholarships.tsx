import React, { useState, useEffect } from 'react';
import { scholarshipsApi } from '../../api/scholarships';
import type { ScholarshipMatch } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const Scholarships: React.FC = () => {
  const [scholarships, setScholarships] = useState<ScholarshipMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMinScore, setFilterMinScore] = useState<number>(50);

  useEffect(() => {
    const loadScholarships = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await scholarshipsApi.getMatches();
        setScholarships(data.matches);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch scholarship matches.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadScholarships();
  }, []);

  const filteredScholarships = scholarships.filter(
    (s) => s.match_score >= filterMinScore
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
              Scholarship & Eligibility Matcher
            </h1>
            <span className="p-1 bg-purple-50 text-purple-600 rounded-full text-xs" title="Smart Matching">
              🎓
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Personalized scholarship opportunities matched directly against your grade, domicile, and academic profile.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">Min Match Score:</label>
          <select
            value={filterMinScore}
            onChange={(e) => setFilterMinScore(Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value={50}>50% & above</option>
            <option value={70}>70% & above</option>
            <option value={90}>90% & above</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" text="Matching your profile against national and state scholarships..." />
        </div>
      ) : filteredScholarships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredScholarships.map((s) => (
            <div
              key={s.scholarship_id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-4 hover:border-purple-300 hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                      s.match_score >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {s.match_score}% Match
                  </span>
                  {s.deadline && (
                    <span className="text-xs font-medium text-slate-500">
                      Deadline: <strong className="text-slate-700">{s.deadline}</strong>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading leading-snug">
                    {s.name}
                  </h3>
                  <p className="text-xs font-medium text-blue-600 mt-0.5">
                    Provider: {s.provider}
                  </p>
                </div>

                {s.description && (
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {s.description}
                  </p>
                )}

                {/* Eligibility reasons */}
                {s.eligibility_reasons && s.eligibility_reasons.length > 0 && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Match Breakdown:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {s.eligibility_reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold text-xs mt-0.5">✓</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Verified official scheme</span>
                {s.application_url ? (
                  <a
                    href={s.application_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <span>Apply on Portal</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">Applications Offline</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">No scholarships matching criteria</p>
          <p className="text-xs text-slate-500">Try lowering your minimum match score filter.</p>
        </div>
      )}
    </div>
  );
};
