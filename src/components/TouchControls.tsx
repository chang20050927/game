import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  RotateCw,
  RotateCcw,
  Zap,
  Repeat,
} from 'lucide-react';

interface TouchControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onHold: () => void;
  canHold: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
  onHardDrop,
  onRotateCW,
  onRotateCCW,
  onHold,
  canHold,
}) => {
  // Safe trigger with slight vibration if supported
  const trigger = (action: () => void) => (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch {}
    action();
  };

  return (
    <div className="w-full max-w-md mx-auto mt-3 px-2 py-2 flex items-center justify-between gap-3 select-none">
      {/* Left: Direction D-pad (Left, Down, Right) */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2">
          {/* Left Button */}
          <button
            onTouchStart={trigger(onMoveLeft)}
            onClick={onMoveLeft}
            className="w-13 h-13 rounded-xl bg-slate-800/90 active:bg-cyan-600/60 border border-slate-700/80 active:scale-95 flex flex-col items-center justify-center text-slate-200 active:text-white shadow-lg transition-transform"
            aria-label="Move Left"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Soft Drop Button */}
          <button
            onTouchStart={trigger(onSoftDrop)}
            onClick={onSoftDrop}
            className="w-13 h-13 rounded-xl bg-slate-800/90 active:bg-cyan-600/60 border border-slate-700/80 active:scale-95 flex flex-col items-center justify-center text-slate-200 active:text-white shadow-lg transition-transform"
            aria-label="Soft Drop"
          >
            <ArrowDown className="w-6 h-6" />
          </button>

          {/* Right Button */}
          <button
            onTouchStart={trigger(onMoveRight)}
            onClick={onMoveRight}
            className="w-13 h-13 rounded-xl bg-slate-800/90 active:bg-cyan-600/60 border border-slate-700/80 active:scale-95 flex flex-col items-center justify-center text-slate-200 active:text-white shadow-lg transition-transform"
            aria-label="Move Right"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Hold Button under D-pad */}
        <button
          onTouchStart={canHold ? trigger(onHold) : undefined}
          onClick={canHold ? onHold : undefined}
          disabled={!canHold}
          className={`w-full py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            canHold
              ? 'bg-slate-800/80 active:bg-indigo-600/80 border-slate-700 text-slate-200'
              : 'bg-slate-900/40 border-slate-800/50 text-slate-600 cursor-not-allowed'
          }`}
          aria-label="Hold Piece"
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>HOLD 暫存</span>
        </button>
      </div>

      {/* Right: Action Buttons (Rotate CCW, Rotate CW, Hard Drop) */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2">
          {/* Rotate CCW */}
          <button
            onTouchStart={trigger(onRotateCCW)}
            onClick={onRotateCCW}
            className="w-13 h-13 rounded-xl bg-slate-800/90 active:bg-purple-600/60 border border-slate-700/80 active:scale-95 flex flex-col items-center justify-center text-slate-200 active:text-white shadow-lg transition-transform"
            aria-label="Rotate Counter-Clockwise"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-[9px] font-mono mt-0.5 text-slate-400">↺ Z</span>
          </button>

          {/* Rotate CW */}
          <button
            onTouchStart={trigger(onRotateCW)}
            onClick={onRotateCW}
            className="w-13 h-13 rounded-xl bg-purple-700/80 active:bg-purple-500 border border-purple-500/60 active:scale-95 flex flex-col items-center justify-center text-white shadow-lg transition-transform"
            aria-label="Rotate Clockwise"
          >
            <RotateCw className="w-5 h-5" />
            <span className="text-[9px] font-mono mt-0.5 text-purple-200">↻ 上</span>
          </button>
        </div>

        {/* Hard Drop Button (Impact / Space) */}
        <button
          onTouchStart={trigger(onHardDrop)}
          onClick={onHardDrop}
          className="w-full py-1.5 px-3 rounded-lg bg-cyan-600/90 active:bg-cyan-500 border border-cyan-400/60 text-white active:scale-95 text-xs font-bold flex items-center justify-center gap-1 shadow-md transition-transform"
          aria-label="Hard Drop"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>HARD DROP 硬降</span>
        </button>
      </div>
    </div>
  );
};
