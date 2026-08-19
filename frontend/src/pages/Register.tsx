import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { authApi } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

const STREAMS = ['Science', 'Arts', 'Commerce'];

const UG_DOMAINS = [
  'Computer Science Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical',
  'Civil',
  'Chemical',
  'Aerospace',
  'Biotechnology',
  'Instrumentation',
];

const PG_DOMAINS = [
  'M.Tech Computer Science',
  'M.Tech Electronics & Communication',
  'M.Tech Electrical & Electronics',
  'M.Tech Mechanical',
  'M.Tech Civil',
  'M.Tech Chemical',
  'M.Tech Aerospace',
  'M.Tech Biotechnology',
  'MBA',
  'MCA',
  'MSc Computer Science',
  'MSc Mathematics',
  'MSc Physics',
];

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('10');
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  // Conditional fields based on grade
  const [stream, setStream] = useState('Science');
  const [ugDomain, setUgDomain] = useState(UG_DOMAINS[0]);
  const [pgDomain, setPgDomain] = useState(PG_DOMAINS[0]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const showStream = grade === '11' || grade === '12';
  const showUgDomain = grade === 'UG';
  const showPgDomain = grade === 'PG';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    // TODO: backend Student model only has `learning_level` (string), not stream/domain columns.
    // We map the conditional field into learning_level as a best-fit string for now.
    // Backend follow-up: add stream, ug_domain, pg_domain columns to Student model.
    let learningLevelValue = 'beginner';
    if (showStream) {
      learningLevelValue = stream;
    } else if (showUgDomain) {
      learningLevelValue = ugDomain;
    } else if (showPgDomain) {
      learningLevelValue = pgDomain;
    }

    setLoading(true);
    try {
      // 1. Register account (always as student)
      await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'student',
        grade,
        preferred_language: preferredLanguage,
        learning_level: learningLevelValue,
      });

      // 2. Automatically log in after registration
      const loginData = await authApi.login({
        email: email.trim(),
        password,
      });

      login(loginData.access_token, loginData.user);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center animate-fade-up">
        <Link to="/" className="inline-flex justify-center mb-6">
          <Logo size="lg" showTagline={true} />
        </Link>
        <h2
          className="text-2xl sm:text-3xl font-extrabold font-heading"
          style={{ color: 'var(--text-primary)' }}
        >
          Create your student account
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Join EduBridge AI for grounded, personalized learning
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div
          className="py-8 px-6 sm:px-10 rounded-2xl animate-scale-in"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {error && (
            <div
              className="mb-5 p-3.5 text-xs sm:text-sm rounded-xl flex items-center gap-2 animate-fade-up"
              style={{
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger-text)',
              }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" htmlFor="name" style={{ color: 'var(--text-secondary)' }}>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Souvik Jana"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                style={inputStyle}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" htmlFor="email" style={{ color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. souvik@test.com"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                style={inputStyle}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" htmlFor="password" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                style={inputStyle}
              />
            </div>

            {/* Student Profile Fields */}
            <div className="space-y-4 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" htmlFor="grade" style={{ color: 'var(--text-secondary)' }}>
                    Class / Grade
                  </label>
                  <select
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2"
                    style={inputStyle}
                  >
                    <option value="6">Class 6</option>
                    <option value="7">Class 7</option>
                    <option value="8">Class 8</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" htmlFor="language" style={{ color: 'var(--text-secondary)' }}>
                    Preferred Language
                  </label>
                  <select
                    id="language"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2"
                    style={inputStyle}
                  >
                    <option value="English">English</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                  </select>
                </div>
              </div>

              {/* Conditional Stream field for Grade 11/12 */}
              {showStream && (
                <div className="animate-fade-up">
                  <label className="block text-xs font-semibold mb-1.5" htmlFor="stream" style={{ color: 'var(--text-secondary)' }}>
                    Stream <span style={{ color: 'var(--danger-text)' }}>*</span>
                  </label>
                  <select
                    id="stream"
                    required
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2"
                    style={inputStyle}
                  >
                    {STREAMS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Conditional UG Domain field */}
              {showUgDomain && (
                <div className="animate-fade-up">
                  <label className="block text-xs font-semibold mb-1.5" htmlFor="ugDomain" style={{ color: 'var(--text-secondary)' }}>
                    UG Domain <span style={{ color: 'var(--danger-text)' }}>*</span>
                  </label>
                  {/* TODO: backend Student model has no ug_domain column — this is stored as learning_level for now */}
                  <select
                    id="ugDomain"
                    required
                    value={ugDomain}
                    onChange={(e) => setUgDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2"
                    style={inputStyle}
                  >
                    {UG_DOMAINS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Conditional PG Domain field */}
              {showPgDomain && (
                <div className="animate-fade-up">
                  <label className="block text-xs font-semibold mb-1.5" htmlFor="pgDomain" style={{ color: 'var(--text-secondary)' }}>
                    PG Domain <span style={{ color: 'var(--danger-text)' }}>*</span>
                  </label>
                  {/* TODO: backend Student model has no pg_domain column — this is stored as learning_level for now */}
                  <select
                    id="pgDomain"
                    required
                    value={pgDomain}
                    onChange={(e) => setPgDomain(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2"
                    style={inputStyle}
                  >
                    {PG_DOMAINS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-4 hover-lift focus-ring"
              style={{
                backgroundColor: 'var(--brand-text)',
                color: 'var(--text-on-brand)',
                boxShadow: 'var(--shadow-brand)',
              }}
            >
              {loading ? <LoadingSpinner size="sm" /> : <span>Create Account</span>}
            </button>
          </form>

          <div className="mt-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--brand-text)' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
