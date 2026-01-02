import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  ChevronLeft, Clock, Save, Activity, FileText, 
  Download, Plus, PowerOff, PencilLine
} from 'lucide-react';
import { InputRange } from '../components/ui/InputRange';
import { LabReport } from '../components/LabReport';
import { LandingWizard } from '../components/LandingWizard';

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
    alert(`${phaseCInterval} outcomes updated.`);
  };

  const handleCommitLanding = (data: { debriefText: string; inputs: any; tags: string[] }) => {
    updateSession(sessionId, { 
      isCompleted: true, 
      debriefText: data.debriefText, 
      tags: data.tags,
      phaseC: { ...session.phaseC, oneDay: { ...data.inputs, mood: data.inputs.mood, wellBeing: data.inputs.wellBeing, attention: data.inputs.attention, energy: data.inputs.energy, lifeOrientation: data.inputs.lifeOrientation } }
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

  if (showReport) {
    return <LabReport session={session} activeProfile={activeProfile} darkMode={darkMode} onClose={() => setShowReport(false)} />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {showLandingWizard && (
        <LandingWizard 
          session={session} 
          darkMode={darkMode} 
          onClose={() => setShowLandingWizard(false)} 
          onCommit={handleCommitLanding} 
        />
      )}

      {/* Header Actions */}
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
            <div>
               <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Initial Intention Record</h4>
               <p className="text-sm font-bold leading-relaxed italic">"{session.phaseA.intentionsText || "No intention specified."}"</p>
               <div className="mt-6">
                 <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Initial Dose</h4>
                 <p className="font-mono text-sm font-black">{session.phaseA.dosage} Units</p>
               </div>
            </div>
            <div>
               <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Initial Classification Tags</h4>
               <div className="flex flex-wrap gap-2">
                  {session.tags?.map(t => <span key={t} className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-lg text-[10px] font-black uppercase">{t}</span>)}
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
            <h3 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter"><Activity /> Phase C: Outcomes</h3>
          </div>

          {session.isCompleted && (
             <div className="mb-10 p-6 bg-blue-50 dark:bg-zinc-800/50 rounded-2xl border border-blue-100 dark:border-white/5 space-y-4">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Retrospective Experience</h4>
                  <p className="text-sm font-medium leading-relaxed italic opacity-80">"{session.debriefText || "No retrospective data captured."}"</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Eventual Dose</h4>
                    <p className="font-mono text-sm font-black">{session.phaseA.dosage} Units</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Final Post-Flight Tags</h4>
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
