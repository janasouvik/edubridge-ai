import React, { useState, useEffect } from 'react';
import { practiceApi } from '../../api/practice';
import type { PracticeSession, PracticeSubmitResult } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const SCHOOL_SUBJECTS = [
  { id: 'mathematics', name: 'Mathematics', icon: '📐', color: 'blue' },
  { id: 'physics', name: 'Physics', icon: '⚛️', color: 'purple' },
  { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: 'emerald' },
  { id: 'biology', name: 'Biology', icon: '🧬', color: 'green' },
  { id: 'computer_science', name: 'Computer Science', icon: '💻', color: 'indigo' },
  { id: 'history', name: 'History', icon: '🏛️', color: 'amber' },
  { id: 'geography', name: 'Geography', icon: '🌍', color: 'teal' },
  { id: 'english', name: 'English', icon: '📚', color: 'rose' },
];

const HIGHER_ED_SUBJECTS = [
  { id: 'data_structures', name: 'Data Structures & Algorithms', icon: '🌳', color: 'indigo' },
  { id: 'quantum_mechanics', name: 'Quantum Mechanics', icon: '🌌', color: 'purple' },
  { id: 'organic_chemistry', name: 'Organic Chemistry', icon: '🔬', color: 'emerald' },
  { id: 'microeconomics', name: 'Microeconomics', icon: '📈', color: 'blue' },
  { id: 'molecular_biology', name: 'Molecular Biology', icon: '🧬', color: 'green' },
  { id: 'artificial_intelligence', name: 'Artificial Intelligence', icon: '🤖', color: 'rose' },
  { id: 'advanced_calculus', name: 'Advanced Calculus', icon: '∫', color: 'amber' },
  { id: 'thermodynamics', name: 'Thermodynamics', icon: '🔥', color: 'teal' },
];

