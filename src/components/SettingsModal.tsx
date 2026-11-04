import React, { useState } from 'react';
import { X, Volume2, VolumeX, Music, Palette, Keyboard, HelpCircle } from 'lucide-react';
import { ThemeId } from '../tetris/types';
import { THEMES } from '../tetris/constants';
import { soundEngine } from '../tetris/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeId: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  musicMuted: boolean;
  onToggleMusic: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  themeId,
  onSelectTheme,
  isMuted,
  onToggleMute,
  musicMuted,
  onToggleMusic,
}) => {
  const [activeTab, setActiveTab] = useState<'audio_theme' | 'controls' | 'rules'>('audio_theme');
  const [sfxVol, setSfxVol] = useState(0.3);
  const [musicVol, setMusicVol] = useState(0.15);

  if (!isOpen) return null;

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    soundEngine.setSfxVolume(val);
  };

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMusicVol(val);
    soundEngine.setMusicVolume(val);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>遊戲設定與說明</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('audio_theme')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'audio_theme'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>音效與主題風格</span>
          </button>

          <button
            onClick={() => setActiveTab('controls')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'controls'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>按鍵操作對照</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'rules'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>規則與進階計分</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {activeTab === 'audio_theme' && (
            <div className="space-y-6">
              {/* Sound Controls */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  聲音效果 (Audio)
                </h3>

                {/* SFX */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onToggleMute}
                      className="p-2 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="font-medium text-slate-200">操作音效 (SFX)</div>
                      <div className="text-xs text-slate-500">旋轉、消除、落地的合成音</div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : sfxVol}
                    onChange={handleSfxChange}
                    className="w-28 accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Music */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onToggleMusic}
                      className="p-2 rounded-lg bg-purple-950/80 text-purple-300 hover:bg-purple-900"
                    >
                      <Music className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="font-medium text-slate-200">8-bit 俄羅斯方塊經典旋律 (BGM)</div>
                      <div className="text-xs text-slate-500">經典 Korobeiniki 晶片復古音樂</div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.02"
                    value={musicMuted ? 0 : musicVol}
                    onChange={handleMusicChange}
                    className="w-28 accent-purple-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  視覺風格主題 (Visual Themes)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
                    const theme = THEMES[tId];
                    const isSelected = themeId === tId;
                    return (
                      <button
                        key={tId}
                        onClick={() => onSelectTheme(tId)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-400/20'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-medium text-slate-200 text-xs mb-2">
                          {theme.name}
                        </div>
                        {/* Swatches */}
                        <div className="flex gap-1.5 items-center">
                          {['I', 'J', 'L', 'O', 'T'].map((p) => (
                            <span
                              key={p}
                              className="w-4 h-4 rounded-xs border"
                              style={{
                                backgroundColor: theme.colors[p as 'I'].fill,
                                borderColor: theme.colors[p as 'I'].border,
                              }}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                鍵盤快捷鍵一覽 (Keyboard Shortcuts)
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">左移 / 右移</span>
                  <div className="flex gap-1 font-mono">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white">←</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white">→</kbd>
                    <span className="text-slate-500">/</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white">A</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white">D</kbd>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">軟降 (加速落體)</span>
                  <div className="flex gap-1 font-mono">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white">↓</kbd>
                    <span className="text-slate-500">/</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white">S</kbd>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">硬降 (瞬間觸底)</span>
                  <div className="font-mono">
                    <kbd className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">Space 空格鍵</kbd>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">順時針旋轉 (CW)</span>
                  <div className="flex gap-1 font-mono">
                    <kbd className="px-1.5 py-0.5 rounded bg-purple-950 border border-purple-700 text-purple-300">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white">W</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white">X</kbd>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">逆時針旋轉 (CCW)</span>
                  <div className="flex gap-1 font-mono">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white">Z</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white">Ctrl</kbd>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">暫存方塊 (Hold)</span>
                  <div className="flex gap-1 font-mono">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white">C</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white">Shift</kbd>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">暫停 / 繼續</span>
                  <div className="flex gap-1 font-mono">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white">P</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white">Esc</kbd>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">快速重開 (Restart)</span>
                  <div className="font-mono">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white">R</kbd>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200">
                <span className="font-bold">📱 手機與平板操作：</span> 支援螢幕虛擬方向鍵、硬降、暫存按鈕，以及在遊戲盤面上直接「滑動左/右」、「下劃快速落體」、「輕點旋轉」的手勢控制！
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="font-bold text-cyan-300 text-sm">標準規範機制 (Standard Guideline)</div>
                <p>
                  本遊戲完整實裝國際 Tetris 現代標準：
                  <span className="text-white font-medium"> 7-Bag 隨機袋系統</span>
                  （確保7種形狀均勻出現，杜絕死局）、
                  <span className="text-white font-medium">SRS 超級旋轉系統踢牆</span>
                  （在邊界與窄縫中可靈活踢牆旋轉）、以及
                  <span className="text-white font-medium">影子方塊 (Ghost Piece)</span> 預覽落點。
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="font-bold text-amber-300 text-sm">計分與獎勵 (Scoring)</div>
                <ul className="space-y-1 list-disc list-inside text-slate-400">
                  <li><strong className="text-slate-200">單行 (Single):</strong> 100 × 當前等級</li>
                  <li><strong className="text-slate-200">雙行 (Double):</strong> 300 × 當前等級</li>
                  <li><strong className="text-slate-200">三行 (Triple):</strong> 500 × 當前等級</li>
                  <li><strong className="text-amber-400">四行 (TETRIS!):</strong> 800 × 當前等級（連續四行觸發 Back-to-Back 1.5倍加成）</li>
                  <li><strong className="text-purple-400">T-Spin 旋轉消除:</strong> 800 ~ 1600 × 當前等級</li>
                  <li><strong className="text-emerald-400">連擊獎勵 (Combo):</strong> 每連續消除一行加成 50 × 連擊數 × 等級</li>
                  <li><strong className="text-cyan-300">全清盤面 (Perfect Clear):</strong> 額外獎勵 1000 ~ 2000 分！</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="font-bold text-indigo-300 text-sm">三種挑戰模式</div>
                <p><strong>1. 馬拉松模式 (Marathon):</strong> 經典無盡模式，每消除 10 行晉級一級，重力下墜速度遞增，挑戰生存最高分。</p>
                <p><strong>2. 40行競速 (Sprint 40L):</strong> 最快速度消除 40 行，記錄精確通關秒數！</p>
                <p><strong>3. 2分鐘極速 (Blitz 2-Min):</strong> 120 秒限時積分賽，發揮最大消除與連擊效率！</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            完成並返回遊戲
          </button>
        </div>
      </div>
    </div>
  );
};
