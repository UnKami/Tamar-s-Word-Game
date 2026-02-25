import React from 'react';
import { Mob } from '../types';
import { getPointOnPath } from '../utils/gameUtils';

interface MobRendererProps {
  mob: Mob;
}

const MobRenderer: React.FC<MobRendererProps> = ({ mob }) => {
  const { x, y } = getPointOnPath(mob.progress);
  const isCleared = !!mob.clearedAt;

  // Split word to highlight missing parts
  const renderWord = () => {
    // If cleared, show the full word cleanly
    if (isCleared) {
      return <span className="text-blueprint-glow font-bold drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">{mob.word}</span>;
    }

    return mob.displayWord.split('').map((char, idx) => {
      const isMissing = char === '_';
      return (
        <span 
          key={idx} 
          className={`${isMissing ? 'text-blueprint-glow animate-pulse font-extrabold' : 'text-blueprint-line'}`}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none will-change-transform"
      style={{ 
        left: `${x * 100}%`, 
        top: `${y * 100}%`,
        zIndex: Math.floor(mob.progress * 100),
        transition: 'opacity 1s ease-out, transform 1s ease-out',
        opacity: isCleared ? 0 : 1,
        transform: isCleared ? 'translate(-50%, -150%) scale(1.2)' : 'translate(-50%, -50%)',
      }}
    >
      <div className={`
        bg-blueprint-bg/95 border px-4 py-2 backdrop-blur-md rounded shadow-[0_0_15px_rgba(0,51,102,0.9)]
        ${isCleared ? 'border-blueprint-glow bg-blueprint-bg' : 'border-blueprint-line/40'}
      `}>
        <div className="text-base md:text-2xl font-mono font-bold tracking-widest whitespace-nowrap drop-shadow-md">
          {renderWord()}
        </div>
      </div>
    </div>
  );
};

export default MobRenderer;