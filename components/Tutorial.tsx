
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ChevronRight, X, Play, BookOpen, Shield, BarChart2 } from 'lucide-react';

export const Tutorial: React.FC = () => {
  const { user, completeTutorial, darkMode } = useStore();
  const [step, setStep] = useState(0);

  if (!user || user.tutorialCompleted) return null;

  const steps = [
    {
      title: "Welcome to Black Box",
      description: "You are now equipped with a professional-grade flight recorder for consciousness exploration. Let's walk through the core systems.",
      icon: <Play className="text-blue-500" size={32} />
    },
    {
      title: "Research Subjects",
      description: "Manage multiple profiles under the 'Subjects' tab. Each subject maintains an isolated, encrypted ledger of their specific experiences.",
      icon: <BookOpen className="text-green-500" size={32} />
    },
    {
      title: "Logging a Flight",
      description: "Use 'New Flight' to initiate a session. We've added an 'Intention Setting' phase to ensure every journey is grounded and mindful.",
      icon: <BarChart2 className="text-amber-500" size={32} />
    },
    {
      title: "FacilitatorAI",
      description: "Our safety matrix is always online. Visit the 'Safety' section to query FacilitatorAI about harm reduction protocols and integration support.",
      icon: <Shield className="text-red-500" size={32} />
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`max-w-md w-full p-10 rounded-[3rem] border-2 shadow-2xl relative overflow-hidden transition-all transform scale-100 ${
        darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-gray-100 text-black'
      }`}>
        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-zinc-800">
          <div 
            className="h-full bg-blue-600 transition-all duration-500" 
            style={{ width: `${((step + 1) / steps.length) * 100}%` }} 
          />
        </div>

        <button 
          onClick={completeTutorial}
          className="absolute top-6 right-6 opacity-40 hover:opacity-100 transition-opacity"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-zinc-800 flex items-center justify-center mb-8 shadow-inner">
            {currentStep.icon}
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase mb-4">{currentStep.title}</h2>
          <p className="text-lg opacity-60 leading-relaxed mb-10 font-medium">
            {currentStep.description}
          </p>

          <div className="flex w-full gap-4">
            {step > 0 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex-1 py-4 border-2 border-gray-100 dark:border-zinc-800 rounded-2xl font-bold uppercase tracking-widest text-xs"
              >
                Back
              </button>
            )}
            <button 
              onClick={() => step < steps.length - 1 ? setStep(step + 1) : completeTutorial()}
              className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg"
            >
              {step < steps.length - 1 ? 'Continue' : 'Initiate System'} <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
