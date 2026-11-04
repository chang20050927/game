// Web Audio API Synthesizer for Retro Tetris SFX and Korobeiniki Chiptune Music

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicMuted: boolean = false;
  private sfxVolume: number = 0.3;
  private musicVolume: number = 0.15;
  private musicPlaying: boolean = false;
  private musicTimer: number | null = null;
  private musicStep: number = 0;

  // Korobeiniki (Classic Tetris Type-A theme) melody notes and durations (pitch in Hz, duration in beats)
  // E5, B4, C5, D5, C5, B4, A4, A4, C5, E5, D5, C5, B4, C5, D5, E5, C5, A4, A4...
  private melody: Array<[number, number]> = [
    [659.25, 2], // E5
    [493.88, 1], // B4
    [523.25, 1], // C5
    [587.33, 2], // D5
    [523.25, 1], // C5
    [493.88, 1], // B4
    [440.0, 2],  // A4
    [440.0, 1],  // A4
    [523.25, 1], // C5
    [659.25, 2], // E5
    [587.33, 1], // D5
    [523.25, 1], // C5
    [493.88, 3], // B4
    [523.25, 1], // C5
    [587.33, 2], // D5
    [659.25, 2], // E5
    [523.25, 2], // C5
    [440.0, 2],  // A4
    [440.0, 2],  // A4
    [0, 1],      // rest

    [587.33, 3], // D5
    [698.46, 1], // F5
    [880.0, 2],  // A5
    [783.99, 1], // G5
    [698.46, 1], // F5
    [659.25, 3], // E5
    [523.25, 1], // C5
    [659.25, 2], // E5
    [587.33, 1], // D5
    [523.25, 1], // C5
    [493.88, 2], // B4
    [493.88, 1], // B4
    [523.25, 1], // C5
    [587.33, 2], // D5
    [659.25, 2], // E5
    [523.25, 2], // C5
    [440.0, 2],  // A4
    [440.0, 2],  // A4
    [0, 2],      // rest
  ];

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopMusic();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMusicMuted(muted: boolean) {
    this.musicMuted = muted;
    if (muted) {
      this.stopMusic();
    } else if (this.musicPlaying) {
      this.startMusic();
    }
  }

  public getMusicMuted(): boolean {
    return this.musicMuted;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
  }

  // Play a quick retro synthesized tone
  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    gainStart: number,
    gainEnd: number = 0.001,
    freqEnd?: number
  ) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (freqEnd) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(20, freqEnd),
          this.ctx.currentTime + duration
        );
      }

      const effectiveGain = gainStart * this.sfxVolume;
      gainNode.gain.setValueAtTime(Math.max(0.0001, effectiveGain), this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        Math.max(0.0001, gainEnd * this.sfxVolume),
        this.ctx.currentTime + duration
      );

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // AudioContext safe fail
    }
  }

  public playMove() {
    this.playTone(280, 'square', 0.04, 0.12, 0.01, 320);
  }

  public playRotate() {
    this.playTone(480, 'triangle', 0.06, 0.2, 0.01, 640);
  }

  public playSoftDrop() {
    this.playTone(180, 'sine', 0.03, 0.1, 0.01);
  }

  public playHardDrop() {
    // Punchy bass impact
    this.playTone(140, 'square', 0.12, 0.35, 0.01, 40);
  }

  public playHold() {
    this.playTone(350, 'sawtooth', 0.09, 0.18, 0.01, 520);
  }

  public playLineClear(lines: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    if (lines === 4) {
      // Triumphant Tetris 4-lines Fanfare: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'triangle', 0.22, 0.3, 0.01);
        }, idx * 75);
      });
    } else {
      // Standard line clear chime
      const base = 440;
      for (let i = 0; i <= lines; i++) {
        setTimeout(() => {
          this.playTone(base * Math.pow(1.25, i), 'sine', 0.12, 0.25, 0.01);
        }, i * 50);
      }
    }
  }

  public playLevelUp() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'square', 0.15, 0.25, 0.01);
      }, i * 80);
    });
  }

  public playGameOver() {
    const notes = [400, 370, 340, 260, 200];
    notes.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'sawtooth', 0.25, 0.3, 0.01);
      }, i * 140);
    });
  }

  public playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'triangle', 0.28, 0.35, 0.01);
      }, i * 90);
    });
  }

  // --- Background Chiptune Music Loop ---
  public startMusic() {
    this.musicPlaying = true;
    if (this.isMuted || this.musicMuted) return;
    this.initContext();
    if (this.musicTimer !== null) return;

    this.musicStep = 0;
    this.scheduleNextNote();
  }

  public stopMusic() {
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleNextNote() {
    if (!this.musicPlaying || this.isMuted || this.musicMuted) {
      this.stopMusic();
      return;
    }

    const tempoMsPerBeat = 125; // ~120 BPM sixteenths/eighths
    const [freq, beats] = this.melody[this.musicStep];
    const duration = (beats * tempoMsPerBeat) / 1000;

    if (freq > 0 && this.ctx) {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // 8-bit chiptune square wave
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        const vol = this.musicVolume * 0.16;
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration * 0.95);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch {
        // Safe fail
      }
    }

    this.musicStep = (this.musicStep + 1) % this.melody.length;
    this.musicTimer = window.setTimeout(() => {
      this.scheduleNextNote();
    }, beats * tempoMsPerBeat);
  }
}

export const soundEngine = new SoundEngine();
