import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { DashboardContent } from './components/DashboardContent';
import { Toaster, toast } from 'sonner';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = () => {
    setIsAuthenticated(true);
    toast.success('Access Granted', {
      description: 'Welcome back, Dr. Chen. Systems are ready.',
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast.info('Session Ended', {
      description: 'You have been successfully logged out.',
    });
  };

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-center" expand={true} richColors />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Toaster position="top-right" expand={true} richColors />
      
      {/* Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header />

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' || activeTab === 'upload' ? (
            <DashboardContent />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                 </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Module Under Maintenance</h2>
              <p className="text-slate-500 max-w-sm">
                The <span className="font-bold text-blue-600 capitalize">{activeTab}</span> section is currently being updated for the new AI diagnostic protocol.
              </p>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
