import React from 'react';
import { Play, RotateCcw, Settings } from 'lucide-react';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
  onResume,
  onRestart,
  onOpenSettings,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 rounded-xl">
      <div className="text-center max-w-xs w-full bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold font-arcade tracking-wider text-cyan-400 mb-2">
          PAUSED
        </h2>
        <p className="text-xs text-slate-400 mb-6 font-mono">遊戲已暫停</p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-md"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>繼續遊戲 (P / Esc)</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重新開始 (R)</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>操作設定與說明</span>
          </button>
        </div>
      </div>
    </div>
  );
};
