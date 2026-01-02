import React from 'react';

interface InputRangeProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  feedback?: string; // For the text status (e.g. "Severely Low")
  minLabel?: string; // For the label on the left bottom (e.g. "Flat")
  maxLabel?: string; // For the label on the right bottom (e.g. "Euphoric")
}

export const InputRange: React.FC<InputRangeProps> = ({ 
  label, 
  value, 
  onChange, 
  min = 1, 
  max = 10,
  step = 1,
  className = "mb-6",
  feedback,
  minLabel,
  maxLabel
}) => {
  const isOutOfBounds = value < min || value > max;

  return (
    <div className={`group ${className}`}>
      <div className="flex justify-between items-end mb-2">
        <div>
          <label className="text-sm font-bold uppercase tracking-widest opacity-60 block mb-1">
            {label}
          </label>
          {feedback && (
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 tracking-tight transition-all">
              {feedback}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
           <span className={`text-xl font-mono font-bold tabular-nums transition-colors ${
             isOutOfBounds ? 'text-red-500 animate-pulse' : 
             (feedback && value > 7) ? 'text-blue-600' : 
             (feedback && value < 4) ? 'text-amber-500' : ''
           }`}>
             {value}
           </span>
           {feedback && <span className="text-[10px] font-bold opacity-20">/ {max}</span>}
        </div>
      </div>
      
      <div className="relative h-4 flex items-center">
        <input 
          type="range" min={min} max={max} step={step}
          value={value} 
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={`w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isOutOfBounds ? 'ring-2 ring-red-500' : ''}`}
        />
      </div>

      {(minLabel || maxLabel) && (
        <div className="flex justify-between mt-2 px-1">
           <span className="text-[9px] font-black uppercase tracking-tighter opacity-30">{minLabel}</span>
           <span className="text-[9px] font-black uppercase tracking-tighter opacity-30">{maxLabel}</span>
        </div>
      )}
    </div>
  );
};
