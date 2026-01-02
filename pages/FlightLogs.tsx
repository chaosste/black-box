
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Download, ChevronRight, Calendar, FlaskConical, FileBarChart2, Copy, Tag, Sparkles, Filter, X, Search, ArrowUpAZ, ArrowDownZA, CalendarDays, Plus } from 'lucide-react';
import { FlightSession, Substance } from '../types';

export const FlightLogs: React.FC<{ onSelectSession: (id: string) => void }> = ({ onSelectSession }) => {
  const { activeProfile, darkMode, setDraft, updateSession } = useStore();
  const sessions = activeProfile?.sessions || [];

  // Filtering state
  const [substanceFilter, setSubstanceFilter] = useState<string>('All');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [quickTagSessionId, setQuickTagSessionId] = useState<string | null>(null);
  const [quickTagValue, setQuickTagValue] = useState('');

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchSubstance = substanceFilter === 'All' || s.phaseA.substance === substanceFilter;
      const matchTag = !tagFilter || (s.tags || []).some(t => t.toLowerCase().includes(tagFilter.toLowerCase()));
      const sessionDate = new Date(s.phaseA.timestamp).getTime();
      const matchStart = !startDate || sessionDate >= new Date(startDate).getTime();
      const matchEnd = !endDate || sessionDate <= new Date(endDate).getTime() + (24 * 60 * 60 * 1000);
      return matchSubstance && matchTag && matchStart && matchEnd;
    }).sort((a,b) => {
      const timeA = new Date(a.phaseA.timestamp).getTime();
      const timeB = new Date(b.phaseA.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [sessions, substanceFilter, tagFilter, startDate, endDate, sortOrder]);

  const handleQuickTagSubmit = (e: React.FormEvent, sessionId: string, currentTags: string[]) => {
    e.preventDefault();
    e.stopPropagation();
    const trimmed = quickTagValue.trim().toUpperCase();
    if (trimmed && !currentTags.includes(trimmed)) {
      updateSession(sessionId, { tags: [...currentTags, trimmed] });
    }
    setQuickTagValue('');
    setQuickTagSessionId(null);
  };

  const exportToCSV = () => {
    if (!filteredSessions.length) return;
    const headers = ['ID', 'Timestamp', 'Substance', 'Dosage', 'Set_Mood', 'Setting_Social', 'Outcome_1h_Mood', 'Tags'];
    const rows = filteredSessions.map(s => [
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
      window.location.hash = '#log-flight';
    }
  };

  const mostRecentSessionId = sessions.length > 0 
    ? [...sessions].sort((a,b) => new Date(b.phaseA.timestamp).getTime() - new Date(a.phaseA.timestamp).getTime())[0].id
    : null;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <style>{`
        @keyframes pulseBorder {
          0% { border-color: rgba(37, 99, 235, 0.2); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
          50% { border-color: rgba(37, 99, 235, 0.6); box-shadow: 0 0 25px 0 rgba(37, 99, 235, 0.15); }
          100% { border-color: rgba(37, 99, 235, 0.2); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        .highlight-recent {
          animation: pulseBorder 3s infinite ease-in-out;
          border-width: 3px !important;
        }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-bold mb-2">Flight Logs</h2>
          <p className="opacity-60 text-lg italic">Accessing temporal records for subject <span className="font-bold underline decoration-blue-500">{activeProfile?.name}</span>.</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all shadow-md ${showFilters ? 'bg-blue-600 text-white' : (darkMode ? 'bg-zinc-800' : 'bg-white border border-gray-200 hover:bg-gray-50')}`}
          >
            <Filter size={20} /> {showFilters ? 'Hide Filters' : 'Filter Logs'}
          </button>
           <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-bold transition-transform hover:scale-105 shadow-xl"
          >
            <Download size={20} /> CSV Export
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={`p-8 rounded-[2.5rem] mb-10 border animate-fadeIn ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-xl'}`}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Substance</label>
              <select 
                className={`w-full p-3 rounded-xl border text-sm font-bold ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50'}`}
                value={substanceFilter}
                onChange={e => setSubstanceFilter(e.target.value)}
              >
                <option value="All">All Substances</option>
                {Object.values(Substance).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Tag Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                <input 
                  type="text" 
                  placeholder="Filter by tag..."
                  className={`w-full p-3 pl-10 rounded-xl border text-sm font-bold ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50'}`}
                  value={tagFilter}
                  onChange={e => setTagFilter(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Start Date</label>
              <input 
                type="date" 
                className={`w-full p-3 rounded-xl border text-sm font-bold ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50'}`}
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">End Date</label>
              <input 
                type="date" 
                className={`w-full p-3 rounded-xl border text-sm font-bold ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50'}`}
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Ordering</label>
              <button 
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className={`w-full p-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50'}`}
              >
                {sortOrder === 'desc' ? <><ArrowDownZA size={16}/> Newest</> : <><ArrowUpAZ size={16}/> Oldest</>}
              </button>
            </div>
          </div>
          <div className="mt-6 flex justify-between items-center">
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Showing {filteredSessions.length} matching logs</p>
            <button 
              onClick={() => { setSubstanceFilter('All'); setTagFilter(''); setStartDate(''); setEndDate(''); setSortOrder('desc'); }}
              className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline flex items-center gap-1"
            >
              <X size={12} /> Clear All Filters
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredSessions.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[3rem] opacity-40 flex flex-col items-center">
            <FlaskConical size={64} className="mb-6 opacity-50" />
            <p className="text-xl font-bold uppercase tracking-tight">No Temporal Records Match Criteria</p>
            <p className="text-sm opacity-60 mt-2">Adjust your filters to reveal hidden data points.</p>
          </div>
        )}
        {filteredSessions.map(s => {
          const isRecent = s.id === mostRecentSessionId;
          const isQuickTagActive = quickTagSessionId === s.id;

          return (
            <div
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={`group cursor-pointer p-8 rounded-[2.5rem] border transition-all relative overflow-hidden flex flex-col justify-between transform hover:scale-[1.02] active:scale-95 ${
                isRecent ? 'highlight-recent' : ''
              } ${
                darkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-600' : 'bg-white border-gray-100 shadow-md hover:shadow-2xl'
              }`}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
                    {isRecent ? <Sparkles className="text-blue-500 animate-pulse" /> : <FlaskConical className="text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-2">
                     <button 
                      onClick={(e) => handleDuplicate(e, s)}
                      className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-inner"
                      title="Duplicate Session"
                     >
                       <Copy size={18} />
                     </button>
                     <div className="text-right ml-2">
                        <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Flight Date</div>
                        <div className="font-mono font-bold text-xs flex items-center gap-1"><CalendarDays size={10} className="opacity-40" /> {new Date(s.phaseA.timestamp).toLocaleDateString()}</div>
                     </div>
                  </div>
                </div>
                
                <h3 className="text-3xl font-black tracking-tighter uppercase mb-2 group-hover:text-blue-500 transition-colors">
                  {s.phaseA.substance}
                  {isRecent && <span className="ml-3 text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full align-middle uppercase tracking-widest font-black shadow-lg">Latest Flight</span>}
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-6 min-h-[24px] items-center">
                  {s.tags?.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 border border-black/5 dark:border-white/5">
                      <Tag size={10} className="opacity-40" /> {tag}
                    </span>
                  ))}
                  
                  {isQuickTagActive ? (
                    <form 
                      onSubmit={(e) => handleQuickTagSubmit(e, s.id, s.tags || [])}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center animate-fadeIn"
                    >
                      <input 
                        autoFocus
                        type="text" 
                        value={quickTagValue}
                        onChange={(e) => setQuickTagValue(e.target.value)}
                        className={`p-1 text-[10px] font-black uppercase border-b-2 outline-none w-20 ${darkMode ? 'bg-black border-blue-500' : 'bg-white border-blue-500'}`}
                        placeholder="TAG..."
                        onBlur={() => { if(!quickTagValue) setQuickTagSessionId(null); }}
                      />
                    </form>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setQuickTagSessionId(s.id); }}
                      className="p-1 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>

                <p className="opacity-60 mb-8 flex items-center gap-2 text-sm font-medium">
                   <span className="font-black text-blue-600 dark:text-blue-400">{s.phaseA.dosage} Units</span> • {s.phaseA.physical}
                </p>
                
                <div className="flex gap-4">
                   <div className={`flex-1 p-5 rounded-2xl ${darkMode ? 'bg-black/50' : 'bg-gray-50'}`}>
                      <div className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-1">Set Mood</div>
                      <div className="text-2xl font-black tabular-nums">{s.phaseA.mood}<span className="text-xs opacity-20 ml-1">/10</span></div>
                   </div>
                   <div className={`flex-1 p-5 rounded-2xl ${darkMode ? 'bg-black/50' : 'bg-gray-50'}`}>
                      <div className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-1">1D Well-Being</div>
                      <div className="text-2xl font-black tabular-nums">{s.phaseC.oneDay?.wellBeing || '--'}<span className="text-xs opacity-20 ml-1">/10</span></div>
                   </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 opacity-[0.04] group-hover:opacity-[0.1] transition-all duration-500 group-hover:scale-125">
                 <FileBarChart2 size={160} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
