import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "minCircle", "maxCircle", "progressCircle", "overlay" ]
  static values = {
    min: { type: Number, default: 0.25 },
    steps: { type: Array },
    autoStart: { type: Boolean, default: false },
  }

  ANIMATION_SMOOTHING = "ease-out"
  PREPARATION_MESSAGE = "Get ready..."

  connect() {
    this.running = false
    this.animations = []
    this.countdownInterval = null

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

    if (this.hasOverlayTarget) {
      this.overlayTarget.textContent = this.PREPARATION_MESSAGE
    }

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

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
      this.countdownInterval = null
    }

    if (this.hasOverlayTarget) {
      this.overlayTarget.textContent = ""
    }

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
      const startTime = Date.now()
      let remainingTime = step.duration

      this.#updateOverlayText(step, remainingTime)

      if (this.countdownInterval) {
        clearInterval(this.countdownInterval)
      }

      this.countdownInterval = setInterval(() => {
        const elapsedMs = Date.now() - startTime
        remainingTime = Math.max(0, step.duration - Math.floor(elapsedMs / 1000))

        this.#updateOverlayText(step, remainingTime)

        if (remainingTime <= 0 || !this.running) {
          clearInterval(this.countdownInterval)
          this.countdownInterval = null
        }
      }, 100)

      let targetScale = null

      if (step.action === "inhale") {
        targetScale = 1
      } else if (step.action === "exhale") {
        targetScale = this.minValue
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
        easing: step.action === "hold" ? "linear" : this.ANIMATION_SMOOTHING
      })

      this.animations.push(animation)

      animation.onfinish = () => {
        this.animations = this.animations.filter(a => a !== animation)
        this.progressCircleTarget.style.transform = `scale(${targetScale})`

        if (this.countdownInterval) {
          clearInterval(this.countdownInterval)
          this.countdownInterval = null
        }

        resolve()
      }

      animation.oncancel = () => {
        this.animations = this.animations.filter(a => a !== animation)

        if (this.countdownInterval) {
          clearInterval(this.countdownInterval)
          this.countdownInterval = null
        }

        resolve()
      }
    })
  }

  #updateOverlayText(step, remainingTime) {
    if (!this.hasOverlayTarget) return

    let actionText = ""
    switch (step.action) {
      case "inhale":
        actionText = "Breathe In"
        break
      case "exhale":
        actionText = "Breathe Out"
        break
      case "hold":
        actionText = "Hold"
        break
      default:
        actionText = step.action
    }

    let orificeText = ""
    if (step.orifice && step.orifice !== "none") {
      orificeText = ` through your ${step.orifice}`
    }

    this.overlayTarget.innerHTML = `
      <div>${actionText}${orificeText}</div>
      <div class="countdown">${remainingTime}</div>
    `
  }
}
