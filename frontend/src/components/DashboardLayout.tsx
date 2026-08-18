import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <TopBar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet context={{ selectedLanguage, setSelectedLanguage }} />
        </main>
      </div>
    </div>
  );
};
