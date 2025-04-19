export default class Vibrator {
  constructor() {
    this.isSupported = 'vibrate' in navigator
  }

  inhale(duration) {
    if (!this.isSupported) return

    this.stop()

    const pulseCount = 5;
    const pattern = [];
    const timePerPulse = duration / pulseCount

    for (let i = 0; i < pulseCount; i++) {
      const vibrationTime = 20 + (i * 10)
      pattern.push(vibrationTime)

      if (i < pulseCount - 1) {
        pattern.push(timePerPulse - vibrationTime)
      }
    }

    navigator.vibrate(pattern)
  }

  exhale(duration) {
    if (!this.isSupported) return

    this.stop()

    const pulseCount = 5
    const pattern = []

    const timePerPulse = duration / pulseCount

    for (let i = 0; i < pulseCount; i++) {
      const vibrationTime = 60 - (i * 10)
      pattern.push(vibrationTime)

      if (i < pulseCount - 1) {
        pattern.push(timePerPulse - vibrationTime)
      }
    }

    navigator.vibrate(pattern)
  }

  stop() {
    if (!this.isSupported) return

    navigator.vibrate(0)
  }
}
