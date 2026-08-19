import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

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
    <div className="min-h-screen flex flex-col font-sans landing-gradient" style={{ color: 'var(--text-primary)' }}>
      {/* ─── Sticky Header ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'var(--border-default)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size="md" showTagline={true} />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <a href="#features" className="hover:opacity-80 transition-opacity">Features</a>
            <a href="#demo" className="hover:opacity-80 transition-opacity">Interactive Demo</a>
            <a href="#impact" className="hover:opacity-80 transition-opacity">Our Impact</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                to={user?.role === 'teacher' ? '/dashboard/teacher-insights' : '/dashboard'}
                className="px-5 py-2.5 text-sm font-semibold rounded-full transition-all flex items-center gap-2 hover-lift"
                style={{
                  backgroundColor: 'var(--brand-text)',
                  color: 'var(--text-on-brand)',
                  boxShadow: 'var(--shadow-brand)',
                }}
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
                  className="px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-semibold rounded-full transition-all hover-lift"
                  style={{
                    backgroundColor: 'var(--brand-text)',
                    color: 'var(--text-on-brand)',
                    boxShadow: 'var(--shadow-brand)',
                  }}
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
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] blur-3xl rounded-full pointer-events-none -z-10"
          style={{ background: 'radial-gradient(ellipse, var(--brand-glow), transparent 70%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6 animate-fade-up">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--brand-bg)',
                  border: '1px solid var(--brand-border)',
                  color: 'var(--brand-text)',
                }}
              >
                <span className="flex h-2 w-2 rounded-full animate-pulse-subtle" style={{ backgroundColor: 'var(--brand-text)' }} />
                Connecting Learners. Building Futures.
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]" style={{ color: 'var(--text-primary)' }}>
                Master concepts with{' '}
                <span className="relative inline-block" style={{ color: 'var(--brand-text)' }}>
                  grounded AI
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3"
                    viewBox="0 0 100 12"
                    preserveAspectRatio="none"
                    fill="none"
                    style={{ color: 'var(--brand-text)', opacity: 0.4 }}
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

              <p className="text-lg sm:text-xl max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Step-by-step explanations in your regional language, adaptive practice that detects learning gaps, and daily contests to sharpen your skills.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={handleHeroCTA}
                  className="w-full sm:w-auto px-8 py-4 font-semibold text-base rounded-full transition-all cursor-pointer flex items-center justify-center gap-2.5 hover-lift"
                  style={{
                    backgroundColor: 'var(--brand-text)',
                    color: 'var(--text-on-brand)',
                    boxShadow: 'var(--shadow-brand)',
                  }}
                >
                  <span>Start Learning Free</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <a
                  href="#demo"
                  className="w-full sm:w-auto px-7 py-4 font-semibold text-base rounded-full border text-center transition-all hover-lift"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-secondary)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  See Doubt Solver Demo
                </a>
              </div>

              {/* Value indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 text-left" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                {[
                  { label: '100% Textbook Grounded', color: 'var(--brand-text)', bg: 'var(--brand-bg)' },
                  { label: 'Multilingual Support', color: 'var(--success-text)', bg: 'var(--success-bg)' },
                  { label: 'Daily Contests', color: 'var(--warning-text)', bg: 'var(--warning-bg)' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: item.bg, color: item.color }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual / Hero Card Mockup */}
            <div className="lg:col-span-5 relative flex justify-center animate-fade-up stagger-2">
              <div
                className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full flex items-center justify-center p-6"
                style={{
                  background: 'radial-gradient(circle, var(--brand-glow), transparent 70%)',
                  border: '1px solid var(--brand-border)',
                }}
              >
                <div
                  className="w-full rounded-2xl p-5 space-y-3.5 hover-lift"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg text-white flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--brand-text)' }}>
                        AI
                      </div>
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Doubt Solver</span>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        backgroundColor: 'var(--success-bg)',
                        color: 'var(--success-text)',
                        border: '1px solid var(--success-border)',
                      }}
                    >
                      Grounded
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl text-xs font-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    "How do plants make food using sunlight?"
                  </div>

                  <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {[
                      'Chlorophyll absorbs sunlight in leaf chloroplasts.',
                      'CO₂ and H₂O are converted into glucose and O₂.',
                    ].map((text, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--brand-bg)', color: 'var(--brand-text)' }}>
                          {i + 1}
                        </span>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px]" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <span className="font-semibold" style={{ color: 'var(--brand-text)' }}>NCERT Science Class 10</span>
                    <span>96% match</span>
                  </div>
                </div>

                {/* Floating Badge 1 */}
                <div
                  className="absolute -top-4 -right-4 sm:-right-6 p-3 rounded-xl flex items-center gap-2.5 animate-float-slow"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' }}>
                    🏆
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Verified Citations</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>NCERT & OpenStax</div>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div
                  className="absolute -bottom-4 -left-4 sm:-left-6 p-3 rounded-xl flex items-center gap-2.5 animate-float-slow [animation-delay:2s]"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}>
                    🌐
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>6+ Languages</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Bengali, Hindi, Telugu...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ────────────────────────────────────────────────── */}
      <section className="border-y py-10" id="impact" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50,000+', label: 'Doubts Solved', color: 'var(--text-primary)' },
              { value: '100%', label: 'Grounded Answers', color: 'var(--brand-text)' },
              { value: '500+', label: 'Daily Contestants', color: 'var(--text-primary)' },
              { value: 'Free', label: 'Accessible for Everyone', color: 'var(--success-text)' },
            ].map((stat) => (
              <div key={stat.label} className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold font-heading" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Value Props / Features ───────────────────────────────────── */}
      <section className="py-20" id="features" style={{ backgroundColor: 'transparent' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--brand-text)' }}>
              Built For Real Learning
            </h2>
            <p className="text-3xl sm:text-4xl font-bold font-heading" style={{ color: 'var(--text-primary)' }}>
              Everything students need in one platform.
            </p>
            <p className="text-base mx-auto" style={{ color: 'var(--text-secondary)', maxWidth: '48ch' }}>
              Powered by Retrieval-Augmented Generation (RAG) and Gemini AI to guarantee factual, curriculum-aligned guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Grounded Doubt Solver',
                description: 'Never get hallucinated answers. Every explanation is grounded in NCERT textbooks and verified open educational content, complete with source chapter citations.',
                accentBg: 'var(--brand-bg)',
                accentColor: 'var(--brand-text)',
                accentBorder: 'var(--brand-border)',
                iconPath: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
              },
              {
                title: 'Adaptive Practice',
                description: 'Smart weakness targeting. The system identifies topics where you struggle and automatically generates practice questions calibrated to your skill level.',
                accentBg: 'var(--success-bg)',
                accentColor: 'var(--success-text)',
                accentBorder: 'var(--success-border)',
                iconPath: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
              },
              {
                title: 'Daily Contests',
                description: 'Compete in domain-specific daily challenges. Earn an Elo-style rating, track your progress, and climb the leaderboard among your peers.',
                accentBg: 'var(--warning-bg)',
                accentColor: 'var(--warning-text)',
                accentBorder: 'var(--warning-border)',
                iconPath: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-8 rounded-2xl space-y-4 card-hover"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: feature.accentBg, color: feature.accentColor, border: `1px solid ${feature.accentBorder}` }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.iconPath} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold font-heading" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Interactive Doubt Solver Demo ────────────────────────────── */}
      <section className="py-20 border-t" id="demo" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--brand-text)' }}>
              Interactive Preview
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading" style={{ color: 'var(--text-primary)' }}>
              Experience the Doubt Solver
            </h2>
            <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Ask a question and see how EduBridge AI breaks it down step-by-step with real citations.
            </p>
          </div>

          <div
            className="rounded-2xl p-6 sm:p-8 space-y-6"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={demoQuestion}
                onChange={(e) => setDemoQuestion(e.target.value)}
                placeholder="Ask any educational question..."
                className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                onClick={() => setDemoAnswerShown(true)}
                className="px-6 py-3 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--brand-text)',
                  color: 'var(--text-on-brand)',
                  boxShadow: 'var(--shadow-brand)',
                }}
              >
                <span>Ask AI</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {demoAnswerShown && (
              <div
                className="rounded-xl p-6 space-y-5 animate-fade-up"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs" style={{ backgroundColor: 'var(--brand-text)' }}>
                      AI
                    </div>
                    <div>
                      <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>EduBridge AI Tutor</h4>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Grounded in NCERT Curriculum</p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-md"
                    style={{ backgroundColor: 'var(--brand-bg)', color: 'var(--brand-text)' }}
                  >
                    Subject: Biology
                  </span>
                </div>

                <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <p>
                    <strong style={{ color: 'var(--text-primary)' }}>Photosynthesis</strong> is the biological process by which green plants synthesize glucose from carbon dioxide and water using light energy absorbed by chlorophyll.
                  </p>

                  <div
                    className="space-y-2.5 p-4 rounded-xl"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {[
                      { step: 1, title: 'Light Absorption:', text: 'Chlorophyll in chloroplasts absorbs solar radiation.' },
                      { step: 2, title: 'Energy Conversion:', text: 'Light energy splits water molecules (H₂O) into hydrogen and oxygen (O₂).' },
                      { step: 3, title: 'Carbon Fixation:', text: 'Carbon dioxide (CO₂) is reduced to form glucose (C₆H₁₂O₆).' },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-2.5">
                        <span
                          className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: 'var(--brand-text)', color: 'var(--text-on-brand)' }}
                        >
                          {item.step}
                        </span>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>{item.title}</strong> {item.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="p-3.5 rounded-xl text-center font-mono text-xs sm:text-sm"
                    style={{
                      backgroundColor: 'var(--success-bg)',
                      border: '1px solid var(--success-border)',
                      color: 'var(--success-text)',
                    }}
                  >
                    6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂
                  </div>
                </div>

                <div
                  className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Source:</span>
                    <span className="px-2 py-0.5 rounded font-medium" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      NCERT Science Class 10 — Chapter 6: Life Processes
                    </span>
                  </div>
                  <Link to="/register" className="font-semibold" style={{ color: 'var(--brand-text)' }}>
                    Ask your own questions →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer
        className="py-12 mt-auto border-t"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-default)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <div className="space-y-3 md:col-span-2">
              <Logo size="md" showTagline={true} taglineText="Connecting Learners. Building Futures." />
              <p className="text-xs max-w-sm" style={{ color: 'var(--text-muted)' }}>
                EduBridge AI improves educational equity with grounded, multilingual AI tutoring and personalized practice.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-primary)' }}>
                Features
              </h4>
              <ul className="space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <li><Link to="/register" className="hover:opacity-70 transition-opacity">Doubt Solver</Link></li>
                <li><Link to="/register" className="hover:opacity-70 transition-opacity">Adaptive Practice</Link></li>
                <li><Link to="/register" className="hover:opacity-70 transition-opacity">Daily Contests</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-primary)' }}>
                Platform
              </h4>
              <ul className="space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <li><Link to="/login" className="hover:opacity-70 transition-opacity">Student Login</Link></li>
                <li><a href="https://ncert.nic.in" target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity">NCERT Sources</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-4" style={{ color: 'var(--text-muted)' }}>
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
