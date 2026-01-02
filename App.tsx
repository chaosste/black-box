
import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './store/useStore';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { NewSession } from './pages/NewSession';
import { PostFlight } from './pages/PostFlight';
import { Profiles } from './pages/Profiles';
import { HarmReduction } from './pages/HarmReduction';
import { Questionnaires } from './pages/Questionnaires';
import { History } from './pages/History';
import { SessionDetail } from './pages/SessionDetail';
import { Baselines } from './pages/Baselines';
import { ASSETS } from './constants';
import { Tutorial } from './components/Tutorial';

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser } = useStore();
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const mockUser = {
      id: crypto.randomUUID(),
      email,
      profiles: [{ id: 'p1', name: 'Subject Alpha', sessions: [], baselines: [], questionnaires: [] }],
      currentProfileId: 'p1',
      tutorialCompleted: false
    };
    setUser(mockUser);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full p-12 rounded-[3.5rem] bg-white text-black shadow-2xl text-center">
          <div className="flex flex-col items-center mb-10">
            <img src={ASSETS.LOGO_OUROBOROS} className="w-24 h-24 mb-6 object-contain" alt="Logo" />
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Black Box</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Flight Recorder</p>
            <div className="w-8 h-[1px] bg-gray-200 mt-4"></div>
            <p className="text-gray-400 text-[8px] font-bold uppercase tracking-widest mt-2">from New Psychonaut</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-left">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pl-2">Neural ID (Email)</label>
              <input 
                type="email" 
                placeholder="ID@VAULT.COM" 
                className="w-full p-5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all font-mono text-sm font-bold uppercase tracking-widest"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button className="w-full bg-black text-white p-6 rounded-2xl font-black hover:opacity-90 transition-opacity text-lg shadow-2xl tracking-widest uppercase">
              Decrypt & Access
            </button>
          </form>

          <p className="mt-12 text-[9px] text-gray-300 font-bold leading-relaxed uppercase tracking-tighter max-w-[250px] mx-auto">
            PROPRIETARY QUANTIFIED SELF ENGINE • NEW PSYCHONAUT RESEARCH • ENCRYPTED LOCAL STORAGE
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const Navigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setActiveTab(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  const renderContent = () => {
    if (activeTab.startsWith('session/')) {
      const sessionId = activeTab.split('/')[1];
      return <SessionDetail sessionId={sessionId} onBack={() => setActiveTab('history')} />;
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'profiles': return <Profiles />;
      case 'profile-record': return <Profiles forceRecordView={true} />;
      case 'history': return <History onSelectSession={(id) => setActiveTab(`session/${id}`)} />;
      case 'baselines': return <Baselines />;
      case 'new-session': return <NewSession />;
      case 'post-flight': return <PostFlight />;
      case 'questionnaires': return <Questionnaires />;
      case 'harm-reduction': return <HarmReduction />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <Tutorial />
      {renderContent()}
    </Layout>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AuthGate>
        <Navigation />
      </AuthGate>
    </StoreProvider>
  );
}
