
import React from 'react';
import { useStore } from '../store/useStore';
import { Download, ChevronRight, Calendar, FlaskConical, FileBarChart2, Copy, Tag } from 'lucide-react';
import { FlightSession } from '../types';

export const History: React.FC<{ onSelectSession: (id: string) => void }> = ({ onSelectSession }) => {
  const { activeProfile, darkMode, setDraft } = useStore();
  const sessions = activeProfile?.sessions || [];

  const exportToCSV = () => {
    if (!sessions.length) return;
    const headers = ['ID', 'Timestamp', 'Substance', 'Dosage', 'Set_Mood', 'Setting_Social', 'Outcome_1h_Mood', 'Tags'];
    const rows = sessions.map(s => [
      s.id, 
      s.phaseA.timestamp, 
      s.phaseA.substance, 
      s.phaseA.dosage, 
      s.phaseA.mood, 
      s.phaseA.social, 
      s.phaseC.oneHour?.mood || '',
      (s.tags || []).join(';')
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `blackbox_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDuplicate = (e: React.MouseEvent, session: FlightSession) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Duplicate "${session.phaseA.substance}" session into a new draft?`);
    if (confirmed) {
      setDraft({
        phaseA: { ...session.phaseA, timestamp: new Date().toISOString() },
        tags: session.tags ? [...session.tags] : [],
        lastSaved: new Date().toISOString()
      });
      window.location.hash = '#new-session';
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-bold mb-2">Experiments Menu</h2>
          <p className="opacity-60 text-lg">History of all quantified flight sessions for subject <span className="font-bold underline decoration-blue-500">{activeProfile?.name}</span>.</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-bold transition-transform hover:scale-105 shadow-xl"
          >
            <Download size={20} /> CSV Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] opacity-40">
            <FlaskConical size={48} className="mx-auto mb-4" />
            <p className="font-bold">No experiment data logged.</p>
          </div>
        )}
        {[...sessions].reverse().map(s => (
          <div
            key={s.id}
            onClick={() => onSelectSession(s.id)}
            className={`group cursor-pointer p-8 rounded-[2.5rem] border transition-all relative overflow-hidden flex flex-col justify-between ${
              darkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-600' : 'bg-white border-gray-100 shadow-md hover:shadow-2xl'
            }`}
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
                  <FlaskConical className="text-blue-500" />
                </div>
                <div className="flex items-center gap-2">
                   <button 
                    onClick={(e) => handleDuplicate(e, s)}
                    className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                    title="Duplicate Session"
                   >
                     <Copy size={16} />
                   </button>
                   <div className="text-right ml-2">
                      <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Flight Date</div>
                      <div className="font-mono font-bold text-xs">{new Date(s.phaseA.timestamp).toLocaleDateString()}</div>
                   </div>
                </div>
              </div>
              
              <h3 className="text-3xl font-bold mb-2 group-hover:text-blue-500 transition-colors">{s.phaseA.substance}</h3>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {s.tags?.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-[9px] font-black uppercase tracking-widest rounded-md flex items-center gap-1">
                    <Tag size={8} /> {tag}
                  </span>
                )) || <span className="text-[9px] opacity-20 font-black uppercase tracking-widest">No Tags</span>}
              </div>

              <p className="opacity-60 mb-8 flex items-center gap-2 text-sm">
                 <span className="font-bold">{s.phaseA.dosage}u</span> • {s.phaseA.physical}
              </p>
              
              <div className="flex gap-4">
                 <div className={`flex-1 p-4 rounded-2xl ${darkMode ? 'bg-black/50' : 'bg-gray-50'}`}>
                    <div className="text-[10px] opacity-40 uppercase font-bold mb-1">Set Mood</div>
                    <div className="text-xl font-bold">{s.phaseA.mood}/10</div>
                 </div>
                 <div className={`flex-1 p-4 rounded-2xl ${darkMode ? 'bg-black/50' : 'bg-gray-50'}`}>
                    <div className="text-[10px] opacity-40 uppercase font-bold mb-1">1D Well-Being</div>
                    <div className="text-xl font-bold">{s.phaseC.oneDay?.wellBeing || '--'}/10</div>
                 </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
               <FileBarChart2 size={120} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
