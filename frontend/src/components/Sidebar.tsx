import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isTeacher = user?.role === 'teacher';

  const navItems = [
    {
      name: 'Home',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      end: true,
      roles: ['student', 'teacher', 'admin'],
    },
    {
      name: 'Doubt Solver',
      path: '/dashboard/doubt-solver',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      roles: ['student', 'admin'],
    },
    {
      name: 'Practice',
      path: '/dashboard/practice',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      roles: ['student', 'admin'],
    },
    {
      name: 'My Progress',
      path: '/dashboard/progress',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      roles: ['student', 'admin'],
    },
    {
      name: 'Study Materials',
      path: '/dashboard/study-materials',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      roles: ['student', 'admin'],
    },
    {
      name: 'Scholarships',
      path: '/dashboard/scholarships',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
      roles: ['student', 'admin'],
    },
    {
      name: 'Teacher Insights',
      path: '/dashboard/teacher-insights',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      roles: ['teacher', 'admin'],
    },
  ];

  const visibleNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || 'student')
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(12, 15, 20, 0.5)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r flex flex-col lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
          transition: 'transform var(--duration-slow) var(--ease-smooth), background-color var(--duration-slow) var(--ease-smooth)',
        }}
      >
        {/* Header / Brand */}
        <div
          className="p-6 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <Logo size="md" showTagline={true} />
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Primary Action: New Doubt */}
        {!isTeacher && (
          <div className="px-5 pt-5 pb-2">
            <button
              onClick={() => {
                navigate('/dashboard/doubt-solver');
                onClose();
              }}
              className="w-full py-2.5 px-4 font-medium text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all hover-lift focus-ring"
              style={{
                backgroundColor: 'var(--brand-text)',
                color: 'var(--text-on-brand)',
                boxShadow: 'var(--shadow-brand)',
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>+ New Doubt</span>
            </button>
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm animate-slide-in-left stagger-${index + 1} ${
                  isActive ? 'font-semibold' : ''
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'var(--brand-bg)' : 'transparent',
                color: isActive ? 'var(--brand-text)' : 'var(--text-secondary)',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                transition: 'background-color var(--duration-fast) var(--ease-smooth), color var(--duration-fast) var(--ease-smooth), box-shadow var(--duration-fast) var(--ease-smooth)',
              })}
              onMouseEnter={(e) => {
                const target = e.currentTarget;
                if (!target.classList.contains('font-semibold')) {
                  target.style.backgroundColor = 'var(--bg-secondary)';
                  target.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget;
                if (!target.classList.contains('font-semibold')) {
                  target.style.backgroundColor = 'transparent';
                  target.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Learning Streak Widget (Students) */}
        {!isTeacher && (
          <div
            className="mx-4 mb-4 p-4 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, var(--brand-bg), var(--bg-secondary))',
              border: '1px solid var(--brand-border)',
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                Learning Streak <span className="text-amber-500">🔥</span>
              </span>
            </div>
            <div className="text-xl font-extrabold font-heading" style={{ color: 'var(--brand-text)' }}>
              7 days
            </div>
            <div className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>Keep it up!</div>
            <div
              className="w-full rounded-full h-1.5 overflow-hidden"
              style={{ backgroundColor: 'var(--border-default)' }}
            >
              <div
                className="h-full rounded-full w-4/5 animate-progress-fill"
                style={{ backgroundColor: 'var(--brand-text)' }}
              />
            </div>
          </div>
        )}

        {/* Bottom Help & Support */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => alert('Need help? Contact support at support@edubridge.ai')}
            className="flex items-center gap-2.5 text-xs font-medium w-full px-2 py-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Help & Support</span>
          </button>
        </div>
      </aside>
    </>
  );
};
