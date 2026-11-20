import { Turbo } from "@hotwired/turbo-rails"
import Swal from "sweetalert2"

// Every data-turbo-confirm in the app opens this dialog instead of the browser's own.
// A form can name its confirm button with data-confirm-label="Finish".
// Messages that start with "Delete" get the red button and the warning icon.
function ask(message, element, submitter) {
  const danger = /^delete/i.test(message)
  const label =
    (submitter && submitter.dataset.confirmLabel) ||
    (element && element.dataset && element.dataset.confirmLabel) ||
    (danger ? "Delete" : "Yes, continue")

  return Swal.fire({
    title: message,
    icon: danger ? "warning" : "question",
    showCancelButton: true,
    confirmButtonText: label,
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: danger,
    buttonsStyling: false,
    customClass: {
      popup: "swal-popup",
      title: "swal-title",
      actions: "swal-actions",
      confirmButton: danger ? "btn btn-danger" : "btn btn-accent",
      cancelButton: "btn btn-outline-secondary"
    }
  }).then((result) => result.isConfirmed)
}

// Turbo 8.0.13+ reads Turbo.config.forms.confirm, older versions use setConfirmMethod
if (Turbo.config && Turbo.config.forms) {
  Turbo.config.forms.confirm = ask
} else {
  Turbo.setConfirmMethod(ask)
}
