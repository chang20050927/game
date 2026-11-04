export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type RotationState = 0 | 1 | 2 | 3;

export interface Position {
  x: number;
  y: number;
}

export interface ActivePiece {
  type: TetrominoType;
  rotation: RotationState;
  x: number;
  y: number;
  lastMoveWasRotate?: boolean;
  lastRotateKicked?: boolean;
}

export type CellValue = TetrominoType | null;

export type BoardMatrix = CellValue[][]; // 22 rows (20 visible + 2 hidden top), 10 cols

export type GameMode = 'marathon' | 'sprint40' | 'blitz2m';

export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export type ThemeId = 'neon' | 'arcade' | 'gameboy' | 'midnight';

export interface ClearEvent {
  lines: number;
  text: string;
  isTetris: boolean;
  isTSpin: boolean;
  isBackToBack: boolean;
  isPerfectClear: boolean;
  scoreGained: number;
  timestamp: number;
}

export interface GameStats {
  score: number;
  lines: number;
  level: number;
  combo: number;
  maxCombo: number;
  piecesDropped: number;
  tetrisCount: number;
  tSpinCount: number;
  singleCount: number;
  doubleCount: number;
  tripleCount: number;
  timeElapsed: number; // in seconds
  timeRemaining?: number; // for blitz mode
}

export interface HighScoreRecord {
  score: number;
  lines: number;
  level: number;
  time: number;
  date: string;
}

export interface KeyBindings {
  moveLeft: string;
  moveRight: string;
  softDrop: string;
  hardDrop: string;
  rotateCW: string;
  rotateCCW: string;
  hold: string;
  pause: string;
  restart: string;
}
