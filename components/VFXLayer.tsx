import React from 'react';
import { Particle } from '../types';

interface VFXLayerProps {
  particles: Particle[];
}

const VFXLayer: React.FC<VFXLayerProps> = ({ particles }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: `${p.x}%`, 
            top: `${p.y}%`,
          }}
        >
          {p.type === 'spark' && (
            <div className="relative">
              <div className="absolute w-2 h-2 bg-blueprint-glow rounded-full animate-[ping_0.5s_ease-out_forwards]" />
              <div className="absolute w-1 h-1 bg-white rounded-full" />
            </div>
          )}
          
          {p.type === 'burst' && (
            <div className="relative">
              <div className="absolute inset-0 w-12 h-12 border-2 border-blueprint-glow rounded-full animate-[ping_0.8s_cubic-bezier(0,0,0.2,1)_forwards] opacity-0" />
              <div className="absolute inset-0 w-8 h-8 bg-blueprint-glow/50 rounded-full animate-[ping_0.6s_ease-out_forwards]" />
              {/* Lines bursting out - simplified with CSS transform */}
              <div className="absolute left-1/2 top-1/2 w-[1px] h-8 bg-blueprint-line origin-bottom -translate-x-1/2 -translate-y-full rotate-0 animate-[ping_0.4s_ease-out_forwards]" />
              <div className="absolute left-1/2 top-1/2 w-[1px] h-8 bg-blueprint-line origin-bottom -translate-x-1/2 -translate-y-full rotate-45 animate-[ping_0.4s_ease-out_forwards]" />
              <div className="absolute left-1/2 top-1/2 w-[1px] h-8 bg-blueprint-line origin-bottom -translate-x-1/2 -translate-y-full rotate-90 animate-[ping_0.4s_ease-out_forwards]" />
              <div className="absolute left-1/2 top-1/2 w-[1px] h-8 bg-blueprint-line origin-bottom -translate-x-1/2 -translate-y-full -rotate-45 animate-[ping_0.4s_ease-out_forwards]" />
              <div className="absolute left-1/2 top-1/2 w-[1px] h-8 bg-blueprint-line origin-bottom -translate-x-1/2 -translate-y-full -rotate-90 animate-[ping_0.4s_ease-out_forwards]" />
            </div>
          )}

          {p.type === 'boss-hit' && (
             <div className="relative">
                 <div className="absolute w-32 h-32 border-4 border-blueprint-damage rounded-full animate-[ping_0.4s_ease-out_forwards]" />
                 <div className="absolute w-24 h-24 bg-white/50 rounded-full animate-[ping_0.2s_ease-out_forwards]" />
             </div>
          )}

          {p.type === 'floating-text' && (
            <div className="relative z-50 animate-float-up">
              <div className="text-yellow-400 font-bold font-mono text-xl md:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
                {p.text}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default VFXLayer;
