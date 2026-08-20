import React, { useState, useRef, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

interface TopBarProps {
  onToggleSidebar: () => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  selectedLanguage,
  onLanguageChange,
}) => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef<HTMLDivElement>(null);

  const languages = [
    'English',
    'Bengali',
    'Hindi',
    'Kannada',
    'Tamil',
    'Telugu',
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (streakRef.current && !streakRef.current.contains(e.target as Node)) {
        setStreakOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/dashboard/doubt-solver?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header
      className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4 sticky top-0 z-30 glass border-b"
      style={{ borderColor: 'var(--border-default)' }}
    >
      {/* Left: Mobile Toggle, Global Search & Learning Streak Widget */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-2xl min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Global Search Box */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[130px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for topics, questions, textbooks..."
            className="w-full pl-3.5 sm:pl-4 pr-9 sm:pr-10 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm focus:outline-none transition-all"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Search"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {/* Learning Streak Widget (Compact, positioned immediately to the right of search input) */}
        {!isTeacher && (
          <div className="relative flex-shrink-0" ref={streakRef}>
            <button
              type="button"
              onClick={() => setStreakOpen(!streakOpen)}
              onMouseEnter={() => setStreakOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer hover-lift"
              style={{
                background: 'linear-gradient(135deg, var(--brand-bg), var(--bg-secondary))',
                border: '1px solid var(--brand-border)',
                color: 'var(--brand-text)',
                boxShadow: 'var(--shadow-xs)',
              }}
              title="7-day Learning Streak (Click for details)"
            >
              <span className="text-sm leading-none animate-pulse-subtle">🔥</span>
              <span className="whitespace-nowrap font-extrabold text-[11px] sm:text-xs">7 days</span>
            </button>

            {/* Streak Popover details */}
            {streakOpen && (
              <div
                className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-64 p-4 rounded-2xl z-50 animate-dropdown-in"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-lg)',
                }}
                onMouseLeave={() => setStreakOpen(false)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                    Learning Streak <span className="text-amber-500">🔥</span>
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                    style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}
                  >
                    Active
                  </span>
                </div>
                <div className="text-xl font-extrabold font-heading mb-1" style={{ color: 'var(--brand-text)' }}>
                  7 days
                </div>
                <p className="text-[11px] mb-2.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  You're on a streak! Complete 1 doubt or practice quiz today to keep it going.
                </p>
                <div
                  className="w-full rounded-full h-1.5 overflow-hidden mb-3"
                  style={{ backgroundColor: 'var(--border-default)' }}
                >
                  <div
                    className="h-full rounded-full w-4/5 animate-progress-fill"
                    style={{ backgroundColor: 'var(--brand-text)' }}
                  />
                </div>
                <div
                  className="pt-2 flex justify-between text-[10px] font-semibold"
                  style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  <span>M ✓</span>
                  <span>T ✓</span>
                  <span>W ✓</span>
                  <span>T ✓</span>
                  <span>F ✓</span>
                  <span>S ✓</span>
                  <span className="font-extrabold" style={{ color: 'var(--brand-text)' }}>S 🔥</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Language Selector */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors"
            style={{
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-default)',
              backgroundColor: 'transparent',
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">{selectedLanguage}</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {langOpen && (
            <div
              className="absolute right-0 mt-1.5 w-36 rounded-xl py-1.5 z-50 animate-dropdown-in"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    onLanguageChange(lang);
                    setLangOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-1.5 text-xs sm:text-sm transition-colors"
                  style={{
                    backgroundColor: selectedLanguage === lang ? 'var(--brand-bg)' : 'transparent',
                    color: selectedLanguage === lang ? 'var(--brand-text)' : 'var(--text-secondary)',
                    fontWeight: selectedLanguage === lang ? '600' : '400',
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-full transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse-subtle" style={{ boxShadow: '0 0 0 2px var(--bg-surface)' }} />
          </button>

          {notificationsOpen && (
            <div
              className="absolute right-0 mt-2 w-72 rounded-xl p-3 z-50 animate-dropdown-in"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Notifications</span>
                <span className="text-[10px] cursor-pointer font-medium" style={{ color: 'var(--brand-text)' }}>Mark read</span>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2 rounded-lg text-xs" style={{ backgroundColor: 'var(--brand-bg)' }}>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>New Practice Questions Ready!</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Test your understanding in Photosynthesis</p>
                </div>
                <div className="p-2 rounded-lg text-xs" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Streak Updated 🔥</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>You reached a 7-day learning streak!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
