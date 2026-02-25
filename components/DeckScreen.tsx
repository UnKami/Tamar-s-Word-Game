import React, { useState } from 'react';
import { Card, UserProfile } from '../types';
import { CARDS } from '../constants';
import { ChevronLeft, Check, Lock, Info, Trash2 } from 'lucide-react';

interface DeckScreenProps {
  profile: UserProfile;
  onUpdateDeck: (newDeck: string[]) => void;
  onBack: () => void;
}

const DeckScreen: React.FC<DeckScreenProps> = ({ profile, onUpdateDeck, onBack }) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const equippedCards = profile.deck.map(id => CARDS[id]).filter(Boolean);
  const ownedCards = profile.inventory.map(id => CARDS[id]).filter(Boolean);

  const handleCardClick = (id: string) => {
    // If already in deck, remove it
    if (profile.deck.includes(id)) {
      onUpdateDeck(profile.deck.filter(c => c !== id));
    } else {
      // If not in deck and deck < 4, add it
      if (profile.deck.length < 4) {
        onUpdateDeck([...profile.deck, id]);
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-blueprint-bg text-blueprint-line relative p-6">
      <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="z-10 flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-mono text-blueprint-glow">DECK CONFIGURATION</h1>
        <button onClick={onBack} className="flex items-center gap-2 hover:text-blueprint-glow">
          <ChevronLeft /> BACK
        </button>
      </div>

      {/* Equipped Rail */}
      <div className="z-10 mb-8">
        <h2 className="text-sm tracking-widest mb-4 opacity-70">ACTIVE SEQUENCE ({profile.deck.length}/4)</h2>
        <div className="flex gap-4 h-32">
          {[0, 1, 2, 3].map((index) => {
            const cardId = profile.deck[index];
            const card = cardId ? CARDS[cardId] : null;

            return (
              <div 
                key={index}
                className={`
                  relative flex-1 border-2 border-dashed rounded flex flex-col items-center justify-center p-2 transition-all
                  ${card ? 'border-blueprint-glow bg-blueprint-glow/10 border-solid cursor-pointer' : 'border-blueprint-line/30'}
                `}
                onClick={() => card && handleCardClick(card.id)}
              >
                {card ? (
                  <>
                    <div className="font-bold text-blueprint-glow mb-1 text-center text-xs md:text-sm">{card.name}</div>
                    <div className="text-[10px] opacity-70 text-center">{card.scope}</div>
                    <div className="absolute top-1 right-1 text-blueprint-damage hover:text-white">
                      <Trash2 size={14} />
                    </div>
                  </>
                ) : (
                  <span className="text-xs opacity-30">EMPTY SLOT</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="z-10 flex-1 overflow-y-auto">
        <h2 className="text-sm tracking-widest mb-4 opacity-70">AVAILABLE MODULES</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8">
          {ownedCards.map(card => {
            const isEquipped = profile.deck.includes(card.id);
            return (
              <button
                key={card.id}
                disabled={isEquipped}
                onClick={() => handleCardClick(card.id)}
                className={`
                  relative border p-4 rounded text-left transition-all
                  ${isEquipped 
                    ? 'border-blueprint-glow/50 opacity-50 bg-blueprint-glow/5 cursor-default' 
                    : 'border-blueprint-line/30 hover:border-blueprint-glow hover:bg-blueprint-line/5'}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${
                    card.scope === 'UNIVERSAL' ? 'border-white text-white' :
                    card.scope === 'MOB' ? 'border-blue-300 text-blue-300' :
                    'border-red-300 text-red-300'
                  }`}>
                    {card.scope}
                  </span>
                  {isEquipped && <Check size={16} className="text-blueprint-glow" />}
                </div>
                <div className="font-bold mb-1">{card.name}</div>
                <div className="text-xs opacity-70">{card.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DeckScreen;
