import React, { useState } from 'react';
import { useStore } from '../store/useStore';
// Added ChevronRight to imports
import { ClipboardList, ExternalLink, Info, ArrowLeft, CheckCircle, ChevronRight } from 'lucide-react';

const QUESTIONNAIRE_TEMPLATES = [
  { 
    id: 'meq', 
    name: 'Mystical Experiences Questionnaire', 
    questions: [
      { id: 'q1', text: 'Loss of your usual sense of time?' },
      { id: 'q2', text: 'Experience of pure being and pure awareness?' },
      { id: 'q3', text: 'Sense of being outside of time, past and future?' },
      { id: 'q4', text: 'Certainty that your usual self was not there?' },
      { id: 'q5', text: 'Experience of unity with all things?' }
    ]
  },
  { 
    id: 'ceq', 
    name: 'Challenging Experiences Questionnaire', 
    questions: [
      { id: 'q1', text: 'Sense of isolation or being alone?' },
      { id: 'q2', text: 'Feeling as though you were dying?' },
      { id: 'q3', text: 'Feeling of paranoia or distrust?' },
      { id: 'q4', text: 'Physical distress or discomfort?' },
      { id: 'q5', text: 'Experience of overwhelming fear?' }
    ]
  },
  { 
    id: 'hsc', 
    name: 'Higher States of Consciousness Scale', 
    questions: [
      { id: 'q1', text: 'Heightened awareness of mental processes?' },
      { id: 'q2', text: 'Feeling of supreme focus or clarity?' },
      { id: 'q3', text: 'Intuitive insight into complex problems?' }
    ]
  },
  { 
    id: 'edi', 
    name: 'Ego Dissolution Inventory', 
    questions: [
      { id: 'q1', text: 'I experienced a dissolution of my "self" or "ego".' },
      { id: 'q2', text: 'I felt at one with the universe.' },
      { id: 'q3', text: 'My sense of self separated from my physical body.' }
    ]
  },
  { 
    id: 'burnout', 
    name: 'Burnout Self-Test Inventory', 
    questions: [
      { id: 'q1', text: 'Do you feel run down and drained of physical or emotional energy?' },
      { id: 'q2', text: 'Are you feeling increasingly cynical about your work/responsibilities?' }
    ]
  }
];

export const Questionnaires: React.FC = () => {
  const { darkMode, addQuestionnaireResult } = useStore();
  const [activeForm, setActiveForm] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, number>>({});

  const template = QUESTIONNAIRE_TEMPLATES.find(t => t.id === activeForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    // Fix: Cast Object.values to number[] to resolve "unknown" type assignment error during reduction
    const values = Object.values(responses) as number[];
    const totalScore: number = values.reduce((a: number, b: number) => a + b, 0);
    const avg = values.length ? totalScore / values.length : 0;

    addQuestionnaireResult({
      id: crypto.randomUUID(),
      questionnaireId: template.id,
      name: template.name,
      responses: { ...responses },
      score: parseFloat(avg.toFixed(1)),
      completedAt: new Date().toISOString()
    });

    alert('Assessment complete. Data linked to current subject profile.');
    setActiveForm(null);
    setResponses({});
  };

  if (activeForm && template) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <button onClick={() => setActiveForm(null)} className="mb-8 flex items-center gap-2 font-bold uppercase text-xs opacity-40 hover:opacity-100 transition-opacity">
          <ArrowLeft size={16} /> Exit Assessment
        </button>
        
        <header className="mb-10">
           <h2 className="text-4xl font-black tracking-tighter uppercase">{template.name}</h2>
           <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-2">Native Research Module • PSY-OS v2.5</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
           {template.questions.map(q => (
             <div key={q.id} className="space-y-4">
                <p className="text-lg font-bold leading-tight">{q.text}</p>
                <div className="flex justify-between items-center gap-4">
                   <span className="text-[10px] font-black opacity-40 uppercase">Not at all</span>
                   <div className="flex-1 flex justify-between gap-2">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setResponses({...responses, [q.id]: val})}
                          className={`flex-1 py-4 rounded-xl border-2 font-black transition-all ${responses[q.id] === val ? 'bg-blue-600 border-blue-600 text-white' : (darkMode ? 'bg-black border-zinc-800 text-zinc-600' : 'bg-white border-gray-100 text-gray-400')}`}
                        >
                          {val}
                        </button>
                      ))}
                   </div>
                   <span className="text-[10px] font-black opacity-40 uppercase">Extremely</span>
                </div>
             </div>
           ))}

           <button 
            type="submit" 
            disabled={Object.keys(responses).length < template.questions.length}
            className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl disabled:opacity-30 disabled:grayscale transition-all"
           >
             <CheckCircle size={24} /> Submit Findings
           </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <header className="mb-12">
        <h2 className="text-4xl font-bold mb-4">Native Assessment Modules</h2>
        <p className="opacity-60 text-lg">Integrated clinical forms. Responses are saved directly to your research profile for long-term outcome tracking.</p>
      </header>

      <div className="grid gap-6">
        {QUESTIONNAIRE_TEMPLATES.map(q => (
          <button 
            key={q.id}
            onClick={() => setActiveForm(q.id)}
            className={`p-8 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6 text-left transition-all hover:scale-[1.01] ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100 shadow-sm'}`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${darkMode ? 'bg-gray-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <ClipboardList size={24} />
              </div>
              <div>
                <h3 className="font-bold text-xl uppercase tracking-tight">{q.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black tracking-widest uppercase opacity-40">Digital Protocol Validated</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] text-blue-500">
               Initiate <ChevronRight size={16} />
            </div>
          </button>
        ))}
      </div>

      <div className={`mt-12 p-8 rounded-[2.5rem] border border-dashed ${darkMode ? 'border-zinc-800 text-zinc-500' : 'border-gray-200 text-gray-500'}`}>
        <p className="text-center text-xs font-medium italic">
          Native digital forms are optimized for PSY-OS v2.5. External PDF assessments are still available in the resources section for archival reference.
        </p>
      </div>
    </div>
  );
};