import React, { useState } from 'react';
import { SparklesIcon, Wand2Icon } from './Icons';

interface AIAssistantProps {
  onGenerate: () => Promise<void>;
  label: string;
  context?: string;
  disabled?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onGenerate, label, context, disabled }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading || disabled) return;
    
    setIsLoading(true);
    try {
      await onGenerate();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || disabled}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm backdrop-blur-md
        ${isLoading 
          ? 'bg-white/40 text-slate-500 cursor-wait' 
          : 'bg-white/40 text-indigo-700 hover:bg-white/60 border border-white/50 hover:shadow-md hover:scale-105'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:bg-white/40' : ''}
      `}
      title={context}
    >
      {isLoading ? (
        <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        <SparklesIcon className="w-3.5 h-3.5 text-indigo-600" />
      )}
      <span className="tracking-wide">{isLoading ? 'Thinking...' : label}</span>
    </button>
  );
};