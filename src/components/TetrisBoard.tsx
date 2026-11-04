import React, { useRef, useEffect, useCallback } from 'react';
import {
  ActivePiece,
  BoardMatrix,
  ClearEvent,
  GameState,
  ThemeId,
} from '../tetris/types';
import {
  MATRIX_COLS,
  MATRIX_ROWS,
  BUFFER_ROWS,
  TETROMINO_SHAPES,
  THEMES,
} from '../tetris/constants';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

interface TetrisBoardProps {
  board: BoardMatrix;
  activePiece: ActivePiece | null;
  ghostPiece: ActivePiece | null;
  clearingRows: number[];
  clearEvents: ClearEvent[];
  gameState: GameState;
  themeId: ThemeId;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
}

export const TetrisBoard: React.FC<TetrisBoardProps> = ({
  board,
  activePiece,
  ghostPiece,
  clearingRows,
  clearEvents,
  gameState,
  themeId,
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
  onHardDrop,
  onRotateCW,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Spawn particle explosion on line clears
  useEffect(() => {
    if (clearingRows.length > 0 && canvasRef.current) {
      const theme = THEMES[themeId];
      const canvas = canvasRef.current;
      const cellW = canvas.width / MATRIX_COLS;
      const cellH = canvas.height / MATRIX_ROWS;

      clearingRows.forEach((rowIdx) => {
        const visibleRow = rowIdx - BUFFER_ROWS;
        if (visibleRow < 0) return;

        for (let col = 0; col < MATRIX_COLS; col++) {
          const type = board[rowIdx]?.[col];
          const color = type ? theme.colors[type].fill : '#ffffff';

          for (let p = 0; p < 4; p++) {
            particlesRef.current.push({
              x: (col + Math.random()) * cellW,
              y: (visibleRow + Math.random()) * cellH,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.7) * 7,
              color,
              size: Math.random() * 5 + 3,
              alpha: 1,
              life: 1,
            });
          }
        }
      });
    }
  }, [clearingRows, board, themeId]);

  // Main board render canvas loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const theme = THEMES[themeId];
    const width = canvas.width;
    const height = canvas.height;
    const cellW = width / MATRIX_COLS;
    const cellH = height / MATRIX_ROWS;

    // Background
    ctx.fillStyle = theme.boardBg;
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines
    ctx.strokeStyle = theme.gridLine;
    ctx.lineWidth = 1;

    for (let c = 1; c < MATRIX_COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellW, 0);
      ctx.lineTo(c * cellW, height);
      ctx.stroke();
    }
    for (let r = 1; r < MATRIX_ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellH);
      ctx.lineTo(width, r * cellH);
      ctx.stroke();
    }

    // Helper to draw beveled block
    const drawBlock = (
      col: number,
      visibleRow: number,
      fill: string,
      border: string,
      opacity: number = 1,
      isGhost: boolean = false
    ) => {
      if (visibleRow < 0 || visibleRow >= MATRIX_ROWS) return;

      const x = col * cellW;
      const y = visibleRow * cellH;
      const pad = 1.5;

      ctx.save();
      ctx.globalAlpha = opacity;

      if (isGhost) {
        // Ghost piece: wireframe with subtle fill
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + pad, y + pad, cellW - pad * 2, cellH - pad * 2);
        ctx.fillStyle = fill;
        ctx.fillRect(x + pad, y + pad, cellW - pad * 2, cellH - pad * 2);
      } else {
        // Solid block with retro 3D bevel
        ctx.fillStyle = fill;
        ctx.fillRect(x + pad, y + pad, cellW - pad * 2, cellH - pad * 2);

        // Top and Left light highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fillRect(x + pad, y + pad, cellW - pad * 2, 3);
        ctx.fillRect(x + pad, y + pad, 3, cellH - pad * 2);

        // Bottom and Right dark bevel
        ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
        ctx.fillRect(x + pad, y + cellH - pad - 3, cellW - pad * 2, 3);
        ctx.fillRect(x + cellW - pad - 3, y + pad, 3, cellH - pad * 2);

        // Border outline
        ctx.strokeStyle = border;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + pad, y + pad, cellW - pad * 2, cellH - pad * 2);
      }

      ctx.restore();
    };

    // 1. Draw locked cells on board
    for (let r = BUFFER_ROWS; r < board.length; r++) {
      const visibleRow = r - BUFFER_ROWS;
      const isClearing = clearingRows.includes(r);

      for (let c = 0; c < MATRIX_COLS; c++) {
        const type = board[r][c];
        if (type) {
          if (isClearing) {
            // Flash white on clear
            drawBlock(c, visibleRow, '#ffffff', '#ffffff', 0.95);
          } else {
            const colors = theme.colors[type];
            drawBlock(c, visibleRow, colors.fill, colors.border, 1);
          }
        }
      }
    }

    // 2. Draw Ghost piece
    if (ghostPiece && activePiece && gameState === 'PLAYING') {
      const shape = TETROMINO_SHAPES[ghostPiece.type][ghostPiece.rotation];
      const colors = theme.colors[ghostPiece.type];
      const size = shape.length;

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (shape[r][c]) {
            const bx = ghostPiece.x + c;
            const by = ghostPiece.y + r - BUFFER_ROWS;
            drawBlock(bx, by, colors.fill, colors.border, theme.ghostOpacity, true);
          }
        }
      }
    }

    // 3. Draw Active piece
    if (activePiece && gameState === 'PLAYING') {
      const shape = TETROMINO_SHAPES[activePiece.type][activePiece.rotation];
      const colors = theme.colors[activePiece.type];
      const size = shape.length;

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (shape[r][c]) {
            const bx = activePiece.x + c;
            const by = activePiece.y + r - BUFFER_ROWS;
            drawBlock(bx, by, colors.fill, colors.border, 1);
          }
        }
      }
    }

    // 4. Update and render particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.alpha -= 0.025;

      if (p.alpha <= 0) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    }
  }, [board, activePiece, ghostPiece, clearingRows, gameState, themeId]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      render();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [render]);

  // Touch gesture handler directly on the board canvas
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < 12 && absY < 12 && dt < 250) {
      // Tap to rotate clockwise
      onRotateCW();
    } else if (absX > absY && absX > 25) {
      // Horizontal swipe
      if (dx > 0) onMoveRight();
      else onMoveLeft();
    } else if (absY > absX && absY > 30) {
      // Vertical swipe
      if (dy > 80 && dt < 200) {
        onHardDrop(); // Quick flick down
      } else if (dy > 0) {
        onSoftDrop();
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Container with rounded arcade border and soft glow */}
      <div className="relative p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Ambient edge glow */}
        <div className="absolute -inset-1 bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent rounded-xl pointer-events-none" />

        <canvas
          ref={canvasRef}
          width={300}
          height={600}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative z-10 w-[240px] sm:w-[280px] md:w-[300px] h-[480px] sm:h-[560px] md:h-[600px] block cursor-pointer select-none rounded-lg"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Floating Clear Event Notification / Tetris banner */}
        {clearEvents.length > 0 && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex flex-col items-center gap-1">
            {clearEvents.slice(0, 1).map((ev) => (
              <div
                key={ev.timestamp}
                className={`animate-bounce px-3 py-1 rounded text-center whitespace-nowrap shadow-lg border ${
                  ev.isTetris || ev.isPerfectClear
                    ? 'bg-amber-400 text-slate-950 font-arcade font-bold text-lg border-yellow-200'
                    : ev.isTSpin
                    ? 'bg-purple-600 text-white font-arcade font-bold text-base border-purple-300'
                    : 'bg-cyan-600/95 text-white text-sm font-medium border-cyan-400'
                }`}
              >
                {ev.text}
                <div className="text-xs font-mono font-bold tracking-wider">
                  +{ev.scoreGained}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
