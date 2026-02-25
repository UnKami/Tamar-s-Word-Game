import React from 'react';
import { GameStats, LevelRewards } from '../types';
import { RefreshCw, Home, Package, Zap, Coins } from 'lucide-react';
import { CARDS } from '../constants';

interface ResultScreenProps {
  won: boolean;
  stats: GameStats;
  rewards?: LevelRewards;
  onRetry: () => void;
  onHome: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ won, stats, rewards, onRetry, onHome }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-blueprint-bg text-blueprint-line relative overflow-hidden p-4">
      <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none" />
      
      <div className="z-10 bg-blueprint-bg/95 border-2 border-blueprint-line p-6 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-md w-full backdrop-blur-md max-h-full overflow-y-auto">
        
        <div className="text-center mb-6 border-b border-blueprint-line pb-4">
          <h1 className={`text-3xl md:text-4xl font-bold font-mono mb-2 ${won ? 'text-blueprint-glow' : 'text-blueprint-damage'}`}>
            {won ? 'PROJECT SECURE' : 'BREACH DETECTED'}
          </h1>
          <p className="text-sm opacity-80 font-mono tracking-widest">
            {won ? 'DEFENSE SUCCESSFUL' : 'CRITICAL FAILURE'}
          </p>
        </div>

        {won && rewards && (
          <div className="mb-6 bg-blueprint-glow/5 border border-blueprint-glow/30 rounded p-4 animate-float-up" style={{ animationDuration: '0.5s' }}>
            <div className="flex items-center justify-center gap-2 mb-4 text-blueprint-glow font-bold tracking-widest">
              <Package size={20} />
              <span>SUPPLY DROP ACQUIRED</span>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {rewards.cards.map(id => {
                const card = CARDS[id];
                return (
                  <div key={id} className="bg-blueprint-bg border border-blueprint-glow p-2 rounded flex flex-col items-center text-center shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                    <span className="text-[10px] text-blueprint-glow uppercase mb-1">NEW MODULE</span>
                    <div className="font-bold text-sm mb-1">{card.name}</div>
                    <div className="text-[10px] opacity-70">{card.scope}</div>
                  </div>
                );
              })}
              {rewards.duplicates.map((id, idx) => {
                const card = CARDS[id];
                return (
                  <div key={`dupe-${idx}`} className="bg-blueprint-bg border border-blueprint-line/50 p-2 rounded flex flex-col items-center text-center opacity-80">
                    <span className="text-[10px] text-yellow-400 uppercase mb-1">DUPLICATE</span>
                    <div className="font-bold text-sm mb-1">{card.name}</div>
                    <div className="text-[10px] text-yellow-400 font-bold">+50 YEN</div>
                  </div>
                );
              })}
            </div>

            {/* Coins Total */}
            <div className="flex justify-center items-center gap-4 text-sm font-bold border-t border-blueprint-line/20 pt-3">
              <div className="flex items-center gap-2 text-yellow-400">
                 <Coins size={16} />
                 <span>+{rewards.coins} YEN</span>
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                 <Zap size={16} />
                 <span>+1 SP</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="flex flex-col gap-1 p-2 bg-blueprint-line/5 rounded">
            <span className="text-[10px] uppercase tracking-widest opacity-70">WPM</span>
            <span className="text-xl font-mono font-bold">{stats.wpm}</span>
          </div>
          <div className="flex flex-col gap-1 p-2 bg-blueprint-line/5 rounded">
            <span className="text-[10px] uppercase tracking-widest opacity-70">Accuracy</span>
            <span className="text-xl font-mono font-bold">{stats.accuracy}%</span>
          </div>
          <div className="flex flex-col gap-1 p-2 bg-blueprint-line/5 rounded">
            <span className="text-[10px] uppercase tracking-widest opacity-70">Best Combo</span>
            <span className="text-xl font-mono font-bold">{stats.bestCombo}</span>
          </div>
          <div className="flex flex-col gap-1 p-2 bg-blueprint-line/5 rounded">
            <span className="text-[10px] uppercase tracking-widest opacity-70">Flow Uptime</span>
            <span className="text-xl font-mono font-bold">{stats.flowUptime}%</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onRetry}
            className="group w-full bg-blueprint-line/10 hover:bg-blueprint-glow/20 border border-blueprint-line text-blueprint-line hover:text-blueprint-glow py-3 px-6 rounded transition-all duration-200 flex items-center justify-center gap-3 font-mono font-bold uppercase tracking-wider"
          >
            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
            {won ? 'Continue Defense' : 'Retry Simulation'}
          </button>
          
          <button 
            onClick={onHome}
            className="w-full text-blueprint-line/70 hover:text-blueprint-line py-2 text-xs md:text-sm flex items-center justify-center gap-2 hover:underline underline-offset-4"
          >
            <Home size={14} />
            Return to Architect's Table
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResultScreen;
