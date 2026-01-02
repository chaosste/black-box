import React from 'react';
import { ASSETS } from '../constants';
import { Hexagon, ShieldCheck, Printer, CheckSquare, Square, Clock } from 'lucide-react';
import { FlightSession, Profile } from '../types';

interface LabReportProps {
  session: FlightSession;
  activeProfile: Profile | null;
  darkMode: boolean;
  onClose: () => void;
}

export const LabReport: React.FC<LabReportProps> = ({ session, activeProfile, darkMode, onClose }) => {
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

         <button onClick={onClose} className="mt-16 w-full py-8 bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-[0.4em] text-sm hover:scale-[1.01] active:scale-95 transition-all print:hidden shadow-2xl">
            EXIT SUMMARY PROTOCOL
         </button>
      </div>
  );
};
