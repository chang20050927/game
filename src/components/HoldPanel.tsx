import React from 'react';
import { TetrominoType, ThemeId } from '../tetris/types';
import { PiecePreview } from './PiecePreview';

interface HoldPanelProps {
  holdPiece: TetrominoType | null;
  canHold: boolean;
  themeId: ThemeId;
  onHoldClick: () => void;
}

export const HoldPanel: React.FC<HoldPanelProps> = ({
  holdPiece,
  canHold,
  themeId,
  onHoldClick,
}) => {
  return (
    <div
      onClick={canHold ? onHoldClick : undefined}
      className={`flex flex-col items-center justify-between p-3 rounded-xl border transition-all ${
        canHold
          ? 'bg-slate-900/80 border-slate-700/80 hover:border-cyan-500/50 cursor-pointer'
          : 'bg-slate-900/40 border-slate-800/80 opacity-60 cursor-not-allowed'
      } shadow-lg backdrop-blur-sm`}
    >
      <div className="w-full flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs font-semibold text-slate-400">
        <span className="tracking-wide">HOLD</span>
        <span className="text-[10px] text-slate-500 font-mono">暫存</span>
      </div>

      <div className="py-2 flex items-center justify-center min-h-[70px]">
        <PiecePreview type={holdPiece} themeId={themeId} cellSize={18} />
      </div>

      <div className="text-[10px] text-slate-500 font-mono tracking-tighter">
        按鍵: C / Shift
      </div>
    </div>
  );
};
