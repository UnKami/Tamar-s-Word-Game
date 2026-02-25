import React from 'react';
import { Play, Book, Settings, Layers, ShoppingCart, Cpu, Lock } from 'lucide-react';
import { TutorialStep } from '../types';

interface MainMenuProps {
  onStart: () => void;
  onLexicon: () => void;
  onDeck: () => void;
  onShop: () => void;
  onSkills: () => void;
  tutorialStep: TutorialStep;
  visitedPages: string[];
}

const MainMenu: React.FC<MainMenuProps> = ({ 
  onStart, onLexicon, onDeck, onShop, onSkills, 
  tutorialStep, visitedPages 
}) => {
  
  const isExplore = tutorialStep === 'EXPLORE';
  const isReady = tutorialStep === 'READY' || tutorialStep === 'COMPLETED' || tutorialStep === 'GAMEPLAY';

  const getButtonClass = (pageId: string) => {
    const base = "flex flex-col items-center justify-center gap-1 text-blueprint-line/80 bg-blueprint-line/5 border p-3 rounded-sm transition-all duration-200 relative ";
    const visited = visitedPages.includes(pageId);
    
    if (isExplore && !visited) {
      return base + "border-blueprint-glow text-blueprint-glow shadow-[0_0_15px_rgba(0,255,255,0.3)] animate-pulse hover:bg-blueprint-glow/10";
    }
    return base + "border-blueprint-line/30 hover:border-blueprint-glow hover:text-blueprint-glow hover:bg-blueprint-line/10";
  };

  const getLexiconClass = () => {
    const base = "flex items-center justify-center gap-3 text-blueprint-line/80 bg-blueprint-line/5 border py-3 rounded-sm transition-all duration-200 mt-2 relative ";
    const visited = visitedPages.includes('LEXICON');
    
    if (isExplore && !visited) {
      return base + "border-blueprint-glow text-blueprint-glow shadow-[0_0_15px_rgba(0,255,255,0.3)] animate-pulse hover:bg-blueprint-glow/10";
    }
    return base + "border-blueprint-line/30 hover:border-blueprint-glow hover:text-blueprint-glow hover:bg-blueprint-line/10";
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-blueprint-bg relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 blueprint-grid opacity-30" />
      <div className="absolute top-0 right-0 w-64 h-64 border-l border-b border-blueprint-line opacity-20 rounded-bl-[100px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 border-r border-t border-blueprint-line opacity-20 rounded-tr-full" />

      {/* Title Block */}
      <div className="z-10 text-center mb-10 relative">
        <div className="inline-block border-2 border-blueprint-line p-8 bg-blueprint-bg/80 backdrop-blur-sm shadow-[10px_10px_0px_rgba(230,242,255,0.1)]">
          <h1 className="text-4xl md:text-6xl font-bold text-blueprint-line font-mono mb-2 tracking-tighter">
            TAMAR'S <span className="text-blueprint-glow">DEFENSE</span>
          </h1>
          <div className="w-full h-px bg-blueprint-line mb-2"></div>
          <p className="text-blueprint-line/80 text-xs md:text-sm tracking-[0.3em] font-mono uppercase">
            Architectural Typing Defense
          </p>
        </div>
      </div>

      {/* Menu Buttons */}
      <div className="z-10 flex flex-col gap-4 w-full max-w-xs">
        <button 
          onClick={isReady ? onStart : undefined}
          disabled={!isReady}
          className={`group relative font-bold py-4 px-8 rounded-sm transition-all duration-200 border-2 mb-4
            ${isReady 
              ? 'bg-blueprint-glow text-blueprint-bg hover:translate-x-1 hover:-translate-y-1 border-transparent hover:border-blueprint-line hover:bg-blueprint-bg hover:text-blueprint-glow' 
              : 'bg-transparent text-blueprint-line/30 border-blueprint-line/30 cursor-not-allowed'}
          `}
        >
          <div className="flex items-center justify-center gap-3">
            {isReady ? <Play size={24} className="fill-current" /> : <Lock size={24} />}
            <span className="tracking-widest text-lg">
              {isReady ? 'INITIALIZE' : 'SYSTEM LOCKED'}
            </span>
          </div>
          {/* Decorative corners */}
          {isReady && (
            <>
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-blueprint-line opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-blueprint-line opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </>
          )}
        </button>

        {isExplore && <div className="text-center text-xs text-blueprint-glow mb-2 animate-bounce">REVIEW ALL SYSTEMS TO UNLOCK</div>}

        <div className="grid grid-cols-3 gap-2">
          <button onClick={onDeck} className={getButtonClass('DECK')}>
            <Layers size={18} />
            <span className="tracking-widest text-[10px] uppercase">Deck</span>
          </button>
          
          <button onClick={onShop} className={getButtonClass('SHOP')}>
            <ShoppingCart size={18} />
            <span className="tracking-widest text-[10px] uppercase">Shop</span>
          </button>
          
          <button onClick={onSkills} className={getButtonClass('SKILLS')}>
            <Cpu size={18} />
            <span className="tracking-widest text-[10px] uppercase">Skills</span>
          </button>
        </div>

        <button onClick={onLexicon} className={getLexiconClass()}>
          <Book size={18} />
          <span className="tracking-widest text-xs uppercase">Lexicon & Stats</span>
        </button>
      </div>

      <div className="absolute bottom-8 text-blueprint-line/30 text-[10px] font-mono">
        V1.1.0 // SYSTEMS ONLINE
      </div>
    </div>
  );
};

export default MainMenu;
