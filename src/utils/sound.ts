class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('hangul_forest_muted');
      this.muted = saved === 'true';
    }
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean): void {
    this.muted = mute;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hangul_forest_muted', String(mute));
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.12,
    delay: number = 0,
    endFreq?: number
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 20), now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playKeyTick(combo: number = 0): void {
    // Gentle wooden marimba tap that pitches slightly brighter with combo
    const baseFreq = 520 + Math.min(combo, 20) * 10;
    this.playTone(baseFreq, 0.055, 'triangle', 0.09, 0, baseFreq * 0.78);
  }

  public playTypo(): void {
    // Soft, friendly "boop" so kids don't feel startled
    this.playTone(240, 0.12, 'triangle', 0.11, 0, 165);
  }

  public playWordComplete(combo: number = 1): void {
    const pitchBoost = Math.min(combo, 12) * 12;
    this.playTone(523.25 + pitchBoost, 0.1, 'sine', 0.12, 0);
    this.playTone(659.25 + pitchBoost, 0.14, 'sine', 0.12, 0.06);
    this.playTone(783.99 + pitchBoost, 0.18, 'triangle', 0.1, 0.12);
  }

  public playAttackHit(): void {
    // Crisp pop + bright chime for damaging the Typo Cloud boss
    this.playTone(360, 0.08, 'square', 0.05, 0, 620);
    this.playTone(784, 0.16, 'triangle', 0.12, 0.05);
  }

  public playFeverStart(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.16, 'triangle', 0.11, idx * 0.065);
    });
  }

  public playStageClear(): void {
    const melody = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 0.11 },
      { f: 783.99, d: 0.12, t: 0.22 },
      { f: 1046.5, d: 0.35, t: 0.34 },
    ];
    melody.forEach((m) => {
      this.playTone(m.f, m.d, 'triangle', 0.13, m.t);
    });
  }

  public playStickerUnlock(): void {
    const notes = [659.25, 880, 1174.66, 1318.51];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.2, 'sine', 0.11, idx * 0.08);
    });
  }

  public playClick(): void {
    this.playTone(600, 0.04, 'sine', 0.07, 0, 480);
  }
}

export const soundEngine = new SoundEngine();
