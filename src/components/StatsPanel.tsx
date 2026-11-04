import React from 'react';
import { GameMode, GameStats, HighScoreRecord } from '../tetris/types';

interface StatsPanelProps {
  stats: GameStats;
  mode: GameMode;
  highScore: HighScoreRecord | null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, mode, highScore }) => {
  return (
    <div className="flex flex-col gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 shadow-lg backdrop-blur-sm">
      <div className="w-full flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs font-semibold text-slate-400">
        <span className="tracking-wide">STATS</span>
        <span className="text-[10px] text-slate-500 font-mono">數據統計</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-left">
        {/* Score */}
        <div className="col-span-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            {mode === 'sprint40' ? 'Sprint Score' : 'Score / 分數'}
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono-nums text-cyan-400 tracking-tight">
            {stats.score.toLocaleString()}
          </div>
        </div>

        {/* Lines */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            Lines / 行數
          </div>
          <div className="text-lg font-bold font-mono-nums text-white">
            {stats.lines}
            {mode === 'sprint40' && (
              <span className="text-xs text-slate-400 font-normal"> / 40</span>
            )}
          </div>
        </div>

        {/* Level */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            Level / 等級
          </div>
          <div className="text-lg font-bold font-mono-nums text-amber-400">
            {stats.level}
          </div>
        </div>

        {/* Time */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            {mode === 'blitz2m' ? 'Remaining / 剩餘' : 'Time / 時間'}
          </div>
          <div className="text-base font-bold font-mono-nums text-emerald-400">
            {mode === 'blitz2m'
              ? formatTime(stats.timeRemaining ?? 120)
              : formatTime(stats.timeElapsed)}
          </div>
        </div>

        {/* Combo */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            Combo / 連擊
          </div>
          <div className="text-base font-bold font-mono-nums text-purple-400">
            {stats.combo > 0 ? `${stats.combo}x` : '0'}
          </div>
        </div>
      </div>

      {/* High score badge */}
      {highScore && (
        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col gap-0.5">
          <div className="flex justify-between items-center text-amber-400/90 font-medium">
            <span>最高紀錄 (Record):</span>
            <span className="font-mono-nums font-bold">
              {mode === 'sprint40'
                ? formatTime(highScore.time)
                : highScore.score.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <span>等級 {highScore.level} · {highScore.lines} 行</span>
            <span>{highScore.date}</span>
          </div>
        </div>
      )}
    </div>
  );
};
