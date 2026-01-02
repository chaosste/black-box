import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Substance, SocialEnvironment, PhysicalEnvironment, FlightSession } from '../types';
import { ChevronRight, Save, HelpCircle, PencilLine, Trash2, ArrowLeft, Brain, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { ASSETS } from '../constants';
import { getForecastAnalytics } from '../services/geminiService';
import { InputRange } from '../components/ui/InputRange';
import { TagInput } from '../components/ui/TagInput';

export const NewSession: React.FC = () => {
  const { addSession, draft, setDraft, darkMode, activeProfile } = useStore();
  const [step, setStep] = useState(0); 
  const [tags, setTags] = useState<string[]>([]);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecast, setForecast] = useState<any>(null);
  const [showAIPopup, setShowAIPopup] = useState(false);
  
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

  useEffect(() => {
    setDraft({ phaseA, tags, lastSaved: new Date().toISOString() });
  }, [phaseA, tags, setDraft]);

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
    
    // Trigger pop-up for 5 seconds after analysis appears
    setShowAIPopup(true);
    setTimeout(() => {
      setShowAIPopup(false);
    }, 5000);
  };

  const handleSubmit = () => {
    const newSession: FlightSession = {
      id: crypto.randomUUID(),
      phaseA,
      phaseB: [],
      phaseC: {},
      questionnaires: [],
      tags
    };
    addSession(newSession);
    alert('Session initiated. Data persisted to local storage.');
    window.location.hash = '#dashboard';
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
    return `Level ${value}`;
  };

  return (
    <div className="max-w-3xl mx-auto py-8 relative">
      {/* Progress */}
      <div className="flex items-center justify-between mb-12 px-2">
        {[0, 1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${
              step >= s 
                ? 'bg-blue-600 text-white shadow-lg' 
                : (darkMode ? 'bg-zinc-900 text-zinc-700' : 'bg-gray-100 text-gray-300')
            }`}>
              {s === 4 ? <Brain size={18} /> : s + 1}
            </div>
            {s < 4 && <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${step > s ? 'bg-blue-600' : (darkMode ? 'bg-zinc-900' : 'bg-gray-100')}`} />}
          </div>
        ))}
      </div>

      <div className={`p-10 md:p-14 rounded-[3.5rem] border-2 relative overflow-hidden transition-all ${
        darkMode ? 'bg-zinc-900 border-zinc-800 shadow-[0_40px_100px_rgba(0,0,0,0.5)]' : 'bg-white border-gray-100 shadow-2xl'
      }`}>
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
              {step === 0 && 'Neural Grounding'}
              {step === 1 && 'Agent Calibration'}
              {step === 2 && 'Set Verification'}
              {step === 3 && 'Setting Optimization'}
              {step === 4 && 'Neural Forecast'}
            </p>
            {draft && step < 4 && <span className="text-[9px] font-mono opacity-40">DRAFT_SAVED: {new Date(draft.lastSaved).toLocaleTimeString()}</span>}
          </div>
          <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">
            {step === 0 && 'Intention Setting'}
            {step === 1 && 'Substance & Dose'}
            {step === 2 && 'Internal State'}
            {step === 3 && 'External Dynamics'}
            {step === 4 && 'Calculated Trajectory'}
          </h2>
        </div>

        {step === 0 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="p-8 rounded-[2rem] bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 flex gap-6 items-center">
              <PencilLine className="text-blue-600 shrink-0" size={32} />
              <p className="text-sm font-medium leading-relaxed opacity-70 italic">
                "Mindfulness begins with clarity of purpose. Record your intention for this flight to calibrate your outcome trajectory."
              </p>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Experiment Intention</label>
              <textarea
                className={`w-full p-8 rounded-[2rem] border-2 outline-none resize-none h-40 transition-all font-medium text-lg ${
                  darkMode ? 'bg-black border-zinc-800 focus:border-blue-500' : 'bg-gray-50 border-gray-200 focus:border-black'
                }`}
                placeholder="What do you hope to explore or achieve in this session?"
                value={phaseA.intentionsText}
                onChange={e => setPhaseA({...phaseA, intentionsText: e.target.value})}
              />
            </div>

            <TagInput 
                tags={tags} 
                onChange={setTags} 
                label="Classification Tags" 
                placeholder="E.G. SOLO, HIGH-DOSE, NATURE..." 
                darkMode={darkMode}
            />

            <button 
              onClick={() => setStep(1)} 
              disabled={!phaseA.intentionsText.trim()}
              className="w-full py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl disabled:opacity-30 uppercase tracking-widest"
            >
              Commit Intention <ChevronRight size={20} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest opacity-40">Neural Agent</label>
                <select 
                  className={`w-full p-6 rounded-2xl border-2 font-bold appearance-none transition-all ${
                    darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'
                  }`}
                  value={phaseA.substance}
                  onChange={(e) => setPhaseA({...phaseA, substance: e.target.value as Substance})}
                >
                  {Object.values(Substance).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest opacity-40">Dosage Weight (Units)</label>
                <input 
                  type="number" 
                  className={`w-full p-6 rounded-2xl border-2 font-mono font-bold transition-all ${
                    darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'
                  }`}
                  value={phaseA.dosage}
                  onChange={(e) => setPhaseA({...phaseA, dosage: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(0)} className="flex-1 py-6 border-2 border-gray-100 dark:border-zinc-800 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={() => setStep(2)} className="flex-[2] py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black text-lg flex items-center justify-center gap-2 uppercase tracking-widest">
                Verify Set <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <InputRange 
              label="Pre-Flight Mood" 
              value={phaseA.mood} 
              onChange={(v: number) => setPhaseA({...phaseA, mood: v})} 
              minLabel="Flat / Depressed" 
              maxLabel="Elevated / Euphoric"
              feedback={getSliderFeedback("mood", phaseA.mood)}
            />
            <InputRange 
              label="Mindfulness Level" 
              value={phaseA.mindfulness} 
              onChange={(v: number) => setPhaseA({...phaseA, mindfulness: v})} 
              minLabel="Scattered / Auto" 
              maxLabel="Centered / Present"
              feedback={getSliderFeedback("mindfulness", phaseA.mindfulness)}
            />
            <InputRange 
              label="System Stress" 
              value={phaseA.stress} 
              onChange={(v: number) => setPhaseA({...phaseA, stress: v})} 
              minLabel="Calm / Ease" 
              maxLabel="Extreme / Tense"
              feedback={getSliderFeedback("stress", phaseA.stress)}
            />
            <InputRange 
              label="Life Responsibilities" 
              value={phaseA.responsibilities} 
              onChange={(v: number) => setPhaseA({...phaseA, responsibilities: v})} 
              minLabel="Clear / Free" 
              maxLabel="Burdened / Heavy"
              feedback={getSliderFeedback("responsibilities", phaseA.responsibilities)}
            />
            
            <div className="flex gap-4 pt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-6 border-2 border-gray-100 dark:border-zinc-800 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                 Back
              </button>
              <button onClick={() => setStep(3)} className="flex-[2] py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black text-lg flex items-center justify-center gap-2 uppercase tracking-widest">
                Optimize Setting <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

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
              <button onClick={() => setStep(2)} className="flex-1 py-6 border-2 border-gray-100 dark:border-zinc-800 rounded-3xl font-black uppercase tracking-widest text-xs">
                Back
              </button>
              <button onClick={handleGenerateForecast} className="flex-[2] py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black text-lg flex items-center justify-center gap-2 uppercase tracking-widest shadow-2xl">
                Generate Forecast <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-10 animate-fadeIn">
            {loadingForecast ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-6">
                <Loader2 className="animate-spin text-blue-500" size={48} />
                <p className="font-black uppercase tracking-[0.2em] text-xs opacity-40">Synchronizing History & Predicting Outcome...</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className={`p-8 rounded-[2.5rem] border-2 border-blue-600/20 bg-blue-600/5 relative overflow-hidden`}>
                  <div className="relative z-10 grid grid-cols-2 gap-8">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Predicted Well-Being</p>
                       <div className="text-4xl font-black text-blue-600">{forecast?.wellBeingScore || '7.5'}.0<span className="text-xs opacity-30">/10</span></div>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Anxiety Probability</p>
                       <div className="text-4xl font-black text-amber-500">{(forecast?.anxietyProbability * 100).toFixed(0) || '15'}%</div>
                    </div>
                  </div>
                  {forecast?.warning && (
                    <div className="mt-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs font-bold leading-relaxed flex gap-3 text-amber-600">
                      <HelpCircle size={16} className="shrink-0" />
                      {forecast.warning}
                    </div>
                  )}
                  <Sparkles size={120} className="absolute -bottom-10 -right-10 opacity-[0.05] text-blue-600" />
                </div>

                <div className="p-8 rounded-[2rem] border border-dashed border-gray-200 dark:border-zinc-800 text-center">
                   <p className="text-xs font-medium italic opacity-60">"Flight parameters verified. Neural path confirmed based on historic subject history."</p>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(3)} className="flex-1 py-6 border-2 border-gray-100 dark:border-zinc-800 rounded-3xl font-black uppercase tracking-widest text-xs">
                    Back
                  </button>
                  <button onClick={handleSubmit} className="flex-[2] py-6 bg-blue-600 text-white rounded-3xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl hover:bg-blue-700 transition-all uppercase tracking-widest">
                    <Save size={24} /> INITIATE FLIGHT
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="absolute -bottom-20 -right-20 opacity-[0.02] pointer-events-none">
           <img src={ASSETS.LOGO_OUROBOROS} className="w-96 h-96 rotate-12" alt="" />
        </div>
      </div>

      {/* NeuroPhenomAI Pop-up (After analysis appears) */}
      {showAIPopup && (
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

      <div className="mt-8 flex justify-between items-center px-6">
        <button 
          onClick={() => { localStorage.removeItem('flight_recorder_draft'); setDraft(null); alert('Draft discarded.'); setStep(0); }}
          className="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity flex items-center gap-2"
        >
          <Trash2 size={12} /> Discard Flight Plan
        </button>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Draft persists across system restarts.</p>
      </div>
    </div>
  );
};
