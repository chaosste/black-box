
import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ASSETS } from '../constants';
import { getAIInsights } from '../services/geminiService';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, ZAxis
} from 'recharts';
import { Activity, Zap, RefreshCw, Target, Map, PlusCircle, Sparkles, Loader2, Brain, ExternalLink } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { activeProfile, darkMode } = useStore();
  const sessions = activeProfile?.sessions || [];
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const sidebarIcon = darkMode ? ASSETS.LOGO_NEW_PSYCHONAUT_WHITE_CIRCULAR : ASSETS.LOGO_OUROBOROS;

  const fetchInsights = async () => {
    if (sessions.length === 0) return;
    setLoadingInsights(true);
    const result = await getAIInsights(sessions);
    setInsights(result);
    setLoadingInsights(false);
  };

  useEffect(() => {
    if (sessions.length > 0 && !insights) {
      fetchInsights();
    }
  }, [sessions]);

  // FEATURE: Dose vs. Outcome 'Sweet Spot'
  const doseOutcomeData = useMemo(() => {
    return sessions.map(s => {
      // Prioritize 1-day well-being as the primary outcome measure
      const wellBeing = s.phaseC.oneDay?.wellBeing || s.phaseC.oneHour?.wellBeing || 5;
      return {
        dosage: s.phaseA.dosage,
        outcomeScore: wellBeing,
        substance: s.phaseA.substance,
        id: s.id.slice(0, 4)
      };
    });
  }, [sessions]);

  // FEATURE: Environment Comparison
  const envComparisonData = useMemo(() => {
    const aloneSessions = sessions.filter(s => s.phaseA.social === 'Alone');
    const notAloneSessions = sessions.filter(s => s.phaseA.social === 'Not Alone');
    const avgMindfulAlone = aloneSessions.length ? aloneSessions.reduce((acc, s) => acc + s.phaseA.mindfulness, 0) / aloneSessions.length : 0;
    const avgMindfulNotAlone = notAloneSessions.length ? notAloneSessions.reduce((acc, s) => acc + s.phaseA.mindfulness, 0) / notAloneSessions.length : 0;

    const familiarSessions = sessions.filter(s => s.phaseA.physical === 'Familiar Environment');
    const newSessions = sessions.filter(s => s.phaseA.physical === 'New Environment');
    const avgAttentionFamiliar = familiarSessions.length ? familiarSessions.reduce((acc, s) => acc + (s.phaseC.oneHour?.attention || 5), 0) / familiarSessions.length : 0;
    const avgAttentionNew = newSessions.length ? newSessions.reduce((acc, s) => acc + (s.phaseC.oneHour?.attention || 5), 0) / newSessions.length : 0;

    return [
      { category: 'Mindfulness (Alone)', score: avgMindfulAlone, type: 'Social' },
      { category: 'Mindfulness (Social)', score: avgMindfulNotAlone, type: 'Social' },
      { category: 'Attention (Familiar)', score: avgAttentionFamiliar, type: 'Physical' },
      { category: 'Attention (New)', score: avgAttentionNew, type: 'Physical' },
    ];
  }, [sessions]);

  const osStatus = useMemo(() => {
    const latest = sessions[sessions.length - 1];
    const score = latest?.phaseC.oneDay?.lifeOrientation || 5;
    return score >= 7 ? 'OPTIMISTIC' : score <= 3 ? 'PESSIMISTIC' : 'BALANCED';
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="space-y-12">
        <section className={`relative rounded-[3rem] overflow-hidden min-h-[500px] flex items-center p-10 md:p-20 ${darkMode ? 'bg-zinc-900' : 'bg-white shadow-2xl border border-gray-100'}`}>
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
              <img src={sidebarIcon} alt="Logo" className="w-16 h-16 object-contain" />
              <div className="h-10 w-[1px] bg-black/10 dark:bg-white/20" />
              <div className="flex flex-col">
                <div className="text-xl font-bold tracking-tight uppercase">BLACK BOX</div>
                <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">from New Psychonaut</div>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tighter">Welcome to the Flight Recorder.</h1>
            <p className="text-xl opacity-60 mb-10 leading-relaxed font-medium">
              You are entering the New Psychonaut quantified self platform. 
              Track your N-of-1 experiments with clinical precision, identifying your personal "sweet spot".
            </p>
            <button 
              onClick={() => window.location.hash = '#new-session'}
              className="px-10 py-5 bg-black text-white dark:bg-white dark:text-black rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-3 shadow-2xl"
            >
              Initiate First Flight <PlusCircle size={24} />
            </button>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-[0.03] dark:opacity-[0.05] pointer-events-none overflow-hidden flex items-center justify-center">
            <img src={sidebarIcon} alt="bg" className="w-full h-full object-contain scale-150 rotate-12" />
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className={`p-8 rounded-[2.5rem] border border-dashed ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
               <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <Zap className="text-blue-500" size={24} />
               </div>
               <h3 className="font-bold mb-2">Quantifiable Set</h3>
               <p className="text-sm opacity-60 leading-relaxed">Record mood, stress, and self-esteem as weighted causal inputs.</p>
            </div>
            <div className={`p-8 rounded-[2.5rem] ${darkMode ? 'bg-zinc-900' : 'bg-white border border-gray-100 shadow-xl'}`}>
               <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <Map className="text-green-500" size={24} />
               </div>
               <h3 className="font-bold mb-2">Observed Setting</h3>
               <p className="text-sm opacity-60 leading-relaxed">Analyze environment and social dynamics impact.</p>
            </div>
            <div className={`p-8 rounded-[2.5rem] border border-dashed ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
               <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <Activity className="text-amber-500" size={24} />
               </div>
               <h3 className="font-bold mb-2">Temporal Outcomes</h3>
               <p className="text-sm opacity-60 leading-relaxed">Measure trajectory at 1h, 24h, and 7d intervals.</p>
            </div>
        </div>
      </div>
    );
  }

  const distinctSubstances = Array.from(new Set(sessions.map(s => s.phaseA.substance)));

  return (
    <div className="space-y-8 pb-12 relative">
      <section className={`p-10 md:p-16 rounded-[3rem] overflow-hidden relative ${darkMode ? 'bg-zinc-900' : 'bg-white shadow-xl border border-gray-100'}`}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw size={20} className="animate-spin text-blue-500" />
              <span className="text-xs font-bold tracking-widest text-blue-500 uppercase">OS UPDATE: PSY-OS v2.5.0</span>
            </div>
            <h2 className="text-5xl font-bold mb-4 tracking-tighter">System Status: <span className="text-blue-500">{osStatus}</span></h2>
            <p className="max-w-xl opacity-60 text-lg leading-relaxed font-medium">
              Subject <span className="font-bold text-blue-600">"{activeProfile?.name}"</span> has completed {sessions.length} cycles. Trajectory is stabilizing.
            </p>
          </div>
          <div className="bg-black/5 dark:bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md">
            <div className="text-sm opacity-40 uppercase font-bold tracking-widest mb-4">Quick Stats</div>
            <div className="grid grid-cols-2 gap-8">
               <div>
                  <div className="text-2xl font-bold">{sessions.length}</div>
                  <div className="text-[10px] opacity-40 font-bold uppercase">Flights</div>
               </div>
               <div>
                  <div className="text-2xl font-bold">{(sessions.reduce((acc, s) => acc + (s.phaseC.oneDay?.wellBeing || 0), 0) / sessions.length).toFixed(1)}</div>
                  <div className="text-[10px] opacity-40 font-bold uppercase">Avg Well-Being</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Insights Card */}
      <section className={`p-10 rounded-[2.5rem] border relative overflow-hidden group ${
        darkMode ? 'bg-blue-900/10 border-blue-900/20' : 'bg-blue-50 border-blue-100'
      }`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
                <Brain size={24} />
             </div>
             <div>
                <h3 className="text-2xl font-black tracking-tighter uppercase">Pattern Recognition Engine</h3>
                <p className="text-xs font-bold tracking-widest uppercase opacity-40">Gemini-Powered History Analysis</p>
             </div>
          </div>
          <button 
            onClick={fetchInsights}
            disabled={loadingInsights}
            className="p-3 rounded-xl hover:bg-white/10 transition-colors text-blue-600"
          >
            {loadingInsights ? <Loader2 size={24} className="animate-spin" /> : <RefreshCw size={24} />}
          </button>
        </div>
        
        <div className="min-h-[100px] flex items-center">
          {loadingInsights ? (
            <div className="flex flex-col gap-2">
               <div className="h-4 w-64 bg-blue-200 dark:bg-blue-900/40 rounded-full animate-pulse" />
               <div className="h-4 w-48 bg-blue-200 dark:bg-blue-900/40 rounded-full animate-pulse" />
               <div className="h-4 w-56 bg-blue-200 dark:bg-blue-900/40 rounded-full animate-pulse" />
            </div>
          ) : (
            <p className="text-lg font-medium leading-relaxed italic opacity-80">
               {insights || "Analyze your flight history to uncover hidden correlations across set and setting."}
            </p>
          )}
        </div>
        <Sparkles size={120} className="absolute -bottom-10 -right-10 opacity-[0.05] text-blue-600 pointer-events-none group-hover:scale-110 transition-transform" />
      </section>

      {/* NeuroPhenomAI Loading Pop-up (Dashboard) */}
      {loadingInsights && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-fadeIn">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative max-w-sm w-full bg-white dark:bg-black border-[6px] border-blue-600 rounded-[3rem] shadow-[0_40px_100px_rgba(37,99,235,0.4)] p-8 text-center animate-slideUp">
            <a href="https://neurophenom-ai-572556903588.us-west1.run.app/" target="_blank" rel="noopener noreferrer" className="block group">
              <img src={ASSETS.BANNER_NEURO} className="w-full h-auto mb-6 rounded-2xl transform transition-transform group-hover:scale-105" alt="NeuroPhenomAI" />
              <div className="flex flex-col items-center justify-center gap-2 text-blue-600 font-black uppercase tracking-widest text-[11px] group-hover:text-blue-500">
                <span>Click for granular interview</span>
                <ExternalLink size={14} />
              </div>
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex items-center gap-2 mb-8">
            <Target className="text-blue-500" size={24} />
            <h4 className="text-xl font-bold uppercase tracking-tight">Substance Sweet Spot Analysis</h4>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis type="number" dataKey="dosage" name="Dosage (Units)" stroke={darkMode ? '#444' : '#ccc'} fontSize={12} label={{ value: 'Dosage', position: 'insideBottomRight', offset: -10, fontSize: 10 }} />
                <YAxis type="number" dataKey="outcomeScore" name="Well-Being Outcome" domain={[0, 10]} stroke={darkMode ? '#444' : '#ccc'} fontSize={12} label={{ value: 'Outcome', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <ZAxis type="number" range={[100, 100]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={darkMode ? { backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' } : { borderRadius: '12px' }}
                />
                {distinctSubstances.map((sub, i) => (
                  <Scatter 
                    key={sub} 
                    name={sub} 
                    data={doseOutcomeData.filter(d => d.substance === sub)} 
                    fill={`hsl(${i * 60}, 70%, 50%)`} 
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className="flex items-center gap-2 mb-8">
            <Map className="text-green-500" size={24} />
            <h4 className="text-xl font-bold uppercase tracking-tight">Setting Weighting</h4>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={envComparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                <XAxis type="number" domain={[0, 10]} stroke={darkMode ? '#444' : '#ccc'} fontSize={12} />
                <YAxis dataKey="category" type="category" stroke={darkMode ? '#444' : '#ccc'} width={140} fontSize={10} />
                <Tooltip />
                <Bar dataKey="score" radius={[0, 10, 10, 0]}>
                  {envComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'Social' ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
