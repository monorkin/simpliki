// Import and register all your controllers from the importmap via controllers/**/*_controller
import { application } from "controllers/application"
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading"
eagerLoadControllersFrom("controllers", application)

document.addEventListener("turbo:before-visit", (event) => {
  const currentPath = window.location.pathname
  const destinationPath = new URL(event.detail.url).pathname

  if (currentPath === destinationPath) {
    document.documentElement.setAttribute("data-same-page-visit", "true");
  } else {
    document.documentElement.removeAttribute("data-same-page-visit");
  }
});
