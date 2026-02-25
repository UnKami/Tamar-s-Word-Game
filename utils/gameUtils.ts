import { Point, Mob } from '../types';
import { PATH_POINTS } from '../constants';

// Cubic Bezier calculation
export const getPointOnPath = (t: number): Point => {
  const p0 = PATH_POINTS.start;
  const p1 = PATH_POINTS.control1;
  const p2 = PATH_POINTS.control2;
  const p3 = PATH_POINTS.end;

  const cx = 3 * (p1.x - p0.x);
  const bx = 3 * (p2.x - p1.x) - cx;
  const ax = p3.x - p0.x - cx - bx;

  const cy = 3 * (p1.y - p0.y);
  const by = 3 * (p2.y - p1.y) - cy;
  const ay = p3.y - p0.y - cy - by;

  const x = (ax * Math.pow(t, 3)) + (bx * Math.pow(t, 2)) + (cx * t) + p0.x;
  const y = (ay * Math.pow(t, 3)) + (by * Math.pow(t, 2)) + (cy * t) + p0.y;

  return { x, y };
};

export const generateMob = (word: string): Mob => {
  // Determine missing letters (1 or 2)
  const len = word.length;
  const missingCount = Math.random() > 0.7 && len > 4 ? 2 : 1;
  
  const indices: number[] = [];
  while (indices.length < missingCount) {
    const idx = Math.floor(Math.random() * len);
    if (!indices.includes(idx) && /[A-Z]/.test(word[idx])) {
      indices.push(idx);
    }
  }
  indices.sort((a, b) => a - b);

  let displayWord = "";
  const missingLetters: { index: number; char: string }[] = [];

  for (let i = 0; i < len; i++) {
    if (indices.includes(i)) {
      displayWord += "_";
      missingLetters.push({ index: i, char: word[i] });
    } else {
      displayWord += word[i];
    }
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    word,
    displayWord,
    missingLetters,
    progress: 0,
    speed: 1.0 + Math.random() * 0.2, // Variance in speed
    isDead: false,
    maxProgress: 0,
  };
};

export const calculateWPM = (keystrokes: number, timeMs: number): number => {
  if (timeMs === 0) return 0;
  // Standard WPM calculation: (All typed entries / 5) / Time in minutes
  const minutes = timeMs / 60000;
  return Math.round((keystrokes / 5) / minutes);
};

export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};
