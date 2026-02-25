import { LevelConfig, Card, Skill } from './types';

export const COLORS = {
  bg: '#003366',
  line: '#E6F2FF',
  glow: '#00FFFF',
  damage: '#FF3333',
};

export const LEVEL_CONFIG: LevelConfig = {
  waveCount: 5, 
  baseHp: 10,
};

export const MOB_WORDS_POOL = [
  "STRUCTURE", "DRAFT", "BLUEPRINT", "DESIGN", "BEAM", "COLUMN", 
  "ARCH", "VAULT", "TRUSS", "GRID", "SCALE", "PLAN", "SECTION",
  "ELEVATION", "DETAIL", "LAYER", "VECTOR", "RENDER", "MODEL", 
  "FRAME", "STEEL", "CONCRETE", "GLASS", "STONE", "BRICK",
  "FADE", "LINE", "SHAPE", "FORM", "SPACE", "VOID", "SOLID"
];

export const PATH_POINTS = {
  start: { x: 0.1, y: 0.05 },
  control1: { x: 0.9, y: 0.3 },
  control2: { x: 0.1, y: 0.55 },
  end: { x: 0.5, y: 0.65 }, // Moved up to 65% height to accommodate keyboard
};

export const GAME_SPEED_MODIFIER = 0.0005; 
export const BOSS_SPEED_MODIFIER = 0.00015;

// --- CARD LIBRARY ---

export const CARDS: Record<string, Card> = {
  // UNIVERSAL
  'temp_anchor': {
    id: 'temp_anchor',
    name: 'Temporal Anchor',
    description: 'Enemies move 30% slower while active.',
    scope: 'UNIVERSAL',
    tier: 1,
    cost: 100,
    effect: { slowFactor: 0.3 },
    icon: 'Clock'
  },
  'aegis_shield': {
    id: 'aegis_shield',
    name: 'Aegis Shield',
    description: 'Absorbs the next 1 damage hit.',
    scope: 'UNIVERSAL',
    tier: 1,
    cost: 150,
    effect: { damageBlock: 1 },
    icon: 'Shield'
  },
  'reinforced_walls': {
    id: 'reinforced_walls',
    name: 'Reinforced Walls',
    description: '+1 Max HP while active.',
    scope: 'UNIVERSAL',
    tier: 1,
    cost: 120,
    effect: { maxHpBoost: 1 },
    icon: 'BrickWall'
  },
  'emergency_brakes': {
    id: 'emergency_brakes',
    name: 'Emergency Brakes',
    description: 'Enemies near base (last 15%) move 60% slower.',
    scope: 'UNIVERSAL',
    tier: 1,
    cost: 200,
    effect: { nearBaseSlow: 0.6 },
    icon: 'Siren'
  },
  // MOB
  'auto_fill': {
    id: 'auto_fill',
    name: 'Auto-Fill Assist',
    description: 'Fills a missing letter every 4 seconds.',
    scope: 'MOB',
    tier: 1,
    cost: 300,
    effect: { autoFillInterval: 4000 },
    icon: 'Wand2'
  },
  'gap_spotlight': {
    id: 'gap_spotlight',
    name: 'Gap Spotlight',
    description: 'Highlights missing letters for clarity.',
    scope: 'MOB',
    tier: 1,
    cost: 80,
    effect: { highlightGaps: true },
    icon: 'Eye'
  },
  'pattern_echo': {
    id: 'pattern_echo',
    name: 'Pattern Echo',
    description: 'Typing a letter fills it for up to 2 enemies.',
    scope: 'MOB',
    tier: 2,
    cost: 400,
    effect: { patternEcho: true },
    icon: 'Copy'
  },
  'vowel_assist': {
    id: 'vowel_assist',
    name: 'Vowel Assist',
    description: 'Words with 2 gaps reveal a vowel (30% chance).',
    scope: 'MOB',
    tier: 1,
    cost: 150,
    effect: { vowelAssist: 0.3 },
    icon: 'Languages'
  },
  // BOSS
  'pulse_damage': {
    id: 'pulse_damage',
    name: 'Pulse Damage',
    description: 'Boss takes 2 damage every 3 seconds.',
    scope: 'BOSS',
    tier: 1,
    cost: 250,
    effect: { passiveBossDps: 2 },
    icon: 'Zap'
  },
  'overclock': {
    id: 'overclock',
    name: 'Overclock',
    description: '+25% Flow gain per word.',
    scope: 'BOSS',
    tier: 1,
    cost: 200,
    effect: { flowGainMult: 0.25 },
    icon: 'Cpu'
  },
  'flow_stabilizer': {
    id: 'flow_stabilizer',
    name: 'Flow Stabilizer',
    description: 'Mistakes reduce flow by 20% less.',
    scope: 'BOSS',
    tier: 1,
    cost: 150,
    effect: { flowProtection: 0.2 },
    icon: 'Anchor'
  },
  'crit_syntax': {
    id: 'crit_syntax',
    name: 'Critical Syntax',
    description: '3 perfect words deals +5 bonus damage.',
    scope: 'BOSS',
    tier: 2,
    cost: 350,
    effect: { critSyntax: 5 },
    icon: 'Crosshair'
  },
};

export const SKILLS: Skill[] = [
  { id: 'rec_clarity', name: 'Optical Clarity', branch: 'RECOGNITION', description: 'Enemies spawn 5% further back.', maxLevel: 5, cost: 1 },
  { id: 'rec_slow', name: 'Entropy Field', branch: 'RECOGNITION', description: 'Global 2% slow per level.', maxLevel: 5, cost: 2 },
  { id: 'perf_flow', name: 'Synapse Fire', branch: 'PERFORMANCE', description: '+5% Flow gain.', maxLevel: 5, cost: 1 },
  { id: 'perf_dmg', name: 'Logic Strike', branch: 'PERFORMANCE', description: '+2 Boss Damage.', maxLevel: 5, cost: 2 },
  { id: 'ctrl_hp', name: 'Core Reinforce', branch: 'CONTROL', description: '+1 Max HP.', maxLevel: 5, cost: 2 },
  { id: 'ctrl_coin', name: 'Data Mining', branch: 'CONTROL', description: '+10% Coin gain.', maxLevel: 5, cost: 1 },
];