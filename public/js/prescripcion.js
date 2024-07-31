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
  console.log(pacienteId);
  console.log(idRefeps);
  console.log(window.datosProfesional);
  console.log(window.paciente);
  document
    .getElementById("guardar")
    .addEventListener("click", async function () {
      //console.log(window.datosProfesional);
      //console.log(window.paciente);
      //console.log(window.paciente.paciente_email);
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
        //mostrarError(obraSocialP, "Obra Social es requerida.");
        document.getElementById("errorPresc1").textContent =
          "Obra Social es requerida.";
        valid = false;
      } else {
        errorPresc1.innerHTML = "";
      }
      if (!plan) {
        errorPresc2.innerHTML = "Plan es requerido.";
        valid = false;
      } else {
        errorPresc2.innerHTML = "";
      }
      if (!diagnostico) {
        errorPresc3.innerHTML = "Diagnóstico es requerido.";
        valid = false;
      } else {
        errorPresc3.innerHTML = "";
      }

      if (!valid) {
        return;
      }

      console.log(plan);

      const vigencia = obtenerFechaVigencia();

      // Objeto de prescripción
      const prescripcion = {
        idREFEPS: window.idREFEPS,
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
  }
});
