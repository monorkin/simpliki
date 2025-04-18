import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "minCircle", "maxCircle", "progressCircle", "overlay" ]
  static values = {
    min: { type: Number, default: 0.25 },
    steps: { type: Array },
    autoStart: { type: Boolean, default: false },
  }

  connect() {
    this.running = false
    this.animations = []

    if (this.autoStartValue) {
      this.start()
    }
  }

  toggle() {
    if (this.running) {
      this.stop()
    } else {
      this.start()
    }
  }

  start() {
    const prepTime = 3000

    this.running = true

    const minCircleAnimation = this.minCircleTarget.animate([
      { transform: "scale(1)" },
      { transform: `scale(${this.minValue})` }
    ], {
      duration: prepTime,
      fill: "forwards",
      easing: "ease-out"
    })
    this.animations.push(minCircleAnimation)

    const progressCircleAnimation = this.progressCircleTarget.animate([
      { transform: "scale(1)" },
      { transform: `scale(${this.minValue})` }
    ], {
      duration: prepTime,
      fill: "forwards",
      easing: "ease-out"
    })

    this.animations.push(progressCircleAnimation)

    minCircleAnimation.onfinish = () => {
      this.minCircleTarget.style.transform = `scale(${this.minValue})`
      this.animations = this.animations.filter(a => a !== minCircleAnimation)
    }

    progressCircleAnimation.onfinish = () => {
      this.progressCircleTarget.style.transform = `scale(${this.minValue})`
      this.animations = this.animations.filter(a => a !== progressCircleAnimation)
    }

    setTimeout(() => {
      this.#runAnimation()
    }, prepTime)
  }

  stop() {
    this.running = false

    this.animations.forEach(animation => {
      if (animation) animation.cancel()
    })
    this.animations = []

    this.minCircleTarget.style.setProperty("transform", "scale(1)")
    this.progressCircleTarget.style.setProperty("transform", "scale(1)")
  }

  async #runAnimation() {
    if (!this.running) return

    let currentStepIndex = 0

    if (!this.hasStepsValue || this.stepsValue.length === 0) {
      return
    }

    while (this.running) {
      const step = this.stepsValue[currentStepIndex]
      await this.#animateStep(step)
      currentStepIndex = (currentStepIndex + 1) % this.stepsValue.length
    }
  }

  async #animateStep(step) {
    return new Promise(resolve => {
      const duration = step.duration * 1000

      let targetScale = null

      if (step.action === "inhale") {
        targetScale = 1 // Expand to full size
      } else if (step.action === "exhale") {
        targetScale = this.minValue // Contract to minimum size
      } else if (step.action === "hold") {
        targetScale = parseFloat(this.progressCircleTarget.style.transform.replace(/[^0-9.]/g, '')) || 1
      } else {
        throw new Error(`Unknown action: ${step.action}`)
      }

      const animation = this.progressCircleTarget.animate([
        { transform: this.progressCircleTarget.style.transform || `scale(${step.action === "inhale" ? this.minValue : 1})` },
        { transform: `scale(${targetScale})` }
      ], {
        duration: duration,
        fill: "forwards",
        easing: step.action === "hold" ? "linear" : "ease-out"
      })

      this.animations.push(animation)

      animation.onfinish = () => {
        this.animations = this.animations.filter(a => a !== animation)
        this.progressCircleTarget.style.transform = `scale(${targetScale})`
        resolve()
      }

      animation.oncancel = () => {
        this.animations = this.animations.filter(a => a !== animation)
        resolve()
      }
    })
  }
}
