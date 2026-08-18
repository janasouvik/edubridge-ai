import React, { useState, useEffect } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { doubtsApi } from '../../api/doubts';
import type { DoubtResponse, Source } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface ContextType {
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  topic?: string;
  sources?: Source[];
  timestamp: string;
}

export const DoubtSolver: React.FC = () => {
  const [searchParams] = useSearchParams();
  const outletContext = useOutletContext<ContextType>();
  const activeLanguage = outletContext?.selectedLanguage || 'English';

  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('Science');
  const [topic, setTopic] = useState('General');
  const [language, setLanguage] = useState(activeLanguage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);

  // Message thread
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-ai',
      sender: 'ai',
      text: 'Hello! I am your Grounded AI Tutor. Ask me any concept from your syllabus (Science, Math, Biology, Physics, etc.) and I will explain it step-by-step using verified textbook sources.',
      sources: [
        {
          title: 'NCERT Curriculum Guidelines',
          chapter: 'Standard Reference',
          source_url: 'https://ncert.nic.in',
          relevance: 0.95,
        },
      ],
      timestamp: 'Just now',
    },
  ]);

  const [activeSources, setActiveSources] = useState<Source[]>([
    {
      title: 'NCERT Science Textbook Class 10',
      chapter: 'Chapter 6: Life Processes',
      source_url: 'https://ncert.nic.in/textbook.php?jesc1=0-16',
      relevance: 0.94,
    },
    {
      title: 'NCERT Exemplar Problems Class 10',
      chapter: 'Life Processes Section 6.2',
      source_url: 'https://ncert.nic.in',
      relevance: 0.88,
    },
  ]);

  // Keep local language aligned with topbar language
  useEffect(() => {
    if (outletContext?.selectedLanguage) {
      setLanguage(outletContext.selectedLanguage);
    }
  }, [outletContext?.selectedLanguage]);

  // Initial query from URL search param if present
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && query.trim() !== '') {
      setQuestion(query);
      handleAsk(query);
    }
  }, [searchParams]);

  const handleAsk = async (queryText?: string) => {
    const textToSend = queryText || question;
    if (!textToSend.trim()) return;

    setError(null);
    setLoading(true);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');

    try {
      const response: DoubtResponse = await doubtsApi.askDoubt({
        question: textToSend,
        language: language,
        subject: subject,
        topic: topic,
      });

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.answer,
        topic: response.topic,
        sources: response.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (response.sources && response.sources.length > 0) {
        setActiveSources(response.sources);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to resolve doubt. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to format structured step-by-step markdown/text nicely
  const renderStructuredAnswer = (text: string) => {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);

    return (
      <div className="space-y-3.5 text-slate-800 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          // Check for numbered points (e.g. 1., 2., 1), etc.)
          const stepMatch = line.match(/^(\d+)[\.\)]\s*(.+)/);
          if (stepMatch) {
            const stepNumber = stepMatch[1];
            const stepContent = stepMatch[2];
            return (
              <div key={idx} className="flex items-start gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100/80">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  {stepNumber}
                </span>
                <div className="flex-1 font-normal text-slate-700">
                  <span dangerouslySetInnerHTML={{ __html: formatInline(stepContent) }} />
                </div>
              </div>
            );
          }

          // Check for formula or equation blocks
          if (line.includes('→') || line.includes('=') || line.includes('CO₂') || line.includes('ax²') || line.includes('6CO2')) {
            return (
              <div key={idx} className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-emerald-950 font-mono text-xs sm:text-sm text-center shadow-2xs flex items-center justify-center gap-2 my-2">
                <span className="text-emerald-600">🌿</span>
                <span className="font-semibold">{line.replace(/^[-*•]\s*/, '')}</span>
              </div>
            );
          }

          // Standard paragraph line
          return (
            <p key={idx} className="text-slate-700">
              <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
            </p>
          );
        })}
      </div>
    );
  };

  // Format bold text
  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-800">$1</em>');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
              Doubt Solver (Grounded)
            </h1>
            <span className="text-blue-600 bg-blue-50 p-1 rounded-full text-xs" title="Grounded in Textbook Citations">
              🛡️
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Get step-by-step explanations from verified textbook sources.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Subject selector */}
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="Science">Science</option>
            <option value="Biology">Biology</option>
            <option value="Physics">Physics</option>
            <option value="Mathematics">Mathematics</option>
            <option value="General">General</option>
          </select>

          {/* Explain in Language selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
            <span className="text-slate-500">Explain in:</span>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                outletContext?.setSelectedLanguage(e.target.value);
              }}
              className="bg-transparent font-semibold text-blue-600 focus:outline-none cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Bengali">Bengali</option>
              <option value="Hindi">Hindi</option>
              <option value="Kannada">Kannada</option>
              <option value="Tamil">Tamil</option>
              <option value="Telugu">Telugu</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => alert('Text-to-speech reading feature ready')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Read aloud"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid: Left Q&A Thread, Right Sources & Citations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Q&A Flow (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Prompt Input */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                rows={2}
                placeholder="Ask any question... (e.g. What is photosynthesis? Explain step by step)"
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
              <button
                type="button"
                onClick={() => handleAsk()}
                disabled={loading || !question.trim()}
                className="absolute right-3 bottom-3.5 p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
                title="Send Question"
              >
                <svg className="w-4 h-4 transform rotate-45 -mt-0.5 -mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            {/* Quick suggested chips */}
            <div className="flex items-center gap-2 overflow-x-auto text-[11px] text-slate-500 pt-1">
              <span className="font-semibold text-slate-400">Suggestions:</span>
              <button
                onClick={() => {
                  setQuestion('What is photosynthesis? Explain step by step.');
                  setSubject('Biology');
                  setTopic('Photosynthesis');
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors whitespace-nowrap"
              >
                🌿 Photosynthesis
              </button>
              <button
                onClick={() => {
                  setQuestion('Explain the quadratic formula and give an example.');
                  setSubject('Mathematics');
                  setTopic('Quadratic Equations');
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors whitespace-nowrap"
              >
                📐 Quadratic Equations
              </button>
              <button
                onClick={() => {
                  setQuestion("State Newton's three laws of motion with examples.");
                  setSubject('Physics');
                  setTopic('Laws of Motion');
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors whitespace-nowrap"
              >
                ⚡ Newton's Laws
              </button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold">×</button>
            </div>
          )}

          {/* Message Thread */}
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {msg.sender === 'user' ? (
                  // User Question Box
                  <div className="flex justify-end">
                    <div className="max-w-2xl bg-blue-600 text-white p-4 rounded-2xl rounded-tr-xs shadow-xs text-sm">
                      <p className="font-medium">{msg.text}</p>
                      <span className="text-[10px] text-blue-200 block text-right mt-1">{msg.timestamp}</span>
                    </div>
                  </div>
                ) : (
                  // AI Answer Box (Structured)
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          AI
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">EduBridge AI Tutor</h3>
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                        </div>
                      </div>

                      {msg.topic && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md">
                          {msg.topic}
                        </span>
                      )}
                    </div>

                    {/* Structured Answer Body */}
                    {renderStructuredAnswer(msg.text)}

                    {/* Bottom Citation Notice */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Grounded using {msg.sources.length} textbook {msg.sources.length === 1 ? 'source' : 'sources'}</span>
                        </span>
                        <span className="text-slate-400 text-[11px]">See citations on the right</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator when thinking */}
            {loading && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-slate-600 font-medium">
                  Retrieving textbook context and formulating step-by-step explanation in {language}...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sources & Citations Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Sources & Citations
              </h2>
            </div>

            {/* Citation Cards */}
            <div className="space-y-3">
              {activeSources.map((source, idx) => {
                const isPrimary = idx === 0;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isPrimary
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {isPrimary ? 'Primary Source' : `Reference ${idx}`}
                      </span>
                      {source.relevance && (
                        <span className="text-[11px] font-semibold text-slate-400">
                          {Math.round(source.relevance * 100)}% match
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 leading-snug">
                      {source.title}
                    </h4>

                    {source.chapter && (
                      <p className="text-[11px] text-slate-500">
                        {source.chapter}
                      </p>
                    )}

                    {source.source_url && (
                      <a
                        href={source.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 pt-1"
                      >
                        <span>View Source</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Was this helpful?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFeedbackGiven('up')}
                className={`p-2 rounded-lg text-sm border transition-colors ${
                  feedbackGiven === 'up'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="Helpful"
              >
                👍
              </button>
              <button
                type="button"
                onClick={() => setFeedbackGiven('down')}
                className={`p-2 rounded-lg text-sm border transition-colors ${
                  feedbackGiven === 'down'
                    ? 'bg-red-50 border-red-300 text-red-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="Not helpful"
              >
                👎
              </button>
            </div>
          </div>

          {/* Related Topics */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Explore Related Topics
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setQuestion('How does chlorophyll absorb sunlight?');
                    handleAsk('How does chlorophyll absorb sunlight?');
                  }}
                  className="text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors text-left"
                >
                  <span className="text-blue-500">•</span>
                  <span>Chlorophyll & Light Absorption</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setQuestion('What is the role of stomata in plants?');
                    handleAsk('What is the role of stomata in plants?');
                  }}
                  className="text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors text-left"
                >
                  <span className="text-blue-500">•</span>
                  <span>Stomata and Gas Exchange</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setQuestion('Difference between respiration and photosynthesis');
                    handleAsk('Difference between respiration and photosynthesis');
                  }}
                  className="text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors text-left"
                >
                  <span className="text-blue-500">•</span>
                  <span>Respiration in Plants</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
