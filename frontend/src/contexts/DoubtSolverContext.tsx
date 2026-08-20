import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Source } from '../types';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  topic?: string;
  sources?: Source[];
  timestamp: string;
}

interface DoubtSolverContextType {
  messages: Message[];
  activeSources: Source[];
  addMessage: (msg: Message) => void;
  setActiveSources: (sources: Source[]) => void;
  clearSession: () => void;
}

const STORAGE_MESSAGES_KEY = 'edubridge_doubt_messages';
const STORAGE_SOURCES_KEY = 'edubridge_doubt_sources';

const INITIAL_MESSAGE: Message = {
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
};

const DEFAULT_SOURCES: Source[] = [
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
];

const DoubtSolverContext = createContext<DoubtSolverContextType | undefined>(undefined);

export const DoubtSolverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MESSAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load doubt messages from localStorage:', e);
    }
    return [INITIAL_MESSAGE];
  });

  const [activeSources, setActiveSourcesState] = useState<Source[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SOURCES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load doubt sources from localStorage:', e);
    }
    return DEFAULT_SOURCES;
  });

  // Sync messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save doubt messages to localStorage:', e);
    }
  }, [messages]);

  // Sync activeSources to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SOURCES_KEY, JSON.stringify(activeSources));
    } catch (e) {
      console.warn('Failed to save doubt sources to localStorage:', e);
    }
  }, [activeSources]);

  const addMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const setActiveSources = useCallback((sources: Source[]) => {
    setActiveSourcesState(sources);
  }, []);

  const clearSession = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    setActiveSourcesState(DEFAULT_SOURCES);
    try {
      localStorage.removeItem(STORAGE_MESSAGES_KEY);
      localStorage.removeItem(STORAGE_SOURCES_KEY);
    } catch (e) {
      console.warn('Failed to clear doubt solver localStorage:', e);
    }
  }, []);

  return (
    <DoubtSolverContext.Provider
      value={{ messages, activeSources, addMessage, setActiveSources, clearSession }}
    >
      {children}
    </DoubtSolverContext.Provider>
  );
};

export const useDoubtSolver = (): DoubtSolverContextType => {
  const context = useContext(DoubtSolverContext);
  if (!context) {
    throw new Error('useDoubtSolver must be used within a DoubtSolverProvider');
  }
  return context;
};
