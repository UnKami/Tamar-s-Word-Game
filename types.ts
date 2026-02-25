export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST',
  LEXICON = 'LEXICON',
  DECK = 'DECK',
  SHOP = 'SHOP',
  SKILLS = 'SKILLS',
}

export interface Point {
  x: number;
  y: number;
}

export interface Mob {
  id: string;
  word: string; 
  displayWord: string; 
  missingLetters: { index: number; char: string }[]; 
  progress: number; 
  speed: number;
  isDead: boolean;
  maxProgress: number; 
  clearedAt?: number; // timestamp when cleared
}

export interface Boss {
  active: boolean;
  hp: number;
  maxHp: number;
  progress: number;
  speed: number;
}

export interface GameStats {
  wpm: number;
  accuracy: number;
  flowUptime: number; 
  bestCombo: number;
  wordsCompleted: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  flowTimeMs: number;
  totalTimeMs: number;
  coinsEarned: number; 
}

export interface LevelConfig {
  waveCount: number;
  baseHp: number;
}

export interface Particle {
  id: number;
  x: number; 
  y: number; 
  type: 'spark' | 'burst' | 'boss-hit' | 'floating-text';
  text?: string;
  createdAt: number;
}

export interface LevelRewards {
  coins: number;
  cards: string[]; // IDs of new cards acquired
  duplicates: string[]; // IDs of cards converted to coins
}

// --- New Types for Systems ---

export type CardScope = 'UNIVERSAL' | 'MOB' | 'BOSS';

export interface CardEffect {
  slowFactor?: number; // 0.3 = 30% slow
  nearBaseSlow?: number; // Slow at >85% progress
  damageBlock?: number; // Absorb X hits
  maxHpBoost?: number;
  autoFillInterval?: number; // ms
  highlightGaps?: boolean;
  patternEcho?: boolean;
  vowelAssist?: number; // chance 0-1
  passiveBossDps?: number; // dmg per tick
  flowGainMult?: number;
  flowProtection?: number; // reduce loss by X%
  critSyntax?: number; // dmg after 3 perfect
}

export interface Card {
  id: string;
  name: string;
  description: string;
  scope: CardScope;
  tier: number; // 1-5
  cost: number; // Coin cost in shop
  effect: CardEffect;
  icon: string; // lucide icon name
}

export interface Skill {
  id: string;
  name: string;
  branch: 'RECOGNITION' | 'PERFORMANCE' | 'CONTROL';
  description: string;
  maxLevel: number;
  cost: number; // SP cost
}

export type TutorialStep = 'WELCOME' | 'EXPLORE' | 'LOOT' | 'READY' | 'GAMEPLAY' | 'COMPLETED';

export interface UserProfile {
  coins: number;
  sp: number; // Skill Points
  inventory: string[]; // Card IDs owned
  deck: string[]; // Card IDs equipped (max 4)
  skills: Record<string, number>; // Skill ID -> Level
  lexicon: string[];
  tutorial: {
    step: TutorialStep;
    visitedPages: string[]; // 'DECK', 'SHOP', 'SKILLS', 'LEXICON'
  };
}
