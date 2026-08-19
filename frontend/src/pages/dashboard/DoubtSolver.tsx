import React, { useState, useEffect, useRef } from 'react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      <div className="space-y-3.5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {lines.map((line, idx) => {
          // Check for numbered points (e.g. 1., 2., 1), etc.)
          const stepMatch = line.match(/^(\d+)[\.\)]\s*(.+)/);
          if (stepMatch) {
            const stepNumber = stepMatch[1];
            const stepContent = stepMatch[2];
            return (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <span className="w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--brand-text)', boxShadow: 'var(--shadow-sm)' }}>
                  {stepNumber}
                </span>
                <div className="flex-1 font-normal" style={{ color: 'var(--text-secondary)' }}>
                  <span dangerouslySetInnerHTML={{ __html: formatInline(stepContent) }} />
                </div>
              </div>
            );
          }

          // Check for formula or equation blocks
          if (line.includes('→') || line.includes('=') || line.includes('CO₂') || line.includes('ax²') || line.includes('6CO2')) {
            return (
              <div key={idx} className="p-3.5 rounded-xl font-mono text-xs sm:text-sm text-center flex items-center justify-center gap-2 my-2" style={{ backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-text)' }}>
                <span>🌿</span>
                <span className="font-semibold">{line.replace(/^[-*•]\s*/, '')}</span>
              </div>
            );
          }

          // Standard paragraph line
          return (
            <p key={idx} style={{ color: 'var(--text-secondary)' }}>
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
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:600;color:var(--text-primary)">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="color:var(--text-primary)">$1</em>');
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl mb-4 flex-shrink-0" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold font-heading" style={{ color: 'var(--text-primary)' }}>
              Doubt Solver (Grounded)
            </h1>
            <span className="p-1 rounded-full text-xs" title="Grounded in Textbook Citations" style={{ backgroundColor: 'var(--brand-bg)', color: 'var(--brand-text)' }}>
              🛡️
            </span>
          </div>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Get step-by-step explanations from verified textbook sources.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Subject selector */}
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 transition-all"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
          >
            <option value="Science">Science</option>
            <option value="Biology">Biology</option>
            <option value="Physics">Physics</option>
            <option value="Mathematics">Mathematics</option>
            <option value="General">General</option>
          </select>

          {/* Explain in Language selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Explain in:</span>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                outletContext?.setSelectedLanguage(e.target.value);
              }}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer"
              style={{ color: 'var(--brand-text)' }}
            >
              <option value="English">English</option>
              <option value="Bengali">Bengali</option>
              <option value="Hindi">Hindi</option>
              <option value="Kannada">Kannada</option>
              <option value="Tamil">Tamil</option>
              <option value="Telugu">Telugu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Column: Q&A Flow */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          {/* Error display */}
          {error && (
            <div className="p-4 text-sm rounded-xl flex items-center justify-between mb-3 flex-shrink-0" style={{ backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="font-bold" style={{ color: 'var(--danger-text)' }}>×</button>
            </div>
          )}

          {/* Scrollable Message Thread */}
          <div className="flex-1 overflow-y-auto space-y-6 pb-4 pr-1">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {msg.sender === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-2xl p-4 rounded-2xl rounded-tr-sm text-sm text-white" style={{ backgroundColor: 'var(--brand-text)', boxShadow: 'var(--shadow-sm)' }}>
                      <p className="font-medium">{msg.text}</p>
                      <span className="text-[10px] block text-right mt-1" style={{ opacity: 0.7 }}>{msg.timestamp}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs" style={{ background: 'linear-gradient(135deg, var(--brand-text), #6366f1)', boxShadow: 'var(--shadow-sm)' }}>
                          AI
                        </div>
                        <div>
                          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>EduBridge AI Tutor</h3>
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{msg.timestamp}</span>
                        </div>
                      </div>

                      {msg.topic && (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-md" style={{ backgroundColor: 'var(--brand-bg)', color: 'var(--brand-text)' }}>
                          {msg.topic}
                        </span>
                      )}
                    </div>

                    {renderStructuredAnswer(msg.text)}

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-3 flex items-center justify-between text-xs" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--success-text)' }} />
                          <span>Grounded using {msg.sources.length} textbook {msg.sources.length === 1 ? 'source' : 'sources'}</span>
                        </span>
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>See citations on the right</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="p-6 rounded-2xl flex items-center gap-3" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
                <LoadingSpinner size="sm" />
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Retrieving textbook context and formulating step-by-step explanation in {language}...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Pinned Bottom Input Bar */}
          <div className="flex-shrink-0 p-4 rounded-2xl space-y-3 mt-2" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-md)' }}>
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
                className="w-full pl-4 pr-12 py-3 rounded-xl text-sm placeholder-opacity-60 focus:outline-none focus:ring-2 transition-all resize-none"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              />
              <button
                type="button"
                onClick={() => handleAsk()}
                disabled={loading || !question.trim()}
                className="absolute right-3 bottom-3.5 p-2 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                title="Send Question"
                style={{ backgroundColor: 'var(--brand-text)' }}
              >
                <svg className="w-4 h-4 transform rotate-45 -mt-0.5 -mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            {/* Quick suggested chips */}
            <div className="flex items-center gap-2 overflow-x-auto text-[11px] pt-1" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>Suggestions:</span>
              <button
                onClick={() => {
                  setQuestion('What is photosynthesis? Explain step by step.');
                  setSubject('Biology');
                  setTopic('Photosynthesis');
                }}
                className="px-2.5 py-1 rounded-full transition-colors whitespace-nowrap"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
              >
                🌿 Photosynthesis
              </button>
              <button
                onClick={() => {
                  setQuestion('Explain the quadratic formula and give an example.');
                  setSubject('Mathematics');
                  setTopic('Quadratic Equations');
                }}
                className="px-2.5 py-1 rounded-full transition-colors whitespace-nowrap"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
              >
                📐 Quadratic Equations
              </button>
              <button
                onClick={() => {
                  setQuestion("State Newton's three laws of motion with examples.");
                  setSubject('Physics');
                  setTopic('Laws of Motion');
                }}
                className="px-2.5 py-1 rounded-full transition-colors whitespace-nowrap"
                style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
              >
                ⚡ Newton's Laws
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Sources & Citations Panel */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-5 rounded-2xl space-y-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--brand-text)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h2 className="text-base font-bold font-heading" style={{ color: 'var(--text-primary)' }}>
                Sources & Citations
              </h2>
            </div>

            <div className="space-y-3">
              {activeSources.map((source, idx) => {
                const isPrimary = idx === 0;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl transition-colors space-y-1.5"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{
                          backgroundColor: isPrimary ? 'var(--success-bg)' : 'var(--brand-bg)',
                          color: isPrimary ? 'var(--success-text)' : 'var(--brand-text)',
                        }}
                      >
                        {isPrimary ? 'Primary Source' : `Reference ${idx}`}
                      </span>
                      {source.relevance && (
                        <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                          {Math.round(source.relevance * 100)}% match
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                      {source.title}
                    </h4>

                    {source.chapter && (
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {source.chapter}
                      </p>
                    )}

                    {source.source_url && (
                      <a
                        href={source.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold pt-1"
                        style={{ color: 'var(--brand-text)' }}
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
          <div className="p-4 rounded-2xl flex items-center justify-between" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Was this helpful?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFeedbackGiven('up')}
                className="p-2 rounded-lg text-sm border transition-colors"
                style={{
                  backgroundColor: feedbackGiven === 'up' ? 'var(--success-bg)' : 'var(--bg-secondary)',
                  borderColor: feedbackGiven === 'up' ? 'var(--success-border)' : 'var(--border-default)',
                  color: feedbackGiven === 'up' ? 'var(--success-text)' : 'var(--text-secondary)',
                }}
                title="Helpful"
              >
                👍
              </button>
              <button
                type="button"
                onClick={() => setFeedbackGiven('down')}
                className="p-2 rounded-lg text-sm border transition-colors"
                style={{
                  backgroundColor: feedbackGiven === 'down' ? 'var(--danger-bg)' : 'var(--bg-secondary)',
                  borderColor: feedbackGiven === 'down' ? 'var(--danger-border)' : 'var(--border-default)',
                  color: feedbackGiven === 'down' ? 'var(--danger-text)' : 'var(--text-secondary)',
                }}
                title="Not helpful"
              >
                👎
              </button>
            </div>
          </div>

          {/* Related Topics */}
          <div className="p-5 rounded-2xl space-y-3" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Explore Related Topics
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setQuestion('How does chlorophyll absorb sunlight?');
                    handleAsk('How does chlorophyll absorb sunlight?');
                  }}
                  className="flex items-center gap-1.5 transition-colors text-left"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span style={{ color: 'var(--brand-text)' }}>•</span>
                  <span>Chlorophyll & Light Absorption</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setQuestion('What is the role of stomata in plants?');
                    handleAsk('What is the role of stomata in plants?');
                  }}
                  className="flex items-center gap-1.5 transition-colors text-left"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span style={{ color: 'var(--brand-text)' }}>•</span>
                  <span>Stomata and Gas Exchange</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setQuestion('Difference between respiration and photosynthesis');
                    handleAsk('Difference between respiration and photosynthesis');
                  }}
                  className="flex items-center gap-1.5 transition-colors text-left"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span style={{ color: 'var(--brand-text)' }}>•</span>
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