export const Practice: React.FC = () => {
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  const [timeLeft, setTimeLeft] = useState<number>(15);
  
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PracticeSubmitResult | null>(null);

  const [activeTab, setActiveTab] = useState<'school' | 'higher_ed'>('school');
  const [customSubject, setCustomSubject] = useState('');

  // Timer logic for active session
  useEffect(() => {
    if (!session || result || submitting) return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Time is up! Move to next or submit
      handleNextOrSubmit();
    }
  }, [timeLeft, session, result, submitting]);

  const startSession = async (subject: string, level: string = 'school') => {
    if (!subject.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const newSession = await practiceApi.generateSession(subject, level);
      setSession(newSession);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setResult(null);
      setTimeLeft(15);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate practice session.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qId: number, optionLetter: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionLetter }));
  };

  const handleNextOrSubmit = async () => {
    if (!session) return;
    
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeLeft(15); // Reset timer for next question
    } else {
      // Auto submit
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!session || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await practiceApi.submitSession(session.session_id, answers);
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to submit practice session.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetPractice = () => {
    setSession(null);
    setResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setCustomSubject('');
  };

  // 1. Loading View
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <LoadingSpinner size="lg" text="Searching Wikipedia & Generating Custom Questions..." />
        <p className="text-sm text-slate-500 animate-pulse">This usually takes about 10-15 seconds...</p>
      </div>
    );
  }

  // 2. Results View
  if (result && session) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-extrabold bg-blue-50 text-blue-600 border-[3px] border-blue-100">
            {result.score}/{result.total}
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
              Practice Complete!
            </h2>
            <p className="text-slate-500 mt-2">
              You scored {result.score} out of {result.total} in {session.subject}.
            </p>
          </div>
          <button
            onClick={resetPractice}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
          >
            Practice Another Subject
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 pl-2">Detailed Review</h3>
          {result.detailed_results.map((res, idx) => (
            <div
              key={res.question_id}
              className={`p-5 rounded-2xl border ${
                res.is_correct ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{res.is_correct ? '✅' : '❌'}</span>
                <span className={`font-bold ${res.is_correct ? 'text-emerald-700' : 'text-red-700'}`}>
                  Question {idx + 1}
                </span>
              </div>
              <p className="font-semibold text-slate-900 mb-4">{res.question_text}</p>
              
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-sm">
                  <span className="text-slate-500 font-bold block text-xs mb-1">Your Answer</span>
                  <span className="font-medium text-slate-800">{res.student_answer || 'Skipped'}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-sm">
                  <span className="text-slate-500 font-bold block text-xs mb-1">Correct Answer</span>
                  <span className="font-medium text-slate-800">{res.correct_option}</span>
                </div>
              </div>
              
              <div className="bg-white/60 p-4 rounded-xl text-sm text-slate-700 leading-relaxed">
                <span className="font-bold block mb-1">Explanation:</span>
                {res.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Active Quiz View
  if (session) {
    const currentQ = session.questions[currentQuestionIndex];
    const options = [
      { letter: 'A', text: currentQ.option_a },
      { letter: 'B', text: currentQ.option_b },
      { letter: 'C', text: currentQ.option_c },
      { letter: 'D', text: currentQ.option_d },
    ];
    
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
        {/* Header & Timer */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-full uppercase tracking-wider">
              {session.subject}
            </span>
            <div className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-wider">
              Question {currentQuestionIndex + 1} of {session.questions.length}
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div
              className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl font-extrabold ${
                timeLeft <= 5 ? 'border-red-500 text-red-600 animate-pulse' : 'border-emerald-500 text-emerald-600'
              }`}
            >
              {timeLeft}
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Seconds</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {currentQ.question_text}
          </h2>

          <div className="space-y-3">
            {options.map((opt) => (
              <button
                key={opt.letter}
                onClick={() => handleSelectAnswer(currentQ.id, opt.letter)}
                className="w-full text-left p-4 rounded-2xl text-sm sm:text-base font-medium transition-all flex items-center gap-3"
                style={{
                  backgroundColor: answers[currentQ.id] === opt.letter ? 'var(--brand-bg)' : 'var(--bg-secondary)',
                  border: `2px solid ${answers[currentQ.id] === opt.letter ? 'var(--brand-border)' : 'transparent'}`,
                  color: answers[currentQ.id] === opt.letter ? 'var(--brand-text)' : 'var(--text-primary)',
                }}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  answers[currentQ.id] === opt.letter ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {opt.letter}
                </span>
                {opt.text}
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handleNextOrSubmit}
              className="px-6 py-3 rounded-xl text-sm font-bold transition-colors ml-auto text-white"
              style={{ backgroundColor: 'var(--brand-text)' }}
            >
              {currentQuestionIndex < session.questions.length - 1 ? 'Next Question ➔' : 'Submit Practice'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Subject Selection Landing View
  const subjectsToDisplay = activeTab === 'school' ? SCHOOL_SUBJECTS : HIGHER_ED_SUBJECTS;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-up">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading mb-4">
          What do you want to practice?
        </h1>
        <p className="text-slate-500">
          Select a subject to instantly generate a 5-question sprint tailored to your grade. 
          You will have exactly 15 seconds to answer each question!
        </p>
      </div>

      <div className="flex justify-center max-w-md mx-auto mb-6">
        <div className="bg-slate-100 p-1 rounded-2xl flex w-full">
          <button
            onClick={() => setActiveTab('school')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'school' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            School (Up to 12th)
          </button>
          <button
            onClick={() => setActiveTab('higher_ed')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'higher_ed' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            Higher Education
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between max-w-2xl mx-auto">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">×</button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 transition-all duration-300">
        {subjectsToDisplay.map((sub) => (
          <button
            key={sub.id}
            onClick={() => startSession(sub.name, activeTab)}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
          >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">{sub.icon}</span>
            <span className="font-bold text-slate-700 text-sm text-center leading-snug">{sub.name}</span>
          </button>
        ))}
      </div>

      <div className="max-w-xl mx-auto mt-12 bg-slate-50 p-6 rounded-3xl border border-slate-200 flex flex-col items-center">
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Or type any custom topic</span>
        <div className="flex w-full gap-2">
          <input
            type="text"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            placeholder={activeTab === 'school' ? "e.g. World War II, Photosynthesis..." : "e.g. Game Theory, Cryptography..."}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && startSession(customSubject, activeTab)}
          />
          <button
            onClick={() => startSession(customSubject, activeTab)}
            disabled={!customSubject.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl transition-colors"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};
