import React from 'react';
import { Terminal } from 'lucide-react';

interface TutorialModalProps {
  title: string;
  message: string;
  onNext: () => void;
  buttonText?: string;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ title, message, onNext, buttonText = "ACKNOWLEDGE" }) => {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Removed animate-float-up to prevent auto-hiding */}
      <div className="bg-blueprint-bg border-2 border-blueprint-glow p-6 max-w-md w-full shadow-[0_0_50px_rgba(0,255,255,0.2)] animate-[pulse_0.5s_ease-out_1]">
        <div className="flex items-center gap-3 mb-4 text-blueprint-glow border-b border-blueprint-line/30 pb-2">
          <Terminal size={24} />
          <h2 className="text-lg font-mono font-bold tracking-widest">{title}</h2>
        </div>
        
        <div className="mb-8 font-mono text-blueprint-line leading-relaxed text-sm md:text-base">
          {message}
        </div>

        <button 
          onClick={onNext}
          className="w-full bg-blueprint-glow text-blueprint-bg font-bold py-3 px-6 rounded-sm hover:bg-white transition-colors tracking-widest uppercase font-mono"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default TutorialModal;
