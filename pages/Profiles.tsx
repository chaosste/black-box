
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { UserCircle, Plus, Check, ChevronRight, Fingerprint, Save, Activity, ClipboardList, Clock, ArrowLeft } from 'lucide-react';

export const Profiles: React.FC<{ forceRecordView?: boolean }> = ({ forceRecordView }) => {
  const { user, setUser, activeProfile, setActiveProfile, updateProfile, addBaseline, darkMode } = useStore();
  const [newProfileName, setNewProfileName] = useState('');
  const [showRecord, setShowRecord] = useState(false);

  // Bio-data temporary state for editing
  const [bioData, setBioData] = useState({
    age: activeProfile?.age || '',
    sex: activeProfile?.sex || '',
    details: activeProfile?.details || ''
  });

  useEffect(() => {
    if (forceRecordView && activeProfile) {
      setShowRecord(true);
      setBioData({ age: activeProfile.age || '', sex: activeProfile.sex || '', details: activeProfile.details || '' });
    }
  }, [forceRecordView, activeProfile]);

  const handleAddProfile = () => {
    if (!newProfileName.trim() || !user) return;
    const newProfile = { 
      id: crypto.randomUUID(), 
      name: newProfileName, 
      sessions: [], 
      baselines: [{ timestamp: new Date().toISOString(), mood: 5, stress: 5, wellBeing: 5, mindfulness: 5, selfEsteem: 5 }], 
      questionnaires: [] 
    };
    setUser({ ...user, profiles: [...user.profiles, newProfile], currentProfileId: newProfile.id });
    setNewProfileName('');
  };

  const handleSaveBio = () => {
    if (!activeProfile) return;
    updateProfile(activeProfile.id, bioData);
    alert('Bio-data updated in subject record.');
  };

  const refreshBaselines = () => {
    window.location.hash = '#baselines';
  };

  if (activeProfile && showRecord) {
    return (
      <div className="max-w-5xl mx-auto py-8 space-y-12">
        <header className="flex justify-between items-center">
          <button onClick={() => setShowRecord(false)} className="flex items-center gap-2 font-bold uppercase text-xs opacity-40 hover:opacity-100 transition-opacity">
            <ArrowLeft size={16} /> Back to Subjects
          </button>
          <div className="text-right">
             <h2 className="text-4xl font-black tracking-tighter uppercase">{activeProfile.name}</h2>
             <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Research Subject Record • UID: {activeProfile.id.slice(0, 12)}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Bio-Data Card */}
          <section className={`md:col-span-1 p-8 rounded-[2.5rem] border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-xl'}`}>
             <h3 className="font-black text-sm uppercase tracking-widest mb-6 opacity-40">Bio-Physical Markers</h3>
             <div className="space-y-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-black opacity-40 uppercase">Age</label>
                   <input 
                    className={`w-full p-4 rounded-xl border-2 font-mono text-sm ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'}`}
                    placeholder="E.G. 28"
                    value={bioData.age}
                    onChange={e => setBioData({...bioData, age: e.target.value})}
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black opacity-40 uppercase">Sex</label>
                   <input 
                    className={`w-full p-4 rounded-xl border-2 font-mono text-sm ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'}`}
                    placeholder="E.G. MALE / FEMALE"
                    value={bioData.sex}
                    onChange={e => setBioData({...bioData, sex: e.target.value})}
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black opacity-40 uppercase">Observations / Notes</label>
                   <textarea 
                    className={`w-full p-4 rounded-xl border-2 font-mono text-sm h-32 resize-none ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'}`}
                    placeholder="General research observations..."
                    value={bioData.details}
                    onChange={e => setBioData({...bioData, details: e.target.value})}
                   />
                </div>
                <button onClick={handleSaveBio} className="w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                   <Save size={14} /> Commit Changes
                </button>
             </div>
          </section>

          {/* Activity Logs Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Assessment History */}
            <section className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm'}`}>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-sm uppercase tracking-widest opacity-40 flex items-center gap-2"><ClipboardList size={16}/> Native Assessments</h3>
                  <button onClick={() => window.location.hash = '#questionnaires'} className="text-[10px] font-black text-blue-500 uppercase tracking-widest">New Test</button>
               </div>
               <div className="space-y-3">
                  {activeProfile.questionnaires?.length ? [...activeProfile.questionnaires].reverse().map(q => (
                    <div key={q.id} className={`p-4 rounded-2xl flex justify-between items-center border ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-100'}`}>
                       <div>
                          <p className="font-bold text-sm uppercase">{q.name}</p>
                          <p className="text-[10px] font-mono opacity-40">{new Date(q.completedAt).toLocaleString()}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-black">SCORE: {q.score || 'N/A'}</p>
                       </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 opacity-20 italic text-sm">No native questionnaires completed.</div>
                  )}
               </div>
            </section>

            {/* Baseline/DataPoint History */}
            <section className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm'}`}>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-sm uppercase tracking-widest opacity-40 flex items-center gap-2"><Activity size={16}/> DataPoint Calibration History</h3>
                  <button onClick={refreshBaselines} className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> Refresh</button>
               </div>
               <div className="space-y-3">
                  {activeProfile.baselines?.length ? [...activeProfile.baselines].reverse().map((b, i) => (
                    <div key={i} className={`p-4 rounded-2xl border ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-100'} transition-all hover:border-blue-500/30`}>
                       <div className="flex justify-between items-center mb-3">
                          <p className="text-[10px] font-black opacity-40 uppercase">{new Date(b.timestamp).toLocaleString()}</p>
                          <div className="flex gap-2">
                             <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded">M:{b.mood}</span>
                             <span className="text-[9px] font-bold px-2 py-0.5 bg-green-500/10 text-green-500 rounded">W:{b.wellBeing}</span>
                             <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded">S:{b.stress}</span>
                          </div>
                       </div>
                       <div className="h-1 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                          <div className="h-full bg-blue-500" style={{ width: `${b.mood * 10}%` }}></div>
                       </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 opacity-20 italic text-sm">Subject baseline history is empty.</div>
                  )}
               </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-12">
        <h2 className="text-4xl font-bold mb-2">Subject Management</h2>
        <p className="opacity-60 text-lg">Manage multiple participants for independent N-of-1 research studies.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {user?.profiles.map(p => (
          <button
            key={p.id}
            onClick={() => {
              setActiveProfile(p.id);
              setShowRecord(true);
              setBioData({ age: p.age || '', sex: p.sex || '', details: p.details || '' });
            }}
            className={`p-10 rounded-[2.5rem] border-2 text-left transition-all flex items-center justify-between group ${
              activeProfile?.id === p.id 
                ? (darkMode ? 'border-white bg-white text-black' : 'border-black bg-black text-white shadow-2xl') 
                : (darkMode ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-600' : 'border-gray-100 bg-white hover:border-gray-300 shadow-md')
            }`}
          >
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-2xl ${activeProfile?.id === p.id ? 'bg-black/10' : 'bg-blue-500/10'}`}>
                <Fingerprint size={32} className={activeProfile?.id === p.id ? 'text-black' : 'text-blue-500'} />
              </div>
              <div>
                <p className="text-2xl font-bold">{p.name}</p>
                <p className={`text-xs font-mono uppercase tracking-widest opacity-60 mt-1`}>{p.sessions.length} RECORDED FLIGHTS</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {activeProfile?.id === p.id && <div className="p-2 bg-green-500 rounded-full"><Check size={16} className="text-white" /></div>}
              <div className="text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">View Record</div>
              <ChevronRight size={24} className="opacity-20 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>

      <div className={`p-10 rounded-[3rem] border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
        <h3 className="text-xl font-bold mb-2">Register New Research ID</h3>
        <p className="text-sm opacity-60 mb-8 max-w-lg leading-relaxed">Each profile maintains a localized, encrypted ledger of psychological baselines and experiment outcomes, isolated from other subjects.</p>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="SUBJECT ID / NAME"
            className={`flex-1 p-5 rounded-2xl border font-mono uppercase text-sm tracking-widest ${darkMode ? 'bg-black border-zinc-800 focus:border-white' : 'bg-white border-gray-300 focus:border-black'} outline-none transition-all`}
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
          />
          <button 
            onClick={handleAddProfile}
            className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus size={24} /> CREATE PROFILE
          </button>
        </div>
      </div>
    </div>
  );
};
