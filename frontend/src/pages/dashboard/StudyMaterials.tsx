import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const StudyMaterials: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const materials = [
    {
      id: 1,
      title: 'NCERT Science Class 10 — Life Processes: Photosynthesis & Respiration',
      source: 'NCERT',
      subject: 'Biology',
      chapter: 'Chapter 6: Life Processes',
      url: 'https://ncert.nic.in/textbook.php?jesc1=0-16',
      summary: 'Detailed explanation of nutrition in green plants, chlorophyll absorption, stomata gas exchange, and chemical formulas.',
      topics: ['Photosynthesis', 'Autotrophic Nutrition', 'Guard Cells'],
    },
    {
      id: 2,
      title: 'NCERT Mathematics Class 10 — Quadratic Equations',
      source: 'NCERT',
      subject: 'Mathematics',
      chapter: 'Chapter 4: Quadratic Equations',
      url: 'https://ncert.nic.in/textbook.php?jemh1=0-15',
      summary: 'Standard forms ax² + bx + c = 0, discriminant D = b² - 4ac, nature of roots, and quadratic formula.',
      topics: ['Discriminant', 'Nature of Roots', 'Factorisation'],
    },
    {
      id: 3,
      title: 'NCERT Mathematics Class 10 — Probability',
      source: 'NCERT',
      subject: 'Mathematics',
      chapter: 'Chapter 15: Probability',
      url: 'https://ncert.nic.in/textbook.php?jemh1=0-15',
      summary: 'Theoretical probability, event outcomes, complementary events P(E) + P(not E) = 1, dice and coin problems.',
      topics: ['Empirical Probability', 'Favourable Outcomes', 'Dice Problems'],
    },
    {
      id: 4,
      title: 'NCERT Science Class 10 — Newton’s Laws of Motion & Momentum',
      source: 'NCERT',
      subject: 'Physics',
      chapter: 'Chapter 9: Force and Laws of Motion',
      url: 'https://ncert.nic.in/textbook.php?jesc1=0-16',
      summary: 'Inertia, F = ma, action-reaction pairs, momentum conservation and practical everyday applications.',
      topics: ['Law of Inertia', 'F = ma', 'Action & Reaction'],
    },
    {
      id: 5,
      title: 'NCERT Science Class 8 — Crop Production and Management',
      source: 'NCERT',
      subject: 'Science',
      chapter: 'Chapter 1: Agricultural Practices',
      url: 'https://ncert.nic.in/textbook.php?hesc1=0-6',
      summary: 'Kharif vs Rabi crops, soil preparation, ploughing, irrigation methods (drip and sprinkler), and manures.',
      topics: ['Kharif & Rabi', 'Drip Irrigation', 'Harvesting'],
    },
  ];

  const filtered = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'All' || m.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            Verified NCERT chapters and textbooks indexed in our grounded RAG knowledge base.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
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
          <option value="All">All Subjects</option>
          <option value="Biology">Biology</option>
          <option value="Physics">Physics</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Science">Science</option>
        </select>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((mat) => (
          <div
            key={mat.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 uppercase">
                  {mat.subject}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{mat.source} Verified</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 font-heading leading-snug">
                {mat.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {mat.summary}
              </p>

              {/* Topic chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {mat.topics.map((t, idx) => (
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
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href={mat.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                <span>Read NCERT Book</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              <button
                onClick={() => navigate(`/dashboard/doubt-solver?q=${encodeURIComponent(`Explain key concepts in ${mat.chapter}`)}`)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Ask Doubt with Source →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
