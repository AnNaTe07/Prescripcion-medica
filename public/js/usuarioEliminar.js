document.addEventListener("DOMContentLoaded", function () {
  const estadoElement = document.getElementById("estado");
  if (buscarBtn) {
    buscarBtn.addEventListener("click", async function () {
      document.getElementById("mensajeUsuario").style.display = "none";
      if (!validarDocumento()) return;

      tipoDni = tipoDniElement.value;
      documento = documentoElement.value.trim();

      const accionElement = document.querySelector(
        'input[name="accion"]:checked'
      );
      window.accion = accionElement ? accionElement.value : "";

      // Solo proceder si la acción seleccionada es "eliminar"
      if (accion === "eliminar" && documento !== "") {
        try {
          const response = await window.buscarUsuario(tipoDni, documento);

          if (response.status === 404) {
            mostrarError(documentoElement, "Usuario no encontrado.");
            limpiarCampos();

            camposRegistroModificacion.classList.add("hidden");
            modificarBtn.style.display = "none";
          } else if (!response.ok) {
            throw new Error("Error en la respuesta del servidor");
          } else {
            const data = await response.json();
            usuarioId = data.id; // Capturo el ID del usuario
            console.log(usuarioId);

            if (data.estado === "Inactivo" && accion === "eliminar") {
              /*    mostrarError(
                documentoElement,
                "El usuario ya fue eliminado. Para volver a ingresarlo en el sistema, ingrese en 'modificar'."
              ); */
              showNotification(
                "El usuario ya fue eliminado. Para volver a ingresarlo en el sistema, ingrese en 'modificar'.",
                false
              );
              cargarDatosUsuario(data);
              soloLectura();
              document
                .getElementById("check-container")
                .classList.add("hidden");
              eliminarBtn.style.display = "none";
              modificarBtn.style.display = "none";
              return;
            }

            cargarDatosUsuario(data);
            soloLectura();

            document.getElementById("check-container").classList.add("hidden");
            eliminarBtn.style.display = "block";
            modificarBtn.style.display = "none";
          }
        } catch (error) {
          console.error("Error al buscar usuario:", error); // Mensaje de depuración
          mostrarError(documentoElement, "Error al buscar usuario.");
        }
      }
    });
  }
  if (eliminarBtn) {
    let confirmacion = false;
    eliminarBtn.addEventListener("click", async function () {
      if (!confirmacion) {
        mostrarError(estadoElement, "Por favor confirme la eliminación.");
        confirmacion = true;
      } else {
        // si se encontró el usuario
        if (window.usuarioId) {
          try {
            //solicitud fetch para cambiar el estado a "Inactivo"
            const response = await fetch(
              `/usuario/${window.usuarioId}/estado`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              throw new Error("Error al actualizar el estado del usuario.");
            }

            // Mostrar mensaje de éxito
            console.log("Estado del usuario actualizado a Inactivo.");
            showNotification("Usuario eliminado correctamente.", true);
            limpiarCampos();
            limpiarCamposModificar();
            camposRegistroModificacion.classList.add("hidden");
            eliminarBtn.style.display = "none";
          } catch (error) {
            console.error("Error al eliminar usuario:", error);
            showNotification("Error al eliminar usuario.", false);
          }
        } else {
          showNotification("No se ha seleccionado un usuario.", false);
        }
      }
    });
  }
  function soloLectura() {
    // Selecciono los campos por su ID
    const campos = ["nombre", "apellido", "email", "telefono"];

    // Recorro cada campo y aplico readonly
    campos.forEach((id) => {
      const elemento = document.getElementById(id);
      if (elemento) {
        if (elemento.tagName === "INPUT") {
          elemento.readOnly = true;
        }
      }
    }); // Deshabilitar campos <select> y <input type="date">
    ["rolUsuario", "caducidad2"].forEach((id) => {
      document.getElementById(id).disabled = true;
    });
  }
  function quitarSoloLectura() {
    const campos = ["nombre", "apellido", "email", "telefono"];
    campos.forEach((id) => {
      const elemento = document.getElementById(id);
      if (elemento) {
        if (elemento.tagName === "INPUT") {
          elemento.readOnly = false;
        }
      }
    });
    ["rolUsuario", "caducidad2"].forEach((id) => {
      document.getElementById(id).disabled = false;
    });
  }
  window.quitarSoloLectura = quitarSoloLectura;
});
