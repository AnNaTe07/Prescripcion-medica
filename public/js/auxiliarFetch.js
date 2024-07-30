document.addEventListener("DOMContentLoaded", function () {
  // Fetch tipos de DNI
  fetch("/aux/tipos-dni")
    .then((response) => response.json())
    .then((data) => {
      const tipoDniSelects = document.querySelectorAll(".tipoDniSelect");
      tipoDniSelects.forEach((select) => {
        data.forEach((tipoDni) => {
          const option = document.createElement("option");
          option.value = tipoDni.id;
          option.textContent = tipoDni.nombre;
          select.appendChild(option);
        });
      });
    })
    .catch((error) => console.error("Error obteniendo tipos de DNI:", error));

  // Fetch sexos
  fetch("/aux/sexos")
    .then((response) => response.json())
    .then((data) => {
      const sexoSelects = document.querySelectorAll(".sexoSelect");
      sexoSelects.forEach((select) => {
        data.forEach((sexo) => {
          const option = document.createElement("option");
          option.value = sexo.id;
          option.textContent = sexo.nombre;
          select.appendChild(option);
        });
      });
    })
    .catch((error) => console.error("Error obteniendo sexos:", error));

  // Fetch obras sociales

  fetch("/aux/obras-sociales")
    .then((response) => response.json())
    .then((data) => {
      const obraSocialSelects = document.querySelectorAll(".obraSocialSelect");
      obraSocialSelects.forEach((select) => {
        data.forEach((obraSocial) => {
          const option = document.createElement("option");
          option.value = obraSocial.id;
          option.textContent = obraSocial.nombre;
          select.appendChild(option);
        });

        // Agregar event listener para cargar planes según obra social seleccionada
        select.addEventListener("change", function () {
          cargarPlanes(select.value);
        });
      });
    })
    .catch((error) => console.error("Error obteniendo obras sociales:", error));
  /* 
  fetch("/aux/diagnosticos")
    .then((response) => response.json())
    .then((data) => {
      const diagnosticosDatalist = document.getElementById("listaDiagnosticos");
      data.forEach((diagnostico) => {
        const option = document.createElement("option");
        option.value = diagnostico.descripcion;
        option.dataset.id = diagnostico.id;
        diagnosticosDatalist.appendChild(option);
      });
    })
    .catch((error) => console.error("Error obteniendo diagnósticos:", error)); */

  /*   fetch("/aux/diagnosticos")
    .then((response) => response.json())
    .then((data) => {
      const diagnosticosDatalist = document.getElementById("listaDiagnosticos");
      data.forEach((diagnostico) => {
        const option = document.createElement("option");
        option.value = diagnostico.descripcion;
        diagnosticosDatalist.appendChild(option);
      });
    })
    .catch((error) => console.error("Error obteniendo diagnósticos:", error));
    */
});
function cargarPlanes(obraSocialId) {
  fetch(`/aux/planes?obraSocialId=${obraSocialId}`)
    .then((response) => response.json())
    .then((data) => {
      const planSelects = document.querySelectorAll(".planSelect");
      planSelects.forEach((select) => {
        // Limpiar opciones anteriores
        select.innerHTML = '<option value="">Seleccione un plan</option>';
        data.forEach((plan) => {
          const option = document.createElement("option");
          option.value = plan.id;
          option.textContent = plan.nombre;
          select.appendChild(option);
        });
      });
    })
    .catch((error) => console.error("Error obteniendo planes:", error));
}
function obtenerTiposPrestacion() {
  fetch("/aux/obtenerTiposPrestacion")
    .then((response) => response.json())
    .then((data) => {
      const tiposPrestacionSelect = document.querySelector(
        ".tipo_prestacionSelect"
      );
      console.log("Tipos de prestación recibidos:", data);

      // Limpiar opciones anteriores
      tiposPrestacionSelect.innerHTML =
        '<option value="">Seleccione un plan</option>';

      data.forEach((tipo_prestacion) => {
        const option = document.createElement("option");
        option.value = tipo_prestacion.id;
        option.textContent = tipo_prestacion.nombre;
        tiposPrestacionSelect.appendChild(option);
      });
    })
    .catch((error) =>
      console.error("Error al obtener tipos de prestación:", error)
    );
}
