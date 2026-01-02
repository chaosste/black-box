import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Substance, SocialEnvironment, PhysicalEnvironment, FlightSession } from '../types';
import { ChevronRight, Save, PencilLine, Trash2, ArrowLeft, Tag, X } from 'lucide-react';
import { ASSETS } from '../constants';
import { InputRange } from '../components/ui/InputRange';

export const NewSession: React.FC = () => {
  const { addSession, draft, setDraft, darkMode } = useStore();
  const [step, setStep] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
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

  // Load draft on mount
  useEffect(() => {
    if (draft) {
      setPhaseA(prev => ({ ...prev, ...draft.phaseA }));
      if (draft.tags) setTags(draft.tags);
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    setDraft({ phaseA, tags, lastSaved: new Date().toISOString() });
  }, [phaseA, tags, setDraft]);

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

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTag.trim();
    if (!tag || tags.includes(tag)) return;
    setTags([...tags, tag]);
    setNewTag('');
  };

  const steps = [
    { title: 'Intention Setting', subtitle: 'Neural Grounding' },
    { title: 'Substance & Dose', subtitle: 'Agent Calibration' },
    { title: 'Internal State', subtitle: 'Set Verification' },
    { title: 'External Dynamics', subtitle: 'Setting Optimization' }
  ];

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-12 px-2">
        {steps.map((_, idx) => (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${
              step >= idx 
                ? 'bg-blue-600 text-white shadow-lg' 
                : (darkMode ? 'bg-zinc-900 text-zinc-700' : 'bg-gray-100 text-gray-300')
            }`}>
              {idx + 1}
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${step > idx ? 'bg-blue-600' : (darkMode ? 'bg-zinc-900' : 'bg-gray-100')}`} />
            )}
          </div>
        ))}
      </div>

      <div className={`p-10 md:p-14 rounded-[3.5rem] border-2 relative overflow-hidden transition-all ${
        darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-2xl'
      }`}>
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
              {steps[step].subtitle}
            </p>
            {draft && <span className="text-[9px] font-mono opacity-40">DRAFT_SAVED: {new Date(draft.lastSaved).toLocaleTimeString()}</span>}
          </div>
          <h2 className="text-4xl font-black tracking-tighter uppercase">{steps[step].title}</h2>
        </div>

        {step === 0 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="p-8 rounded-[2rem] bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 flex gap-6 items-center">
              <PencilLine className="text-blue-600 shrink-0" size={32} />
              <p className="text-sm font-medium leading-relaxed opacity-70 italic">
                "Mindfulness begins with clarity of purpose. Record your intention for this flight to calibrate your outcome trajectory."
              </p>
            </div>
            
            <textarea
              className={`w-full p-8 rounded-[2rem] border-2 outline-none resize-none h-40 transition-all font-medium text-lg ${
                darkMode ? 'bg-black border-zinc-800 focus:border-blue-500' : 'bg-gray-50 border-gray-200 focus:border-black'
              }`}
              placeholder="What do you hope to explore or achieve in this session?"
              value={phaseA.intentionsText}
              onChange={e => setPhaseA({...phaseA, intentionsText: e.target.value})}
            />

            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Classification Tags</label>
               <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(t => (
                    <span key={t} className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Tag size={10} /> {t}
                      <button onClick={() => setTags(tags.filter(x => x !== t))} className="hover:text-red-500"><X size={12}/></button>
                    </span>
                  ))}
               </div>
               <form onSubmit={handleAddTag} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="E.G. SOLO, HIGH-DOSE, NATURE..."
                    className={`flex-1 p-4 rounded-xl border-2 font-black uppercase text-xs tracking-widest ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'}`}
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                  />
                  <button type="submit" className="px-6 bg-blue-600 text-white rounded-xl font-black uppercase text-xs tracking-widest">Add</button>
               </form>
            </div>

            <button 
              onClick={() => setStep(1)} 
              disabled={!phaseA.intentionsText.trim()}
              className="w-full py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl disabled:opacity-30"
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
              <button onClick={() => setStep(0)} className="flex-1 py-6 border-2 border-gray-100 dark:border-zinc-800 rounded-3xl font-black uppercase tracking-widest text-xs">Back</button>
              <button onClick={() => setStep(2)} className="flex-[2] py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black text-lg flex items-center justify-center gap-2">Verify Set <ChevronRight size={20} /></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <InputRange label="Self-Esteem Baseline" value={phaseA.selfEsteem} onChange={(v) => setPhaseA({...phaseA, selfEsteem: v})} />
            <InputRange label="Pre-Flight Mood" value={phaseA.mood} onChange={(v) => setPhaseA({...phaseA, mood: v})} />
            <InputRange label="Mindfulness Level" value={phaseA.mindfulness} onChange={(v) => setPhaseA({...phaseA, mindfulness: v})} />
            <InputRange label="System Stress" value={phaseA.stress} onChange={(v) => setPhaseA({...phaseA, stress: v})} />
            
            <div className="flex gap-4 pt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-6 border-2 border-gray-100 dark:border-zinc-800 rounded-3xl font-black uppercase tracking-widest text-xs">Back</button>
              <button onClick={() => setStep(3)} className="flex-[2] py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black text-lg flex items-center justify-center gap-2">Optimize Setting <ChevronRight size={20} /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 animate-fadeIn">
            {[ 
              { label: 'Social Matrix', field: 'social', options: Object.values(SocialEnvironment) },
              { label: 'Physical Coordinates', field: 'physical', options: Object.values(PhysicalEnvironment) }
            ].map(setting => (
              <div key={setting.field} className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest opacity-40">{setting.label}</label>
                <div className="grid grid-cols-2 gap-4">
                  {setting.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setPhaseA({...phaseA, [setting.field]: opt})}
                      className={`p-6 rounded-2xl border-2 font-black transition-all uppercase tracking-widest text-xs ${
                        phaseA[setting.field as keyof typeof phaseA] === opt 
                          ? 'border-blue-600 bg-blue-600 text-white shadow-lg' 
                          : (darkMode ? 'border-zinc-800 bg-black' : 'border-gray-100 bg-gray-50')
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(2)} className="flex-1 py-6 border-2 border-gray-100 dark:border-zinc-800 rounded-3xl font-black uppercase tracking-widest text-xs">Back</button>
              <button onClick={handleSubmit} className="flex-[2] py-6 bg-blue-600 text-white rounded-3xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl hover:bg-blue-700 transition-all transform active:scale-95">
                <Save size={24} /> INITIATE FLIGHT
              </button>
            </div>
          </div>
        )}

        <div className="absolute -bottom-20 -right-20 opacity-[0.02] pointer-events-none">
           <img src={ASSETS.LOGO_OUROBOROS} className="w-96 h-96 rotate-12" alt="" />
        </div>
      </div>

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
