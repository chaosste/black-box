
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ASSETS } from '../constants';
import { 
  ChevronLeft, Send, Clock, Save, Activity, FileText, Printer, CheckSquare, 
  Square, Hexagon, ShieldCheck, Download, Tag, X, Plus, PowerOff, Sparkles, ArrowRight,
  PencilLine
} from 'lucide-react';

export const SessionDetail: React.FC<{ sessionId: string, onBack: () => void }> = ({ sessionId, onBack }) => {
  const { activeProfile, updateSession, darkMode } = useStore();
  const session = activeProfile?.sessions.find(s => s.id === sessionId);
  
  const [logText, setLogText] = useState('');
  const [phaseCInterval, setPhaseCInterval] = useState<'oneHour' | 'oneDay' | 'oneWeek'>('oneHour');
  const [phaseCInputs, setPhaseCInputs] = useState({
    mood: 5, attention: 5, wellBeing: 5, energy: 5, lifeOrientation: 5
  });
  const [showReport, setShowReport] = useState(false);
  const [showLandingWizard, setShowLandingWizard] = useState(false);
  const [landingStep, setLandingStep] = useState(0);
  const [newTag, setNewTag] = useState('');

  // Landing wizard state
  const [debriefText, setDebriefText] = useState(session?.debriefText || '');
  const [landingTags, setLandingTags] = useState<string[]>(session?.tags || []);

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

  const handleAddLog = () => {
    if (!logText.trim()) return;
    const newLogs = [...session.phaseB, { timestamp: new Date().toISOString(), content: logText }];
    updateSession(sessionId, { phaseB: newLogs });
    setLogText('');
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
    if (!showLandingWizard) alert(`${phaseCInterval} outcomes updated.`);
  };

  const handleCommitLanding = () => {
    updateSession(sessionId, { 
      isCompleted: true, 
      debriefText, 
      tags: landingTags,
      phaseC: { ...session.phaseC, oneDay: { ...phaseCInputs, mood: phaseCInputs.mood, wellBeing: phaseCInputs.wellBeing, attention: phaseCInputs.attention, energy: phaseCInputs.energy, lifeOrientation: phaseCInputs.lifeOrientation } }
    });
    setShowLandingWizard(false);
    alert("Experience committed to the research ledger.");
    window.location.hash = '#baselines';
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

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    const tags = landingTags;
    if (tags.includes(newTag.trim())) return;
    setLandingTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setLandingTags(landingTags.filter(t => t !== tagToRemove));
  };

  const InputRange = ({ label, value, onChange }: any) => {
    const outOfBounds = value < 1 || value > 10;
    return (
      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-widest">
          <label className="opacity-40">{label}</label>
          <span className={outOfBounds ? "text-red-500 font-black animate-pulse" : "opacity-60"}>{value}</span>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="range" min="1" max="10" 
            value={value} 
            onChange={(e) => onChange(parseInt(e.target.value))}
            className={`flex-1 h-1 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-all ${outOfBounds ? 'ring-2 ring-red-500' : ''}`}
          />
        </div>
      </div>
    );
  };

  if (showReport) {
    const headerLogo = darkMode ? ASSETS.LOGO_NEW_PSYCHONAUT_WHITE_CIRCULAR : ASSETS.LOGO_NEW_PSYCHONAUT_TYPE_BLACK;
    return (
      <div className={`max-w-4xl mx-auto p-10 md:p-16 my-8 border-[12px] border-black relative overflow-hidden ${darkMode ? 'bg-zinc-950 text-white' : 'bg-white text-black shadow-2xl'} print:m-0 print:border-black print:shadow-none print:p-8`}>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none rotate-12 scale-150">
           <Hexagon size={600} />
         </div>

         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start mb-14 border-b-[4px] border-black pb-12">
            <div className="flex-1">
               <div className="flex items-center gap-5 mb-10">
                  <img src={ASSETS.LOGO_OUROBOROS} className={`h-14 w-14 object-contain ${darkMode ? 'invert' : ''}`} alt="NP" />
                  <div className="h-12 w-[3px] bg-black dark:bg-white opacity-20"></div>
                  <img src={headerLogo} className="h-14 object-contain" alt="New Psychonaut" />
               </div>
               <h1 className="text-7xl font-black tracking-tighter uppercase leading-[0.8] mb-6">Experiment<br/>Manifest</h1>
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-mono text-[10px] font-black tracking-[0.3em] uppercase">
                 <ShieldCheck size={14} /> Official Flight Record • Secure Ledger
               </div>
            </div>
            <div className="md:text-right mt-10 md:mt-0 font-mono text-[11px] font-black space-y-3 uppercase tracking-tight">
               <div className="bg-black dark:bg-white dark:text-black text-white p-4 inline-block mb-4 shadow-xl">
                 <span className="opacity-60">LEDGER_UUID:</span><br/>
                 <span className="text-lg">{session.id.toUpperCase().slice(0, 16)}</span>
               </div>
               <div className="pt-2"><span className="opacity-40">OPERATOR:</span> {activeProfile?.name}</div>
               <div><span className="opacity-40">INIT_TIME:</span> {new Date(session.phaseA.timestamp).toLocaleString()}</div>
               <div className="pt-6 print:hidden flex flex-col gap-2">
                 <button onClick={() => window.print()} className="flex items-center gap-3 bg-black text-white px-8 py-4 hover:bg-zinc-800 transition-all ml-auto font-black text-xs tracking-widest uppercase shadow-2xl">
                    <Printer size={16} /> GENERATE PDF COPY
                 </button>
               </div>
            </div>
         </div>

         <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-0 mb-14 border-4 border-black divide-x-4 divide-y-4 md:divide-y-0 divide-black">
            <div className="p-8">
               <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 opacity-40">01. Agent Profile</h3>
               <div className="text-3xl font-black tracking-tighter">{session.phaseA.substance}</div>
               <div className="font-mono text-xs mt-2 font-black opacity-60 uppercase">INITIAL DOSE: {session.phaseA.dosage} UNITS</div>
            </div>
            <div className="p-8 bg-zinc-50 dark:bg-zinc-900">
               <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 opacity-40">02. Initial Calibration</h3>
               <div className="text-4xl font-black font-mono leading-none flex items-baseline">
                 {session.phaseA.mood}.0<span className="text-lg opacity-20 ml-1">/10</span>
               </div>
            </div>
            <div className="p-8">
               <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 opacity-40">03. Setting Environment</h3>
               <div className="text-[12px] font-black leading-tight uppercase tracking-tight">
                 PHYS: {session.phaseA.physical}<br/>
                 SOCIAL: {session.phaseA.social}
               </div>
            </div>
            <div className="p-8 bg-zinc-50 dark:bg-zinc-900">
               <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 opacity-40">04. Grounding</h3>
               <div className="flex flex-col gap-3">
                 <div className="flex items-center gap-3">
                    {session.phaseA.intentions ? <CheckSquare size={20} /> : <Square size={20} />}
                    <span className="text-[12px] font-black uppercase">Confirmed</span>
                 </div>
               </div>
            </div>
         </div>

         {/* PHASE A: PREP BOX */}
         <div className="relative z-10 mb-14 border-4 border-black p-8 bg-zinc-50 dark:bg-zinc-900 shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
            <h3 className="text-[14px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-[10px]">A</div>
               PHASE A: PREP
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 text-blue-600">Initial Intention</h4>
                    <p className="text-sm font-bold leading-relaxed italic">"{session.phaseA.intentionsText || 'No intention recorded.'}"</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 text-blue-600">Initial Dose</h4>
                    <p className="font-mono text-sm font-black">{session.phaseA.dosage} Units</p>
                  </div>
               </div>
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 text-blue-600">Initial Classification Tags</h4>
                  <div className="flex flex-wrap gap-2">
                     {session.tags?.map(t => <span key={t} className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-[9px] font-black uppercase tracking-widest">{t}</span>)}
                     {(!session.tags || session.tags.length === 0) && <span className="opacity-20 text-[9px] font-black">UNCLASSIFIED</span>}
                  </div>
               </div>
            </div>
         </div>

         <div className="relative z-10 mb-14">
            <div className="flex items-center gap-5 mb-8">
               <h3 className="text-[12px] font-black uppercase tracking-[0.3em]">Causal Analysis Matrix</h3>
               <div className="h-[3px] flex-1 bg-black/10 dark:bg-white/10"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { label: 'T+1H Observation', data: session.phaseC.oneHour },
                 { label: 'T+24H Recovery', data: session.phaseC.oneDay },
                 { label: 'T+7D Integration', data: session.phaseC.oneWeek }
               ].map((period, i) => (
                 <div key={i} className={`p-8 border-4 border-black group transition-all ${!period.data ? 'opacity-20 grayscale' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 bg-white dark:bg-zinc-950'}`}>
                    <div className="text-[11px] font-black uppercase mb-8 flex justify-between items-center">
                       <span className="bg-black text-white px-2 py-0.5">{period.label}</span>
                       <span className="opacity-30 font-mono text-[9px]">{i === 0 ? '60 MIN' : i === 1 ? '1 DAY' : '1 WEEK'}</span>
                    </div>
                    {period.data ? (
                      <div className="space-y-5 font-mono">
                        <div className="flex justify-between items-end border-b-2 border-black/10 pb-2">
                          <span className="text-[11px] font-black opacity-40 uppercase">Mood</span>
                          <span className="font-black text-xl">{period.data.mood}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3">
                          <span className="text-[11px] font-black opacity-40 uppercase">Well-Being</span>
                          <span className="text-3xl font-black text-blue-600">+{period.data.wellBeing}.0</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 flex flex-col items-center justify-center font-mono text-[10px] uppercase font-black tracking-widest opacity-30 border-4 border-dashed border-black/10 gap-2">
                        <Clock size={20} />
                        PENDING
                      </div>
                    )}
                 </div>
               ))}
            </div>
         </div>

         {/* PHASE C: OUTCOMES */}
         <div className="relative z-10 mb-14 border-4 border-black p-8 bg-white dark:bg-zinc-950">
            <h3 className="text-[14px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px]">C</div>
               PHASE C: OUTCOMES
            </h3>
            <div className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Retrospective Experience</h4>
                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border-2 border-black font-medium leading-relaxed italic text-sm">
                       "{session.debriefText || "No post-flight debrief recorded."}"
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 text-blue-600">Eventual Dose</h4>
                      <p className="font-mono text-sm font-black">{session.phaseA.dosage} Units</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 text-blue-600">Final Post-Flight Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {session.tags?.map(t => <span key={t} className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-[9px] font-black uppercase tracking-widest">{t}</span>)}
                        {(!session.tags || session.tags.length === 0) && <span className="opacity-20 text-[9px] font-black">NONE</span>}
                      </div>
                    </div>
                 </div>
               </div>
            </div>
         </div>

         <button onClick={() => setShowReport(false)} className="mt-16 w-full py-8 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-[0.4em] text-sm hover:scale-[1.01] active:scale-95 transition-all print:hidden shadow-2xl">
            EXIT SUMMARY PROTOCOL
         </button>
      </div>
    );
  }

  if (showLandingWizard) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
        <div className={`max-w-2xl w-full p-10 md:p-14 rounded-[3.5rem] border-4 relative overflow-hidden animate-fadeIn ${darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-black text-black'}`}>
           <div className="mb-10 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-1">Landing Protocol: {landingStep + 1}/3</p>
                <h2 className="text-4xl font-black uppercase tracking-tighter">
                  {landingStep === 0 && 'Neural Update'}
                  {landingStep === 1 && 'Outcome Matrix'}
                  {landingStep === 2 && 'Commit Flight'}
                </h2>
              </div>
              <button onClick={() => setShowLandingWizard(false)} className="p-2 opacity-40 hover:opacity-100"><X /></button>
           </div>

           {landingStep === 0 && (
             <div className="space-y-8 animate-fadeIn">
               <div className="p-8 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 flex gap-4 items-start">
                 <Sparkles className="text-blue-500 shrink-0 mt-1" />
                 <p className="text-sm font-medium italic opacity-60">"Setting an intention beforehand can be worthwhile, but experiences can often surprise us."</p>
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Experiential Debrief</label>
                  <textarea 
                    className={`w-full p-6 rounded-[2rem] border-4 h-48 outline-none resize-none font-medium ${darkMode ? 'bg-black border-zinc-900 focus:border-blue-600' : 'bg-gray-50 border-gray-100 focus:border-black'}`}
                    placeholder="Did your eventual outcome match the intended trajectory? Or was the trip different to your intention? How?"
                    value={debriefText}
                    onChange={e => setDebriefText(e.target.value)}
                  />
               </div>
               <button onClick={() => setLandingStep(1)} className="w-full py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                 Verify Outcomes <ArrowRight size={16} />
               </button>
             </div>
           )}

           {landingStep === 1 && (
             <div className="space-y-6 animate-fadeIn">
                <InputRange label="Subjective Mood (Now)" value={phaseCInputs.mood} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, mood: v})} />
                <InputRange label="Attentional Bandwidth" value={phaseCInputs.attention} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, attention: v})} />
                <InputRange label="Global Well-Being" value={phaseCInputs.wellBeing} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, wellBeing: v})} />
                <InputRange label="System Energy" value={phaseCInputs.energy} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, energy: v})} />
                <InputRange label="Life Orientation" value={phaseCInputs.lifeOrientation} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, lifeOrientation: v})} />
                
                <div className="flex gap-4 pt-6">
                  <button onClick={() => setLandingStep(0)} className="flex-1 py-6 border-4 border-gray-100 dark:border-zinc-800 rounded-3xl font-black uppercase text-xs">Back</button>
                  <button onClick={() => setLandingStep(2)} className="flex-[2] py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black uppercase text-xs">Retrospective Tags</button>
                </div>
             </div>
           )}

           {landingStep === 2 && (
             <div className="space-y-8 animate-fadeIn">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Classification Tags - After</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {landingTags.map(t => (
                      <span key={t} className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        {t} <button onClick={() => handleRemoveTag(t)}><X size={12}/></button>
                      </span>
                    ))}
                  </div>
                  <form onSubmit={handleAddTag} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="ADD RETROSPECTIVE TAG..."
                      className={`flex-1 p-4 rounded-xl border-2 uppercase text-[10px] font-black tracking-widest outline-none ${darkMode ? 'bg-black border-zinc-900' : 'bg-gray-50 border-gray-200'}`}
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                    />
                    <button type="submit" className="px-6 py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px]">Add</button>
                  </form>
                </div>
                <button onClick={handleCommitLanding} className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl hover:bg-blue-700 uppercase tracking-[0.2em]">
                  <ShieldCheck size={24} /> Commit Experience
                </button>
             </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-10">
        <button onClick={onBack} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity font-bold uppercase text-xs tracking-widest">
          <ChevronLeft size={20} /> Experiment Menu
        </button>
        <div className="flex gap-4">
          {!session.isCompleted && (
            <button 
              onClick={() => setShowLandingWizard(true)}
              className="px-6 py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-black flex items-center gap-2 shadow-2xl transition-transform hover:scale-105 uppercase text-[10px] tracking-widest"
            >
              <PowerOff size={18} /> Land Flight
            </button>
          )}
          <button 
            onClick={handleExportJSON}
            className="px-6 py-4 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Download size={20} /> JSON
          </button>
          <button 
            onClick={() => setShowReport(true)}
            className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-2xl transition-transform hover:scale-105"
          >
            <FileText size={20} /> Lab Report
          </button>
        </div>
      </div>

      <header className="mb-12">
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
               <h2 className="text-5xl font-black tracking-tighter uppercase">{session.phaseA.substance}</h2>
               <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold font-mono uppercase tracking-widest border border-blue-200">ID:{session.id.slice(0,8)}</div>
               {session.isCompleted && <span className="bg-green-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Completed Experiment</span>}
            </div>
         </div>
         <p className="opacity-40 text-lg uppercase tracking-[0.2em] font-bold">
           {new Date(session.phaseA.timestamp).toLocaleString()} • <span className="text-blue-500">Dose: {session.phaseA.dosage} Units</span>
         </p>
      </header>

      {/* Main Detail View - Phase Prep Box */}
      <section className={`mb-10 p-10 rounded-[3rem] border-4 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black shadow-xl'}`}>
         <h3 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter mb-8"><PencilLine /> PHASE A: PREP</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 text-blue-600">Initial Intention Record</h4>
                  <p className="text-sm font-bold leading-relaxed italic">"{session.phaseA.intentionsText || "No intention specified."}"</p>
               </div>
               <div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 text-blue-600">Initial Dose</h4>
                 <p className="font-mono text-sm font-black">{session.phaseA.dosage} Units</p>
               </div>
            </div>
            <div>
               <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 text-blue-600">Initial Classification Tags</h4>
               <div className="flex flex-wrap gap-2">
                  {(session.tags || []).length > 0 ? (
                    session.tags?.map(t => <span key={t} className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-lg text-[10px] font-black uppercase">{t}</span>)
                  ) : (
                    <span className="opacity-20 text-[10px] font-black uppercase">None</span>
                  )}
               </div>
            </div>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* During Phase Section */}
        <section className={`p-10 rounded-[3rem] border-4 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black shadow-xl'}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter"><Clock /> Phase B: During</h3>
            {!session.isCompleted && <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/> Tracking Live</div>}
          </div>
          {!session.isCompleted && (
            <div className="mb-8 space-y-4">
              <textarea
                className={`w-full p-5 rounded-[1.5rem] border-2 outline-none resize-none h-32 transition-all font-medium ${darkMode ? 'bg-black border-zinc-800 focus:border-blue-500' : 'bg-gray-50 border-gray-100 focus:border-black'}`}
                placeholder="Add timestamped subjective log entry..."
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
              />
              <button 
                onClick={handleAddLog}
                className="w-full py-5 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-80 transition-all uppercase tracking-widest shadow-xl text-xs"
              >
                <Plus size={18} /> Add Log Entry
              </button>
            </div>
          )}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
            {[...session.phaseB].reverse().map((log, i) => (
              <div key={i} className={`p-5 rounded-[1.5rem] border ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-100'}`}>
                <p className="text-[9px] font-mono font-black opacity-30 uppercase mb-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                <p className="text-sm leading-relaxed font-bold">"{log.content}"</p>
              </div>
            ))}
            {session.phaseB.length === 0 && <div className="text-center py-20 opacity-20 italic text-sm">No live log entries recorded.</div>}
          </div>
        </section>

        {/* Phase C: Outcomes Section */}
        <section className={`p-10 rounded-[3rem] border-4 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-black shadow-xl'}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter"><Activity /> PHASE C: OUTCOMES</h3>
          </div>

          {session.isCompleted && (
             <div className="mb-10 p-8 bg-blue-50 dark:bg-zinc-800/50 rounded-3xl border border-blue-100 dark:border-white/5 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 text-blue-600">Experiential Debrief</h4>
                  <p className="text-sm font-medium leading-relaxed italic opacity-80">"{session.debriefText || "No retrospective data captured."}"</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 text-blue-600">Eventual Dose</h4>
                    <p className="font-mono text-sm font-black">{session.phaseA.dosage} Units</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 text-blue-600">Post-Flight Tags</h4>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {session.tags?.map(t => <span key={t} className="px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black rounded text-[9px] font-black uppercase tracking-widest">{t}</span>)}
                    </div>
                  </div>
                </div>
             </div>
          )}
          
          <div className="flex gap-2 mb-10 p-1.5 bg-gray-100 dark:bg-black rounded-2xl border border-gray-200 dark:border-zinc-800">
            {(['oneHour', 'oneDay', 'oneWeek'] as const).map(interval => (
              <button
                key={interval}
                onClick={() => setPhaseCInterval(interval)}
                className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${phaseCInterval === interval ? 'bg-white dark:bg-zinc-800 shadow-lg text-blue-500' : 'opacity-40 hover:opacity-60'}`}
              >
                {interval === 'oneHour' ? '1H' : interval === 'oneDay' ? '24H' : '7D'}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <InputRange label="Mood Delta" value={phaseCInputs.mood} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, mood: v})} />
            <InputRange label="Attention" value={phaseCInputs.attention} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, attention: v})} />
            <InputRange label="Well-Being" value={phaseCInputs.wellBeing} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, wellBeing: v})} />
            <InputRange label="Energy" value={phaseCInputs.energy} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, energy: v})} />
            {phaseCInterval === 'oneDay' && (
              <InputRange label="Orientation" value={phaseCInputs.lifeOrientation} onChange={(v: number) => setPhaseCInputs({...phaseCInputs, lifeOrientation: v})} />
            )}
            
            <button 
              onClick={handleSavePhaseC}
              className="w-full py-6 mt-6 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
            >
              <Save size={18} /> Update Data Matrix
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
