/**
 * Web Audio API Synthesizer for Time Twist alarms and timer notifications.
 * Guarantees zero missing audio assets and reliable browser playback.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isRinging: boolean = false;
  private alarmInterval: number | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public unlockAudio() {
    this.initContext();
  }

  public playTone(freq: number, type: OscillatorType = 'sine', duration: number = 0.3, volume: number = 0.5) {
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Envelope: ramp up fast, decay smoothly
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(volume, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Error playing audio tone:', e);
    }
  }

  public playChime() {
    // Quick two-tone success notification for timer or alarm trigger
    this.playTone(523.25, 'sine', 0.2, 0.4); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.25, 0.4), 150); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.4, 0.5), 300); // G5
  }

  public startAlarmLoop() {
    if (this.isRinging) return;
    this.isRinging = true;
    this.initContext();

    const ringSequence = () => {
      if (!this.isRinging) return;
      // Elegant repeating triple alarm melody
      this.playTone(880, 'sine', 0.15, 0.6); // A5
      setTimeout(() => this.playTone(1046.5, 'sine', 0.15, 0.6), 180); // C6
      setTimeout(() => this.playTone(1318.5, 'sine', 0.3, 0.7), 360); // E6
    };

    ringSequence();
    this.alarmInterval = window.setInterval(ringSequence, 1200);
  }

  public stopAlarmLoop() {
    this.isRinging = false;
    if (this.alarmInterval !== null) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
  }

  public isAlarmRinging(): boolean {
    return this.isRinging;
  }
}

export const soundManager = new SoundSynthesizer();
