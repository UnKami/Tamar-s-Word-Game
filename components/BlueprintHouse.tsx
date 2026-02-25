import React from 'react';
import { Home } from 'lucide-react';
import { PATH_POINTS } from '../constants';

const BlueprintHouse: React.FC = () => {
  // Position is based on normalized coordinates (0-1) scaled to percentage
  const left = `${PATH_POINTS.end.x * 100}%`;
  const top = `${PATH_POINTS.end.y * 100}%`;

  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
      style={{ left, top }}
    >
      <div className="relative group">
        {/* House Icon */}
        <Home 
          size={48} 
          className="text-blueprint-line drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" 
          strokeWidth={1.5}
        />
        {/* Blueprint decorative lines */}
        <div className="absolute -left-4 -right-4 top-1/2 h-px bg-blueprint-line opacity-30"></div>
        <div className="absolute -top-4 -bottom-4 left-1/2 w-px bg-blueprint-line opacity-30"></div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] text-blueprint-line tracking-widest whitespace-nowrap">
          TAMAR'S HOUSE
        </div>
      </div>
    </div>
  );
};

export default BlueprintHouse;
