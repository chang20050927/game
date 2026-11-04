import React from 'react';
import { GameMode, GameState, ThemeId } from '../tetris/types';
import { Volume2, VolumeX, Music, Settings, Play, Pause, RotateCcw } from 'lucide-react';
import { THEMES } from '../tetris/constants';

interface TopNavProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  gameState: GameState;
  onStartOrResume: () => void;
  onRestart: () => void;
  themeId: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  musicMuted: boolean;
  onToggleMusic: () => void;
  onOpenSettings: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentMode,
  onSelectMode,
  gameState,
  onStartOrResume,
  onRestart,
  themeId,
  onSelectTheme,
  isMuted,
  onToggleMute,
  musicMuted,
  onToggleMusic,
  onOpenSettings,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto flex items-center justify-between gap-4 md:gap-8 px-4 py-3 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
        <span className="text-xl sm:text-2xl font-bold font-arcade tracking-wider bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
          TETRIS MASTER
        </span>
        <span className="hidden sm:inline-block text-xs text-slate-500 font-medium font-sans">
          經典俄羅斯方塊
        </span>
      </div>

      {/* Zone 2: Navigation Links (Mode Selector & Theme Selector) */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        {/* Game Mode Links */}
        <button
          onClick={() => onSelectMode('marathon')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            currentMode === 'marathon'
              ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5'
              : ''
          }`}
        >
          馬拉松模式
        </button>
        <button
          onClick={() => onSelectMode('sprint40')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            currentMode === 'sprint40'
              ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5'
              : ''
          }`}
        >
          40行競速
        </button>
        <button
          onClick={() => onSelectMode('blitz2m')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            currentMode === 'blitz2m'
              ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 pb-0.5'
              : ''
          }`}
        >
          2分鐘極速
        </button>

        {/* Theme Dropdown / Quick Switch */}
        <select
          value={themeId}
          onChange={(e) => onSelectTheme(e.target.value as ThemeId)}
          className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1 outline-none cursor-pointer hover:border-slate-500"
        >
          {(Object.keys(THEMES) as ThemeId[]).map((tKey) => (
            <option key={tKey} value={tKey}>
              {THEMES[tKey].name}
            </option>
          ))}
        </select>
      </nav>

      {/* Zone 3: Primary Action & Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Audio Mute SFX */}
        <button
          onClick={onToggleMute}
          title={isMuted ? '開啟音效' : '靜音音效'}
          className={`p-2 rounded-lg border transition-colors ${
            isMuted
              ? 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
              : 'bg-slate-900 border-slate-700 text-cyan-400 hover:bg-slate-800'
          }`}
          aria-label="Toggle SFX Mute"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Music Toggle */}
        <button
          onClick={onToggleMusic}
          title={musicMuted ? '播放 8-bit 背景音樂' : '關閉背景音樂'}
          className={`p-2 rounded-lg border transition-colors ${
            musicMuted
              ? 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
              : 'bg-purple-950/60 border-purple-700 text-purple-300 hover:bg-purple-900/80 animate-pulse'
          }`}
          aria-label="Toggle BGM"
        >
          <Music className="w-4 h-4" />
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="遊戲設定與說明"
          className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Game Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Restart Button */}
        {gameState === 'PLAYING' && (
          <button
            onClick={onRestart}
            title="重新開始 (R)"
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Restart Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Primary Play/Pause Button */}
        {gameState === 'PLAYING' ? (
          <button
            onClick={onStartOrResume}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>暫停</span>
          </button>
        ) : (
          <button
            onClick={onStartOrResume}
            className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{gameState === 'PAUSED' ? '繼續遊戲' : '開始遊戲'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
