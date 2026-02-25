import React from 'react';
import { UserProfile, Card } from '../types';
import { CARDS } from '../constants';
import { ChevronLeft, Coins, Zap } from 'lucide-react';

interface ShopScreenProps {
  profile: UserProfile;
  onBuyCard: (cardId: string) => void;
  onBuySP: () => void;
  onBack: () => void;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ profile, onBuyCard, onBuySP, onBack }) => {
  const unownedCards = Object.values(CARDS).filter(c => !profile.inventory.includes(c.id));
  const spCost = 500; // Fixed cost for MVP

  return (
    <div className="flex flex-col h-full w-full bg-blueprint-bg text-blueprint-line relative p-6">
      <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="z-10 flex justify-between items-center mb-8 border-b border-blueprint-line/30 pb-4">
        <div>
          <h1 className="text-3xl font-bold font-mono text-blueprint-glow">SUPPLY DEPOT</h1>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2 text-yellow-400">
              <Coins size={16} /> <span className="font-mono">{profile.coins} YEN</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <Zap size={16} /> <span className="font-mono">{profile.sp} SP</span>
            </div>
          </div>
        </div>
        <button onClick={onBack} className="flex items-center gap-2 hover:text-blueprint-glow">
          <ChevronLeft /> BACK
        </button>
      </div>

      <div className="z-10 grid md:grid-cols-2 gap-8 overflow-y-auto">
        
        {/* Resource Exchange */}
        <div>
          <h2 className="text-sm tracking-widest mb-4 opacity-70">RESOURCES</h2>
          <div className="border border-blueprint-line/30 p-4 rounded flex justify-between items-center bg-blueprint-bg/50">
            <div>
              <div className="font-bold text-lg text-purple-400">Skill Point Bundle</div>
              <div className="text-xs opacity-70">Convert Yen to SP</div>
            </div>
            <button 
              onClick={onBuySP}
              disabled={profile.coins < spCost}
              className={`px-4 py-2 border rounded font-bold ${
                profile.coins >= spCost 
                  ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/10' 
                  : 'border-gray-600 text-gray-600 cursor-not-allowed'
              }`}
            >
              {spCost} YEN
            </button>
          </div>
        </div>

        {/* Card Catalog */}
        <div>
          <h2 className="text-sm tracking-widest mb-4 opacity-70">MODULE CATALOG</h2>
          <div className="flex flex-col gap-4">
            {unownedCards.length === 0 ? (
              <div className="text-center opacity-50 py-8 border border-dashed border-blueprint-line/30">
                CATALOG EMPTY - ALL MODULES ACQUIRED
              </div>
            ) : (
              unownedCards.map(card => (
                <div key={card.id} className="border border-blueprint-line/30 p-4 rounded flex justify-between items-center bg-blueprint-bg/50 hover:border-blueprint-glow transition-colors">
                  <div>
                    <div className="font-bold text-blueprint-glow">{card.name}</div>
                    <div className="text-xs opacity-70 mb-1">{card.description}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 border rounded ${
                      card.scope === 'UNIVERSAL' ? 'border-white text-white' :
                      card.scope === 'MOB' ? 'border-blue-300 text-blue-300' :
                      'border-red-300 text-red-300'
                    }`}>
                      {card.scope}
                    </span>
                  </div>
                  <button 
                    onClick={() => onBuyCard(card.id)}
                    disabled={profile.coins < card.cost}
                    className={`ml-4 px-4 py-2 border rounded font-bold min-w-[80px] text-center ${
                      profile.coins >= card.cost 
                        ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/10' 
                        : 'border-gray-600 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {card.cost}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShopScreen;
