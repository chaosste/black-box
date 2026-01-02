import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Substance, SocialEnvironment, PhysicalEnvironment, FlightSession } from '../types';
import { ChevronRight, Save, Trash2, ArrowLeft, Sparkles } from 'lucide-react';
import { ASSETS } from '../constants';
import { InputRange } from '../components/ui/InputRange';
import { TagInput } from '../components/ui/TagInput';

export const PostFlight: React.FC = () => {
  const { addSession, darkMode } = useStore();
  const [step, setStep] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  
  const [data, setData] = useState({
    substance: Substance.LSD,
    dosage: 100,
    mood: 5,
    mindfulness: 5,
    stress: 5,
    debriefText: '',
    social: SocialEnvironment.ALONE,
    physical: PhysicalEnvironment.FAMILIAR,
    timestamp: new Date().toISOString()
  });

  const handleSubmit = () => {
    const newSession: FlightSession = {
      id: crypto.randomUUID(),
      phaseA: {
        substance: data.substance,
        dosage: data.dosage,
        selfEsteem: 5,
        intentions: true,
        intentionsText: "Retrospective Entry",
        mood: data.mood,
        mindfulness: data.mindfulness,
        stress: data.stress,
        responsibilities: 5,
        social: data.social,
        physical: data.physical,
        timestamp: data.timestamp
      },
      phaseB: [],
      phaseC: {
          oneDay: {
              mood: data.mood,
              attention: 5,
              wellBeing: 8, // Defaulting for retro entry
              energy: 5,
              lifeOrientation: 5
          }
      },
      questionnaires: [],
      tags,
      isCompleted: true,
      debriefText: data.debriefText
    };
    addSession(newSession);
    alert('Retrospective experience committed to the research ledger.');
    window.location.hash = '#dashboard';
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Progress */}
      <div className="flex items-center justify-between mb-12 px-2">
        {[0, 1, 2].map(s => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all ${
              step >= s 
                ? 'bg-blue-600 text-white shadow-lg' 
                : (darkMode ? 'bg-zinc-900 text-zinc-700' : 'bg-gray-100 text-gray-300')
            }`}>
              {s + 1}
            </div>
            {s < 2 && <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${step > s ? 'bg-blue-600' : (darkMode ? 'bg-zinc-900' : 'bg-gray-100')}`} />}
          </div>
        ))}
      </div>

      <div className={`p-10 md:p-14 rounded-[3.5rem] border-2 relative overflow-hidden transition-all ${
        darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-2xl'
      }`}>
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
              {step === 0 && 'Neural Update Post Flight'}
              {step === 1 && 'Agent Calibration Post Flight'}
              {step === 2 && 'Set Verification'}
            </p>
          </div>
          <h2 className="text-4xl font-black tracking-tighter uppercase">
            {step === 0 && 'Experiential Debrief'}
            {step === 1 && 'Further Substances'}
            {step === 2 && 'Internal State'}
          </h2>
        </div>

        {step === 0 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="p-8 rounded-[2rem] bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 flex gap-4 items-start">
              <Sparkles className="text-blue-500 shrink-0 mt-1" />
              <p className="text-sm font-medium italic opacity-60">"Setting an intention beforehand can be worthwhile, but experiences can often surprise us."</p>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Experiment Intention</label>
              <textarea
                className={`w-full p-8 rounded-[2rem] border-2 outline-none resize-none h-40 transition-all font-medium text-lg ${
                  darkMode ? 'bg-black border-zinc-800 focus:border-blue-500' : 'bg-gray-50 border-gray-200 focus:border-black'
                }`}
                placeholder="Did your eventual outcome match the intended trajectory? Or was the trip different to your intention? How?"
                value={data.debriefText}
                onChange={e => setData({...data, debriefText: e.target.value})}
              />
            </div>

            <TagInput 
              tags={tags} 
              onChange={setTags} 
              label="Classification Tags - After" 
              placeholder="ADD RETROSPECTIVE TAG..." 
              darkMode={darkMode} 
            />

            <button 
              onClick={() => setStep(1)} 
              disabled={!data.debriefText.trim()}
              className="w-full py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl disabled:opacity-30 uppercase tracking-widest"
            >
              Commit Experience <ChevronRight size={20} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest opacity-40">Agent Substance</label>
                <select 
                  className={`w-full p-6 rounded-2xl border-2 font-bold appearance-none transition-all ${
                    darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'
                  }`}
                  value={data.substance}
                  onChange={(e) => setData({...data, substance: e.target.value as Substance})}
                >
                  {Object.values(Substance).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest opacity-40">Total Dosage (Units)</label>
                <input 
                  type="number" 
                  className={`w-full p-6 rounded-2xl border-2 font-mono font-bold transition-all ${
                    darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'
                  }`}
                  value={data.dosage}
                  onChange={(e) => setData({...data, dosage: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(0)} className="flex-1 py-6 border-2 border-gray-100 dark:border-zinc-800 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={() => setStep(2)} className="flex-[2] py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black text-lg flex items-center justify-center gap-2 uppercase tracking-widest">
                Finalize Setting <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <InputRange label="Post-Flight Mood" value={data.mood} onChange={(v: number) => setData({...data, mood: v})} />
            <InputRange label="Recalled Mindfulness" value={data.mindfulness} onChange={(v: number) => setData({...data, mindfulness: v})} />
            <InputRange label="Peak Stress Levels" value={data.stress} onChange={(v: number) => setData({...data, stress: v})} />
            
            <div className="flex gap-4 pt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-6 border-2 border-gray-100 dark:border-zinc-800 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                 Back
              </button>
              <button onClick={handleSubmit} className="flex-[2] py-6 bg-blue-600 text-white rounded-3xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl hover:bg-blue-700 transition-all transform active:scale-95 uppercase tracking-widest">
                <Save size={24} /> Finalize Setting
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
          onClick={() => { setStep(0); setData({...data, debriefText: ''}); }}
          className="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity flex items-center gap-2"
        >
          <Trash2 size={12} /> Clear Retrospective Plan
        </button>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 italic">Retrospective logging helps stabilize longitudinal data.</p>
      </div>
    </div>
  );
};
