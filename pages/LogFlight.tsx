
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Substance, SocialEnvironment, PhysicalEnvironment, FlightSession, LogEntry, LogEntryType } from '../types';
import { 
  ChevronRight, Save, HelpCircle, PencilLine, Trash2, ArrowLeft, Tag, X, Brain, 
  Loader2, Sparkles, Send, Mic, Upload, Rocket, PowerOff, ShieldCheck, Heart, Target, Map,
  FileText, Eye, Zap, Activity, Info
} from 'lucide-react';
import { ASSETS } from '../constants';
import { getForecastAnalytics, getAIInsights } from '../services/geminiService';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export const LogFlight: React.FC = () => {
  const { addSession, draft, setDraft, darkMode, activeProfile } = useStore();
  const [step, setStep] = useState(0); 
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecast, setForecast] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);

  // Phase B State
  const [phaseBLogs, setPhaseBLogs] = useState<LogEntry[]>([]);
  const [commText, setCommText] = useState('');
  const [commType, setCommType] = useState<LogEntryType>('text');
  const [isInFlight, setIsInFlight] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Post Flight States
  const [debriefText, setDebriefText] = useState('');
  const [postMood, setPostMood] = useState(5);
  const [postAttention, setPostAttention] = useState(5);
  const [postWellBeing, setPostWellBeing] = useState(8);
  const [postStress, setPostStress] = useState(5);
  const [postResponsibilities, setPostResponsibilities] = useState(5);

  const [phaseA, setPhaseA] = useState({
    substance: Substance.LSD,
    dosage: 100,
    selfEsteem: 5,
    intentions: true,
    intentionsText: '',
    mood: 5,
    mindfulness: 5,
    stress: 5,
    responsibilities: 5,
    social: SocialEnvironment.ALONE,
    physical: PhysicalEnvironment.FAMILIAR,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    if (draft) {
      setPhaseA(prev => ({ ...prev, ...draft.phaseA }));
      if (draft.tags) setTags(draft.tags);
    }
  }, []);

  const handleGenerateForecast = async () => {
    setLoadingForecast(true);
    setStep(4);
    const result = await getForecastAnalytics(activeProfile?.sessions || [], {
      substance: phaseA.substance,
      dosage: phaseA.dosage,
      physical: phaseA.physical
    });
    setForecast(result);
    setLoadingForecast(false);
  };

  const handleTakeOff = () => {
    const audio = new Audio("https://storage.cloud.google.com/ai-studio-bucket-572556903588-us-west1/services/self-test-images/Tibetan%20Singing%20Bowl%20Sounds%20-%20OM.mp3");
    audio.play();
    setIsInFlight(true);
  };

  const handleTouchDown = () => {
    setIsInFlight(false);
    setStep(7);
  };

  const handleSubmit = () => {
    const newSession: FlightSession = {
      id: crypto.randomUUID(),
      phaseA,
      phaseB: phaseBLogs,
      phaseC: {
        oneDay: {
          mood: postMood,
          attention: postAttention,
          wellBeing: postWellBeing,
          energy: 5,
          lifeOrientation: 5
        }
      },
      questionnaires: [],
      tags,
      isCompleted: true,
      debriefText
    };
    addSession(newSession);
    alert('Experience committed to the Black Box.');
    window.location.hash = '#flight-logs';
  };

  const addLogEntry = (entry: LogEntry) => {
    setPhaseBLogs(prev => [...prev, entry]);
  };

  const handleCommSubmit = () => {
    if (!commText.trim()) return;
    addLogEntry({ 
      timestamp: new Date().toISOString(), 
      content: commText, 
      type: commType 
    });
    setCommText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      addLogEntry({
        timestamp: new Date().toISOString(),
        content: `File upload: ${file.name}`,
        type: 'file',
        fileUrl: event.target?.result as string,
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const getSliderFeedback = (label: string, value: number) => {
    const l = label.toLowerCase();
    if (l.includes("mood")) {
      if (value <= 2) return "Severely Low / Flat";
      if (value <= 4) return "Below Baseline";
      if (value <= 6) return "Stable / Balanced";
      if (value <= 8) return "Elevated / Positive";
      return "Optimally Radiant";
    }
    if (l.includes("mindfulness")) {
      if (value <= 2) return "Deeply Scattered";
      if (value <= 4) return "Auto-Pilot Active";
      if (value <= 6) return "Moderately Present";
      if (value <= 8) return "Centred / Attuned";
      return "Hyper-Mindful / Flow";
    }
    if (l.includes("stress")) {
      if (value <= 2) return "Complete Tranquility";
      if (value <= 4) return "Minimal Friction";
      if (value <= 6) return "Functional Load";
      if (value <= 8) return "Highly Activated";
      return "Critical System Strain";
    }
    if (l.includes("responsibilities")) {
      if (value <= 2) return "Total Liberty";
      if (value <= 4) return "Minor Tasks Pending";
      if (value <= 6) return "Standard Obligations";
      if (value <= 8) return "Heavily Committed";
      return "Overwhelming Duty";
    }
    if (l.includes("well-being")) {
      if (value <= 3) return "Systemic Malaise";
      if (value <= 6) return "Operational Equilibrium";
      if (value <= 8) return "Prosperous / Thriving";
      return "Flourishing State";
    }
    return `Level ${value}`;
  };

  const InputRange = ({ label, value, min = 1, max = 10, onChange, minLabel, maxLabel }: any) => (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-2">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40 block mb-1">{label}</label>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{getSliderFeedback(label, value)}</p>
        </div>
        <span className="text-2xl font-mono font-black tabular-nums text-blue-600">{value}</span>
      </div>
      <input 
        type="range" min={min} max={max} step="1" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between mt-2 px-1">
         <span className="text-[9px] font-black uppercase tracking-tighter opacity-30">{minLabel}</span>
         <span className="text-[9px] font-black uppercase tracking-tighter opacity-30">{maxLabel}</span>
      </div>
    </div>
  );

  const fetchInsights = async () => {
    setLoadingInsights(true);
    const res = await getAIInsights(activeProfile?.sessions || []);
    setInsights(res);
    setLoadingInsights(false);
  };

  useEffect(() => {
    if ((step === 5 || step === 10) && !insights) {
      fetchInsights();
    }
  }, [step]);

  const commTypeOptions: { label: string, value: LogEntryType, icon: any }[] = [
    { label: 'Observation', value: 'Visual Observation', icon: <Eye size={14}/> },
    { label: 'Somatic', value: 'Somatic Sensation', icon: <Zap size={14}/> },
    { label: 'Cognitive', value: 'Cognitive Shift', icon: <Brain size={14}/> },
    { label: 'Audio', value: 'audio', icon: <Mic size={14}/> },
    { label: 'Text', value: 'text', icon: <FileText size={14}/> },
  ];

  const suggestedTags = ['SOLO', 'NATURE', 'THERAPEUTIC', 'MUSIC', 'CREATIVE'];

  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  return (
    <div className={`max-w-6xl mx-auto py-8 relative transition-all duration-1000 ${isInFlight ? 'isInFlightMode' : ''}`}>
      <style>{`
        .isInFlightMode .fadeText {
          opacity: 0.2;
          filter: blur(2px);
          transition: all 1s ease;
          text-shadow: 0 0 10px rgba(37,99,235,0.5);
        }
        .isInFlightMode .clearElement {
          opacity: 1 !important;
          filter: none !important;
          box-shadow: 0 0 40px rgba(37,99,235,0.2);
        }
        @keyframes activePulse {
           0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37,99,235,0.7); }
           70% { transform: scale(1.15); box-shadow: 0 0 0 15px rgba(37,99,235,0); }
           100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37,99,235,0); }
        }
        .step-active {
           animation: activePulse 2s infinite ease-in-out;
           z-index: 10;
           background: linear-gradient(135deg, #2563eb, #60a5fa);
           border: 2px solid white;
        }
        .progress-line {
           background: linear-gradient(to right, #2563eb, #60a5fa);
        }
      `}</style>
      
      {/* Flight Progress Header */}
      <div className="flex items-center justify-between mb-16 px-2 fadeText">
        {[0, 1, 2, 3, 4, 5, 7, 8, 9, 10].map((s, i) => {
          const isActive = step === s;
          const isPast = step > s;
          return (
            <div key={i} className="flex items-center flex-1 last:flex-none relative">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[11px] font-black transition-all duration-500 relative ${
                isActive 
                  ? 'text-white shadow-[0_0_30px_rgba(37,99,235,0.5)] step-active scale-110' 
                  : isPast 
                    ? 'bg-blue-500 text-white opacity-60' 
                    : (darkMode ? 'bg-zinc-900 text-zinc-700' : 'bg-gray-100 text-gray-300')
              }`}>
                {s === 5 ? <Rocket size={18} /> : s === 10 ? <ShieldCheck size={18} /> : i + 1}
                {isActive && (
                   <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 animate-pulse">
                      Phase {i+1}
                   </div>
                )}
              </div>
              {i < 9 && (
                <div className={`h-[3px] flex-1 mx-2 rounded-full transition-all duration-700 ${isPast ? 'progress-line' : (darkMode ? 'bg-zinc-800' : 'bg-gray-200')}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className={`p-10 md:p-14 rounded-[3.5rem] border-2 relative overflow-hidden transition-all duration-500 ${
        darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-2xl'
      }`}>
        
        <div className={`mb-10 fadeText`}>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-2">
            STEP {step} : {
                step === 0 ? 'NEURAL GROUNDING' : 
                step === 1 ? 'AGENT CALIBRATION' : 
                step === 2 ? 'SET VERIFICATION' : 
                step === 3 ? 'SETTING OPTIMIZATION' :
                step === 4 ? 'NEURAL FORECAST' :
                step === 5 ? 'SYSTEM STATUS PATTERN RECOGNITION' :
                step === 7 ? 'EXPERIENTIAL DEBRIEF' :
                step === 8 ? 'FURTHER SUBSTANCES' :
                step === 9 ? 'INTERNAL STATE' : 'FINAL COMMITMENT'
            }
          </p>
          <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">
            {step === 0 && 'Intention Setting'}
            {step === 1 && 'Substance & Dose'}
            {step === 2 && 'Internal State'}
            {step === 3 && 'External Dynamics'}
            {step === 4 && 'Calculated Trajectory'}
            {step === 5 && 'Active Flight Dashboard'}
            {step === 7 && 'Experience Debrief'}
            {step === 8 && 'Dose Adjustment'}
            {step === 9 && 'Post-Flight State'}
            {step === 10 && 'Final Flight Summary'}
          </h2>
        </div>

        {/* --- STEP 0: INTENTION --- */}
        {step === 0 && (
          <div className="space-y-8 animate-fadeIn">
            <textarea
              className={`w-full p-8 rounded-[2rem] border-2 outline-none resize-none h-48 transition-all font-medium text-lg ${
                darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200 focus:border-black'
              }`}
              placeholder="What is your intention for this flight?"
              value={phaseA.intentionsText}
              onChange={e => setPhaseA({...phaseA, intentionsText: e.target.value})}
            />
            
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Classification Tags</label>
               <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(t => (
                    <span key={t} className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Tag size={10} /> {t}
                      <button onClick={() => setTags(tags.filter(tag => tag !== t))} className="hover:text-red-500"><X size={12}/></button>
                    </span>
                  ))}
               </div>
               <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-20 mr-2 flex items-center">Suggestions:</span>
                  {suggestedTags.map(st => (
                    <button 
                      key={st} 
                      onClick={() => addSuggestedTag(st)}
                      className="px-3 py-1.5 text-[9px] font-black border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 active:scale-95"
                    >
                      {st}
                    </button>
                  ))}
               </div>
               <form onSubmit={(e) => { e.preventDefault(); if(newTag.trim()){ setTags([...tags, newTag.trim()]); setNewTag(''); } }} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="ADD CUSTOM TAG..."
                    className={`flex-1 p-4 rounded-xl border-2 font-black uppercase text-xs tracking-widest ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'}`}
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                  />
                  <button type="submit" className="px-6 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 shadow-lg transition-colors">Add</button>
               </form>
            </div>

            <button onClick={() => setStep(1)} className="w-full py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black uppercase text-lg hover:scale-[1.01] transition-all shadow-2xl">Commit Intention</button>
          </div>
        )}

        {/* --- STEP 1: SUBSTANCE --- */}
        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase opacity-40">Agent</label>
                <select className={`w-full p-6 rounded-2xl border-2 font-bold ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'}`} value={phaseA.substance} onChange={e => setPhaseA({...phaseA, substance: e.target.value as Substance})}>
                  {Object.values(Substance).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase opacity-40">Dose</label>
                <input type="number" className={`w-full p-6 rounded-2xl border-2 font-mono font-bold ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'}`} value={phaseA.dosage} onChange={e => setPhaseA({...phaseA, dosage: parseFloat(e.target.value)})} />
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black uppercase text-lg hover:scale-[1.01] transition-all">Verify Set</button>
          </div>
        )}

        {/* --- STEP 2: INTERNAL STATE (PRE-FLIGHT) --- */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <InputRange 
              label="Pre-Flight Mood" 
              value={phaseA.mood} 
              onChange={(v: number) => setPhaseA({...phaseA, mood: v})} 
              minLabel="Flat / Depressed" 
              maxLabel="Elevated / Euphoric" 
            />
            <InputRange 
              label="Mindfulness Level" 
              value={phaseA.mindfulness} 
              onChange={(v: number) => setPhaseA({...phaseA, mindfulness: v})} 
              minLabel="Scattered / Auto" 
              maxLabel="Centered / Present"
            />
            <InputRange 
              label="System Stress" 
              value={phaseA.stress} 
              onChange={(v: number) => setPhaseA({...phaseA, stress: v})} 
              minLabel="Calm / Ease" 
              maxLabel="Extreme / Tense"
            />
            <InputRange 
              label="Life Responsibilities" 
              value={phaseA.responsibilities} 
              onChange={(v: number) => setPhaseA({...phaseA, responsibilities: v})} 
              minLabel="Clear / Free" 
              maxLabel="Burdened / Heavy"
            />
            <button onClick={() => setStep(3)} className="w-full py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black uppercase text-lg hover:scale-[1.01] transition-all">Optimize Setting</button>
          </div>
        )}

        {/* --- STEP 3: EXTERNAL DYNAMICS --- */}
        {step === 3 && (
          <div className="space-y-10 animate-fadeIn">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest opacity-40">Social Matrix</label>
              <div className="grid grid-cols-2 gap-4">
                {[SocialEnvironment.ALONE, SocialEnvironment.NOT_ALONE].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setPhaseA({...phaseA, social: opt})}
                    className={`p-6 rounded-2xl border-2 font-black transition-all uppercase tracking-widest text-xs ${
                      phaseA.social === opt 
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg' 
                        : (darkMode ? 'border-zinc-800 bg-black' : 'border-gray-100 bg-gray-50')
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest opacity-40">Physical Coordinates</label>
              <div className="grid grid-cols-2 gap-4">
                {[PhysicalEnvironment.FAMILIAR, PhysicalEnvironment.NEW].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setPhaseA({...phaseA, physical: opt})}
                    className={`p-6 rounded-2xl border-2 font-black transition-all uppercase tracking-widest text-xs ${
                      phaseA.physical === opt 
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg' 
                        : (darkMode ? 'border-zinc-800 bg-black' : 'border-gray-100 bg-gray-50')
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(2)} className="flex-1 py-6 border-2 border-gray-100 dark:border-zinc-800 rounded-3xl font-black uppercase text-xs">
                Back
              </button>
              <button onClick={handleGenerateForecast} className="flex-[2] py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black text-lg flex items-center justify-center gap-2 uppercase tracking-widest shadow-2xl">
                Generate Forecast <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 4: NEURAL FORECAST --- */}
        {step === 4 && (
          <div className="animate-fadeIn text-center py-10">
             {loadingForecast ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-6">
                  <Loader2 className="animate-spin text-blue-500" size={48} />
                  <p className="font-black uppercase tracking-[0.2em] text-xs opacity-40">Synchronizing History & Predicting Outcome...</p>
                </div>
             ) : (
               <div className="space-y-8">
                  <div className="p-10 rounded-[3rem] bg-blue-600/5 border-2 border-blue-600/20 shadow-[0_0_50px_rgba(37,99,235,0.1)]">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Predicted Well-Being</p>
                          <div className="text-6xl font-black text-blue-600">{forecast?.wellBeingScore || '7.8'}.0<span className="text-xs opacity-20 ml-1">/10</span></div>
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Anxiety Probability</p>
                          <div className="text-6xl font-black text-amber-500">{(forecast?.anxietyProbability * 100).toFixed(0) || '21'}%</div>
                       </div>
                    </div>
                    <div className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 italic opacity-80 text-sm">
                      "Flight parameters verified. Neural path confirmed based on historic subject history."
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button onClick={() => setStep(3)} className="flex-1 py-6 border-2 border-gray-100 dark:border-zinc-800 rounded-3xl font-black uppercase text-xs">
                      Back
                    </button>
                    <button onClick={() => setStep(5)} className="flex-[2] py-6 bg-blue-600 text-white rounded-3xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl hover:bg-blue-700 transition-all uppercase tracking-widest">
                       <Save size={24} /> INITIATE LAUNCH SEQUENCE
                    </button>
                  </div>
               </div>
             )}
          </div>
        )}

        {/* --- STEP 5: SYSTEM STATUS PATTERN RECOGNITION (PHASE B) --- */}
        {step === 5 && (
          <div className="space-y-6 animate-fadeIn">
            {/* 1. Pattern Recognition Card */}
            <section className={`p-6 rounded-[2rem] border-2 border-blue-600/20 bg-blue-600/5 fadeText`}>
               <div className="flex items-center gap-3 mb-3">
                  <Brain className="text-blue-600" size={20} />
                  <h3 className="text-lg font-black uppercase tracking-tight">Pattern Recognition Engine</h3>
               </div>
               <div className="min-h-[40px]">
                  {loadingInsights ? <Loader2 className="animate-spin text-blue-500" size={16} /> : <p className="italic font-medium opacity-80 text-sm">{insights}</p>}
               </div>
            </section>

            {/* 2. Communication UI */}
            <div className={`p-6 rounded-[2rem] border-2 transition-all duration-1000 clearElement ${darkMode ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50 border-gray-100 shadow-xl'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Phase B: Comm UI</h4>
                  <div className="flex gap-2">
                    <button onClick={() => setCommType('audio')} className={`p-1.5 rounded-lg transition-colors ${commType === 'audio' ? 'bg-blue-600 text-white' : 'bg-blue-500/10 text-blue-500'}`}><Mic size={12}/></button>
                    <button onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20"><Upload size={12}/></button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-1.5 mb-3">
                  {commTypeOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setCommType(opt.value)}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${
                        commType === opt.value ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white/5 border-gray-200 dark:border-zinc-800 opacity-60'
                      }`}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                   <input 
                    type="text" 
                    placeholder={`Logging ${commType}...`} 
                    className={`flex-1 p-3.5 rounded-xl border-2 outline-none font-medium text-base transition-all ${darkMode ? 'bg-black border-zinc-800 focus:border-blue-600' : 'bg-white border-gray-100 focus:border-black'}`}
                    value={commText}
                    onChange={e => setCommText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleCommSubmit()}
                   />
                   <button onClick={handleCommSubmit} className="p-3.5 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all"><Send size={20}/></button>
                </div>

                {phaseBLogs.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-32 overflow-y-auto pr-2 custom-scroll">
                    {[...phaseBLogs].reverse().map((log, i) => (
                      <div key={i} className={`p-2.5 rounded-xl border flex justify-between items-start ${darkMode ? 'bg-black/40 border-zinc-800' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-start gap-2">
                          <div className="opacity-40">{commTypeOptions.find(o => o.value === log.type)?.icon}</div>
                          <p className="text-[11px] font-bold leading-tight">{log.content}</p>
                        </div>
                        <span className="text-[8px] font-mono opacity-20 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* 3. CONDENSED BOTTOM SECTION: Charts & Take Off */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Condensed Sweet Spot */}
                <div className={`p-4 rounded-[1.5rem] border fadeText h-40 ${darkMode ? 'bg-black/20 border-zinc-800' : 'bg-white border-gray-100'}`}>
                  <h4 className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-2">Sweet Spot</h4>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: -25 }}><XAxis type="number" dataKey="x" hide domain={[0,10]}/><YAxis type="number" dataKey="y" hide domain={[0,10]}/><Scatter data={[{x:5,y:5}]} fill="#3b82f6" shape="circle" /></ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Take Off Clear Element */}
                <div className="clearElement">
                  <button 
                    onClick={isInFlight ? handleTouchDown : handleTakeOff}
                    className={`w-full py-8 rounded-[2rem] font-black text-xl uppercase tracking-[0.3em] transition-all duration-500 shadow-xl flex items-center justify-center gap-3 ${
                      isInFlight ? 'bg-red-600 text-white animate-pulse shadow-[0_0_40px_rgba(220,38,38,0.3)]' : 'bg-blue-600 text-white hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    {isInFlight ? <><PowerOff size={24} /> TOUCH DOWN</> : <><Rocket size={24} /> TAKE OFF</>}
                  </button>
                </div>

                {/* Condensed Setting Weighting */}
                <div className={`p-4 rounded-[1.5rem] border fadeText h-40 ${darkMode ? 'bg-black/20 border-zinc-800' : 'bg-white border-gray-100'}`}>
                  <h4 className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-2">Weighting</h4>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{n:'S',v:4},{n:'E',v:7}]}><XAxis dataKey="n" hide /><YAxis hide domain={[0,10]} /><Bar dataKey="v" radius={[4,4,0,0]}><Cell fill="#10b981" /><Cell fill="#3b82f6" /></Bar></BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* --- STEP 7: EXPERIENTIAL DEBRIEF --- */}
        {step === 7 && (
           <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center gap-3 mb-2">
                 <PencilLine className="text-blue-500" />
                 <label className="text-xs font-black uppercase opacity-40">Experiential Debrief</label>
              </div>
              <textarea className={`w-full p-8 rounded-[2rem] border-2 h-64 outline-none font-medium text-lg leading-relaxed ${darkMode ? 'bg-black border-zinc-800 focus:border-blue-600' : 'bg-gray-50 border-gray-200 focus:border-black'}`} placeholder="Chronicle your experience..." value={debriefText} onChange={e => setDebriefText(e.target.value)} />
              <button onClick={() => setStep(8)} className="w-full py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black uppercase tracking-widest hover:scale-[1.01] transition-all">Continue Integration</button>
           </div>
        )}

        {/* --- STEP 8: FURTHER SUBSTANCES --- */}
        {step === 8 && (
          <div className="space-y-8 animate-fadeIn">
            <h3 className="text-xs font-black uppercase opacity-40 tracking-widest">Further Substances Used?</h3>
            <InputRange label="Final Effective Dose" value={phaseA.dosage} onChange={(v:number) => setPhaseA({...phaseA, dosage:v})} minLabel="Baseline" maxLabel="Peak Adjust" />
            <button onClick={() => setStep(9)} className="w-full py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black uppercase tracking-widest hover:scale-[1.01] transition-all">Verify Final State</button>
          </div>
        )}

        {/* --- STEP 9: INTERNAL STATE (POST-FLIGHT) --- */}
        {step === 9 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-xs font-black uppercase opacity-40 tracking-widest mb-6">Current Internal State</h3>
            <InputRange 
              label="Mood" 
              value={postMood} 
              onChange={setPostMood} 
              minLabel="Flat / Depressed" 
              maxLabel="Elevated / Euphoric" 
            />
            <InputRange 
              label="Well-Being" 
              value={postWellBeing} 
              onChange={setPostWellBeing} 
              minLabel="Systemic Malaise" 
              maxLabel="Flourishing State"
            />
            <InputRange 
              label="System Stress" 
              value={postStress} 
              onChange={setPostStress} 
              minLabel="Calm / Ease" 
              maxLabel="Extreme / Tense"
            />
            <InputRange 
              label="Life Responsibilities" 
              value={postResponsibilities} 
              onChange={setPostResponsibilities} 
              minLabel="Clear / Free" 
              maxLabel="Burdened / Heavy"
            />
            <button onClick={() => setStep(10)} className="w-full py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black uppercase tracking-widest hover:scale-[1.01] transition-all">Run Final Analysis</button>
          </div>
        )}

        {/* --- STEP 10: SECOND SYSTEM STATUS PATTERN RECOGNITION (FINAL) --- */}
        {step === 10 && (
          <div className="space-y-6 animate-fadeIn">
            <section className={`p-6 rounded-[2rem] border-2 border-blue-600/20 bg-blue-600/5`}>
               <div className="flex items-center gap-3 mb-3">
                  <Brain className="text-blue-600" size={20} />
                  <h3 className="text-lg font-black uppercase tracking-tight">Final Pattern Recognition Engine</h3>
               </div>
               <div className="min-h-[40px]">
                  {loadingInsights ? <Loader2 className="animate-spin text-blue-500" size={16} /> : <p className="italic font-medium opacity-80 text-sm">{insights}</p>}
               </div>
            </section>

            {/* CONDENSED FINAL SUMMARY UI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
               <div className="space-y-6">
                 <button 
                  onClick={handleSubmit} 
                  className="w-full py-10 bg-blue-600 text-white rounded-[2.5rem] font-black text-2xl uppercase tracking-[0.4em] shadow-[0_30px_80px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                 >
                   <Save size={28} /> FILE TO BLACK BOX
                 </button>
                 
                 <div className={`p-6 rounded-[2rem] border bg-black/5 dark:bg-white/5 italic opacity-60 text-xs leading-relaxed`}>
                   Final session telemetry captured and calibrated against baseline. Integration phase now active.
                 </div>
               </div>

               <div className={`p-6 rounded-[2rem] border ${darkMode ? 'bg-black/20 border-zinc-800' : 'bg-white border-gray-100'}`}>
                 <div className="flex items-center gap-2 mb-4">
                   <Map className="text-green-500" size={16} />
                   <h4 className="text-[9px] font-black uppercase tracking-widest opacity-40">Trajectory Weighting</h4>
                 </div>
                 <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{n:'Initial',v:5},{n:'Final',v:postWellBeing}]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1}/>
                        <XAxis dataKey="n" hide />
                        <YAxis hide domain={[0,10]} />
                        <Bar dataKey="v" radius={[6,6,0,0]} fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
