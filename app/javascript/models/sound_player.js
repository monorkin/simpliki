// Generated this with Claude
// I have no clue how to do sound synthesis
export default class SoundPlayer {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.isPlaying = false;
    this.currentSource = null;
    this.currentOscillator = null;
  }

  playInhaleSound(duration) {
    this.stopCurrentSound();

    const durationInSeconds = duration / 1000;
    const attackTime = Math.min(0.2, durationInSeconds * 0.2);

    // Create oscillators for gong-like sound (combines multiple frequencies)
    const primaryOsc = this.audioContext.createOscillator();
    const secondaryOsc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    // Configure primary oscillator
    primaryOsc.type = 'sine';
    primaryOsc.frequency.value = 200;

    // Configure secondary oscillator for harmonics
    secondaryOsc.type = 'triangle';
    secondaryOsc.frequency.value = 280;

    // Configure filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
    filter.frequency.linearRampToValueAtTime(
      1200, 
      this.audioContext.currentTime + durationInSeconds
    );
    filter.Q.value = 5;

    // Configure gain envelope
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + attackTime);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + durationInSeconds);

    // Connect everything
    primaryOsc.connect(filter);
    secondaryOsc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Start and schedule stop
    primaryOsc.start();
    secondaryOsc.start();
    primaryOsc.stop(this.audioContext.currentTime + durationInSeconds);
    secondaryOsc.stop(this.audioContext.currentTime + durationInSeconds);

    this.currentOscillator = [primaryOsc, secondaryOsc];
    this.isPlaying = true;

    // Clean up
    primaryOsc.onended = () => {
      this.isPlaying = false;
      this.currentOscillator = null;
    };
  }

  playExhaleSound(duration) {
    this.stopCurrentSound();

    const durationInSeconds = duration / 1000;
    const attackTime = Math.min(0.1, durationInSeconds * 0.1);

    // Create oscillators for gong-like sound
    const primaryOsc = this.audioContext.createOscillator();
    const secondaryOsc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    // Configure primary oscillator
    primaryOsc.type = 'sine';
    primaryOsc.frequency.value = 280;

    // Configure secondary oscillator for harmonics
    secondaryOsc.type = 'triangle';
    secondaryOsc.frequency.value = 180;

    // Configure filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    filter.frequency.linearRampToValueAtTime(
      300, 
      this.audioContext.currentTime + durationInSeconds
    );
    filter.Q.value = 3;

    // Configure gain envelope
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + attackTime);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + durationInSeconds);

    // Connect everything
    primaryOsc.connect(filter);
    secondaryOsc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Start and schedule stop
    primaryOsc.start();
    secondaryOsc.start();
    primaryOsc.stop(this.audioContext.currentTime + durationInSeconds);
    secondaryOsc.stop(this.audioContext.currentTime + durationInSeconds);

    this.currentOscillator = [primaryOsc, secondaryOsc];
    this.isPlaying = true;

    // Clean up
    primaryOsc.onended = () => {
      this.isPlaying = false;
      this.currentOscillator = null;
    };
  }

  stopCurrentSound() {
    if (this.isPlaying && this.currentOscillator) {
      if (Array.isArray(this.currentOscillator)) {
        this.currentOscillator.forEach(osc => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (e) {
            // Oscillator might already be stopped
          }
        });
      } else {
        try {
          this.currentOscillator.stop();
          this.currentOscillator.disconnect();
        } catch (e) {
          // Oscillator might already be stopped
        }
      }

      this.isPlaying = false;
      this.currentOscillator = null;
    }
  }

  resumeAudio() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}
