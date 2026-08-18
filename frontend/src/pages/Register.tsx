import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { authApi } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [grade, setGrade] = useState('10');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [learningLevel, setLearningLevel] = useState('beginner');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      // 1. Register account
      await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        grade: role === 'student' ? grade : undefined,
        preferred_language: role === 'student' ? preferredLanguage : undefined,
        learning_level: role === 'student' ? learningLevel : undefined,
      });

      // 2. Automatically log in after registration
      const loginData = await authApi.login({
        email: email.trim(),
        password,
      });

      login(loginData.access_token, loginData.user);

      if (loginData.user.role === 'teacher') {
        navigate('/dashboard/teacher-insights', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
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
          Create an account
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
            {/* Role Selection Tabs */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                I am a:
              </label>
              <div
                className="grid grid-cols-2 gap-2 p-1 rounded-xl"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className="py-2 text-xs font-bold rounded-lg transition-all"
                  style={{
                    backgroundColor: role === 'student' ? 'var(--bg-surface)' : 'transparent',
                    color: role === 'student' ? 'var(--brand-text)' : 'var(--text-secondary)',
                    boxShadow: role === 'student' ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className="py-2 text-xs font-bold rounded-lg transition-all"
                  style={{
                    backgroundColor: role === 'teacher' ? 'var(--bg-surface)' : 'transparent',
                    color: role === 'teacher' ? 'var(--brand-text)' : 'var(--text-secondary)',
                    boxShadow: role === 'teacher' ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  👩‍🏫 Teacher / Educator
                </button>
              </div>
            </div>

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

            {/* Student-specific Profile Customization */}
            {role === 'student' && (
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
                      <option value="College">Undergraduate</option>
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

                <div>
                  <label className="block text-xs font-semibold mb-1.5" htmlFor="level" style={{ color: 'var(--text-secondary)' }}>
                    Learning Level
                  </label>
                  <select
                    id="level"
                    value={learningLevel}
                    onChange={(e) => setLearningLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2"
                    style={inputStyle}
                  >
                    <option value="beginner">Beginner (Foundational concepts)</option>
                    <option value="intermediate">Intermediate (Standard curriculum)</option>
                    <option value="advanced">Advanced (Exam prep & problem solving)</option>
                  </select>
                </div>
              </div>
            )}

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
