import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Mob, Boss, GameStats, Particle, UserProfile, Card } from '../types';
import { MOB_WORDS_POOL, PATH_POINTS, GAME_SPEED_MODIFIER, BOSS_SPEED_MODIFIER, LEVEL_CONFIG, CARDS } from '../constants';
import { generateMob, getPointOnPath, calculateWPM } from '../utils/gameUtils';
import { audioManager } from '../utils/audioManager';
import BlueprintHouse from './BlueprintHouse';
import MobRenderer from './MobRenderer';
import BossRenderer from './BossRenderer';
import VFXLayer from './VFXLayer';
import VirtualKeyboard from './VirtualKeyboard';
import TutorialModal from './TutorialModal';
import { Zap, Heart, Target, Timer, Shield } from 'lucide-react';

interface GameScreenProps {
  onGameOver: (won: boolean, stats: GameStats) => void;
  returnToMenu: () => void;
  profile: UserProfile;
  onWordUnlocked: (word: string) => void;
  lexicon: Set<string>; // Backward compat
  isTutorial: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({ onGameOver, returnToMenu, profile, onWordUnlocked, isTutorial }) => {
  // Game State
  const [wave, setWave] = useState(1);
  const [hp, setHp] = useState(LEVEL_CONFIG.baseHp);
  const [mobs, setMobs] = useState<Mob[]>([]);
  const [boss, setBoss] = useState<Boss>({ active: false, hp: 100, maxHp: 100, progress: 0, speed: 0.8 });
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  
  // Tutorial State
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  const [showTutorial, setShowTutorial] = useState(isTutorial);

  // Card System State
  const [cardTimer, setCardTimer] = useState(0); 
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [deck, setDeck] = useState<Card[]>([]);
  const [tempHp, setTempHp] = useState(0);
  
  // VFX State
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Boss Wave Specifics
  const [bossArsenal, setBossArsenal] = useState<string[]>([]);
  const [currentBossTarget, setCurrentBossTarget] = useState<string | null>(null);
  const [bossInput, setBossInput] = useState("");
  const [flow, setFlow] = useState(0); 
  const [bossHitAnim, setBossHitAnim] = useState(false);

  // Performance Stats
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [keystrokesTotal, setKeystrokesTotal] = useState(0);
  const [keystrokesCorrect, setKeystrokesCorrect] = useState(0);
  const [startTime] = useState(Date.now());
  const [flowTime, setFlowTime] = useState(0);

  // Refs
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const nextSpawnTimeRef = useRef<number>(0);
  const mobsRef = useRef<Mob[]>([]); 
  const bossRef = useRef<Boss>({ active: false, hp: 100, maxHp: 100, progress: 0, speed: 0.8 });
  const hpRef = useRef(10);
  const waveRef = useRef(1);
  const cardTimerRef = useRef(0);
  const lastAutoFillRef = useRef(0);

  // --- Initialization ---
  useEffect(() => {
    // If tutorial, pause immediately
    if (isTutorial) {
      setPaused(true);
    } else {
      startLevel();
    }
    
    // Load Deck
    const loadedDeck = profile.deck.map(id => CARDS[id]).filter(Boolean);
    while (loadedDeck.length < 4 && loadedDeck.length > 0) {
      loadedDeck.push(loadedDeck[0]);
    }
    setDeck(loadedDeck);

    return () => {
      audioManager.stopBGM();
    };
  }, []);

  const startLevel = () => {
    audioManager.startBGM();
    audioManager.playWaveStart();
    setPaused(false);
  };

  // --- VFX Helper ---
  const spawnParticle = (x: number, y: number, type: Particle['type'], text?: string) => {
    const id = Date.now() + Math.random();
    setParticles(prev => [...prev, { id, x, y, type, text, createdAt: Date.now() }]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1000);
  };

  // --- Core Game Loop ---
  const update = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    if (paused) {
      // Still request frame to keep loop alive for when we unpause, but don't update state
      requestRef.current = requestAnimationFrame(update);
      return; 
    }

    // --- Card Timer Logic ---
    const CYCLE_DURATION = 16000; // 12s + 4s
    const ACTIVE_DURATION = 12000;
    
    cardTimerRef.current = (cardTimerRef.current + deltaTime) % CYCLE_DURATION;
    const isGap = cardTimerRef.current > ACTIVE_DURATION;
    
    setCardTimer(cardTimerRef.current);
    
    // --- Card Effects Setup ---
    let speedMult = 1.0;
    let autoFillInterval = 0;
    
    const currentCard = deck[activeCardIndex];
    const isCardActive = !isGap && currentCard;
    
    if (isCardActive) {
      if (currentCard.effect.slowFactor) {
        speedMult -= currentCard.effect.slowFactor;
      }
      if (currentCard.effect.autoFillInterval) {
        autoFillInterval = currentCard.effect.autoFillInterval;
      }
      if (currentCard.effect.maxHpBoost && tempHp === 0) {
        setTempHp(currentCard.effect.maxHpBoost); // Apply temp HP visual
      }
    } else {
      if (tempHp > 0) setTempHp(0); // Remove temp HP in gap
    }

    // --- Win/Loss Checks ---
    if (hpRef.current + (isCardActive && currentCard?.effect.maxHpBoost ? currentCard.effect.maxHpBoost : 0) <= 0) {
      endGame(false);
      return;
    }

    // --- Wave Management ---
    const isBossWave = waveRef.current === LEVEL_CONFIG.waveCount;

    // --- Auto Fill Logic ---
    if (autoFillInterval > 0 && !isBossWave) {
      if (time - lastAutoFillRef.current > autoFillInterval) {
        lastAutoFillRef.current = time;
        // Trigger auto fill
        triggerAutoFill();
      }
    }

    // Spawning Mobs
    if (!isBossWave && time > nextSpawnTimeRef.current) {
      const lastMob = mobsRef.current[mobsRef.current.length - 1];
      if (!lastMob || lastMob.progress > 0.15) {
        const word = MOB_WORDS_POOL[Math.floor(Math.random() * MOB_WORDS_POOL.length)];
        const newMob = generateMob(word);
        mobsRef.current.push(newMob);
        setMobs([...mobsRef.current]);
        
        const spawnDelay = Math.max(1500, 3000 - (waveRef.current * 400));
        nextSpawnTimeRef.current = time + spawnDelay;
      } else {
         nextSpawnTimeRef.current = time + 500;
      }
    }

    // --- Update Mobs ---
    if (!isBossWave) {
      const remainingMobs: Mob[] = [];
      let hpLost = 0;
      const now = Date.now();
      
      mobsRef.current.forEach(mob => {
        if (mob.clearedAt) {
          if (now - mob.clearedAt < 1000) {
            remainingMobs.push(mob); 
          }
          return; 
        }

        let mobSpeed = mob.speed * speedMult;
        
        if (isCardActive && currentCard?.effect.nearBaseSlow && mob.progress > 0.85) {
          mobSpeed *= (1 - currentCard.effect.nearBaseSlow);
        }

        mob.progress += (GAME_SPEED_MODIFIER * mobSpeed * (deltaTime / 16));
        
        if (mob.progress >= 1.0) {
          hpLost += 1;
        } else if (!mob.isDead) {
          remainingMobs.push(mob);
        }
      });

      if (hpLost > 0) {
        if (!(isCardActive && currentCard?.effect.damageBlock && currentCard.effect.damageBlock > 0)) {
          takeDamage(hpLost);
        }
      }

      mobsRef.current = remainingMobs;
      setMobs([...remainingMobs]);
    } 
    
    // --- Update Boss ---
    if (isBossWave && bossRef.current.active) {
      let bossSpeed = bossRef.current.speed * speedMult;
      if (isCardActive && currentCard?.effect.nearBaseSlow && bossRef.current.progress > 0.85) {
        bossSpeed *= (1 - currentCard.effect.nearBaseSlow);
      }
      
      bossRef.current.progress += (BOSS_SPEED_MODIFIER * bossSpeed * (deltaTime / 16));
      
      if (isCardActive && currentCard?.effect.passiveBossDps) {
        bossRef.current.hp -= (currentCard.effect.passiveBossDps * (deltaTime / 1000));
      }

      if (bossRef.current.progress >= 1.0) {
        takeDamage(100); 
      } else if (bossRef.current.hp <= 0) {
        endGame(true);
      } else {
        setBoss({...bossRef.current});
      }
    }

    requestRef.current = requestAnimationFrame(update);
  }, [deck, activeCardIndex, tempHp, paused]);

  useEffect(() => {
    const cycleInterval = setInterval(() => {
      if (!paused) {
        setActiveCardIndex(prev => (prev + 1) % 4);
        cardTimerRef.current = 0; 
      }
    }, 16000);
    return () => clearInterval(cycleInterval);
  }, [paused]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  // --- Logic Helpers ---

  const triggerAutoFill = () => {
    const sortedMobs = [...mobsRef.current].sort((a, b) => b.progress - a.progress);
    const target = sortedMobs[0];
    if (target && !target.isDead && !target.clearedAt) {
      const missing = target.missingLetters[0];
      if (missing) {
        handleInput(missing.char); 
      }
    }
  }

  const takeDamage = (amount: number) => {
    hpRef.current = Math.max(0, hpRef.current - amount);
    setHp(hpRef.current);
    setCombo(0); 
    audioManager.playErrorSound();
  };

  const endGame = (won: boolean) => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (!won) audioManager.playLevelFail();
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    let coins = Math.floor(completedWords.length * 5); 
    if (won) coins += 100; 
    
    const stats: GameStats = {
      wpm: calculateWPM(keystrokesTotal, totalTime),
      accuracy: keystrokesTotal > 0 ? Math.floor((keystrokesCorrect / keystrokesTotal) * 100) : 0,
      flowUptime: Math.floor((flowTime / totalTime) * 100), 
      bestCombo: maxCombo,
      wordsCompleted: completedWords.length,
      totalKeystrokes: keystrokesTotal,
      correctKeystrokes: keystrokesCorrect,
      flowTimeMs: flowTime,
      totalTimeMs: totalTime,
      coinsEarned: coins
    };
    onGameOver(won, stats);
  };

  const advanceWave = () => {
    if (waveRef.current < 5) {
      waveRef.current += 1;
      setWave(waveRef.current);
      audioManager.playWaveStart();
      mobsRef.current = [];
      setMobs([]);
      if (waveRef.current === 5) startBossWave();
    }
  };

  const startBossWave = () => {
    let arsenal = [...completedWords];
    if (arsenal.length < 5) {
      arsenal = [...arsenal, ...MOB_WORDS_POOL.slice(0, 10)];
    }
    arsenal.sort(() => Math.random() - 0.5);
    setBossArsenal(arsenal);
    bossRef.current = { active: true, hp: 100, maxHp: 100, progress: 0, speed: 1.0 };
    setBoss(bossRef.current);
    pickNextBossTarget(arsenal);
  };

  const pickNextBossTarget = (currentArsenal: string[]) => {
    if (currentArsenal.length === 0) {
      const refilled = [...completedWords.length > 0 ? completedWords : MOB_WORDS_POOL];
      refilled.sort(() => Math.random() - 0.5);
      setBossArsenal(refilled);
      setCurrentBossTarget(refilled[0]);
    } else {
      const next = currentArsenal[0];
      setBossArsenal(prev => prev.slice(1));
      setCurrentBossTarget(next);
    }
    setBossInput("");
  };

  const handleInput = (char: string) => {
    if (paused) return; // Block input during tutorial
    
    setKeystrokesTotal(prev => prev + 1);

    const activeCard = deck[activeCardIndex];
    const isGap = cardTimer > 12000;
    const isCardActive = !isGap && activeCard;

    if (waveRef.current < 5) {
      const sortedMobs = [...mobsRef.current].sort((a, b) => b.progress - a.progress);
      let hit = false;
      
      for (const mob of sortedMobs) {
        if (mob.isDead || mob.clearedAt) continue; 
        
        const firstMissing = mob.missingLetters[0];
        if (firstMissing && firstMissing.char === char) {
          hit = true;
          setKeystrokesCorrect(prev => prev + 1);
          audioManager.playTypingSound();

          const pos = getPointOnPath(mob.progress);
          spawnParticle(pos.x * 100, pos.y * 100, 'spark');
          
          mob.missingLetters.shift(); 
          const chars = mob.displayWord.split('');
          chars[firstMissing.index] = char;
          mob.displayWord = chars.join('');
          
          if (mob.missingLetters.length === 0) {
            mob.isDead = true;
            mob.clearedAt = Date.now(); 
            setMobs([...mobsRef.current]);
            
            audioManager.playClearSound();
            spawnParticle(pos.x * 100, pos.y * 100, 'burst');
            setTimeout(() => {
              spawnParticle(pos.x * 100, pos.y * 100, 'floating-text', '+5 ¥');
            }, 500);
            
            onWordUnlocked(mob.word);
            setCompletedWords(prev => [...prev, mob.word]);
            setCombo(prev => {
              const newCombo = prev + 1;
              if (newCombo > maxCombo) setMaxCombo(newCombo);
              return newCombo;
            });

            if (completedWords.length > 0 && completedWords.length % 5 === 0) {
               advanceWave();
            }
          } else {
            setMobs([...mobsRef.current]);
          }
          break;
        }
      }

      if (!hit) {
        setCombo(0);
        audioManager.playErrorSound();
      }

    } else {
      if (!bossRef.current.active || !currentBossTarget) return;
      const expectedChar = currentBossTarget[bossInput.length];
      
      if (char === expectedChar) {
        setKeystrokesCorrect(prev => prev + 1);
        const newInput = bossInput + char;
        setBossInput(newInput);
        audioManager.playTypingSound();
        const pos = getPointOnPath(bossRef.current.progress);
        spawnParticle(pos.x * 100, pos.y * 100, 'spark');

        let flowGain = 5;
        if (isCardActive && activeCard.effect.flowGainMult) {
          flowGain *= (1 + activeCard.effect.flowGainMult);
        }
        setFlow(prev => Math.min(100, prev + flowGain));

        if (newInput === currentBossTarget) {
          const baseDamage = currentBossTarget.length * (flow >= 100 ? 2 : 1);
          const lexiconBonus = 1 + (profile.lexicon.length * 0.01); 
          let finalDamage = baseDamage * lexiconBonus;
          
          if (isCardActive && activeCard.effect.critSyntax) {
             finalDamage += activeCard.effect.critSyntax; 
          }

          bossRef.current.hp -= finalDamage;
          setBoss({...bossRef.current});
          setBossHitAnim(true);
          setTimeout(() => setBossHitAnim(false), 200);
          audioManager.playBossHit();
          spawnParticle(pos.x * 100, pos.y * 100, 'boss-hit');
          setTimeout(() => {
            spawnParticle(pos.x * 100, pos.y * 100, 'floating-text', '+5 ¥');
          }, 500);

          setFlow(prev => Math.min(100, prev + 10));
          setCombo(prev => {
            const newCombo = prev + 1;
            if (newCombo > maxCombo) setMaxCombo(newCombo);
            return newCombo;
          });

          if (bossRef.current.hp <= 0) {
            endGame(true);
          } else {
            pickNextBossTarget(bossArsenal);
          }
        }
      } else {
        setCombo(0);
        let flowLoss = 10;
        if (isCardActive && activeCard.effect.flowProtection) {
          flowLoss *= (1 - activeCard.effect.flowProtection);
        }
        setFlow(prev => Math.max(0, prev - flowLoss));
        audioManager.playErrorSound();
      }
    }
  };

  // --- Rendering Helpers ---
  const generatePathD = () => {
    const p0 = PATH_POINTS.start;
    const p1 = PATH_POINTS.control1;
    const p2 = PATH_POINTS.control2;
    const p3 = PATH_POINTS.end;
    const toPct = (pt: any) => `${pt.x * 100},${pt.y * 100}`;
    return `M ${toPct(p0)} C ${toPct(p1)} ${toPct(p2)} ${toPct(p3)}`;
  };

  const renderCardRail = () => {
    if (deck.length === 0) return null;
    const isGap = cardTimer > 12000;
    const activeCard = deck[activeCardIndex];
    return (
      <div className="absolute bottom-[230px] left-1/2 transform -translate-x-1/2 flex items-end gap-2">
        <div className={`relative w-20 h-28 border-2 rounded transition-all duration-300 flex flex-col items-center justify-center p-1 bg-blueprint-bg/80 backdrop-blur-sm
          ${isGap ? 'border-blueprint-line/30 scale-90 opacity-50' : 'border-blueprint-glow scale-100 shadow-[0_0_20px_rgba(0,255,255,0.3)]'}
        `}>
          {isGap ? (
            <div className="text-xs text-blueprint-line text-center animate-pulse">RECHARGING</div>
          ) : (
            <>
              <div className="text-[10px] text-blueprint-glow font-bold mb-1 text-center leading-tight">{activeCard.name}</div>
              <Shield size={24} className="text-blueprint-glow mb-2" />
              <div className="w-full h-1 bg-blueprint-line/20 mt-auto rounded-full overflow-hidden">
                 <div className="h-full bg-blueprint-glow" style={{ width: `${Math.max(0, (12000 - cardTimer) / 12000) * 100}%` }} />
              </div>
            </>
          )}
        </div>
        {[1, 2, 3].map((offset) => {
          const idx = (activeCardIndex + offset) % 4;
          return <div key={idx} className="w-12 h-16 border border-blueprint-line/30 rounded bg-blueprint-bg/50 flex items-center justify-center opacity-50"></div>;
        })}
      </div>
    );
  };

  const TUTORIAL_STEPS = [
    { title: "MISSION BRIEFING", msg: "Enemy fragments are approaching the House. Your goal is to neutralize them before they make contact." },
    { title: "RECOGNITION PROTOCOL", msg: "Enemies appear as words with MISSING letters (e.g. 'STR_CT_RE'). Identify the gaps." },
    { title: "DEFENSE MECHANIC", msg: "Use the keyboard below to type ONLY the missing letters. Completing the word destroys the enemy." },
    { title: "BOSS WARNING", msg: "Survive 5 waves. The final wave is a Boss Construct. You must type FULL words to damage it. Good luck." },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden">
      
      {showTutorial && (
        <TutorialModal 
          title={TUTORIAL_STEPS[tutorialStepIndex].title}
          message={TUTORIAL_STEPS[tutorialStepIndex].msg}
          buttonText={tutorialStepIndex === TUTORIAL_STEPS.length - 1 ? "START DEFENSE" : "NEXT"}
          onNext={() => {
            if (tutorialStepIndex < TUTORIAL_STEPS.length - 1) {
              setTutorialStepIndex(prev => prev + 1);
            } else {
              setShowTutorial(false);
              startLevel();
            }
          }}
        />
      )}

      <div className="absolute inset-0 blueprint-grid opacity-50 pointer-events-none" />

      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d={generatePathD()} fill="none" stroke="#E6F2FF" strokeWidth="0.5" strokeDasharray="2 2" className="opacity-40" />
        <path d={generatePathD()} fill="none" stroke="#00FFFF" strokeWidth="0.2" className="opacity-20 drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]" />
      </svg>

      <BlueprintHouse />
      {mobs.map(mob => <MobRenderer key={mob.id} mob={mob} />)}
      {wave === 5 && <BossRenderer boss={boss} isHit={bossHitAnim} />}
      <VFXLayer particles={particles} />

      <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-4 md:p-8">
        <div className="flex justify-between items-start">
          <div className="bg-blueprint-bg/90 border border-blueprint-line p-3 rounded shadow-lg backdrop-blur">
            <div className="text-blueprint-line text-xs font-bold mb-1">PROJECT STATUS</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-blueprint-glow" />
                <span className="text-xl font-mono text-white">WAVE {wave}/5</span>
              </div>
              <div className="w-px h-6 bg-blueprint-line/30" />
              <div className="flex items-center gap-2">
                <Heart size={16} className={hp < 4 ? "text-blueprint-damage animate-pulse" : "text-blueprint-glow"} />
                <span className={`text-xl font-mono ${hp < 4 ? "text-blueprint-damage" : "text-white"}`}>
                  HP {hp}/{LEVEL_CONFIG.baseHp}
                  {tempHp > 0 && <span className="text-blueprint-glow"> +{tempHp}</span>}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="bg-blueprint-bg/90 border border-blueprint-line p-2 rounded min-w-[100px] text-right">
              <div className="text-[10px] text-blueprint-line uppercase tracking-widest">COMBO</div>
              <div className={`text-2xl font-mono font-bold ${combo > 5 ? 'text-blueprint-glow' : 'text-white'}`}>
                x{combo}
              </div>
            </div>
            <div className="bg-blueprint-bg/90 border border-blueprint-line p-2 rounded min-w-[100px] text-right text-[10px] text-blueprint-glow">
              LEXICON BONUS +{profile.lexicon.length}%
            </div>
          </div>
        </div>

        {renderCardRail()}

        {wave === 5 && (
          <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 w-full max-w-md flex flex-col items-center gap-4">
            <div className="w-64 h-2 bg-blueprint-bg border border-blueprint-line rounded-full overflow-hidden relative">
              <div className="h-full bg-blueprint-glow transition-all duration-300 shadow-[0_0_10px_#00FFFF]" style={{ width: `${flow}%` }} />
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-[8px] font-bold text-blueprint-bg tracking-widest">FLOW STATE</div>
            </div>
            <div className="bg-blueprint-bg/90 border-2 border-blueprint-line/50 p-6 rounded-lg backdrop-blur-md shadow-[0_0_30px_rgba(0,51,102,0.6)] min-w-[300px] text-center">
              <div className="text-xs text-blueprint-line mb-2 tracking-[0.2em]">TARGET SEQUENCE</div>
              <div className="text-3xl md:text-4xl font-mono tracking-widest break-all">
                <span className="text-blueprint-glow">{bossInput}</span>
                <span className="text-blueprint-line/50">{currentBossTarget?.slice(bossInput.length)}</span>
              </div>
            </div>
            {flow >= 100 && <div className="text-blueprint-glow font-bold animate-pulse tracking-widest text-sm">HYPER MODE ACTIVE - DOUBLE DAMAGE</div>}
          </div>
        )}
      </div>

      <VirtualKeyboard onKeyPress={handleInput} />
    </div>
  );
};

export default GameScreen;