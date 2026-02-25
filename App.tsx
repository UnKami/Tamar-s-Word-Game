import React, { useState, useEffect } from 'react';
import { GameState, GameStats, UserProfile, LevelRewards } from './types';
import { audioManager } from './utils/audioManager';
import { CARDS } from './constants';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import LexiconScreen from './components/LexiconScreen';
import DeckScreen from './components/DeckScreen';
import ShopScreen from './components/ShopScreen';
import SkillTreeScreen from './components/SkillTreeScreen';
import TutorialModal from './components/TutorialModal';
import { Terminal, Wifi } from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  coins: 0,
  sp: 0,
  inventory: [],
  deck: [], // Empty initially
  skills: {},
  lexicon: [],
  tutorial: {
    step: 'WELCOME',
    visitedPages: []
  }
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [lastGameStats, setLastGameStats] = useState<GameStats | null>(null);
  const [lastRewards, setLastRewards] = useState<LevelRewards | undefined>(undefined);
  const [gameWon, setGameWon] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  // --- Persistence Logic (LocalStorage Only) ---
  useEffect(() => {
    // Simulate a short loading delay for effect, then load local data
    const timer = setTimeout(() => {
      try {
        const localData = localStorage.getItem('tamar_profile');
        if (localData) {
          const parsed = JSON.parse(localData);
          // Merge with default to ensure structure integrity
          setProfile({ ...DEFAULT_PROFILE, ...parsed });
        } else {
          setProfile(DEFAULT_PROFILE);
        }
      } catch (e) {
        console.warn("Failed to parse local profile, using default", e);
        setProfile(DEFAULT_PROFILE);
      } finally {
        setIsLoading(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Save profile to localStorage
  const saveProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile); // Optimistic update
    localStorage.setItem('tamar_profile', JSON.stringify(newProfile));
  };

  // --- Tutorial Logic ---

  const advanceTutorial = () => {
    if (profile.tutorial.step === 'WELCOME') {
      saveProfile({ ...profile, tutorial: { ...profile.tutorial, step: 'EXPLORE' } });
    } else if (profile.tutorial.step === 'LOOT') {
       // Grant Starter Cards
       const starters = ['temp_anchor', 'reinforced_walls'];
       saveProfile({ 
         ...profile, 
         inventory: [...profile.inventory, ...starters],
         deck: starters, // Auto equip
         tutorial: { ...profile.tutorial, step: 'READY' }
       });
    }
  };

  const markPageVisited = (pageId: string) => {
    if (profile.tutorial.step !== 'EXPLORE') return;
    if (!profile.tutorial.visitedPages.includes(pageId)) {
      const newVisited = [...profile.tutorial.visitedPages, pageId];
      // Note: We do NOT advance to LOOT here immediately.
      // We wait until the user returns to the menu to check for completion.
      
      saveProfile({
        ...profile,
        tutorial: {
          ...profile.tutorial,
          visitedPages: newVisited
        }
      });
    }
  };

  const handleReturnToMenu = () => {
    setGameState(GameState.MENU);
    // Check if exploration is complete upon returning to menu
    if (profile.tutorial.step === 'EXPLORE' && profile.tutorial.visitedPages.length >= 4) {
       saveProfile({ ...profile, tutorial: { ...profile.tutorial, step: 'LOOT' } });
    }
  };

  const completeGameTutorial = () => {
    if (profile.tutorial.step === 'GAMEPLAY') {
      saveProfile({ ...profile, tutorial: { ...profile.tutorial, step: 'COMPLETED' } });
    }
  };

  // --- Navigation Wrappers ---

  const navigateTo = (state: GameState) => {
    setGameState(state);
    // Track visits
    if (state === GameState.DECK) markPageVisited('DECK');
    if (state === GameState.SHOP) markPageVisited('SHOP');
    if (state === GameState.SKILLS) markPageVisited('SKILLS');
    if (state === GameState.LEXICON) markPageVisited('LEXICON');
  };

  const addToLexicon = (word: string) => {
    if (profile.lexicon.includes(word)) return;
    const newProfile = { ...profile, lexicon: [...profile.lexicon, word] };
    saveProfile(newProfile);
  };

  const updateDeck = (newDeck: string[]) => {
    saveProfile({ ...profile, deck: newDeck });
  };

  const buyCard = (cardId: string) => {
    const card = CARDS[cardId];
    if (card && profile.coins >= card.cost && !profile.inventory.includes(cardId)) {
      saveProfile({
        ...profile,
        coins: profile.coins - card.cost,
        inventory: [...profile.inventory, cardId]
      });
    }
  };

  const buySP = () => {
    const cost = 500;
    if (profile.coins >= cost) {
      saveProfile({
        ...profile,
        coins: profile.coins - cost,
        sp: profile.sp + 1
      });
    }
  };

  const upgradeSkill = (skillId: string) => {
     const cost = 1; 
     if (profile.sp >= cost) {
        const currentLevel = profile.skills[skillId] || 0;
        saveProfile({
            ...profile,
            sp: profile.sp - cost,
            skills: { ...profile.skills, [skillId]: currentLevel + 1 }
        });
     }
  };

  const startGame = () => {
    audioManager.init();
    if (profile.tutorial.step === 'READY') {
      saveProfile({ ...profile, tutorial: { ...profile.tutorial, step: 'GAMEPLAY' }});
    }
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = (won: boolean, stats: GameStats) => {
    setGameWon(won);
    setLastGameStats(stats);
    completeGameTutorial(); // Mark complete if it was the tutorial run
    
    if (won) {
      // Generate Rewards
      const allCardIds = Object.keys(CARDS);
      const newCards: string[] = [];
      const duplicates: string[] = [];
      
      const currentInventory = [...profile.inventory];

      for (let i = 0; i < 2; i++) {
        const randomId = allCardIds[Math.floor(Math.random() * allCardIds.length)];
        if (currentInventory.includes(randomId) || newCards.includes(randomId)) {
          duplicates.push(randomId);
        } else {
          newCards.push(randomId);
        }
      }

      const duplicateBonus = duplicates.length * 50;
      const totalCoins = stats.coinsEarned + duplicateBonus;
      const spEarned = 1;
      
      const rewards: LevelRewards = {
        coins: totalCoins,
        cards: newCards,
        duplicates: duplicates
      };
      
      setLastRewards(rewards);

      saveProfile({
        ...profile,
        coins: profile.coins + totalCoins,
        sp: profile.sp + spEarned,
        inventory: [...profile.inventory, ...newCards],
        tutorial: { ...profile.tutorial, step: 'COMPLETED' } // Ensure completion
      });

    } else {
      setLastRewards(undefined);
    }

    setGameState(won ? GameState.WON : GameState.LOST);
  };

  // --- Render Tutorial Overlay ---
  const renderTutorialOverlay = () => {
    // Only show overlays during menu navigation phases
    if (gameState === GameState.PLAYING) return null; // GameScreen handles its own tutorial

    if (gameState === GameState.MENU) {
      if (profile.tutorial.step === 'WELCOME') {
        return (
          <TutorialModal 
            title="ARCHITECT INITIALIZATION"
            message="Welcome to Tamar's Defense. You are tasked with protecting the structural integrity of the House. Before we begin the simulation, you must familiarize yourself with the defense systems."
            buttonText="BEGIN DIAGNOSTICS"
            onNext={advanceTutorial}
          />
        );
      }
      if (profile.tutorial.step === 'LOOT') {
        return (
          <TutorialModal 
            title="INITIAL SUPPLY DROP"
            message="Diagnostics complete. You have been granted two starter modules: 'Temporal Anchor' to slow hostiles, and 'Reinforced Walls' for structure fortitude. They have been auto-equipped."
            buttonText="EQUIP & CONTINUE"
            onNext={advanceTutorial}
          />
        );
      }
    }
    
    return null;
  };

  // Helper for sub-page tutorials to avoid state complexity in App
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    // Trigger modal when entering a state if relevant
    if (profile.tutorial.step === 'EXPLORE') {
      if (gameState === GameState.DECK) setActiveModal("DECK CONFIGURATION: Configure your active defense modules. You can have up to 4 active at once. They cycle automatically.");
      else if (gameState === GameState.SHOP) setActiveModal("SUPPLY DEPOT: Exchange Yen earned from defense for new Cards (Modules) and Skill Points.");
      else if (gameState === GameState.SKILLS) setActiveModal("SYSTEM ARCHITECTURE: Invest Skill Points to permanently upgrade global parameters like Damage, Flow, and Recognition.");
      else if (gameState === GameState.LEXICON) setActiveModal("LEXICON DATABASE: A record of all neutralized threats. Filling this database increases your Boss Damage output.");
      else setActiveModal(null);
    } else {
      setActiveModal(null);
    }
  }, [gameState, profile.tutorial.step]);

  // --- Loading Screen ---
  if (isLoading) {
    return (
      <div className="w-full h-screen bg-blueprint-bg text-blueprint-line flex flex-col items-center justify-center font-mono relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-30" />
        <div className="z-10 flex flex-col items-center animate-pulse">
           <Terminal size={48} className="text-blueprint-glow mb-4" />
           <h1 className="text-xl font-bold tracking-widest text-blueprint-glow mb-2">ESTABLISHING LOCAL UPLINK</h1>
           <div className="flex items-center gap-2 text-xs opacity-70">
              <Wifi size={14} className="animate-ping" />
              <span>RETRIEVING ARCHIVE...</span>
           </div>
        </div>
        <div className="absolute bottom-10 text-[10px] text-blueprint-line/30">
          SECURE CONNECTION PROTOCOL V1.0 (OFFLINE)
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen blueprint-grid bg-blueprint-bg text-white font-mono overflow-hidden select-none " >
      
      {/* Global Tutorial Overlay for Menu Phases */}
      {renderTutorialOverlay()}
      
      {/* Sub-page Specific Modal */}
      {activeModal && (
        <TutorialModal 
          title="SYSTEM GUIDE" 
          message={activeModal} 
          onNext={() => setActiveModal(null)}
          buttonText="PROCEED"
        />
      )}

      {gameState === GameState.MENU && (
        <MainMenu 
          onStart={startGame} 
          onLexicon={() => navigateTo(GameState.LEXICON)}
          onDeck={() => navigateTo(GameState.DECK)}
          onShop={() => navigateTo(GameState.SHOP)}
          onSkills={() => navigateTo(GameState.SKILLS)}
          tutorialStep={profile.tutorial.step}
          visitedPages={profile.tutorial.visitedPages}
        />
      )}
      <div className="w-full h-full p-4 pt-8 pb-8 *:!bg-[#003366]/50 ">      
        {gameState === GameState.LEXICON && (
          <LexiconScreen unlockedWords={new Set(profile.lexicon)} onBack={handleReturnToMenu} />
        )}
        
        {gameState === GameState.DECK && (
          <DeckScreen 
            profile={profile} 
            onUpdateDeck={updateDeck} 
            onBack={handleReturnToMenu} 
          />
        )}

        {gameState === GameState.SHOP && (
          <ShopScreen 
            profile={profile} 
            onBuyCard={buyCard} 
            onBuySP={buySP}
            onBack={handleReturnToMenu} 
          />
        )}

        {gameState === GameState.SKILLS && (
          <SkillTreeScreen 
            profile={profile} 
            onUpgradeSkill={upgradeSkill}
            onBack={handleReturnToMenu} 
          />
        )}
        
        {gameState === GameState.PLAYING && (
          <GameScreen 
            onGameOver={handleGameOver} 
            returnToMenu={handleReturnToMenu}
            profile={profile}
            onWordUnlocked={addToLexicon}
            lexicon={new Set(profile.lexicon)}
            isTutorial={profile.tutorial.step === 'GAMEPLAY'}
          />
        )}

        {(gameState === GameState.WON || gameState === GameState.LOST) && lastGameStats && (
          <ResultScreen 
            won={gameWon} 
            stats={lastGameStats}
            rewards={lastRewards}
            onRetry={() => setGameState(GameState.PLAYING)}
            onHome={handleReturnToMenu}
          />
        )}
      </div>
    </div>
  );
};

export default App;