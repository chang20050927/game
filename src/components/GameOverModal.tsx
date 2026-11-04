import React from 'react';
import { GameMode, GameState, GameStats, HighScoreRecord } from '../tetris/types';
import { RotateCcw, Trophy, Award, Clock } from 'lucide-react';

interface GameOverModalProps {
  gameState: GameState;
  gameMode: GameMode;
  stats: GameStats;
  highScore: HighScoreRecord | null;
  onRestart: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  gameState,
  gameMode,
  stats,
  highScore,
  onRestart,
}) => {
  if (gameState !== 'GAME_OVER' && gameState !== 'VICTORY') return null;

  const isVictory = gameState === 'VICTORY';
  const isSprint = gameMode === 'sprint40';
  const isNewRecord =
    highScore &&
    (isSprint
      ? stats.lines >= 40 && stats.timeElapsed <= highScore.time
      : stats.score >= highScore.score);

  const pps =
    stats.timeElapsed > 0
      ? (stats.piecesDropped / stats.timeElapsed).toFixed(2)
      : '0.00';

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            isVictory ? 'bg-amber-500/25' : 'bg-red-500/20'
          }`}
        />

        {/* Title */}
        <div className="relative z-10 mb-4">
          <div className="inline-flex p-3 rounded-full bg-slate-800/90 border border-slate-700 mb-2">
            {isVictory ? (
              <Trophy className="w-8 h-8 text-amber-400" />
            ) : (
              <Award className="w-8 h-8 text-cyan-400" />
            )}
          </div>
          <h2
            className={`text-3xl font-bold font-arcade tracking-wider ${
              isVictory ? 'text-amber-400' : 'text-slate-100'
            }`}
          >
            {isVictory ? 'STAGE CLEAR!' : 'GAME OVER'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isVictory
              ? '恭喜完成 40 行競速挑戰！'
              : gameMode === 'blitz2m'
              ? '2分鐘極速挑戰時間結束！'
              : '方塊已堆滿頂部，挑戰結束！'}
          </p>

          {isNewRecord && (
            <div className="mt-2 inline-block px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs font-bold text-amber-300 animate-pulse">
              ★ 達成個人最高新紀錄！ (NEW RECORD)
            </div>
          )}
        </div>

        {/* Core Primary Metric Display */}
        <div className="relative z-10 p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-4 text-center">
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
            {isSprint ? 'CLEAR TIME / 完成耗時' : 'FINAL SCORE / 最終總分'}
          </div>
          <div className="text-4xl font-extrabold font-mono-nums text-cyan-400 tracking-tight">
            {isSprint ? formatTime(stats.timeElapsed) : stats.score.toLocaleString()}
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="relative z-10 grid grid-cols-3 gap-2 text-left mb-6 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block text-[10px]">消除行數</span>
            <span className="font-bold text-white font-mono-nums text-base">
              {stats.lines}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block text-[10px]">最高等級</span>
            <span className="font-bold text-amber-400 font-mono-nums text-base">
              {stats.level}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block text-[10px]">最大連擊</span>
            <span className="font-bold text-purple-400 font-mono-nums text-base">
              {stats.maxCombo > 0 ? `${stats.maxCombo}x` : '0'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block text-[10px]">四行消除 (Tetris)</span>
            <span className="font-bold text-cyan-300 font-mono-nums text-base">
              {stats.tetrisCount} 次
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block text-[10px]">T-Spin 旋轉</span>
            <span className="font-bold text-indigo-300 font-mono-nums text-base">
              {stats.tSpinCount} 次
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 block text-[10px]">下落速率 (PPS)</span>
            <span className="font-bold text-emerald-300 font-mono-nums text-base">
              {pps} /s
            </span>
          </div>
        </div>

        {/* Restart Action */}
        <div className="relative z-10 flex flex-col gap-2">
          <button
            onClick={onRestart}
            className="w-full py-3 px-6 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>再玩一局 (Play Again)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
