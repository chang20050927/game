import React from 'react';
import { TetrominoType, ThemeId } from '../tetris/types';
import { PiecePreview } from './PiecePreview';

interface NextQueuePanelProps {
  queue: TetrominoType[];
  themeId: ThemeId;
}

export const NextQueuePanel: React.FC<NextQueuePanelProps> = ({ queue, themeId }) => {
  const visibleQueue = queue.slice(0, 5);

  return (
    <div className="flex flex-col items-center p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 shadow-lg backdrop-blur-sm">
      <div className="w-full flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs font-semibold text-slate-400">
        <span className="tracking-wide">NEXT</span>
        <span className="text-[10px] text-slate-500 font-mono">下一個</span>
      </div>

      <div className="flex flex-col items-center gap-2 py-2">
        {visibleQueue.map((pieceType, index) => (
          <div
            key={`${pieceType}-${index}`}
            className={`flex items-center justify-center transition-all ${
              index === 0 ? 'scale-100 py-1' : 'scale-85 opacity-75'
            }`}
          >
            <PiecePreview
              type={pieceType}
              themeId={themeId}
              cellSize={index === 0 ? 18 : 15}
            />
          </div>
        ))}
        {visibleQueue.length === 0 && (
          <div className="text-xs text-slate-500 py-6">--</div>
        )}
      </div>
    </div>
  );
};
