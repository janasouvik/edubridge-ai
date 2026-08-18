import React, { useState, useEffect } from 'react';
import { teacherApi } from '../../api/teacher';
import type { TeacherInsights as TeacherInsightsType } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const TeacherInsights: React.FC = () => {
  const [insights, setInsights] = useState<TeacherInsightsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium'>('all');

  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await teacherApi.getInsights();
        setInsights(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch teacher insights.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  const filteredStudents = insights?.flagged_students.filter((s) => {
    if (riskFilter === 'all') return true;
    return s.risk_level === riskFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
              Teacher Insight & Intervention Agent
            </h1>
            <span className="p-1 bg-blue-50 text-blue-600 rounded-full text-xs" title="Analytics & Interventions">
              👩‍🏫
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automated class analytics, student risk flagging, and personalized intervention guidance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter Risk:</span>
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setRiskFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                riskFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRiskFilter('high')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                riskFilter === 'high' ? 'bg-red-500 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              High Risk
            </button>
            <button
              onClick={() => setRiskFilter('medium')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                riskFilter === 'medium' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              Medium Risk
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" text="Running analytics across student attempts and generating pedagogical recommendations..." />
        </div>
      ) : insights ? (
        <div className="space-y-8">
          {/* Class Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Enrolled Students
              </span>
              <div className="text-3xl font-extrabold text-slate-900 font-heading">
                {insights.class_summary.total_students}
              </div>
              <span className="text-[11px] text-slate-400">Class 10 Section A</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Students Needing Attention
              </span>
              <div className="text-3xl font-extrabold text-red-600 font-heading">
                {insights.class_summary.students_needing_attention}
              </div>
              <span className="text-[11px] text-red-500 font-medium">Flagged for intervention</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Class Average Accuracy
              </span>
              <div className="text-3xl font-extrabold text-blue-600 font-heading">
                {insights.class_summary.average_accuracy}%
              </div>
              <span className="text-[11px] text-slate-400">Based on recent practice quizzes</span>
            </div>
          </div>

          {/* Flagged Students Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 font-heading">
                Flagged Students & Recommendations
              </h2>
              <span className="text-xs text-slate-500">
                Showing {filteredStudents?.length || 0} student(s)
              </span>
            </div>

            {filteredStudents && filteredStudents.length > 0 ? (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div
                    key={student.student_id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-sm">
                          {student.student_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            {student.student_name}
                          </h3>
                          <span className="text-[11px] text-slate-400">
                            Student ID: #{student.student_id}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block">Accuracy:</span>
                          <span className="text-sm font-extrabold text-slate-800 font-heading">
                            {student.accuracy}%
                          </span>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            student.risk_level === 'high'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {student.risk_level} Risk
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Weak Topics */}
                      <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <span className="font-bold uppercase tracking-wider text-slate-500 block">
                          Identified Weak Topics:
                        </span>
                        {student.weak_topics && student.weak_topics.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {student.weak_topics.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-red-50 text-red-700 font-semibold rounded-lg border border-red-200"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">General revision required</span>
                        )}
                        <p className="text-slate-500 pt-1">
                          <strong>Reason:</strong> {student.reason}
                        </p>
                      </div>

                      {/* AI Recommendation */}
                      <div className="space-y-1.5 bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-1.5 text-blue-700 font-bold uppercase tracking-wider">
                          <span>✨</span>
                          <span>AI Recommendation:</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed pt-0.5">
                          {student.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No students flagged in this category.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
