// Generated this with Claude and ChatGPT
// I'm not really well versed at sound synthesis,
// yet alone in WebAudio, but this is decent enought
export default class SoundPlayer {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.isPlaying = false;
    this.currentNodes = [];

    // Master volume
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.setValueAtTime(5, this.audioContext.currentTime);

    // Reverb
    this.reverbNode = this.#createReverb();
    this.reverbNode.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);
  }

  playInhaleSound(duration) {
    this.stopCurrentSound();
    const dur = duration / 1000;
    this.#createAmbientPad(130, dur, -0.2);
    this.#createSoftNoise(dur);
  }

  playExhaleSound(duration) {
    this.stopCurrentSound();
    const dur = duration / 1000;
    this.#createAmbientPad(100, dur, 0.2);
    this.#createSoftNoise(dur);
  }

  playHoldSound(duration) {
    this.stopCurrentSound();

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const durationInSeconds = duration / 1000;

    const bufferSize = ctx.sampleRate * durationInSeconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut = 0.98 * lastOut + 0.02 * white) * 0.1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.Q.value = 0.6;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 1);
    gain.gain.linearRampToValueAtTime(0, now + durationInSeconds);

    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(0, now);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(this.reverbNode);

    noiseSource.start(now);
    noiseSource.stop(now + durationInSeconds);

    this.currentNodes.push(noiseSource, filter, gain, panner);
  }

  stopCurrentSound() {
    this.currentNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.currentNodes = [];
    this.isPlaying = false;
  }

  resumeAudio() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setVolume(level) {
    this.masterGain.gain.setTargetAtTime(level, this.audioContext.currentTime, 0.05);
  }

  #createReverb(duration = 5) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.8);
      }
    }

    const convolver = this.audioContext.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }

  #createAmbientPad(baseFreq = 120, duration = 6, pan = 0) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const end = now + duration;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const panner = ctx.createStereoPanner();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.detune.value = (Math.random() - 0.5) * 10;

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);

    lfo.frequency.value = 0.05;
    lfoGain.gain.value = 80;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(now);
    lfo.stop(end);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 1.5);
    gain.gain.linearRampToValueAtTime(0, end);

    panner.pan.setValueAtTime(pan, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(this.reverbNode);

    osc.start(now);
    osc.stop(end);

    this.currentNodes.push(osc, gain, filter, panner, lfo, lfoGain);
  }

  #createSoftNoise(duration = 6) {
    const ctx = this.audioContext;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut = 0.98 * lastOut + 0.02 * white) * 0.2;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.reverbNode);

    noiseSource.start();
    noiseSource.stop(ctx.currentTime + duration);

    this.currentNodes.push(noiseSource, filter, gain);
  }
}
