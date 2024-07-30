window.modificarBtn = document.querySelector("#modificarBtn");
window.eliminarBtn = document.querySelector("#eliminarBtn");
window.mensajeUsuario = document.getElementById("mensajeUsuario");

document.addEventListener("DOMContentLoaded", function () {
  const contrasena = document.getElementById("contrasena").value;
  const confirmarContrasena = document.getElementById(
    "confirmarContrasena"
  ).value;
  const radioButtons = document.querySelectorAll('input[name="accion"]');
  //const camposComunes = document.getElementById("camposComunes");
  const camposProfesional = document.getElementById("camposProfesional");
  const camposRegistroModificacion = document.getElementById(
    "camposRegistroModificacion"
  );
  const caducidad = document.getElementById("caducidad2");
  const estado = document.getElementById("estado");
  const check = document.getElementById("togglePassword");
  const seleccion = document.querySelector(
    'input[name="accion"]:checked'
  ).value;
  console.log(seleccion);
  function actualizarFormularioInicio() {
    limpiarCampos();
    limpiarErrores();
    registroBtn.style.display = "none";
    modificarBtn.style.display = "none";
    eliminarBtn.style.display = "none";
    // Ocultar los campos adicionales
    camposProfesional.classList.add("hidden");
    camposRegistroModificacion.classList.add("hidden");
    mensajeUsuario.classList.add("hidden");

    // Mostrar campos adicionales según la opción seleccionada

    /* if (seleccion === "registrar" || seleccion === "modificar") {
      camposRegistroModificacion.style.display = "block";
    }
    if (seleccion === "modificar") {
      camposProfesional.style.display = "block";
    } */
  }

  // Asignar el evento change a todos los radio buttons
  radioButtons.forEach((button) => {
    button.addEventListener("change", actualizarFormularioInicio);
  });
  //busca usuario por tipo_dni y documento
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

      // Solo proceder si la acción seleccionada es "modificar"
      if (accion === "modificar" && documento !== "") {
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
            /*  tipoDniElement.disabled = true;
            documentoElement.readOnly = true;
 */
            const data = await response.json();
            usuarioId = data.id; // Captura el ID del usuario
            console.log(usuarioId);
            quitarSoloLectura();
            cargarDatosUsuario(data);
          }
        } catch (error) {
          console.error("Error al buscar usuario:", error); // Mensaje de depuración
          mostrarError(documentoElement, "Error al buscar usuario.");
        }
      }
    });
  }

  modificarBtn.addEventListener("click", async () => {
    const data = {
      nombre: document.getElementById("nombre").value,
      apellido: document.getElementById("apellido").value,
      email: document.getElementById("email").value,
      telefono: document.getElementById("telefono").value,
      rol: document.getElementById("rolUsuario").value,
      caducidad: document.getElementById("caducidad2").value,
      estado: "Activo",
      id: usuarioId,
    };

    // Solo añadir contraseñas si no están vacías
    if (contrasena && confirmarContrasena && validarContrasenas()) {
      data.password = contrasena;
      data.confirmarContrasena = confirmarContrasena;
    }

    console.log(data);

    try {
      //  fetch para modificar el usuario
      const response = await fetch(`/usuario/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error en la actualización del usuario");
      }

      const result = await response.json();

      //  mensaje de éxito
      showNotification("Modificación exitosa.", true);
      console.error(result.message);
      limpiarCamposModificar();
      camposRegistroModificacion.classList.add("hidden");
      modificarBtn.style.display = "none";
    } catch (error) {
      // mensaje de error
      showNotification("No se realizaron los cambios", false);
      console.error(error.message);
    }
  });
  function cargarDatosUsuario(data) {
    // Limpiar los campos
    limpiarCamposModificar();
    // Llenar los campos con la información del usuario
    document.getElementById("nombre").value = data.nombre || "";
    document.getElementById("apellido").value = data.apellido || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("telefono").value = data.telefono || "";
    document.getElementById("rolUsuario").value = data.rol || "";
    estado.value = data.estado || "";
    console.log(data.rol);
    document.getElementById("contrasena-container").classList.add("hidden");
    document
      .getElementById("confirmarContrasena-container")
      .classList.add("hidden");

    document.getElementById("estado-container2").classList.add("hidden");
    /*  document.getElementById("contrasena").readOnly = true;
    document.getElementById("confirmarContrasena").readOnly = true; */
    // Mostrar u ocultar campos específicos basados en el rol del usuario
    if (data.rol === "profesional" || data.rol === "admin_profesional") {
      // convierto la fecha en formato ISO a formato YYYY-MM-DD
      const fechaCaducidad = new Date(data.caducidad);
      const fechaFormato = fechaCaducidad.toISOString().split("T")[0]; // obtengo solo la parte de la fecha

      // Asignar el valor al campo de entrada
      caducidad.value = fechaFormato || "";
      document
        .getElementById("caducidad-container2")
        .classList.remove("hidden");
      document.getElementById("estado-container").classList.remove("hidden");
      document.getElementById("check-container").classList.remove("hidden");
    } else {
      camposProfesional.classList.add("hidden");
    }
    // Mostrar botón de modificar
    modificarBtn.style.display = "block";
  }
  window.cargarDatosUsuario = cargarDatosUsuario;
  function limpiarCamposModificar() {
    camposRegistroModificacion.classList.remove("hidden");
    //camposProfesional.classList.remove("hidden");

    // Limpia los campos del formulario
    document.getElementById("nombre").value = "";
    document.getElementById("apellido").value = "";
    document.getElementById("email").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("contrasena").value = "";
    document.getElementById("confirmarContrasena").value = "";
    document.getElementById("rolUsuario").value = "";
    caducidad.value = "";
    estado.value = "";

    // Ocultar botón de modificar
    modificarBtn.style.display = "none";
  }
  window.limpiarCamposModificar = limpiarCamposModificar;
  //funcion para mostrar/ocultar contraseña
  check.addEventListener("change", function () {
    if (check.checked) {
      document
        .getElementById("contrasena-container")
        .classList.remove("hidden");
      document
        .getElementById("confirmarContrasena-container")
        .classList.remove("hidden");
    } else {
      document.getElementById("contrasena-container").classList.add("hidden");
      document
        .getElementById("confirmarContrasena-container")
        .classList.add("hidden");
      document.getElementById("contrasena").value = "";
      document.getElementById("confirmarContrasena").value = "";
    }
  });
});
