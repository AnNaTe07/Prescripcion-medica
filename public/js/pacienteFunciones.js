window.paciente = null;
document.addEventListener("DOMContentLoaded", () => {
  if (window.pacienteId === undefined) {
    window.pacienteId = null;
  }
  console.log("Archivo paciente.js cargado correctamente");

  const modificarBtn = document.getElementById("modificarBtn");
  const registrarPacienteBtn = document.getElementById("registrarPacienteBtn");
  const modificarPacienteBtn = document.getElementById("modificarPacienteBtn");

  const sexoInput = document.getElementById("sexoInput");
  const obraSocialInput = document.getElementById("obraSocialInput");
  const planInput = document.getElementById("planInput");
  const sexoSelect = document.getElementById("sexo");
  const obraSocialSelect = document.getElementById("obraSocial");
  const planSelect = document.getElementById("planPaciente");
  console.log(planSelect);
  const datosPacienteForm = document.getElementById("datosPacienteForm");

  // Función para sincronizar el select con el input
  function syncSelectWithInput(select, inputValue) {
    for (const option of select.options) {
      if (option.textContent.trim() === inputValue.trim()) {
        select.value = option.value;
        break;
      }
    }
  }

  //**********FUNCION BUSCAR PACIENTE **********************/
  document
    .getElementById("buscarPacienteBtn")
    .addEventListener("click", async () => {
      const tipoDniInput = document.querySelector(".tipoDniSelect");
      const documentoInput = document.getElementById("documento");
      const tipoDni = tipoDniInput.value.trim();
      const documento = documentoInput.value.trim();

      document.querySelector(".container-paciente").classList.remove("hidden");
      let isValid = true;

      document.getElementById("errorDni").textContent = "";
      document.getElementById("errorDocumento").textContent = "";

      if (!tipoDni) {
        document.getElementById("errorDni").textContent =
          "El tipo de DNI es requerido.";
        tipoDniInput.focus();
        isValid = false;
      }

      if (!documento) {
        document.getElementById("errorDocumento").textContent =
          "El número de documento es requerido.";
        if (isValid) {
          documentoInput.focus();
        }
        isValid = false;
      }

      if (!isValid) {
        return;
      }

      console.log("Buscando paciente...");

      try {
        const response = await fetch(
          `/pacientes/buscar?tipoDni=${tipoDni}&documento=${documento}`
        );

        if (!response.ok) {
          // console.log("Error en la búsqueda del paciente79.");
          throw new Error("Error en la búsqueda del paciente.");
        }

        const data = await response.json();
        // console.log("Datos del paciente:", data);

        // Verifica si los datos esperados están presentes antes de actualizar el DOM
        if (data.paciente_id) {
          console.log("Paciente encontrado:", data.paciente_id);
          window.pacienteId = data.paciente_id;
          console.log("ID del paciente:", window.pacienteId);
          window.paciente = data;
          console.log("paciente:", window.paciente);
          modificarBtn.style.display = "inline";
          registrarPacienteBtn.style.display = "none";
          modificarPacienteBtn.style.display = "none";

          // Mostrar los datos del paciente y ocultar el mensaje de no encontrado
          document.getElementById("datosPacienteForm").style.display = "block";
          document.getElementById("mensaje").style.display = "none";
          // Actualiza los campos del formulario
          document.getElementById("nombre").value = data.persona_nombre || "";
          document.getElementById("apellido").value =
            data.persona_apellido || "";

          const fechaNacimiento = data.persona_fecha_nacimiento
            ? new Date(data.persona_fecha_nacimiento)
            : null;
          console.log(fechaNacimiento);
          if (fechaNacimiento && !isNaN(fechaNacimiento)) {
            document.getElementById("fecha_nacimiento").value = fechaNacimiento
              .toISOString()
              .split("T")[0];
          } else {
            document.getElementById("fecha_nacimiento").value = "";
          }

          sexoInput.value = data.persona_sexo_nombre || "";
          sexoSelect.value = data.persona_sexo_id;
          obraSocialInput.value = data.obra_social_nombre || "";
          obraSocialSelect.value = data.obra_social_id;

          const event = new Event("change");
          obraSocialSelect.dispatchEvent(event);

          console.log("124", obraSocialSelect.value);

          // Crear una nueva opción
          const nuevaOpcion = document.createElement("option");
          nuevaOpcion.value = data.plan_id; // Asignar el valor del plan_id como valor de la opción
          nuevaOpcion.textContent = data.plan_nombre; // Asignar el nombre del plan como texto de la opción

          // Agregar la nueva opción al select de planes
          planSelect.appendChild(nuevaOpcion);
          // Intenta forzar una actualización visual
          planSelect.dispatchEvent(new Event("change"));

          // Verificar si la opción ya existe en el select
          let planOptionExists = false;
          for (const option of planSelect.options) {
            if (option.value === data.plan_id) {
              planOptionExists = true;
              break;
            }
          }
          // Después de cargar los datos del paciente
          planSelect.value = data.plan_id;
          console.log("123", planSelect.value);
          // Recorrer todas las opciones del select
          for (const option of planSelect.options) {
            console.log("Valor:", option.value, "Texto:", option.textContent);
          }
          // Si la opción no existe, agregarla al select
          if (!planOptionExists) {
            const nuevaOpcion = document.createElement("option");
            nuevaOpcion.value = data.plan_id;
            nuevaOpcion.textContent = data.plan_nombre;
            planSelect.appendChild(nuevaOpcion);
          }
          planInput.value = data.plan_nombre || ""; // Asigna el nombre del plan al input
          //planSelect.value = data.plan_id; // Establece el valor del select como el plan_id

          // Recorrer todas las opciones del select
          for (const option of planSelect.options) {
            console.log("Valor:", option.value, "Texto:", option.textContent);
          }

          document.getElementById("email").value = data.paciente_email || "";
          document.getElementById("telefono").value =
            data.persona_telefono || "";
          console.log("pacienteId", data.plan_nombre);
          //syncSelectWithInput(planSelect, data.plan_nombre);

          //syncSelectWithInput(sexoSelect, data.persona_sexo_nombre);
          //syncSelectWithInput(obraSocialSelect, data.obra_social_nombre);
          Array.from(
            document.querySelectorAll("#datosPacienteForm input")
          ).forEach((input) => {
            input.setAttribute("readonly", true);
          });

          sexoInput.style.display = "block";
          obraSocialInput.style.display = "block";
          planInput.style.display = "block";
          sexoSelect.style.display = "none";
          obraSocialSelect.style.display = "none";
          planSelect.style.display = "none";
        } else {
          // Paciente no encontrado
          console.log("Paciente no encontrado.");

          document.getElementById("datosPacienteForm").style.display = "block";
          document.getElementById("mensaje").style.display = "block";
          document.getElementById("mensaje").innerText =
            "Paciente no encontrado. Puede registrarlo.";

          Array.from(
            document.querySelectorAll(
              "#datosPacienteForm input, #datosPacienteForm select"
            )
          ).forEach((input) => {
            input.removeAttribute("readonly");
            input.value = "";
          });

          sexoInput.style.display = "none";
          obraSocialInput.style.display = "none";
          planInput.style.display = "none";
          sexoSelect.style.display = "block";
          obraSocialSelect.style.display = "block";
          planSelect.style.display = "block";

          registrarPacienteBtn.style.display = "inline";
          modificarBtn.style.display = "none";
          modificarPacienteBtn.style.display = "none";
        }
      } catch (error) {
        console.error("Error al buscar paciente:", error);
      }
    });
  //**********FUNCION MODIFICAR PARA ACTIVAR CAMPOS******** */
  modificarBtn.addEventListener("click", () => {
    if (modificarBtn.textContent === "Modificar") {
      /*   const currentPlanValue = planInput.value;
      const currentObraSocialValue = obraSocialInput.value;
      const currentSexoValue = sexoInput.value; */
      console.log("Modificar Paciente clicado");
      Array.from(document.querySelectorAll("#datosPacienteForm input")).forEach(
        (input) => {
          input.removeAttribute("readonly");
        }
      );
      // Recorrer todas las opciones del select
      for (const option of planSelect.options) {
        console.log("Valor:", option.value, "Texto:", option.textContent);
      }

      sexoInput.style.display = "none";
      obraSocialInput.style.display = "none";
      planInput.style.display = "none";
      sexoSelect.style.display = "block";
      obraSocialSelect.style.display = "block";
      planSelect.style.display = "block";
      syncSelectWithInput(planSelect, planInput.value);

      modificarBtn.textContent = "Cancelar";
      modificarPacienteBtn.style.display = "inline";
    } else {
      console.log("Cancelar Modificación clicado");
      Array.from(document.querySelectorAll("#datosPacienteForm input")).forEach(
        (input) => {
          input.setAttribute("readonly", true);
        }
      );

      sexoInput.style.display = "block";
      obraSocialInput.style.display = "block";
      planInput.style.display = "block";
      sexoSelect.style.display = "none";
      obraSocialSelect.style.display = "none";
      planSelect.style.display = "none";

      modificarBtn.textContent = "Modificar";
      modificarPacienteBtn.style.display = "none";
    }
  });
  //***************FUNCION MODIFICAR PACIENTE */
  function showNotification(message, isSuccess) {
    const mensajeElemento = document.getElementById("mensajeModificar");
    mensajeElemento.textContent = message;
    mensajeElemento.style.display = "block";
    mensajeElemento.className = isSuccess
      ? "alert alert-success"
      : "alert alert-danger";
  }
  // Función para ocultar el mensaje de notificación
  function hideNotification() {
    const mensajeElemento = document.getElementById("mensajeModificar");
    mensajeElemento.style.display = "none";
  }

  // Agregar eventos a todos los botones para ocultar el mensaje de notificación
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", hideNotification);
  });
  modificarPacienteBtn.addEventListener("click", async () => {
    //console.log("Modificar Paciente - Guardar cambios clicado");
    // Obtener el valor seleccionado del select de obra social
    const obraSocialSelect = document.getElementById("obraSocial");
    const obraSocialId = obraSocialSelect.value;
    const planSelect = document.getElementById("planPaciente");
    const planId = planSelect.value;
    console.log("ID del paciente:", window.pacienteId);

    const pacienteData = {
      id: window.pacienteId,
      nombre: document.getElementById("nombre").value,
      apellido: document.getElementById("apellido").value,
      fecha_nacimiento: document.getElementById("fecha_nacimiento").value,
      sexo: parseInt(document.getElementById("sexo").value),
      email: document.getElementById("email").value,
      telefono: document.getElementById("telefono").value,
      plan_id: parseInt(planId),
      //obra_social: obraSocialId,
    };
    //pacienteId = pacienteData;
    // window.pacienteId = pacienteData.id;
    console.log("Datos del paciente a guardar:", pacienteData);
    console.log("pacienteid", window.pacienteId);

    try {
      const response = await fetch(
        `/pacientes/modificar/${window.pacienteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pacienteData),
        }
      );

      if (!response.ok) {
        throw new Error("Error al modificar el paciente.");
      }

      showNotification("Paciente modificado con éxito.", true);

      const result = await response.json();
      console.log("Resultado de la modificación:", result);

      modificarBtn.textContent = "Modificar";
      modificarBtn.style.display = "inline";
      modificarPacienteBtn.style.display = "none";

      Array.from(document.querySelectorAll("#datosPacienteForm input")).forEach(
        (input) => {
          input.setAttribute("readonly", true);
        }
      );

      sexoInput.style.display = "block";
      obraSocialInput.style.display = "block";
      planInput.style.display = "block";
      sexoSelect.style.display = "none";
      obraSocialSelect.style.display = "none";
      planSelect.style.display = "none";
    } catch (error) {
      console.error("Error al modificar el paciente:", error);
      showNotification("Hubo un error al modificar el paciente.", false);
    }
  });
  //***********FUNCION REGISTRAR PACIENTE */
  document
    .getElementById("registrarPacienteBtn")
    .addEventListener("click", async () => {
      const pacienteData = {
        tipoDni: parseInt(document.getElementById("dni").value),
        documento: parseInt(document.getElementById("documento").value),
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        fecha_nacimiento: document.getElementById("fecha_nacimiento").value,
        sexo: parseInt(document.getElementById("sexo").value),
        email: document.getElementById("email").value,
        telefono: parseInt(document.getElementById("telefono").value),
        obra_social: parseInt(document.getElementById("obraSocial").value),
        plan: parseInt(document.getElementById("planPaciente").value),
      };

      console.log("Datos del paciente a registrar:", pacienteData);

      try {
        const response = await fetch("/pacientes/registrar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(pacienteData),
        });

        if (!response.ok) {
          throw new Error("Error al registrar el paciente.");
        }

        const responseData = await response.json();
        console.log("Respuesta del servidor:", responseData);

        // obtengo personaId desde la respuesta del servidor
        window.pacienteId = responseData.personaId;
        console.log("ID del paciente registrado:", window.pacienteId);

        showNotification("Paciente registrado con éxito.", true);
        // Oculto el botón "Registrar Paciente"
        document.getElementById("registrarPacienteBtn").style.display = "none";
        document.getElementById("mensaje").style.display = "none";
      } catch (error) {
        console.error("Error al registrar el paciente:", error);
        showNotification("Hubo un error al registrar el paciente.", false);
      }
    });
});
