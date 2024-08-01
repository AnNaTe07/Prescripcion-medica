window.medicamentos = [];
window.prestaciones = [];
window.pacienteId = null;
window.idRefeps = null;
window.profesionalId = null;
let diagnosticoId = null;
let planId = null;
document.addEventListener("DOMContentLoaded", () => {
  // Evento click para el botón de guardar prescripción
  const diagnosticosInput = document.getElementById("diagnosticos");
  const diagnosticosDatalist = document.getElementById("listaDiagnosticos");
  const form = document.querySelector("#formulario");
  const contenedorPaciente = document.querySelector(".container-paciente");
  const errorPresc1 = document.getElementById("errorPresc1");
  const errorPresc2 = document.getElementById("errorPresc2");
  const errorPresc3 = document.getElementById("errorPresc3");
  const errorMedicamento = document.getElementById("errorMedicamento");
  const errorPrestacion = document.getElementById("errorPrestacion");
  console.log("Error 3:", errorPresc3);
  let diagnostico = null;
  let pdfUrl = null;
  // Cargo diagnósticos desde el servidor
  fetch("/prescripcion/diagnosticos")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((diagnostico) => {
        const option = document.createElement("option");
        option.value = diagnostico.descripcion;
        option.dataset.id = diagnostico.id;
        diagnosticosDatalist.appendChild(option);
      });
    })
    .catch((error) => console.error("Error obteniendo diagnósticos:", error));

  // Capturo el ID del diagnóstico seleccionado
  diagnosticosInput.addEventListener("input", function () {
    diagnostico = this.value;
    diagnosticoId = null;

    // Busco en las opciones del datalist
    Array.from(diagnosticosDatalist.options).forEach((option) => {
      if (option.value === diagnostico) {
        diagnosticoId = option.dataset.id;
      }
    });
    console.log("ID del diagnóstico seleccionado:", diagnostico);
    console.log("ID del diagnóstico seleccionado:", diagnosticoId);
  });
  /*   // limpio error paciente
  document
    .getElementById("buscarPacienteBtn")
    .addEventListener("change", function () {
      const errorPaciente = document.getElementById("errorPaciente");
      if (errorPaciente && window.pacienteId !== null) {
        errorPaciente.textContent = "";
      }
    }); */
  // limpio error obra social
  document
    .getElementById("obraSocialP")
    .addEventListener("change", function () {
      if (errorPresc1) {
        errorPresc1.textContent = "";
      }
    });
  // limpio error plan
  document
    .getElementById("planPrescripcion")
    .addEventListener("change", function () {
      if (errorPresc2) {
        errorPresc2.textContent = "";
      }
    });
  // limpio error diagnostico
  document
    .getElementById("diagnosticos")
    .addEventListener("change", function () {
      if (errorPresc3) {
        errorPresc3.textContent = "";
      }
    });
  console.log(pacienteId);
  console.log(idRefeps);
  console.log(window.datosProfesional);
  console.log(window.paciente);
  document
    .getElementById("guardar")
    .addEventListener("click", async function () {
      const obraSocialSelect = document.querySelector("#obraSocialP");
      const planSelect = document.getElementById("planPrescripcion");
      const diagnostico = diagnosticosInput.value.trim();
      const obraSocial = obraSocialSelect.value.trim();
      const plan = planSelect.value.trim();
      const enviarEmail = document.getElementById("enviarEmail").checked;
      const imprimir = document.getElementById("imprimir").checked;

      // Validar campos vacíos
      let valid = true;
      if (!obraSocial) {
        document.getElementById("errorPresc1").textContent =
          "Debe seleccionar una Obra Social.";
        valid = false;
      } else {
        errorPresc1.innerHTML = "";
      }
      if (!plan) {
        errorPresc2.innerHTML = "Debe seleccionar un Plan.";
        valid = false;
      } else {
        errorPresc2.innerHTML = "";
      }
      if (!diagnostico) {
        errorPresc3.innerHTML = "Debe seleccionar un Diagnóstico.";
        valid = false;
      } else {
        errorPresc3.innerHTML = "";
      }
      /*    if (window.pacienteId === null) {
        errorPaciente.innerHTML = "Debe seleccionar un Paciente.";
        valid = false;
      } else {
        errorPresc3.innerHTML = "";
      } */
      if (
        window.medicamentos.length === 0 &&
        window.prestaciones.length === 0
      ) {
        errorMedicamento.textContent =
          "Debe agregar al menos un medicamento o prestación.";
        // errorPrestacion.textContent =
        //"Debe agregar al menos una prestación o medicamento.";
        valid = false;
      } else {
        errorMedicamento.textContent = "";
      }

      if (!valid) {
        console.log("Validación fallida, no se envía la prescripción.");
        return;
      }

      console.log(plan);

      const vigencia = obtenerFechaVigencia();

      // Objeto de prescripción
      const prescripcion = {
        idREFEPS: window.datosProfesional.idREFEPS,
        paciente_id: window.pacienteId,
        diagnostico_id: diagnosticoId,
        plan_id: plan,
        vigencia,
        medicamentos,
        prestaciones,
        profesional: window.datosProfesional,
        paciente: window.paciente,
        diagnostico,
        //enviarEmail,
        //pacienteEmail: window.paciente.paciente_email,
      };
      console.log("Prescripción:", prescripcion);
      // Si el checkbox está marcado, envío la información del email
      if (enviarEmail) {
        prescripcion.enviarEmail = true;
        prescripcion.pacienteEmail = window.paciente.paciente_email;
      }
      try {
        // Envio la solicitud para crear la prescripción
        const response = await fetch("/prescripcion/crear", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(prescripcion),
        });
        if (!response.ok) {
          showNotification("Error al crear la prescripción", false);
        }
        // respuesta del servidor
        const result = await response.json();
        if (result.pdfPath) {
          pdfUrl = `${window.location.origin}/${result.pdfPath}`;
          console.log("PDF generado:", pdfUrl);
        }
        console.log("Prescripción creada:", result);
        window.medicamentos = [];
        window.prestaciones = [];
        mostrarMedicamentos();
        mostrarPrestaciones();
        limpiarCamposFormulario();
        if (imprimir) {
          // Imprimo el PDF
          window.open(pdfUrl, "_blank");
        }
        showNotification("Prescripción creada exitosamente", true);
      } catch (error) {
        console.error("Error al crear la prescripción:", error);
      }
    });

  // Función para obtener la fecha de vigencia
  function obtenerFechaVigencia() {
    const fechaActual = new Date();
    fechaActual.setDate(fechaActual.getDate() + 30);

    const year = fechaActual.getFullYear();
    const month = String(fechaActual.getMonth() + 1).padStart(2, "0");
    const day = String(fechaActual.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
  function showNotification(message, isSuccess) {
    const mensajeElemento = document.getElementById("mensajePrescripcion");
    mensajeElemento.textContent = message;
    mensajeElemento.style.display = "block";
    mensajeElemento.className = isSuccess
      ? "alert alert-success"
      : "alert alert-danger";
  }

  function limpiarCamposFormulario() {
    document.getElementById("documento").value = "";
    document.getElementById("dni").value = "";
    document.getElementById("obraSocialP").value = "";
    document.getElementById("planPrescripcion").value = "";
    document.getElementById("diagnosticos").value = "";
    contenedorPaciente.classList.add("hidden");
    document.querySelector(".container-paciente").classList.add("hidden");
    document.getElementById("enviarEmail").checked = false;
    document.getElementById("imprimir").checked = false;
    document.getElementById("mensajeMedicamento").style.display = "none";
    document.getElementById("mensajePrestacion").style.display = "none";
    document.querySelector(".add-medicamento").disabled = false;
    document.querySelector(".add-prestacion").disabled = false;
  }
});
