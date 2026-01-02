import React from 'react';
import { useStore } from '../store/useStore';
import { ASSETS } from '../constants';
import { LayoutDashboard, UserCircle, PlusCircle, CheckSquare, ShieldAlert, FileText, Moon, Sun, LogOut, History, Activity, Coffee } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, setUser, activeProfile, darkMode, toggleDarkMode } = useStore();

  if (!user) return <>{children}</>;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-session', label: 'New Flight', icon: PlusCircle },
    { id: 'post-flight', label: 'Post Flight', icon: CheckSquare },
    { id: 'questionnaires', label: 'Assessments', icon: FileText },
    { id: 'history', label: 'Experiments', icon: History },
    { id: 'profiles', label: 'Subjects', icon: UserCircle },
    { id: 'baselines', label: 'DataPoint Entry', icon: Activity },
    { id: 'harm-reduction', label: 'Safety', icon: ShieldAlert },
  ];

  const sidebarIcon = darkMode ? ASSETS.LOGO_NEW_PSYCHONAUT_WHITE_CIRCULAR : ASSETS.LOGO_OUROBOROS;
  const headerLogo = darkMode ? ASSETS.LOGO_NEW_PSYCHONAUT_WHITE_CIRCULAR : ASSETS.LOGO_NEW_PSYCHONAUT_TYPE_BLACK;

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <aside className={`w-full md:w-64 border-r ${darkMode ? 'border-zinc-800 bg-black' : 'border-gray-200 bg-white'} sticky top-0 md:h-screen z-50 flex flex-col`}>
        <div className="p-6">
           <div className="flex items-center gap-3 mb-2">
            <img src={sidebarIcon} alt="Logo" className="w-10 h-10 object-contain" />
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight uppercase leading-none">Black Box</span>
            </div>
          </div>
          <div className="text-[10px] font-bold opacity-40 tracking-widest uppercase pl-1 leading-tight">
            Flight Recorder <br/> 
            <span className="text-[8px] opacity-60">from New Psychonaut</span>
          </div>
        </div>

        <nav className="px-4 space-y-1 flex-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab.startsWith(item.id) 
                  ? (darkMode ? 'bg-white text-black' : 'bg-black text-white shadow-lg') 
                  : 'hover:bg-gray-100 dark:hover:bg-zinc-900'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-4">
          <button 
            onClick={() => setActiveTab('profile-record')}
            className={`w-full p-4 rounded-xl text-left transition-all hover:ring-2 hover:ring-blue-500/50 group ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'}`}
          >
            <p className="opacity-60 uppercase text-[10px] font-bold tracking-widest mb-1 group-hover:text-blue-500 transition-colors">Active Subject</p>
            <p className="font-semibold truncate">{activeProfile?.name || 'No Profile'}</p>
          </button>
          <div className="flex gap-2">
            <button onClick={toggleDarkMode} className={`flex-1 p-3 rounded-xl border flex items-center justify-center ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setUser(null)} className={`flex-1 p-3 rounded-xl border flex items-center justify-center ${darkMode ? 'border-zinc-800 text-red-400' : 'border-gray-200 text-red-600'}`}>
              <LogOut size={20} />
            </button>
          </div>
          <div className="flex justify-center pb-2">
             <img src={headerLogo} alt="New Psychonaut" className="h-8 object-contain" />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className={`p-4 md:p-6 border-b flex items-center justify-between ${darkMode ? 'border-zinc-800 bg-black' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center gap-4">
            <img src={headerLogo} alt="Header Logo" className="h-10 object-contain" />
            <div className="h-8 w-[1px] bg-gray-200 dark:bg-zinc-800 hidden md:block"></div>
            <span className="text-xs font-bold tracking-widest opacity-40 uppercase hidden md:block">Black Box Flight Recorder</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs font-mono opacity-40">PSY-OS v2.5.0-STABLE</span>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto animate-fadeIn">
            {children}
          </div>
          
          <footer className="mt-20 py-10 border-t border-gray-100 dark:border-zinc-800 text-center flex flex-col items-center">
            <p className="text-xs opacity-40 font-mono mb-4 uppercase tracking-[0.2em]">Black Box Recorder • Secure Encrypted Logging</p>
            <a href="https://newpsychonaut.com" target="_blank" rel="noopener noreferrer" className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 mb-6">
               newpsychonaut.com
            </a>
            
            {/* Neurophenom Banner - Moved to Footer and Reduced size by 30% (h-12 -> h-8.4, h-14 -> h-9.8) */}
            <a 
              href="https://neurophenom-ai-572556903588.us-west1.run.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block group transition-transform hover:scale-105 active:scale-95"
            >
              <img 
                src={ASSETS.BANNER_NEURO} 
                alt="Neurophenom AI" 
                className="h-8 md:h-10 w-auto rounded-lg border border-black/5 dark:border-white/5 opacity-50 hover:opacity-100 transition-opacity"
              />
            </a>
          </footer>
        </div>

        {/* Buy Me A Coffee - Bottom Right */}
        <a 
          href="https://buymeacoffee.com/stevebeale" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`fixed bottom-4 right-4 z-[60] flex items-center justify-center w-12 h-12 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group ${darkMode ? 'bg-zinc-800 text-yellow-400 border border-zinc-700' : 'bg-white text-yellow-600 border border-gray-200'}`}
        >
          <Coffee size={24} fill="currentColor" fillOpacity={0.2} />
          <span className="absolute bottom-full right-0 mb-3 px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
            Support the Research
          </span>
        </a>
      </main>
    </div>
  );
};