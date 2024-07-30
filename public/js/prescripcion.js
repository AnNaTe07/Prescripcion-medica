window.medicamentos = [];
window.prestaciones = [];
window.pacienteId = null;
window.idRefeps = null;
window.profesionalId = null;
let diagnosticoId = null;
let planId = null;
//const { pdf } = window.pdf;
document.addEventListener("DOMContentLoaded", function () {
  // Evento click para el botón de guardar prescripción
  const diagnosticosInput = document.getElementById("diagnosticos");
  const diagnosticosDatalist = document.getElementById("listaDiagnosticos");
  const form = document.querySelector("#formulario");
  const contenedorPaciente = document.querySelector(".container-paciente");
  let diagnostico = null;
  let pdfUrl = null;
  // Cargar diagnósticos desde el servidor
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

  // Capturar el ID del diagnóstico seleccionado
  diagnosticosInput.addEventListener("input", function () {
    diagnostico = this.value;
    diagnosticoId = null;

    // Buscar en las opciones del datalist
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
      console.log(window.datosProfesional);
      console.log(window.paciente);
      /*     const enviarEmail = document.getElementById("enviarEmail").checked;
      const imprimir = document.getElementById("imprimir").checked;

      const obraSocial = document.getElementById("obraSocialpres").value;
      const plan = document.getElementById("plans").value;
      const diagnostico = document.getElementById("diagnosticos").value;

      //generarPDF();
      if (enviarEmail) {
        const email = "toony1717@hotmail.com";
        const pdfData = doc.output("dataurlstring");
        try {
          const response = await fetch("/sendEmail", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, pdfData }),
          });
          const data = await response.json();
          alert("Email enviado exitosamente");
        } catch (error) {
          console.error("Error al enviar el email:", error);
        }
      }

      if (imprimir) {
        doc.autoPrint();
        window.open(doc.output("bloburl"), "_blank");
      } */
      //console.log("ID del diagnóstico seleccionado:", diagnosticoId);

      // console.log(profesionalId);
      //console.log(diagnosticoId);
      const plan = document.getElementById("planPrescripcion").value;
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
      };

      try {
        // Enviar la solicitud para crear la prescripción
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
        // Manejar la respuesta del servidor
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
          // Imprimir el PDF
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
    const checkboxes = form.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach((checkbox) => (checkbox.checked = false));
  }
});
