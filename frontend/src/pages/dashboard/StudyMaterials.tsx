import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialsApi } from '../../api/materials';
import type { StudyMaterial } from '../../api/materials';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const StudyMaterials: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [activeTab, setActiveTab] = useState<'school' | 'higher_ed'>('school');
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await materialsApi.getMaterials(activeTab);
        setMaterials(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to generate study materials.');
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [activeTab]);

  const filtered = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.topics && m.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesSubject = selectedSubject === 'All' || m.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });
  
  // Extract unique subjects for the filter dropdown
  const uniqueSubjects = ['All', ...Array.from(new Set(materials.map(m => m.subject)))];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <LoadingSpinner size="lg" text="Analyzing your grade & generating dynamic study topics..." />
        <p className="text-sm text-slate-500 animate-pulse">This usually takes about 10-15 seconds...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
              Curriculum Study Materials
            </h1>
            <span className="p-1 bg-blue-50 text-blue-600 rounded-full text-xs">
              📚
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            AI-curated Wikipedia study guides explicitly tailored for your current grade and stream.
          </p>
        </div>
      </div>

      {/* Level Tabs */}
      <div className="flex justify-center max-w-md mx-auto mb-6">
        <div className="bg-slate-100 p-1 rounded-2xl flex w-full shadow-sm border border-slate-200">
          <button
            onClick={() => setActiveTab('school')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'school' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            School (Up to 12th)
          </button>
          <button
            onClick={() => setActiveTab('higher_ed')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'higher_ed' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            Higher Education
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search chapters, topics, concepts..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none"
        >
          {uniqueSubjects.map(sub => (
            <option key={sub} value={sub}>{sub === 'All' ? 'All Subjects' : sub}</option>
          ))}
        </select>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-1 md:col-span-2 text-center p-8 text-slate-500 border border-dashed rounded-2xl">
            No study materials found matching your search.
          </div>
        ) : (
          filtered.map((mat) => (
            <div
              key={mat.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 uppercase">
                    {mat.subject}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{mat.source} Verified</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 font-heading leading-snug">
                  {mat.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {mat.summary}
                </p>

                {/* Topic chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {mat.topics && mat.topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <a
                    href={mat.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wide"
                  >
                    <span>Wikipedia 📖</span>
                  </a>
                  {mat.book_url && (
                    <a
                      href={mat.book_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-wide"
                    >
                      <span>Course Book 📚</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/dashboard/doubt-solver?q=${encodeURIComponent(`Explain the core concepts of ${mat.title} as taught in grade school.`)}`)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors whitespace-nowrap"
                >
                  Ask Doubt with AI →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
