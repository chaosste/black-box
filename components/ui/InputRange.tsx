import React from 'react';

interface InputRangeProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  className?: string;
  showValueColor?: boolean;
}

export const InputRange: React.FC<InputRangeProps> = ({ 
  label, 
  value, 
  onChange, 
  min = 1, 
  max = 10,
  className = "",
  showValueColor = true
}) => {
  const outOfBounds = value < min || value > max;
  
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-bold uppercase tracking-widest opacity-60">
          {label}
        </label>
        <span className={`text-xl font-mono font-bold ${showValueColor ? 'text-blue-600' : ''} ${outOfBounds ? 'text-red-500 animate-pulse' : ''}`}>
          {value}
        </span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step="1" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all ${outOfBounds ? 'ring-2 ring-red-500' : ''}`}
      />
    </div>
  );
};
