/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTetris } from './tetris/useTetris';
import { TopNav } from './components/TopNav';
import { TetrisBoard } from './components/TetrisBoard';
import { HoldPanel } from './components/HoldPanel';
import { NextQueuePanel } from './components/NextQueuePanel';
import { StatsPanel } from './components/StatsPanel';
import { TouchControls } from './components/TouchControls';
import { PauseOverlay } from './components/PauseOverlay';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { soundEngine } from './tetris/sound';
import { GameMode } from './tetris/types';
import { Play, Flame, Timer, Zap, HelpCircle } from 'lucide-react';

export default function App() {
  const {
    gameState,
    gameMode,
    theme,
    board,
    activePiece,
    ghostPiece,
    holdPiece,
    canHold,
    nextQueue,
    clearEvents,
    clearingRows,
    stats,
    highScores,
    changeTheme,
    setGameMode,
    startGame,
    togglePause,
    moveHorizontally,
    softDrop,
    hardDrop,
    rotate,
    hold,
  } = useTetris();

  const [isMuted, setIsMuted] = useState(false);
  const [musicMuted, setMusicMuted] = useState(true); // Muted by default to avoid unexpected auto-play
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const handleToggleMusic = () => {
    const next = !musicMuted;
    setMusicMuted(next);
    soundEngine.setMusicMuted(next);
  };

  const handleStartMode = (mode: GameMode) => {
    setGameMode(mode);
    startGame(mode);
  };

  const handleStartOrResume = () => {
    if (gameState === 'PLAYING') {
      togglePause();
    } else if (gameState === 'PAUSED') {
      togglePause();
    } else {
      startGame(gameMode);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* 1. Universal Top Bar Contract */}
      <TopNav
        currentMode={gameMode}
        onSelectMode={(mode) => {
          setGameMode(mode);
          if (gameState === 'PLAYING') {
            startGame(mode);
          }
        }}
        gameState={gameState}
        onStartOrResume={handleStartOrResume}
        onRestart={() => startGame(gameMode)}
        themeId={theme}
        onSelectTheme={changeTheme}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        musicMuted={musicMuted}
        onToggleMusic={handleToggleMusic}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. Main Arena Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 md:py-6">
        {gameState === 'TITLE_MENU' ? (
          /* Start Screen with Mode Selection Cards */
          <div className="max-w-xl w-full mx-auto text-center space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold font-mono">
                Classic Arcade Edition
              </span>
              <h1 className="text-4xl sm:text-5xl font-black font-arcade tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400">
                俄羅斯方塊大師
              </h1>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                標準 SRS 旋轉踢牆、7-Bag 隨機袋、暫存方塊與 8-bit 復古音效，選擇模式開始挑戰！
              </p>
            </div>

            {/* Mode selection cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Marathon */}
              <button
                onClick={() => handleStartMode('marathon')}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/80 hover:bg-slate-850 transition-all text-left group cursor-pointer shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 inline-block mb-2 group-hover:scale-105 transition-transform">
                    <Flame className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">經典馬拉松</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    無盡生存模式，隨消除行數提升等級與速度。
                  </p>
                </div>
                <div className="mt-4 text-[11px] font-mono text-cyan-400 font-semibold flex items-center gap-1">
                  <span>開始遊戲</span>
                  <span>→</span>
                </div>
              </button>

              {/* Sprint 40 */}
              <button
                onClick={() => handleStartMode('sprint40')}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/80 hover:bg-slate-850 transition-all text-left group cursor-pointer shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400 inline-block mb-2 group-hover:scale-105 transition-transform">
                    <Timer className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">40行競速</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    競速挑戰！最快速度消除 40 行，記錄通關時間。
                  </p>
                </div>
                <div className="mt-4 text-[11px] font-mono text-amber-400 font-semibold flex items-center gap-1">
                  <span>挑戰極限</span>
                  <span>→</span>
                </div>
              </button>

              {/* Blitz 2m */}
              <button
                onClick={() => handleStartMode('blitz2m')}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/80 hover:bg-slate-850 transition-all text-left group cursor-pointer shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="p-2 rounded-lg bg-purple-950/60 text-purple-400 inline-block mb-2 group-hover:scale-105 transition-transform">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">2分鐘極速</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    120 秒倒數計時，把握連擊與 Tetris 爭奪最高分。
                  </p>
                </div>
                <div className="mt-4 text-[11px] font-mono text-purple-400 font-semibold flex items-center gap-1">
                  <span>搶分排位</span>
                  <span>→</span>
                </div>
              </button>
            </div>

            {/* Quick action bar */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => handleStartMode('marathon')}
                className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm shadow-xl transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>立即開始 (Space / Enter)</span>
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>操作與規則說明</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Gameplay Workspace Layout (Desktop 3-column split, Mobile stacked) */
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
            <div className="w-full flex items-start justify-center gap-3 md:gap-5">
              {/* Left Column: HOLD Piece + Shortcuts */}
              <div className="hidden sm:flex flex-col gap-3 w-28 md:w-36 shrink-0">
                <HoldPanel
                  holdPiece={holdPiece}
                  canHold={canHold}
                  themeId={theme}
                  onHoldClick={hold}
                />

                {/* Desktop Quick Shortcuts Card */}
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-300 border-b border-slate-800 pb-1">
                    鍵盤提示
                  </div>
                  <div className="flex justify-between">
                    <span>左右移:</span>
                    <span className="font-mono text-white">← →</span>
                  </div>
                  <div className="flex justify-between">
                    <span>順旋轉:</span>
                    <span className="font-mono text-white">↑ / W</span>
                  </div>
                  <div className="flex justify-between">
                    <span>逆旋轉:</span>
                    <span className="font-mono text-white">Z / Ctrl</span>
                  </div>
                  <div className="flex justify-between">
                    <span>硬降:</span>
                    <span className="font-mono text-cyan-300 font-bold">Space</span>
                  </div>
                  <div className="flex justify-between">
                    <span>暫存:</span>
                    <span className="font-mono text-white">C / Shift</span>
                  </div>
                </div>
              </div>

              {/* Center Column: Tetris Board Canvas + In-board Pause Overlay */}
              <div className="relative">
                {/* Mobile Hold button preview */}
                <div className="sm:hidden flex items-center justify-between w-full mb-2 gap-2">
                  <div className="flex-1">
                    <HoldPanel
                      holdPiece={holdPiece}
                      canHold={canHold}
                      themeId={theme}
                      onHoldClick={hold}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-center">
                      <div className="text-[10px] text-slate-400">分數 (Score)</div>
                      <div className="text-lg font-bold font-mono-nums text-cyan-400">
                        {stats.score.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <TetrisBoard
                  board={board}
                  activePiece={activePiece}
                  ghostPiece={ghostPiece}
                  clearingRows={clearingRows}
                  clearEvents={clearEvents}
                  gameState={gameState}
                  themeId={theme}
                  onMoveLeft={() => moveHorizontally(-1)}
                  onMoveRight={() => moveHorizontally(1)}
                  onSoftDrop={softDrop}
                  onHardDrop={hardDrop}
                  onRotateCW={() => rotate('cw')}
                  onRotateCCW={() => rotate('ccw')}
                />

                {/* Pause Overlay inside Board frame */}
                {gameState === 'PAUSED' && (
                  <PauseOverlay
                    onResume={togglePause}
                    onRestart={() => startGame(gameMode)}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                  />
                )}
              </div>

              {/* Right Column: NEXT Queue + STATS */}
              <div className="hidden sm:flex flex-col gap-3 w-28 md:w-44 shrink-0">
                <NextQueuePanel queue={nextQueue} themeId={theme} />
                <StatsPanel
                  stats={stats}
                  mode={gameMode}
                  highScore={highScores[gameMode]}
                />
              </div>
            </div>

            {/* Mobile Touch Gamepad Controls */}
            <div className="w-full sm:hidden">
              <TouchControls
                onMoveLeft={() => moveHorizontally(-1)}
                onMoveRight={() => moveHorizontally(1)}
                onSoftDrop={softDrop}
                onHardDrop={hardDrop}
                onRotateCW={() => rotate('cw')}
                onRotateCCW={() => rotate('ccw')}
                onHold={hold}
                canHold={canHold}
              />
            </div>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-3 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>經典俄羅斯方塊</span>
          <span aria-hidden="true">·</span>
          <span>標準 SRS 旋轉踢牆</span>
          <span aria-hidden="true">·</span>
          <span>7-Bag 隨機袋系統</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="hover:text-slate-300 underline underline-offset-2 transition-colors cursor-pointer"
          >
            遊戲說明與按鍵指南
          </button>
        </div>
      </footer>

      {/* Modals */}
      <GameOverModal
        gameState={gameState}
        gameMode={gameMode}
        stats={stats}
        highScore={highScores[gameMode]}
        onRestart={() => startGame(gameMode)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        themeId={theme}
        onSelectTheme={changeTheme}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        musicMuted={musicMuted}
        onToggleMusic={handleToggleMusic}
      />
    </div>
  );
}
