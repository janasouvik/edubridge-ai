import React, { useState, useEffect, useMemo } from 'react';
import { scholarshipsApi } from '../../api/scholarships';
import type { ScholarshipMatch } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const Scholarships: React.FC = () => {
  const [scholarships, setScholarships] = useState<ScholarshipMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMinScore, setFilterMinScore] = useState<number>(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipMatch | null>(null);

  const loadScholarships = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await scholarshipsApi.getMatches();
      setScholarships(data.matches || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch scholarship matches. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScholarships();
  }, []);

  const filteredScholarships = useMemo(() => {
    return scholarships.filter((s) => {
      const matchesScore = s.match_score >= filterMinScore;
      const matchesSearch =
        searchTerm === '' ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesScore && matchesSearch;
    });
  }, [scholarships, filterMinScore, searchTerm]);

  const highMatchCount = useMemo(() => {
    return scholarships.filter((s) => s.match_score >= 80).length;
  }, [scholarships]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div
        className="p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{
                backgroundColor: 'var(--brand-bg)',
                color: 'var(--brand-text)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              🎓
            </div>
            <h1
              className="text-xl sm:text-2xl font-extrabold font-heading"
              style={{ color: 'var(--text-primary)' }}
            >
              Scholarships & Schemes
            </h1>
          </div>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
            Personalized scholarship opportunities matched directly against your grade, domicile, and academic profile.
          </p>
        </div>

        {/* Quick Highlights */}
        {!loading && !error && scholarships.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--brand-text)' }} />
              <span>{scholarships.length} Available Matches</span>
            </div>
            {highMatchCount > 0 && (
              <div
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--success-bg)',
                  border: '1px solid var(--success-border)',
                  color: 'var(--success-text)',
                }}
              >
                <span>🔥 {highMatchCount} Top Fit (&gt;80%)</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        className="p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Search input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by scholarship title, provider or keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          />
          <svg
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--text-muted)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Min Match Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
            Min Match Score:
          </label>
          <select
            value={filterMinScore}
            onChange={(e) => setFilterMinScore(Number(e.target.value))}
            className="px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer transition-all"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          >
            <option value={50}>50% &amp; above (All matches)</option>
            <option value={70}>70% &amp; above (Good matches)</option>
            <option value={85}>85% &amp; above (High priority)</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          className="p-5 rounded-2xl flex items-center justify-between gap-4"
          style={{
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger-text)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={loadScholarships}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--brand-text)' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div
          className="p-16 rounded-2xl flex flex-col items-center justify-center text-center space-y-4"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <LoadingSpinner size="lg" />
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Calculating Eligibility Matches...
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Checking your academic profile against national and state scholarship registries.
            </p>
          </div>
        </div>
      ) : filteredScholarships.length > 0 ? (
        /* Scholarship Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredScholarships.map((s) => {
            const isHighMatch = s.match_score >= 80;
            return (
              <div
                key={s.scholarship_id}
                className="p-6 rounded-2xl flex flex-col justify-between space-y-4 transition-all hover-lift"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div className="space-y-3.5">
                  {/* Card Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase"
                      style={{
                        backgroundColor: isHighMatch ? 'var(--success-bg)' : 'var(--brand-bg)',
                        color: isHighMatch ? 'var(--success-text)' : 'var(--brand-text)',
                        border: isHighMatch ? '1px solid var(--success-border)' : '1px solid var(--brand-border)',
                      }}
                    >
                      {s.match_score}% Match
                    </span>

                    {s.deadline ? (
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-lg"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        Deadline: <strong style={{ color: 'var(--text-primary)' }}>{s.deadline}</strong>
                      </span>
                    ) : (
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-lg"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        Rolling Admissions
                      </span>
                    )}
                  </div>

                  {/* Title and Provider */}
                  <div>
                    <h3
                      className="text-base font-bold font-heading leading-snug"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {s.name}
                    </h3>
                    <p className="text-xs font-medium mt-1" style={{ color: 'var(--brand-text)' }}>
                      🏛️ {s.provider}
                    </p>
                  </div>

                  {/* Description */}
                  {s.description && (
                    <p
                      className="text-xs leading-relaxed line-clamp-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {s.description}
                    </p>
                  )}

                  {/* Eligibility Breakdown */}
                  {s.eligibility_reasons && s.eligibility_reasons.length > 0 && (
                    <div
                      className="p-3.5 rounded-xl space-y-2"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[11px] font-bold uppercase tracking-wider"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Eligibility Checklist
                        </span>
                        <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                          {s.eligibility_reasons.length} criteria
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-xs">
                        {s.eligibility_reasons.slice(0, 3).map((reason, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            <span
                              className="font-bold flex-shrink-0 mt-0.5"
                              style={{ color: reason.includes('NOT') ? 'var(--danger-text)' : 'var(--success-text)' }}
                            >
                              {reason.includes('NOT') ? '✗' : '✓'}
                            </span>
                            <span className="leading-snug">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div
                  className="pt-4 flex items-center justify-between gap-3"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <button
                    onClick={() => setSelectedScholarship(s)}
                    className="text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    style={{ color: 'var(--brand-text)' }}
                  >
                    <span>View Details</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {s.application_url ? (
                    <a
                      href={s.application_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-white font-semibold text-xs rounded-xl shadow-xs transition-all hover-lift"
                      style={{ backgroundColor: 'var(--brand-text)' }}
                    >
                      <span>Apply on Portal</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <span
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Apply via Institute
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div
          className="p-12 rounded-2xl text-center space-y-3"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="text-4xl">🔍</div>
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            No Scholarships Found Matching Criteria
          </h3>
          <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Try lowering the minimum match score threshold or searching for general keywords to view all eligible national schemes.
          </p>
          <button
            onClick={() => {
              setFilterMinScore(50);
              setSearchTerm('');
            }}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--brand-text)' }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Detail Modal Dialog */}
      {selectedScholarship && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(9, 11, 16, 0.65)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setSelectedScholarship(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl p-6 sm:p-7 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="flex items-start justify-between pb-4 gap-4"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase"
                    style={{
                      backgroundColor: 'var(--brand-bg)',
                      color: 'var(--brand-text)',
                    }}
                  >
                    {selectedScholarship.match_score}% Match Score
                  </span>
                  {selectedScholarship.deadline && (
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      Deadline: {selectedScholarship.deadline}
                    </span>
                  )}
                </div>
                <h2
                  className="text-lg sm:text-xl font-extrabold font-heading"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {selectedScholarship.name}
                </h2>
                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--brand-text)' }}>
                  Provided by: {selectedScholarship.provider}
                </p>
              </div>

              <button
                onClick={() => setSelectedScholarship(null)}
                className="p-1.5 rounded-lg transition-colors text-sm font-bold flex-shrink-0"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                }}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                About the Scheme
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {selectedScholarship.description || 'No detailed description provided for this scholarship.'}
              </p>
            </div>

            {/* Eligibility Details */}
            {selectedScholarship.eligibility_reasons && selectedScholarship.eligibility_reasons.length > 0 && (
              <div
                className="p-4 rounded-xl space-y-2.5"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Profile Eligibility Match Analysis
                </h4>
                <ul className="space-y-2 text-xs">
                  {selectedScholarship.eligibility_reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2.5" style={{ color: 'var(--text-secondary)' }}>
                      <span
                        className="font-bold text-sm"
                        style={{ color: reason.includes('NOT') ? 'var(--danger-text)' : 'var(--success-text)' }}
                      >
                        {reason.includes('NOT') ? '✗' : '✓'}
                      </span>
                      <span className="leading-snug pt-0.5">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Application Actions */}
            <div
              className="pt-4 flex items-center justify-end gap-3"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <button
                onClick={() => setSelectedScholarship(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                }}
              >
                Close
              </button>

              {selectedScholarship.application_url ? (
                <a
                  href={selectedScholarship.application_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-white font-semibold text-xs rounded-xl shadow-xs transition-all hover-lift"
                  style={{ backgroundColor: 'var(--brand-text)' }}
                >
                  <span>Go to Official Application Portal</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <span
                  className="px-4 py-2 text-xs font-semibold rounded-xl"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-muted)',
                  }}
                >
                  Apply through your School/College Office
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
