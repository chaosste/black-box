
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ASSETS } from '../constants';
import { 
  ChevronLeft, Clock, Save, Activity, FileText, ShieldCheck, Download,
  Notebook, Zap, Eye, Brain, Mic, File, Edit, X, Trash, Thermometer, User, Compass
} from 'lucide-react';
import { LogEntryType, Substance, SocialEnvironment, PhysicalEnvironment } from '../types';

export const SessionDetail: React.FC<{ sessionId: string, onBack: () => void }> = ({ sessionId, onBack }) => {
  const { activeProfile, updateSession, darkMode } = useStore();
  const session = activeProfile?.sessions.find(s => s.id === sessionId);
  
  const [phaseCInterval, setPhaseCInterval] = useState<'oneHour' | 'oneDay' | 'oneWeek'>('oneHour');
  const [phaseCInputs, setPhaseCInputs] = useState({
    mood: 5, attention: 5, wellBeing: 5, energy: 5, lifeOrientation: 5
  });
  const [showReport, setShowReport] = useState(false);
  const [notes, setNotes] = useState(session?.notes || '');
  
  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editPhaseA, setEditPhaseA] = useState(session?.phaseA);
  const [editPhaseB, setEditPhaseB] = useState(session?.phaseB);
  const [editDebrief, setEditDebrief] = useState(session?.debriefText || '');

  useEffect(() => {
    if (!session) return;
    const intervalData = session.phaseC[phaseCInterval];
    if (intervalData) {
      setPhaseCInputs({
        mood: intervalData.mood,
        attention: intervalData.attention,
        wellBeing: intervalData.wellBeing,
        energy: intervalData.energy,
        lifeOrientation: (intervalData as any).lifeOrientation || 5
      });
    } else {
      setPhaseCInputs({ mood: 5, attention: 5, wellBeing: 5, energy: 5, lifeOrientation: 5 });
    }
  }, [phaseCInterval, session]);

  if (!session) return null;

  const handleSaveNotes = () => {
    updateSession(sessionId, { notes });
    alert("Integration notes updated.");
  };

  const handleSavePhaseC = () => {
    const isValid = (val: number) => val >= 1 && val <= 10;
    if (!isValid(phaseCInputs.mood) || !isValid(phaseCInputs.attention) || !isValid(phaseCInputs.wellBeing) || !isValid(phaseCInputs.energy)) {
      alert("Please ensure all metrics are between 1 and 10.");
      return;
    }

    const updatedPhaseC = { ...session.phaseC };
    updatedPhaseC[phaseCInterval] = {
      mood: phaseCInputs.mood,
      attention: phaseCInputs.attention,
      wellBeing: phaseCInputs.wellBeing,
      energy: phaseCInputs.energy,
      ...(phaseCInterval === 'oneDay' ? { lifeOrientation: phaseCInputs.lifeOrientation } : {})
    };
    updateSession(sessionId, { phaseC: updatedPhaseC });
    alert(`${phaseCInterval} outcomes updated.`);
  };

  const handleCommitEdits = () => {
    if (!editPhaseA) return;
    updateSession(sessionId, {
      phaseA: editPhaseA,
      phaseB: editPhaseB,
      debriefText: editDebrief
    });
    setIsEditing(false);
    alert("Flight record successfully modified and persisted.");
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(session, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flight_session_${session.id.slice(0, 8)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const InputRange = ({ label, value, onChange }: any) => (
      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-black mb-1 uppercase tracking-widest">
          <label className="opacity-40">{label}</label>
          <span className="opacity-60 text-blue-500 font-bold">{value}</span>
        </div>
        <input 
          type="range" min="1" max="10" 
          value={value} 
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-all hover:h-2"
        />
      </div>
  );

  const getLogIcon = (type: LogEntryType) => {
    switch (type) {
      case 'Visual Observation': return <Eye size={12}/>;
      case 'Somatic Sensation': return <Zap size={12}/>;
      case 'Cognitive Shift': return <Brain size={12}/>;
      case 'audio': return <Mic size={12}/>;
      case 'file': return <File size={12}/>;
      default: return <FileText size={12}/>;
    }
  };

  if (showReport) {
    const headerLogo = darkMode ? ASSETS.LOGO_NEW_PSYCHONAUT_WHITE_CIRCULAR : ASSETS.LOGO_NEW_PSYCHONAUT_TYPE_BLACK;
    return (
      <div className={`max-w-4xl mx-auto p-10 md:p-16 my-8 border-[12px] border-black relative overflow-hidden transition-all animate-fadeIn ${darkMode ? 'bg-zinc-950 text-white' : 'bg-white text-black shadow-2xl'}`}>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start mb-14 border-b-[4px] border-black pb-12">
            <div className="flex-1">
               <div className="flex items-center gap-5 mb-10">
                  <img src={ASSETS.LOGO_OUROBOROS} className={`h-14 w-14 object-contain ${darkMode ? 'invert' : ''}`} alt="NP" />
                  <div className="h-12 w-[3px] bg-black dark:bg-white opacity-20"></div>
                  <img src={headerLogo} className="h-14 object-contain" alt="New Psychonaut" />
               </div>
               <h1 className="text-7xl font-black tracking-tighter uppercase leading-[0.8] mb-6">Flight<br/>Manifest</h1>
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-black tracking-[0.3em] uppercase">
                 <ShieldCheck size={14} /> Official Flight Record • Secure Ledger
               </div>
            </div>
         </div>

         <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-0 mb-14 border-4 border-black divide-x-4 divide-y-4 md:divide-y-0 divide-black">
            <div className="p-8">
               <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 opacity-40">01. Agent Profile</h3>
               <div className="text-3xl font-black tracking-tighter uppercase">{session.phaseA.substance}</div>
               <div className="font-mono text-xs mt-2 font-black opacity-60 uppercase">INITIAL DOSE: {session.phaseA.dosage} UNITS</div>
            </div>
            <div className="p-8 bg-zinc-50 dark:bg-zinc-900">
               <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 opacity-40">02. Calibration</h3>
               <div className="text-4xl font-black font-mono leading-none flex items-baseline tabular-nums">{session.phaseA.mood}.0</div>
            </div>
            <div className="p-8"><h3 className="text-[11px] font-black uppercase tracking-widest mb-6 opacity-40">03. Environment</h3><div className="text-[12px] font-black uppercase tracking-tight">{session.phaseA.physical}<br/>{session.phaseA.social}</div></div>
            <div className="p-8 bg-zinc-50 dark:bg-zinc-900">
              <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 opacity-40">04. Integration Status</h3>
              <p className="text-[10px] leading-relaxed font-bold uppercase tracking-widest text-blue-500">
                {session.notes ? "DATA RICH" : "PENDING NOTES"}
              </p>
            </div>
         </div>

         <div className="relative z-10 space-y-12">
           <section>
              <h4 className="text-[12px] font-black uppercase tracking-widest mb-6 border-b-2 border-black pb-2">Subject Notes</h4>
              <p className="text-sm font-medium leading-relaxed italic">{session.notes || "No detailed integration notes recorded for this flight."}</p>
           </section>
           
           <section>
              <h4 className="text-[12px] font-black uppercase tracking-widest mb-6 border-b-2 border-black pb-2">Phase B: Temporal Logs</h4>
              <div className="space-y-4">
                {session.phaseB.map((log, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-[9px] font-mono font-black opacity-40 whitespace-nowrap mt-1">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[8px] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded font-black uppercase tracking-widest opacity-60 flex items-center gap-1">
                           {getLogIcon(log.type)} {log.type}
                         </span>
                      </div>
                      <p className="text-xs font-bold leading-relaxed">{log.content}</p>
                      {log.fileUrl && <div className="mt-2 text-[9px] font-black text-blue-500 uppercase flex items-center gap-1"><Download size={10}/> Attachment: {log.fileName}</div>}
                    </div>
                  </div>
                ))}
              </div>
           </section>
         </div>

         <button onClick={() => setShowReport(false)} className="mt-16 w-full py-8 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-[0.4em] text-sm hover:scale-[1.01] active:scale-95 transition-all shadow-2xl">
            EXIT SUMMARY PROTOCOL
         </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-10">
        <button onClick={onBack} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity font-bold uppercase text-xs tracking-widest">
          <ChevronLeft size={20} /> Back to Logs
        </button>
        <div className="flex gap-4">
          {!isEditing && (
            <button 
              onClick={() => {
                setIsEditing(true);
                setEditPhaseA({...session.phaseA});
                setEditPhaseB([...session.phaseB]);
                setEditDebrief(session.debriefText || '');
              }} 
              className="px-6 py-4 bg-gray-100 dark:bg-zinc-800 text-blue-500 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-md"
            >
              <Edit size={20} /> Modify Flight
            </button>
          )}
          <button onClick={handleExportJSON} className="px-6 py-4 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"><Download size={20} /> JSON</button>
          <button onClick={() => setShowReport(true)} className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-2xl hover:scale-105 transition-all"><FileText size={20} /> Lab Report</button>
        </div>
      </div>

      <header className="mb-12">
        <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">{session.phaseA.substance} <span className="text-blue-500 opacity-40">[{session.phaseA.dosage}u]</span></h2>
        <p className="opacity-40 text-lg uppercase tracking-[0.2em] font-bold">{new Date(session.phaseA.timestamp).toLocaleString()}</p>
      </header>

      {isEditing ? (
        <div className="space-y-10 animate-fadeIn">
          <section className={`p-10 rounded-[3.5rem] border-4 ${darkMode ? 'bg-zinc-900 border-zinc-800 shadow-inner' : 'bg-white border-black shadow-2xl'}`}>
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-10 flex items-center gap-3"><Edit size={32} className="text-blue-500" /> Modification Protocol</h3>
            
            <div className="space-y-12">
              {/* Phase A Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4 border-b-2 border-black/10 dark:border-white/10 pb-2">
                  <Thermometer size={18} className="text-blue-500" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Phase A: Parameters</h4>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40">Agent Identity</label>
                    <select 
                      className={`w-full p-4 rounded-xl border-2 font-bold transition-all focus:border-blue-500 outline-none ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50'}`}
                      value={editPhaseA?.substance}
                      onChange={e => setEditPhaseA({...editPhaseA!, substance: e.target.value as Substance})}
                    >
                      {Object.values(Substance).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40">Dose Magnitude</label>
                    <input 
                      type="number"
                      className={`w-full p-4 rounded-xl border-2 font-mono font-bold transition-all focus:border-blue-500 outline-none ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50'}`}
                      value={editPhaseA?.dosage}
                      onChange={e => setEditPhaseA({...editPhaseA!, dosage: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40">Social Setting</label>
                    <select 
                      className={`w-full p-4 rounded-xl border-2 font-bold ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50'}`}
                      value={editPhaseA?.social}
                      onChange={e => setEditPhaseA({...editPhaseA!, social: e.target.value as SocialEnvironment})}
                    >
                      <option value={SocialEnvironment.ALONE}>Alone</option>
                      <option value={SocialEnvironment.NOT_ALONE}>Not Alone</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40">Physical Coordinates</label>
                    <select 
                      className={`w-full p-4 rounded-xl border-2 font-bold ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50'}`}
                      value={editPhaseA?.physical}
                      onChange={e => setEditPhaseA({...editPhaseA!, physical: e.target.value as PhysicalEnvironment})}
                    >
                      <option value={PhysicalEnvironment.FAMILIAR}>Familiar Environment</option>
                      <option value={PhysicalEnvironment.NEW}>New Environment</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Debrief Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b-2 border-black/10 dark:border-white/10 pb-2">
                  <User size={18} className="text-blue-500" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Post-Flight Debrief</h4>
                </div>
                <textarea 
                  className={`w-full p-6 rounded-2xl border-2 h-48 outline-none font-medium leading-relaxed transition-all focus:border-blue-500 ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50'}`}
                  placeholder="The core experiential narrative..."
                  value={editDebrief}
                  onChange={e => setEditDebrief(e.target.value)}
                />
              </div>

              {/* Phase B logs modification */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b-2 border-black/10 dark:border-white/10 pb-2">
                  <Clock size={18} className="text-blue-500" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Phase B: Log Stream</h4>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scroll">
                  {editPhaseB?.map((log, i) => (
                    <div key={i} className="flex gap-3 group">
                      <div className="flex-1 relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30">{getLogIcon(log.type)}</div>
                        <input 
                          type="text" 
                          className={`w-full p-3 pl-10 rounded-xl border-2 text-sm font-bold transition-all focus:border-blue-500 ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50'}`}
                          value={log.content}
                          onChange={e => {
                            const newB = [...editPhaseB];
                            newB[i].content = e.target.value;
                            setEditPhaseB(newB);
                          }}
                        />
                      </div>
                      <button 
                        onClick={() => setEditPhaseB(editPhaseB.filter((_, idx) => idx !== i))}
                        className="p-3 text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                  {editPhaseB?.length === 0 && <p className="text-center italic opacity-40 text-sm">No temporal logs available for modification.</p>}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-12 pt-10 border-t border-black/10 dark:border-white/10">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-6 border-2 border-gray-100 dark:border-zinc-800 rounded-3xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-red-500/10 hover:text-red-500 transition-all">
                <X size={18} /> Abort Edits
              </button>
              <button onClick={handleCommitEdits} className="flex-[2] py-6 bg-blue-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-blue-700 hover:scale-[1.01] transition-all">
                <Save size={20} /> Commit System Overwrite
              </button>
            </div>
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-10">
             <section className={`p-8 rounded-[3rem] border-4 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black shadow-xl'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter"><Notebook size={24}/> Integration Notes</h3>
                  <button onClick={handleSaveNotes} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center gap-2 shadow-lg"><Save size={14}/> Save</button>
                </div>
                <textarea 
                  className={`w-full p-6 rounded-2xl border-2 outline-none resize-none h-48 transition-all font-medium ${darkMode ? 'bg-black border-zinc-800 focus:border-blue-500' : 'bg-gray-50 border-gray-100 focus:border-black'}`}
                  placeholder="Record deeper reflections or integration insights..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
             </section>

             <section className={`p-8 rounded-[3rem] border-4 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black shadow-xl'}`}>
                <h3 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter mb-6"><Clock /> Phase B: Logs</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
                  {session.phaseB.map((log, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50'}`}>
                      <div className="flex justify-between mb-2">
                         <span className="text-[8px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1">{getLogIcon(log.type)} {log.type}</span>
                         <p className="text-[9px] font-mono font-black opacity-30 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <p className="text-sm font-bold">"{log.content}"</p>
                      {log.fileUrl && <div className="mt-3 p-2 bg-black/5 rounded-lg text-[10px] font-black text-blue-600 uppercase flex items-center gap-2 truncate"><Download size={14}/> {log.fileName}</div>}
                    </div>
                  ))}
                  {session.phaseB.length === 0 && <p className="text-center italic opacity-30 py-4">No temporal logs recorded.</p>}
                </div>
             </section>
          </div>

          <div className="space-y-10">
            <section className={`p-8 rounded-[3rem] border-4 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black shadow-xl'}`}>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter"><Activity /> Outcomes</h3>
                <button onClick={handleSavePhaseC} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center gap-2 shadow-lg"><Save size={14}/> Sync</button>
              </div>
              <div className="flex gap-2 mb-10 p-1 bg-gray-100 dark:bg-black rounded-2xl border border-gray-200 dark:border-zinc-800">
                {(['oneHour', 'oneDay', 'oneWeek'] as const).map(interval => (
                  <button key={interval} onClick={() => setPhaseCInterval(interval)} className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${phaseCInterval === interval ? 'bg-white dark:bg-zinc-800 shadow-lg text-blue-500' : 'opacity-40 hover:opacity-60'}`}>
                    {interval === 'oneHour' ? '1H' : interval === 'oneDay' ? '24H' : '7D'}
                  </button>
                ))}
              </div>
              <div className="space-y-6">
                <InputRange label="Mood Delta" value={phaseCInputs.mood} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, mood: v})} />
                <InputRange label="Well-Being" value={phaseCInputs.wellBeing} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, wellBeing: v})} />
                <InputRange label="Cognitive Load" value={phaseCInputs.attention} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, attention: v})} />
              </div>
            </section>

            <section className={`p-8 rounded-[3rem] border-4 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black shadow-xl'}`}>
              <h3 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter mb-6"><Compass size={24} className="text-blue-500"/> Final Trajectory</h3>
              <div className={`p-6 rounded-2xl border-2 border-dashed ${darkMode ? 'bg-black/40 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
                 <p className="text-sm font-medium leading-relaxed italic opacity-70">
                   {session.debriefText || "Experience debrief summary pending final subject input."}
                 </p>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
