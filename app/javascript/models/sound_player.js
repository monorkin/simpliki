// Generated this with Claude
// I'm not really well versed at sound synthesis, but this is decent enought

export default class SoundPlayer {
  constructor() {
    // Initialize AudioContext
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.isPlaying = false;
    this.currentSource = null;
    this.currentOscillator = null;
  }

  playInhaleSound(duration) {
    this.stopCurrentSound();
    
    const durationInSeconds = duration / 1000;
    const attackTime = Math.min(0.2, durationInSeconds * 0.2);
    
    // Create oscillators for a more pleasant, calm sound
    const primaryOsc = this.audioContext.createOscillator();
    const secondaryOsc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    // Configure oscillators with much lower, softer frequencies
    primaryOsc.type = 'sine';
    primaryOsc.frequency.value = 196; // G3 - much lower, gentle
    
    // Configure secondary oscillator
    secondaryOsc.type = 'sine';
    secondaryOsc.frequency.value = 220; // A3 - complementary note
    
    // Configure filter for a gentler sound
    filter.type = 'lowpass'; // Lowpass helps reduce harshness
    filter.frequency.setValueAtTime(250, this.audioContext.currentTime);
    filter.frequency.linearRampToValueAtTime(
      450, // Gentle rise for inhale
      this.audioContext.currentTime + durationInSeconds
    );
    filter.Q.value = 0.7; // Very low resonance to avoid harshness
    
    // Configure gain envelope with very gentle attack
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + attackTime);
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
    
    // Create oscillators for a distinct exhale sound
    const primaryOsc = this.audioContext.createOscillator();
    const secondaryOsc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    // Configure oscillators with a distinctly different sound for exhale
    primaryOsc.type = 'triangle'; // Different wave type for obvious contrast
    primaryOsc.frequency.value = 165; // E3 - different note than inhale
    
    // Configure secondary oscillator
    secondaryOsc.type = 'sine';
    secondaryOsc.frequency.value = 147; // D3 - another complementary note
    
    // Configure filter with a falling pattern for exhale
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.audioContext.currentTime);
    filter.frequency.linearRampToValueAtTime(
      200, // Falling for exhale
      this.audioContext.currentTime + durationInSeconds
    );
    filter.Q.value = 0.7;
    
    // Configure gain envelope
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + attackTime);
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
