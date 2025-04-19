import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "minCircle",
    "maxCircle",
    "progressCircle",
    "overlay",
    "instruction",
    "timer"
  ]
  static values = {
    min: { type: Number, default: 0.25 },
    steps: { type: Array },
    autostart: { type: Boolean, default: false },
  }

  // ease-out is more satisfying but throws off pacing
  // linear feels "artificial" or robotic but is better for pacing
  ANIMATION_SMOOTHING = "linear"

  PREPARATION_MESSAGE = "Get ready..."
  PREPARATION_DURATION = 3000
  PREPARATION_SMOOTHING = "ease-out"

  INITIAL_OVERLAY_TAP_MESSAGE = "Tap to start"
  INITIAL_OVERLAY_MOUSE_MESSAGE = "Click to start"

  connect() {
    this.running = false
    this.animations = []
    this.preparationTimeout = null
    this.countdownInterval = null
    this.timer = null
    this.holdTimeout = null

    this.overlayTarget.textContent = this.initialOverlayMessage

    if (this.autostartValue) {
      this.start()
    }
  }

  disconnect() {
    this.stop()
  }

  toggle() {
    if (this.running) {
      this.stop()
    } else {
      this.start()
    }
  }

  start() {
    this.running = true

    this.instructionTarget.textContent = this.PREPARATION_MESSAGE
    this.overlayTarget.textContent = ""

    const minCircleAnimation = this.minCircleTarget.animate([
      { transform: "scale(1)" },
      { transform: `scale(${this.minValue})` }
    ], {
      duration: this.PREPARATION_DURATION,
      easing: this.PREPARATION_SMOOTHING
    })

    this.animations.push(minCircleAnimation)

    let callback = () => {
      this.minCircleTarget.style.transform = `scale(${this.minValue})`
      this.animations = this.animations.filter(a => a !== minCircleAnimation)
    }

    minCircleAnimation.onfinish = callback
    minCircleAnimation.oncancel = callback

    if (this.stepsValue[0].action === "inhale") {
      const progressCircleAnimation = this.progressCircleTarget.animate([
        { transform: "scale(1)" },
        { transform: `scale(${this.minValue})` }
      ], {
        duration: this.PREPARATION_DURATION,
        easing: this.PREPARATION_SMOOTHING
      })

      this.animations.push(progressCircleAnimation)

      let callback = () => {
        this.progressCircleTarget.style.transform = `scale(${this.minValue})`
        this.animations = this.animations.filter(a => a !== progressCircleAnimation)
      }

      progressCircleAnimation.onfinish = callback
      progressCircleAnimation.oncancel = callback
    }

    this.preparationTimeout = setTimeout(() => {
      this.#runAnimation()
      this.#startTimer()
    }, this.PREPARATION_DURATION)
  }

  stop() {
    this.running = false

    if (this.preparationTimeout) {
      clearTimeout(this.preparationTimeout)
      this.preparationTimeout = null
    }

    if (this.holdTimeout) {
      clearTimeout(this.holdTimeout)
      this.holdTimeout = null
    }

    this.#stopTimer()

    this.animations.forEach(animation => {
      animation.cancel()
    })
    this.animations = []

    setTimeout(() => {
      this.minCircleTarget.style.removeProperty("transform")
      this.progressCircleTarget.style.removeProperty("transform")
    }, 0)

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
      this.countdownInterval = null
    }

    this.timerTarget.textContent = ""
    this.instructionTarget.textContent = ""
    this.overlayTarget.textContent = this.initialOverlayMessage
  }

  async #startTimer() {
    this.timerTarget.textContent = "00:00"
    this.startedAt = Date.now()
    this.timer = setInterval(() => {
      const elapsedTime = Date.now() - this.startedAt
      const elapsedSeconds = Math.floor(elapsedTime / 1000)
      const elapsedMinutes = Math.floor(elapsedSeconds / 60)
      const timeString = `${elapsedMinutes.toString().padStart(2, "0")}:${(elapsedSeconds % 60).toString().padStart(2, "0")}`

      this.timerTarget.textContent = timeString
    }, 1000)
  }

  async #stopTimer() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    this.startedAt = null
  }

  async #runAnimation() {
    let currentStepIndex = 0

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

      if (step.action === "hold") {
        if (this.holdTimeout) {
          clearTimeout(this.holdTimeout)
          this.holdTimeout = null
        }

        this.holdTimeout = setTimeout(() => {
          if (this.countdownInterval) {
            clearInterval(this.countdownInterval)
            this.countdownInterval = null
          }

          resolve()
        }, duration)

        return
      }

      let targetScale = null

      if (step.action === "inhale") {
        targetScale = 1
      } else if (step.action === "exhale") {
        targetScale = this.minValue
      } else {
        throw new Error(`Unknown action: ${step.action}`)
      }

      const animation = this.progressCircleTarget.animate([
        { transform: this.progressCircleTarget.style.transform || `scale(${step.action === "inhale" ? this.minValue : 1})` },
        { transform: `scale(${targetScale})` }
      ], {
        duration: duration,
        easing: this.ANIMATION_SMOOTHING
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

    const instructionText = `${actionText}${orificeText}`
    const remainingTimeText = `${remainingTime}`

    if (this.instructionTarget.textContent !== instructionText) {
      this.instructionTarget.textContent = instructionText
    }

    if (this.overlayTarget.textContent !== remainingTimeText) {
      this.overlayTarget.textContent = remainingTimeText
    }
  }

  get initialOverlayMessage() {
    if (this.hasMouse) {
      return this.INITIAL_OVERLAY_MOUSE_MESSAGE
    } else {
      return this.INITIAL_OVERLAY_TAP_MESSAGE
    }
  }

  get hasMouse() {
    return window.matchMedia("(hover: hover)").matches
  }
}
