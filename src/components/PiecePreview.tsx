import React from 'react';
import { TetrominoType, ThemeId } from '../tetris/types';
import { TETROMINO_SHAPES, THEMES } from '../tetris/constants';

interface PiecePreviewProps {
  type: TetrominoType | null;
  themeId: ThemeId;
  cellSize?: number;
}

export const PiecePreview: React.FC<PiecePreviewProps> = ({
  type,
  themeId,
  cellSize = 20,
}) => {
  if (!type) {
    return (
      <div
        className="flex items-center justify-center text-xs text-slate-500 font-mono"
        style={{ width: cellSize * 4, height: cellSize * 4 }}
      >
        --
      </div>
    );
  }

  const shape = TETROMINO_SHAPES[type][0]; // Spawn rotation
  const theme = THEMES[themeId];
  const colors = theme.colors[type];
  const size = shape.length;

  // Find bounding box to center nicely
  let minR = size,
    maxR = 0,
    minC = size,
    maxC = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (shape[r][c]) {
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);
      }
    }
  }

  const pieceWidth = (maxC - minC + 1) * cellSize;
  const pieceHeight = (maxR - minR + 1) * cellSize;
  const totalBoxSize = cellSize * 4;
  const offsetX = (totalBoxSize - pieceWidth) / 2 - minC * cellSize;
  const offsetY = (totalBoxSize - pieceHeight) / 2 - minR * cellSize;

  return (
    <svg
      width={totalBoxSize}
      height={totalBoxSize}
      viewBox={`0 0 ${totalBoxSize} ${totalBoxSize}`}
      className="overflow-visible"
    >
      {shape.map((row, r) =>
        row.map((cell, c) => {
          if (!cell) return null;
          const x = offsetX + c * cellSize;
          const y = offsetY + r * cellSize;
          const pad = 1.5;

          return (
            <g key={`${r}-${c}`}>
              {/* Block Base */}
              <rect
                x={x + pad}
                y={y + pad}
                width={cellSize - pad * 2}
                height={cellSize - pad * 2}
                fill={colors.fill}
                stroke={colors.border}
                strokeWidth={1}
                rx={1}
              />
              {/* Highlight */}
              <line
                x1={x + pad}
                y1={y + pad + 1}
                x2={x + cellSize - pad}
                y2={y + pad + 1}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={1.5}
              />
              <line
                x1={x + pad + 1}
                y1={y + pad}
                x2={x + pad + 1}
                y2={y + cellSize - pad}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={1.5}
              />
              {/* Shadow */}
              <line
                x1={x + pad}
                y1={y + cellSize - pad}
                x2={x + cellSize - pad}
                y2={y + cellSize - pad}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth={1.5}
              />
              <line
                x1={x + cellSize - pad}
                y1={y + pad}
                x2={x + cellSize - pad}
                y2={y + cellSize - pad}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth={1.5}
              />
            </g>
          );
        })
      )}
    </svg>
  );
};
