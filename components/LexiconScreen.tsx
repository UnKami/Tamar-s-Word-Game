import React from 'react';
import { Book, ChevronLeft, Shield } from 'lucide-react';

interface LexiconScreenProps {
  unlockedWords: Set<string>;
  onBack: () => void;
}

const LexiconScreen: React.FC<LexiconScreenProps> = ({ unlockedWords, onBack }) => {
  const words = Array.from(unlockedWords).sort();
  const damageBonus = words.length; // 1% per word

  return (
    <div className="flex flex-col h-full w-full bg-blueprint-bg text-blueprint-line relative overflow-hidden ">
      <div className="absolute inset-0 opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="z-10 flex flex-col md:flex-row justify-between items-start mb-8 border-b border-blueprint-line/50 pb-4 gap-4">
        <div className='w-full'>
        <div style={{flexDirection:'row', display:'flex', justifyContent:'space-between'}}>
          <h1 className="text-3xl md:text-4xl font-bold font-mono text-blueprint-glow flex items-center gap-3">
            <Book className="w-8 h-8" />
            LEXICON
          </h1>
                      <button 
              onClick={onBack}
              className="self-end flex items-center gap-2 text-blueprint-line hover:text-blueprint-glow transition-colors uppercase tracking-widest text-sm font-bold"
            >
              <ChevronLeft size={20} />
              BACK
            </button>

          </div>
          <p className="text-xs md:text-sm text-blueprint-line/70 mt-2 font-mono tracking-widest uppercase">
            Collected Fragments & Knowledge Base
          </p>
        </div>

        <div className="flex flex-col items-end gap-4 w-full md:w-auto">

            <div className="w-full md:w-auto flex items-center gap-4 bg-blueprint-bg/80 border border-blueprint-glow/50 px-4 py-3 rounded backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,255,0.2)]">
              <Shield className="text-blueprint-glow" size={24} />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest opacity-70">Boss Damage Bonus</span>
                <span className="text-xl font-bold font-mono text-blueprint-glow">+{damageBonus}%</span>
              </div>
            </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {words.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-blueprint-line/40 text-center">
            <Book size={64} className="mb-4 opacity-20" />
            <p className="font-mono text-lg">NO DATA RECORDED</p>
            <p className="text-xs mt-2 max-w-xs">Successfully clear words during defense simulations to populate the lexicon and increase system potency.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {words.map((word) => (
              <div 
                key={word} 
                className="bg-blueprint-line/5 border border-blueprint-line/20 p-3 rounded text-center hover:bg-blueprint-glow/10 hover:border-blueprint-glow/50 transition-colors cursor-default group"
              >
                <span className="font-mono font-bold text-sm md:text-base tracking-wider group-hover:text-blueprint-glow transition-colors">
                  {word}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(230, 242, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(230, 242, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
};

export default LexiconScreen;