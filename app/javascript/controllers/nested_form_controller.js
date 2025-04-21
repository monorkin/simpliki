import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "container", "template", "record" ]

  connect() {
    console.log("Ahoy!")
  }

  addRecord(event) {
    debugger
    const id = new Date().getTime()
    const html = this.templateTarget.innerHTML.replace(/NEW_RECORD/g, id)

    this.containerTarget.insertAdjacentHTML("afterbegin", html)
  }

  removeRecord(event) {
    const container = event.target.closest(`[data-${this.identifier}-target="record"]`)

    if (container.dataset.persisted === "true") {
      const destroyInput = container.querySelector("input[name$=\"[_destroy]\"]")

      if (destroyInput) {
        destroyInput.value = "1"
      }

      container.classList.add("hidden")
    } else {
      container.remove()
    }
  }
}
