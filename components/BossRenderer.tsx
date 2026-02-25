import React from 'react';
import { Boss } from '../types';
import { getPointOnPath } from '../utils/gameUtils';
import { Box, Activity } from 'lucide-react';

interface BossRendererProps {
  boss: Boss;
  isHit: boolean;
}

const BossRenderer: React.FC<BossRendererProps> = ({ boss, isHit }) => {
  const { x, y } = getPointOnPath(boss.progress);

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform will-change-transform"
      style={{ 
        left: `${x * 100}%`, 
        top: `${y * 100}%`,
        zIndex: 50
      }}
    >
      {/* 3D Wireframe Construct Visualization */}
      <div className={`relative transition-all duration-100 ${isHit ? 'scale-110 brightness-150' : 'scale-100'}`}>
        
        {/* Boss Core */}
        <div className="relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 border-2 border-dashed border-blueprint-line rounded-full animate-[spin_10s_linear_infinite] opacity-50"></div>
          
          {/* Inner rotating square */}
          <div className="absolute inset-4 border border-blueprint-glow rotate-45 animate-[spin_4s_linear_infinite_reverse]"></div>

          {/* Core Icon */}
          <Box className="text-blueprint-line w-8 h-8 md:w-12 md:h-12 drop-shadow-[0_0_15px_rgba(255,50,50,0.4)]" strokeWidth={1} />
          
          {/* HP Bar Circular */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
             <circle 
                cx="50" cy="50" r="48" 
                fill="none" 
                stroke="#003366" 
                strokeWidth="4" 
             />
             <circle 
                cx="50" cy="50" r="48" 
                fill="none" 
                stroke={boss.hp < 30 ? "#FF3333" : "#00FFFF"} 
                strokeWidth="4" 
                strokeDasharray="301.59" 
                strokeDashoffset={301.59 * (1 - boss.hp / boss.maxHp)}
                className="transition-all duration-300"
             />
          </svg>
        </div>

        {/* HP Text */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <span className="text-blueprint-line font-bold font-mono text-xs">CONSTRUCT</span>
          <span className={`font-mono text-xs ${boss.hp < 30 ? 'text-blueprint-damage' : 'text-blueprint-glow'}`}>
            HP: {boss.hp}/{boss.maxHp}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BossRenderer;
