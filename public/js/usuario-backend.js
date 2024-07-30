document.addEventListener("DOMContentLoaded", function () {
  window.registroBtn = document.getElementById("registroBtn");
  document.getElementById("registroBtn").addEventListener("click", async () => {
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const tipoDniId = document.getElementById("tipoDni").value;
    const documento = document.getElementById("documento").value;
    //const domicilioId = document.getElementById("domicilioId").value;
    const telefono = document.getElementById("telefono").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("contrasena").value;

    const rol = document.getElementById("rolUsuario").value;
    // Obtener el ID de localidad del data attribute
    const localidadInput = document.getElementById("localidad");
    const localidad_id = localidadInput.dataset.id;

    const fecha_nacimiento = null;
    const sexoId = null;
    // Datos profesionales
    const profesion =
      rol === "profesional" || rol === "admin_profesional"
        ? document.getElementById("profesion").value
        : null;
    const matricula =
      rol === "profesional" || rol === "admin_profesional"
        ? document.getElementById("matricula").value
        : null;
    const caducidad =
      rol === "profesional" || rol === "admin_profesional"
        ? document.getElementById("caducidad").value
        : null;
    const idREFEPS =
      rol === "profesional" || rol === "admin_profesional"
        ? document.getElementById("refeps").value
        : null;

    console.log(codigo_pais);
    console.log(especialidad_id);

    // Validar campos del formulario
    const esValido = validarYEnviarFormulario();
    // Si no es válido, detener el registro
    if (!esValido) {
      return;
    }
    // Construyo el objeto `body` para la solicitud `fetch`
    const body = {
      nombre,
      apellido,
      tipoDniId,
      documento,
      telefono,
      email,
      password,
      rol,
      fecha_nacimiento,
      sexoId,
    };
    // Agrego datos adicionales solo si el rol es profesional o admin_profesional
    if (rol === "profesional" || rol === "admin_profesional") {
      Object.assign(body, {
        domicilio: {
          calle: document.getElementById("calle").value,
          numero: document.getElementById("numero").value,
          piso: document.getElementById("piso").value,
          departamento: document.getElementById("depto").value,
          localidad_id,
          cp: document.getElementById("cp").value,
          provincia: document.getElementById("provincia").value,
        },
        profesion,
        especialidad_id,
        matricula,
        caducidad,
        idREFEPS,
        codigo_pais,
      });
    }
    //registrar usuario
    try {
      const response = await fetch("/usuario/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      console.log("Respuesta del servidor:", result);
      if (result.success) {
        showNotification("Usuario registrado exitosamente", true);
        limpiarCampos();
        limpiarCamposProfesional();
        document.querySelector("#registroBtn").style.display = "none";
        camposRegistroModificacion.classList.add("hidden");
        camposProfesional.classList.add("hidden");
      } else {
        console.log("entro al else");
        showNotification("Error al registrar usuario", false);
        limpiarCampos();
        limpiarCamposProfesional();
        camposRegistroModificacion.classList.add("hidden");
        camposProfesional.classList.add("hidden");
      }
    } catch (error) {
      console.log("entro al catch");
      console.error("Error:", error);
      showNotification("Error al registrar usuario", false);
      limpiarCampos();
      limpiarCamposProfesional();
      camposRegistroModificacion.classList.add("hidden");
      camposProfesional.classList.add("hidden");
    }
  });
  function showNotification(message, isSuccess) {
    mensajeUsuario.textContent = message;
    mensajeUsuario.classList.remove("hidden");
    mensajeUsuario.style.display = "block";
    mensajeUsuario.className = isSuccess
      ? "alert alert-success"
      : "alert alert-danger";
  }

  function hideNotification() {
    mensajeUsuario.style.display = "none";
  }
  window.hideNotification = hideNotification;
  window.showNotification = showNotification;
});
