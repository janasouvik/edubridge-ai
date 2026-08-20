import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DoubtSolverProvider } from '../contexts/DoubtSolverContext';

const SIDEBAR_COLLAPSED_KEY = 'edubridge-sidebar-collapsed';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return saved === 'true';
  });
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const handleToggleCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 main-transition ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <TopBar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto animate-fade-in">
          <DoubtSolverProvider>
            <Outlet context={{ selectedLanguage, setSelectedLanguage }} />
          </DoubtSolverProvider>
        </main>
      </div>
    </div>
  );
};
