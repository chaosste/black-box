import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { InputRange } from './ui/InputRange';
import { TagInput } from './ui/TagInput';
import { FlightSession } from '../types';

interface LandingWizardProps {
  session: FlightSession;
  darkMode: boolean;
  onClose: () => void;
  onCommit: (data: { debriefText: string; inputs: any; tags: string[] }) => void;
}

export const LandingWizard: React.FC<LandingWizardProps> = ({ session, darkMode, onClose, onCommit }) => {
  const [step, setStep] = useState(0);
  const [debriefText, setDebriefText] = useState(session.debriefText || '');
  const [tags, setTags] = useState<string[]>(session.tags || []);
  
  // Default inputs
  const [inputs, setInputs] = useState({
    mood: 5, attention: 5, wellBeing: 5, energy: 5, lifeOrientation: 5
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className={`max-w-2xl w-full p-10 md:p-14 rounded-[3.5rem] border-4 relative overflow-hidden animate-fadeIn ${darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-black text-black'}`}>
         <div className="mb-10 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-1">Landing Protocol: {step + 1}/3</p>
              <h2 className="text-4xl font-black uppercase tracking-tighter">
                {step === 0 && 'Neural Update'}
                {step === 1 && 'Outcome Matrix'}
                {step === 2 && 'Commit Flight'}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 opacity-40 hover:opacity-100"><X /></button>
         </div>

         {step === 0 && (
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
             <button onClick={() => setStep(1)} className="w-full py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
               Verify Outcomes <ArrowRight size={16} />
             </button>
           </div>
         )}

         {step === 1 && (
           <div className="space-y-6 animate-fadeIn">
              <InputRange label="Subjective Mood (Now)" value={inputs.mood} onChange={(v: number) => setInputs({...inputs, mood: v})} />
              <InputRange label="Attentional Bandwidth" value={inputs.attention} onChange={(v: number) => setInputs({...inputs, attention: v})} />
              <InputRange label="Global Well-Being" value={inputs.wellBeing} onChange={(v: number) => setInputs({...inputs, wellBeing: v})} />
              <InputRange label="System Energy" value={inputs.energy} onChange={(v: number) => setInputs({...inputs, energy: v})} />
              <InputRange label="Life Orientation" value={inputs.lifeOrientation} onChange={(v: number) => setInputs({...inputs, lifeOrientation: v})} />
              
              <div className="flex gap-4 pt-6">
                <button onClick={() => setStep(0)} className="flex-1 py-6 border-4 border-gray-100 dark:border-zinc-800 rounded-3xl font-black uppercase text-xs">Back</button>
                <button onClick={() => setStep(2)} className="flex-[2] py-6 bg-black text-white dark:bg-white dark:text-black rounded-3xl font-black uppercase text-xs">Retrospective Tags</button>
              </div>
           </div>
         )}

         {step === 2 && (
           <div className="space-y-8 animate-fadeIn">
              <TagInput 
                tags={tags} 
                onChange={setTags} 
                label="Classification Tags - After" 
                placeholder="ADD RETROSPECTIVE TAG..." 
                darkMode={darkMode}
              />
              <button onClick={() => onCommit({ debriefText, inputs, tags })} className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl hover:bg-blue-700 uppercase tracking-[0.2em]">
                <ShieldCheck size={24} /> Commit Experience
              </button>
           </div>
         )}
      </div>
    </div>
  );
};
