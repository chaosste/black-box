
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ASSETS } from '../constants';
import { 
  ChevronLeft, Clock, Save, Activity, FileText, ShieldCheck, Download,
  Notebook, Zap, Eye, Brain, Mic, File, Edit, X, Trash, Thermometer, User, Compass, AlertCircle, Tag, Plus, Printer, Share2
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
  const [editTags, setEditTags] = useState<string[]>(session?.tags || []);
  const [newTag, setNewTag] = useState('');

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

  const isValueValid = (val: number) => val >= 1 && val <= 10;

  const handleSavePhaseC = () => {
    if (!isValueValid(phaseCInputs.mood) || !isValueValid(phaseCInputs.attention) || !isValueValid(phaseCInputs.wellBeing) || !isValueValid(phaseCInputs.energy)) {
      alert("Invalid input detected. Please ensure all metrics are between 1 and 10.");
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
      debriefText: editDebrief,
      tags: editTags
    });
    setIsEditing(false);
    alert("Flight record successfully modified and persisted.");
  };

  const handleAddTag = () => {
    const trimmed = newTag.trim().toUpperCase();
    if (trimmed && !editTags.includes(trimmed)) {
      setEditTags([...editTags, trimmed]);
      setNewTag('');
    }
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

  const InputWithValidation = ({ label, value, onChange }: any) => {
    const invalid = !isValueValid(value);
    return (
      <div className="mb-6">
        <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest">
          <label className={invalid ? 'text-red-500' : 'opacity-40'}>{label}</label>
          <span className={invalid ? 'text-red-500 font-black' : 'opacity-60 text-blue-500 font-bold'}>{value}</span>
        </div>
        <div className="flex gap-4 items-center">
          <input 
            type="range" min="1" max="10" 
            value={isValueValid(value) ? value : 5} 
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="flex-1 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-all"
          />
          <input 
            type="number"
            min="1"
            max="10"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            className={`w-14 p-2 rounded-lg border-2 text-center font-mono text-sm font-bold outline-none transition-all ${
              invalid 
                ? 'border-red-500 bg-red-500/10 text-red-500 animate-pulse' 
                : (darkMode ? 'bg-black border-zinc-800 focus:border-blue-500' : 'bg-white border-gray-100 focus:border-black')
            }`}
          />
        </div>
        {invalid && (
          <p className="text-[9px] text-red-500 mt-1 font-bold flex items-center gap-1 uppercase tracking-tighter">
            <AlertCircle size={10} /> Value must be between 1 and 10
          </p>
        )}
      </div>
    );
  };

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
      <div className={`max-w-4xl mx-auto p-12 md:p-16 my-8 border-2 relative overflow-hidden transition-all animate-fadeIn print:m-0 print:border-none print:p-8 ${darkMode ? 'bg-zinc-950 text-white border-zinc-800' : 'bg-white text-black border-black shadow-2xl'}`}>
         {/* Report Background Watermark */}
         <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <img src={ASSETS.LOGO_OUROBOROS} className="w-96 h-96" alt="" />
         </div>

         {/* Official Header */}
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start mb-10 border-b-4 border-black dark:border-white pb-8">
            <div className="flex-1">
               <div className="flex items-center gap-4 mb-8">
                  <img src={ASSETS.LOGO_OUROBOROS} className={`h-10 w-10 object-contain ${darkMode ? 'invert' : ''}`} alt="NP" />
                  <div className="h-8 w-[2px] bg-black dark:bg-white opacity-20"></div>
                  <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Black Box <span className="text-blue-500">Record</span></h1>
               </div>
               <div className="flex flex-col gap-1">
                  <span className="font-mono text-[9px] font-black uppercase tracking-widest opacity-40">Document ID: BB-SESS-{session.id.slice(0, 8).toUpperCase()}</span>
                  <span className="font-mono text-[9px] font-black uppercase tracking-widest opacity-40">Classification: {session.tags?.join(' / ') || 'UNCLASSIFIED'}</span>
               </div>
            </div>
            <div className="text-right mt-6 md:mt-0">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white dark:bg-white dark:text-black font-mono text-[9px] font-black tracking-widest uppercase mb-4">
                 Verified Flight Ledger
               </div>
               <p className="font-mono text-[10px] font-bold opacity-60 uppercase">{new Date(session.phaseA.timestamp).toLocaleString()}</p>
            </div>
         </div>

         {/* Metadata Matrix */}
         <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-0 mb-10 border-2 border-black dark:border-white divide-x-2 divide-y-2 md:divide-y-0 divide-black dark:divide-white">
            <div className="p-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-40">01. Agent</h3>
               <div className="text-2xl font-black tracking-tighter uppercase leading-none">{session.phaseA.substance}</div>
               <div className="font-mono text-[10px] mt-2 font-black opacity-60">DOSE: {session.phaseA.dosage}U</div>
            </div>
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50">
               <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-40">02. Baseline</h3>
               <div className="text-2xl font-black font-mono leading-none flex items-baseline tabular-nums">{session.phaseA.mood}.0 <span className="text-xs opacity-30 ml-1">SET</span></div>
            </div>
            <div className="p-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-40">03. Context</h3>
               <div className="text-[10px] font-black uppercase leading-tight tracking-tight">
                  {session.phaseA.physical}<br/>
                  <span className="opacity-40">{session.phaseA.social}</span>
               </div>
            </div>
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50">
               <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-40">04. Status</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                 INTEGRATION ACTIVE
               </p>
            </div>
         </div>

         {/* Main Content Area */}
         <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
           <div className="md:col-span-2 space-y-10">
             <section>
                <h4 className="text-[11px] font-black uppercase tracking-widest mb-4 border-b border-black/20 dark:border-white/20 pb-1">Experiential Narrative</h4>
                <p className="text-[13px] font-medium leading-relaxed italic opacity-80 whitespace-pre-wrap">{session.debriefText || "No debrief narrative recorded for this flight."}</p>
             </section>

             <section>
                <h4 className="text-[11px] font-black uppercase tracking-widest mb-4 border-b border-black/20 dark:border-white/20 pb-1">Phase B: Temporal Log Stream</h4>
                <div className="space-y-4">
                  {session.phaseB.length > 0 ? session.phaseB.map((log, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <span className="text-[9px] font-mono font-black opacity-30 whitespace-nowrap mt-1">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[8px] bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded font-black uppercase tracking-widest opacity-60 flex items-center gap-1">
                             {getLogIcon(log.type)} {log.type}
                           </span>
                        </div>
                        <p className="text-[11px] font-bold leading-relaxed">{log.content}</p>
                      </div>
                    </div>
                  )) : <p className="text-[11px] opacity-30 italic">No temporal events captured during active flight phase.</p>}
                </div>
             </section>

             <section>
                <h4 className="text-[11px] font-black uppercase tracking-widest mb-4 border-b border-black/20 dark:border-white/20 pb-1">Subject Reflections</h4>
                <p className="text-[12px] font-medium leading-relaxed opacity-70 italic">{session.notes || "Additional subject notes pending integration cycle."}</p>
             </section>
           </div>

           <div className="md:col-span-1 space-y-10">
             <section>
                <h4 className="text-[11px] font-black uppercase tracking-widest mb-4 border-b border-black/20 dark:border-white/20 pb-1">Outcome Matrix</h4>
                <div className="space-y-4">
                  {[
                    { label: 'Mood Delta', val: session.phaseC.oneDay?.mood },
                    { label: 'Well-Being', val: session.phaseC.oneDay?.wellBeing },
                    { label: 'Cognitive', val: session.phaseC.oneDay?.attention },
                    { label: 'Energy', val: session.phaseC.oneDay?.energy },
                    { label: 'Life Orient.', val: session.phaseC.oneDay?.lifeOrientation },
                  ].map((m, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-black/5 dark:border-white/5 last:border-0">
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{m.label}</span>
                       <span className="font-mono text-xs font-black">{m.val || '--'}.0</span>
                    </div>
                  ))}
                </div>
             </section>

             <section>
                <h4 className="text-[11px] font-black uppercase tracking-widest mb-4 border-b border-black/20 dark:border-white/20 pb-1">Trajectory Plot</h4>
                <div className={`p-4 rounded-xl border-2 border-dashed ${darkMode ? 'border-zinc-800' : 'border-gray-200'} h-40 flex items-center justify-center`}>
                  <div className="text-[9px] font-black opacity-20 uppercase tracking-[0.2em] text-center">Visual Telemetry <br/> Data Active</div>
                </div>
             </section>

             <section className="pt-10 border-t-2 border-black dark:border-white border-dotted">
                <div className="h-10 border-b border-black dark:border-white mb-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Subject Signature</span>
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Date</span>
                </div>
             </section>
           </div>
         </div>

         {/* Footer Controls */}
         <div className="relative z-10 mt-16 pt-8 border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 print:hidden">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30">© New Psychonaut Black Box Recorder v2.5.0</p>
            <div className="flex gap-4">
              <button onClick={() => window.print()} className="px-6 py-3 border-2 border-black dark:border-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                <Printer size={16} /> Print Report
              </button>
              <button onClick={() => setShowReport(false)} className="px-10 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.05] active:scale-95 transition-all shadow-xl">
                 Close Manifest
              </button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-10">
        <button onClick={onBack} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity font-bold uppercase text-xs tracking-widest text-blue-600">
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
                setEditTags(session.tags || []);
              }} 
              className="px-6 py-4 bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg"
            >
              <Edit size={20} /> Edit Session
            </button>
          )}
          <button onClick={handleExportJSON} className="px-6 py-4 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"><Download size={20} /> JSON</button>
          <button onClick={() => setShowReport(true)} className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-2xl hover:scale-105 transition-all"><FileText size={20} /> Lab Report</button>
        </div>
      </div>

      <header className="mb-12">
        <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">{session.phaseA.substance} <span className="text-blue-500 opacity-40">[{session.phaseA.dosage}u]</span></h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {session.tags?.map(t => (
            <span key={t} className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-blue-500/20">
              <Tag size={10} /> {t}
            </span>
          ))}
        </div>
        <p className="opacity-40 text-lg uppercase tracking-[0.2em] font-bold">{new Date(session.phaseA.timestamp).toLocaleString()}</p>
      </header>

      {isEditing ? (
        <div className="space-y-10 animate-fadeIn">
          <section className={`p-10 rounded-[3.5rem] border-4 ${darkMode ? 'bg-zinc-900 border-zinc-800 shadow-inner' : 'bg-white border-black shadow-2xl'}`}>
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-10 flex items-center gap-3"><Edit size={32} className="text-blue-500" /> Modification Console</h3>
            
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4 border-b-2 border-black/10 dark:border-white/10 pb-2">
                  <Compass size={18} className="text-blue-500" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Phase A: Parameters</h4>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40">Agent</label>
                    <select 
                      className={`w-full p-4 rounded-xl border-2 font-bold transition-all focus:border-blue-500 outline-none ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50'}`}
                      value={editPhaseA?.substance}
                      onChange={e => setEditPhaseA({...editPhaseA!, substance: e.target.value as Substance})}
                    >
                      {Object.values(Substance).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase opacity-40">Dosage</label>
                    <input 
                      type="number"
                      className={`w-full p-4 rounded-xl border-2 font-mono font-bold transition-all focus:border-blue-500 outline-none ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50'}`}
                      value={editPhaseA?.dosage}
                      onChange={e => setEditPhaseA({...editPhaseA!, dosage: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              {/* Tags Editor */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b-2 border-black/10 dark:border-white/10 pb-2">
                  <Tag size={18} className="text-blue-500" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Session Labels / Tags</h4>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {editTags.map(t => (
                    <span key={t} className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-blue-500/20">
                      {t} <button onClick={() => setEditTags(editTags.filter(tag => tag !== t))} className="hover:text-red-500"><X size={12}/></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="ADD LABEL (e.g. SOLO, INTEGRATION)..."
                    className={`flex-1 p-4 rounded-xl border-2 font-black uppercase text-xs tracking-widest outline-none transition-all focus:border-blue-500 ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50'}`}
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleAddTag()}
                  />
                  <button onClick={handleAddTag} className="px-6 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-blue-700 shadow-lg">
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b-2 border-black/10 dark:border-white/10 pb-2">
                  <Notebook size={18} className="text-blue-500" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Experience Debrief</h4>
                </div>
                <textarea 
                  className={`w-full p-6 rounded-2xl border-2 h-48 outline-none font-medium leading-relaxed transition-all focus:border-blue-500 ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50'}`}
                  placeholder="Modify the experiential narrative..."
                  value={editDebrief}
                  onChange={e => setEditDebrief(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 border-b-2 border-black/10 dark:border-white/10 pb-2">
                  <Activity size={18} className="text-blue-500" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Phase C: Outcome Metrics</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  <InputWithValidation label="Mood Delta" value={phaseCInputs.mood} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, mood: v})} />
                  <InputWithValidation label="Well-Being" value={phaseCInputs.wellBeing} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, wellBeing: v})} />
                  <InputWithValidation label="Cognitive Load" value={phaseCInputs.attention} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, attention: v})} />
                  <InputWithValidation label="System Energy" value={phaseCInputs.energy} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, energy: v})} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-12 pt-10 border-t border-black/10 dark:border-white/10">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-6 border-2 border-gray-100 dark:border-zinc-800 rounded-3xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-red-500/10 hover:text-red-500 transition-all">
                <X size={18} /> Cancel
              </button>
              <button onClick={handleCommitEdits} className="flex-[2] py-6 bg-blue-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-blue-700 hover:scale-[1.01] transition-all">
                <Save size={20} /> Commit Changes
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
                <InputWithValidation label="Mood Delta" value={phaseCInputs.mood} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, mood: v})} />
                <InputWithValidation label="Well-Being" value={phaseCInputs.wellBeing} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, wellBeing: v})} />
                <InputWithValidation label="Cognitive Load" value={phaseCInputs.attention} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, attention: v})} />
                <InputWithValidation label="System Energy" value={phaseCInputs.energy} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, energy: v})} />
                {phaseCInterval === 'oneDay' && (
                  <InputWithValidation label="Life Orientation" value={phaseCInputs.lifeOrientation} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, lifeOrientation: v})} />
                )}
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
