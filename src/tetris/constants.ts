import { TetrominoType, KeyBindings, ThemeId } from './types';

export const MATRIX_COLS = 10;
export const MATRIX_ROWS = 20;
export const BUFFER_ROWS = 2;
export const TOTAL_ROWS = MATRIX_ROWS + BUFFER_ROWS; // 22

// Standard 4x4 or 3x3 or 2x2 shape matrices in 4 rotations (0: spawn, 1: 90 CW, 2: 180, 3: 270 CCW)
export const TETROMINO_SHAPES: Record<TetrominoType, number[][][]> = {
  I: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],
  L: [
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
  O: [
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
  ],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  T: [
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  ],
};

// Default spawn positions: x centered, y in upper invisible buffer rows
export const SPAWN_POSITIONS: Record<TetrominoType, { x: number; y: number }> = {
  I: { x: 3, y: 0 },
  J: { x: 3, y: 0 },
  L: { x: 3, y: 0 },
  O: { x: 4, y: 0 },
  S: { x: 3, y: 0 },
  T: { x: 3, y: 0 },
  Z: { x: 3, y: 0 },
};

// Colors per theme for each tetromino
export interface ThemeConfig {
  name: string;
  boardBg: string;
  gridLine: string;
  ghostOpacity: number;
  colors: Record<TetrominoType, { fill: string; border: string; glow?: string }>;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  neon: {
    name: '霓虹電馭 (Neon Cyber)',
    boardBg: '#090d16',
    gridLine: 'rgba(255, 255, 255, 0.05)',
    ghostOpacity: 0.28,
    colors: {
      I: { fill: '#06b6d4', border: '#67e8f9', glow: '#0891b2' },
      J: { fill: '#3b82f6', border: '#93c5fd', glow: '#2563eb' },
      L: { fill: '#f97316', border: '#fdba74', glow: '#ea580c' },
      O: { fill: '#eab308', border: '#fef08a', glow: '#ca8a04' },
      S: { fill: '#22c55e', border: '#86efac', glow: '#16a34a' },
      T: { fill: '#a855f7', border: '#d8b4fe', glow: '#9333ea' },
      Z: { fill: '#ef4444', border: '#fca5a5', glow: '#dc2626' },
    },
  },
  arcade: {
    name: '經典街機 (Arcade Retro)',
    boardBg: '#121826',
    gridLine: 'rgba(255, 255, 255, 0.07)',
    ghostOpacity: 0.24,
    colors: {
      I: { fill: '#00d2ff', border: '#80e9ff' },
      J: { fill: '#0066ff', border: '#66a3ff' },
      L: { fill: '#ff8800', border: '#ffbb66' },
      O: { fill: '#ffd000', border: '#ffe466' },
      S: { fill: '#00e676', border: '#66f1ad' },
      T: { fill: '#9933ff', border: '#cc80ff' },
      Z: { fill: '#ff3344', border: '#ff808d' },
    },
  },
  gameboy: {
    name: '復古掌機 (GameBoy 8-bit)',
    boardBg: '#8b956d',
    gridLine: '#9bbc0f',
    ghostOpacity: 0.35,
    colors: {
      I: { fill: '#0f380f', border: '#306230' },
      J: { fill: '#1b4a1b', border: '#427842' },
      L: { fill: '#225522', border: '#4f8a4f' },
      O: { fill: '#0f380f', border: '#306230' },
      S: { fill: '#2b5f2b', border: '#5e995e' },
      T: { fill: '#1b4a1b', border: '#427842' },
      Z: { fill: '#225522', border: '#4f8a4f' },
    },
  },
  midnight: {
    name: '深邃曜黑 (Midnight Sleek)',
    boardBg: '#0f172a',
    gridLine: 'rgba(255, 255, 255, 0.04)',
    ghostOpacity: 0.2,
    colors: {
      I: { fill: '#38bdf8', border: '#7dd3fc' },
      J: { fill: '#60a5fa', border: '#93c5fd' },
      L: { fill: '#fb923c', border: '#fdba74' },
      O: { fill: '#facc15', border: '#fef08a' },
      S: { fill: '#4ade80', border: '#86efac' },
      T: { fill: '#c084fc', border: '#e9d5ff' },
      Z: { fill: '#f87171', border: '#fca5a5' },
    },
  },
};

export const DEFAULT_KEYBINDINGS: KeyBindings = {
  moveLeft: 'ArrowLeft',
  moveRight: 'ArrowRight',
  softDrop: 'ArrowDown',
  hardDrop: ' ',
  rotateCW: 'ArrowUp',
  rotateCCW: 'z',
  hold: 'c',
  pause: 'p',
  restart: 'r',
};

// Fallback alternative keys accepted (e.g. WASD, Shift)
export const SECONDARY_KEYS: Record<string, keyof KeyBindings> = {
  a: 'moveLeft',
  d: 'moveRight',
  s: 'softDrop',
  w: 'rotateCW',
  x: 'rotateCW',
  Control: 'rotateCCW',
  Shift: 'hold',
  Escape: 'pause',
};

// Drop interval in milliseconds per level (classic guideline speed curve)
export function getDropInterval(level: number): number {
  // Level 1: ~800ms, down to level 15: ~50ms
  const speed = Math.pow(0.8 - ((level - 1) * 0.007), level - 1) * 1000;
  return Math.max(45, Math.round(speed));
}
