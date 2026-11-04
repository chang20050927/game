import {
  ActivePiece,
  BoardMatrix,
  Position,
  RotationState,
  TetrominoType,
} from './types';
import {
  MATRIX_COLS,
  TOTAL_ROWS,
  TETROMINO_SHAPES,
} from './constants';

// Matrix coordinates: dx (right is +), dy (down is +)
// SRS JLSTZ Wall Kicks
const JLSTZ_KICK_TABLE: Record<string, Position[]> = {
  '0->1': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
  '1->0': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
  '1->2': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
  '2->1': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
  '2->3': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  '3->2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
  '3->0': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
  '0->3': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
};

// SRS I Wall Kicks
const I_KICK_TABLE: Record<string, Position[]> = {
  '0->1': [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 1 }, { x: 1, y: -2 }],
  '1->0': [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: -1 }, { x: -1, y: 2 }],
  '1->2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: -2 }, { x: 2, y: 1 }],
  '2->1': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 2 }, { x: -2, y: -1 }],
  '2->3': [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: -1 }, { x: -1, y: 2 }],
  '3->2': [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 1 }, { x: 1, y: -2 }],
  '3->0': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 2 }, { x: -2, y: -1 }],
  '0->3': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: -2 }, { x: 2, y: 1 }],
};

export function createEmptyMatrix(): BoardMatrix {
  return Array.from({ length: TOTAL_ROWS }, () => Array(MATRIX_COLS).fill(null));
}

export function isValidPosition(
  type: TetrominoType,
  rotation: RotationState,
  x: number,
  y: number,
  board: BoardMatrix
): boolean {
  const shape = TETROMINO_SHAPES[type][rotation];
  const size = shape.length;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (shape[r][c]) {
        const boardX = x + c;
        const boardY = y + r;

        // Boundaries check
        if (boardX < 0 || boardX >= MATRIX_COLS) return false;
        if (boardY < 0 || boardY >= TOTAL_ROWS) return false;

        // Occupied cell check
        if (board[boardY][boardX] !== null) return false;
      }
    }
  }

  return true;
}

export function tryRotate(
  piece: ActivePiece,
  board: BoardMatrix,
  direction: 'cw' | 'ccw'
): { success: boolean; piece: ActivePiece; kicked: boolean } {
  if (piece.type === 'O') {
    return { success: true, piece, kicked: false };
  }

  const currentRot = piece.rotation;
  const nextRot = ((currentRot + (direction === 'cw' ? 1 : 3)) % 4) as RotationState;
  const kickKey = `${currentRot}->${nextRot}`;

  const kickTable = piece.type === 'I' ? I_KICK_TABLE : JLSTZ_KICK_TABLE;
  const tests = kickTable[kickKey] || [{ x: 0, y: 0 }];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const newX = piece.x + test.x;
    const newY = piece.y + test.y;

    if (isValidPosition(piece.type, nextRot, newX, newY, board)) {
      return {
        success: true,
        piece: {
          ...piece,
          rotation: nextRot,
          x: newX,
          y: newY,
          lastMoveWasRotate: true,
          lastRotateKicked: i > 0,
        },
        kicked: i > 0,
      };
    }
  }

  return { success: false, piece, kicked: false };
}

export function getGhostPiecePosition(piece: ActivePiece, board: BoardMatrix): ActivePiece {
  let ghostY = piece.y;
  while (isValidPosition(piece.type, piece.rotation, piece.x, ghostY + 1, board)) {
    ghostY++;
  }
  return {
    ...piece,
    y: ghostY,
  };
}

// Standard 3-corner rule for T-Spin detection
export function checkTSpin(piece: ActivePiece, board: BoardMatrix): { isTSpin: boolean; isMini: boolean } {
  if (piece.type !== 'T' || !piece.lastMoveWasRotate) {
    return { isTSpin: false, isMini: false };
  }

  // T center is at x+1, y+1 in the 3x3 shape
  const cx = piece.x + 1;
  const cy = piece.y + 1;

  // 4 diagonal corners around center: (cx-1, cy-1), (cx+1, cy-1), (cx-1, cy+1), (cx+1, cy+1)
  const corners = [
    { x: cx - 1, y: cy - 1 }, // top-left
    { x: cx + 1, y: cy - 1 }, // top-right
    { x: cx - 1, y: cy + 1 }, // bottom-left
    { x: cx + 1, y: cy + 1 }, // bottom-right
  ];

  let occupiedCorners = 0;
  for (const corner of corners) {
    if (
      corner.x < 0 ||
      corner.x >= MATRIX_COLS ||
      corner.y >= TOTAL_ROWS ||
      (corner.y >= 0 && board[corner.y][corner.x] !== null)
    ) {
      occupiedCorners++;
    }
  }

  if (occupiedCorners < 3) {
    return { isTSpin: false, isMini: false };
  }

  // Mini T-spin check: if kicked or facing away
  const isMini = piece.lastRotateKicked === true && occupiedCorners === 3;
  return { isTSpin: true, isMini };
}
