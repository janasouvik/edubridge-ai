import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

export const Landing: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [demoQuestion, setDemoQuestion] = useState('What is photosynthesis?');
  const [demoAnswerShown, setDemoAnswerShown] = useState(true);

  const handleHeroCTA = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* ─── Sticky Header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size="md" showTagline={true} />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#demo" className="hover:text-blue-600 transition-colors">Interactive Demo</a>
            <a href="#scholarships" className="hover:text-blue-600 transition-colors">Scholarships</a>
            <a href="#impact" className="hover:text-blue-600 transition-colors">Our Impact</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'teacher' ? '/dashboard/teacher-insights' : '/dashboard'}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                <span>Go to Dashboard</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full shadow-sm hover:shadow-md shadow-blue-500/20 transition-all"
                >
                  Join Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-blue-400/15 via-indigo-300/10 to-teal-200/10 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-xs font-semibold text-blue-700">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                Connecting Learners. Building Futures.
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Master concepts with{' '}
                <span className="relative inline-block text-blue-600">
                  grounded AI
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-blue-400/60"
                    viewBox="0 0 100 12"
                    preserveAspectRatio="none"
                    fill="none"
                  >
                    <path
                      d="M0,8 Q50,0 100,8"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{' '}
                and verified sources.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Step-by-step explanations in your regional language, adaptive practice that detects learning gaps, and scholarship matching tailored for every student.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={handleHeroCTA}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <span>Start Learning Free</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <a
                  href="#demo"
                  className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-base rounded-full border border-slate-200 shadow-xs transition-all text-center"
                >
                  See Doubt Solver Demo
                </a>
              </div>

              {/* Value indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/60 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">100% Textbook Grounded</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Multilingual Support</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Smart Scholarships</span>
                </div>
              </div>
            </div>

            {/* Right Visual / Hero Card Mockup */}
            <div className="lg:col-span-5 relative flex justify-center">
              {/* Circular Gradient Backdrop */}
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-blue-500/20 via-blue-600/10 to-indigo-500/20 flex items-center justify-center p-6 border border-blue-200/50">
                
                {/* Main Hero Card */}
                <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-5 space-y-3.5 transform hover:scale-[1.02] transition-transform">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        AI
                      </div>
                      <span className="text-xs font-bold text-slate-800">Doubt Solver</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      Grounded
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl text-xs font-medium text-slate-800">
                    "How do plants make food using sunlight?"
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      <span>Chlorophyll absorbs sunlight in leaf chloroplasts.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      <span>CO₂ and H₂O are converted into glucose and O₂.</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-blue-600">NCERT Science Class 10</span>
                    <span className="text-slate-400">96% match</span>
                  </div>
                </div>

                {/* Floating Badge 1: Top Right */}
                <div className="absolute -top-4 -right-4 sm:-right-6 bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2.5 animate-float-slow">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                    🏆
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Verified Citations</div>
                    <div className="text-[10px] text-slate-500">NCERT & OpenStax</div>
                  </div>
                </div>

                {/* Floating Badge 2: Bottom Left */}
                <div className="absolute -bottom-4 -left-4 sm:-left-6 bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2.5 animate-float-slow [animation-delay:2s]">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                    🌐
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">6+ Languages</div>
                    <div className="text-[10px] text-slate-500">Bengali, Hindi, Telugu...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-slate-200/80 py-10" id="impact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
                50,000+
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                Doubts Solved
              </div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 font-heading">
                100%
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                Grounded Answers
              </div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
                8+
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                Active Scholarships
              </div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-heading">
                Free
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                Accessible for Everyone
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Value Props / Features ───────────────────────────────────── */}
      <section className="py-20 bg-slate-50" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Built For Real Learning
            </h2>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 font-heading">
              Everything students and educators need in one platform.
            </p>
            <p className="text-base text-slate-600">
              Powered by Retrieval-Augmented Generation (RAG) and Gemini AI to guarantee factual, curriculum-aligned guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
                📖
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading">
                Grounded Doubt Solver
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Never get hallucinated answers. Every explanation is grounded in NCERT textbooks and verified open educational content, complete with source chapter citations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
                🎯
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading">
                Adaptive Practice
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Smart weakness targeting. The system identifies topics where you struggle and automatically generates practice questions calibrated to your skill level.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl">
                🎓
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading">
                Scholarship Matching
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Discover government and private financial aid. Matches eligibility criteria (grade, state, category) with direct application links and deadlines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Doubt Solver Demo ────────────────────────────── */}
      <section className="py-20 bg-white border-t border-slate-200" id="demo">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Interactive Preview
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-heading">
              Experience the Doubt Solver
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Ask a question and see how EduBridge AI breaks it down step-by-step with real citations.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Input Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={demoQuestion}
                onChange={(e) => setDemoQuestion(e.target.value)}
                placeholder="Ask any educational question..."
                className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
              <button
                onClick={() => setDemoAnswerShown(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Ask AI</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {/* Answer Display */}
            {demoAnswerShown && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">EduBridge AI Tutor</h4>
                      <p className="text-[11px] text-slate-500">Grounded in NCERT Curriculum</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                    Subject: Biology
                  </span>
                </div>

                <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                  <p>
                    <strong>Photosynthesis</strong> is the biological process by which green plants synthesize glucose from carbon dioxide and water using light energy absorbed by chlorophyll.
                  </p>

                  <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                      <div>
                        <strong className="text-slate-900">Light Absorption:</strong> Chlorophyll in chloroplasts absorbs solar radiation.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                      <div>
                        <strong className="text-slate-900">Energy Conversion:</strong> Light energy splits water molecules (H₂O) into hydrogen and oxygen (O₂).
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                      <div>
                        <strong className="text-slate-900">Carbon Fixation:</strong> Carbon dioxide (CO₂) is reduced to form glucose (C₆H₁₂O₆).
                      </div>
                    </div>
                  </div>

                  {/* Formula Box */}
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-center font-mono text-xs sm:text-sm text-emerald-900">
                    6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂
                  </div>
                </div>

                {/* Sources Citation */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Source:</span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                      NCERT Science Class 10 — Chapter 6: Life Processes
                    </span>
                  </div>
                  <Link to="/register" className="text-blue-600 hover:text-blue-800 font-semibold">
                    Ask your own questions →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-300 py-12 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            <div className="space-y-3 md:col-span-2">
              <Logo size="md" theme="light" showTagline={true} taglineText="Connecting Learners. Building Futures." />
              <p className="text-xs text-slate-400 max-w-sm">
                EduBridge AI improves educational equity with grounded, multilingual AI tutoring and personalized practice.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Features
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Doubt Solver</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Adaptive Practice</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Scholarship Matcher</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Teacher Insights</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Student Login</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Teacher Login</Link></li>
                <li><a href="https://ncert.nic.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">NCERT Sources</a></li>
                <li><a href="https://scholarships.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">National Scholarship Portal</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} EduBridge AI. All rights reserved.</p>
            <p className="flex items-center gap-1">
              <span>Made with</span>
              <span className="text-red-500">♥</span>
              <span>for equitable education</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
