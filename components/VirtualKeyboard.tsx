import React from 'react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
}

const KEYS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ onKeyPress }) => {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-blueprint-bg/95 border-t-2 border-blueprint-line/50 p-2 pb-6 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col gap-2 max-w-3xl mx-auto">
        {KEYS.map((row, i) => (
          <div key={i} className="flex justify-center gap-1.5">
            {row.map((k) => (
              <button
                key={k}
                onPointerDown={(e) => {
                  e.preventDefault(); // Prevent ghost clicks and focus issues
                  onKeyPress(k);
                }}
                className="
                  flex-1 h-12 min-w-[32px] max-w-[60px] 
                  bg-blueprint-bg border border-blueprint-line/40 rounded 
                  text-blueprint-line font-mono font-bold text-lg md:text-xl
                  shadow-[0_2px_0_rgba(230,242,255,0.1)]
                  active:bg-blueprint-glow active:text-blueprint-bg active:border-blueprint-glow active:shadow-none active:translate-y-[2px]
                  transition-all duration-75 select-none touch-manipulation
                "
              >
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualKeyboard;
