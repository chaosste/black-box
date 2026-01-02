
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Profile, FlightSession, Baseline, DraftSession, QuestionnaireData } from '../types';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  activeProfile: Profile | null;
  setActiveProfile: (profileId: string) => void;
  updateProfile: (profileId: string, updates: Partial<Profile>) => void;
  addSession: (session: FlightSession) => void;
  updateSession: (sessionId: string, updates: Partial<FlightSession>) => void;
  addBaseline: (baseline: Baseline) => void;
  addQuestionnaireResult: (result: QuestionnaireData) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  draft: DraftSession | null;
  setDraft: (draft: DraftSession | null) => void;
  completeTutorial: () => void;
}

const StoreContext = createContext<AppState | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('flight_recorder_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [draft, setDraftState] = useState<DraftSession | null>(() => {
    const saved = localStorage.getItem('flight_recorder_draft');
    return saved ? JSON.parse(saved) : null;
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('flight_recorder_dark');
    // Default to true (Dark Mode) if not set
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('flight_recorder_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('flight_recorder_dark', darkMode.toString());
    if (darkMode) {
      document.body.classList.add('dark');
      document.body.classList.remove('bg-gray-50');
      document.body.classList.add('bg-black');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.remove('bg-black');
      document.body.classList.add('bg-gray-50');
    }
  }, [darkMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (draft) {
        localStorage.setItem('flight_recorder_draft', JSON.stringify({
          ...draft,
          lastSaved: new Date().toISOString()
        }));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [draft]);

  const setDraft = (newDraft: DraftSession | null) => {
    setDraftState(newDraft);
    if (newDraft) {
      localStorage.setItem('flight_recorder_draft', JSON.stringify(newDraft));
    } else {
      localStorage.removeItem('flight_recorder_draft');
    }
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const setActiveProfile = (profileId: string) => {
    if (!user) return;
    setUser({ ...user, currentProfileId: profileId });
  };

  const updateProfile = (profileId: string, updates: Partial<Profile>) => {
    if (!user) return;
    const updatedProfiles = user.profiles.map(p => 
      p.id === profileId ? { ...p, ...updates } : p
    );
    setUser({ ...user, profiles: updatedProfiles });
  };

  const activeProfile = user?.profiles.find(p => p.id === user.currentProfileId) || null;

  const addSession = (session: FlightSession) => {
    if (!user || !activeProfile) return;
    const updatedProfiles = user.profiles.map(p => 
      p.id === activeProfile.id 
        ? { ...p, sessions: [...p.sessions, session] } 
        : p
    );
    setUser({ ...user, profiles: updatedProfiles });
    setDraft(null);
  };

  const updateSession = (sessionId: string, updates: Partial<FlightSession>) => {
    if (!user || !activeProfile) return;
    const updatedProfiles = user.profiles.map(p => {
      if (p.id !== activeProfile.id) return p;
      return {
        ...p,
        sessions: p.sessions.map(s => s.id === sessionId ? { ...s, ...updates } : s)
      };
    });
    setUser({ ...user, profiles: updatedProfiles });
  };

  const addBaseline = (baseline: Baseline) => {
    if (!user || !activeProfile) return;
    const updatedProfiles = user.profiles.map(p => 
      p.id === activeProfile.id 
        ? { ...p, baselines: [...(p.baselines || []), baseline] } 
        : p
    );
    setUser({ ...user, profiles: updatedProfiles });
  };

  const addQuestionnaireResult = (result: QuestionnaireData) => {
    if (!user || !activeProfile) return;
    const updatedProfiles = user.profiles.map(p => 
      p.id === activeProfile.id 
        ? { ...p, questionnaires: [...(p.questionnaires || []), result] } 
        : p
    );
    setUser({ ...user, profiles: updatedProfiles });
  };

  const completeTutorial = () => {
    if (!user) return;
    setUser({ ...user, tutorialCompleted: true });
  };

  return (
    <StoreContext.Provider value={{ 
      user, setUser, activeProfile, setActiveProfile, updateProfile, addSession, updateSession, addBaseline, addQuestionnaireResult, darkMode, toggleDarkMode,
      draft, setDraft, completeTutorial
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};