const botonAgregar = document.querySelector(".add-medicamento");
const botonRemover = document.querySelector(".min-medicamento");
const botonConfirmar = document.querySelector(".confirmarM");

document.addEventListener("DOMContentLoaded", function () {
  fetchData("dosis", "dosiss");
  fetchData("tiempo", "tiempos");
  fetchData("duracion", "duracions");
  function mostrarCampos() {
    console.log("Mostrar Campos");
    const camposOcultos = document.querySelectorAll(".medicamento-row.hidden");
    camposOcultos.forEach(function (campo) {
      campo.classList.remove("hidden");
    });

    botonAgregar.style.display = "none";
    botonConfirmar.style.display = "inline-block";
    botonRemover.style.display = "inline-block";
  }

  function ocultarCampos() {
    console.log("Ocultar Campos");
    const camposVisibles = document.querySelectorAll(
      ".medicamento-row:not(.hidden)"
    );
    camposVisibles.forEach(function (campo) {
      campo.classList.add("hidden");
    });

    botonAgregar.style.display = "inline-block";
    botonConfirmar.style.display = "none";
    botonRemover.style.display = "none";
  }
  window.ocultarCampos = ocultarCampos;
  if (botonRemover) {
    botonRemover.addEventListener("click", ocultarCampos);
  }

  if (botonAgregar) {
    botonAgregar.addEventListener("click", mostrarCampos);
  }

  const inputBuscar = document.querySelector("#nomgen");
  const datalistNombreGenerico = document.querySelector("#nombres");
  const inputNombreComercial = document.querySelector("#nomcom");
  const inputMedicamentoId = document.querySelector("#medicamentoId");

  //funcion para buscar nombre generico
  inputBuscar.addEventListener("input", function () {
    const terminoABuscar = inputBuscar.value.trim();

    if (terminoABuscar.length >= 3) {
      const encodedTermino = encodeURIComponent(terminoABuscar);
      fetch(`/medicamentos/buscar?q=${encodedTermino}`)
        .then((response) => response.json())
        .then((data) => {
          datalistNombreGenerico.innerHTML = "";
          data.forEach((item) => {
            const option = document.createElement("option");
            // concatena los datos para mostrar en el datalist
            option.value = `${item.nombre_generico} ${
              item.forma_farmaceutica || ""
            } ${item.presentacion || ""} ${item.nombre_comercial || ""}`;
            option.dataset.id = item.id;
            option.dataset.nombreGenerico = item.nombre_generico;
            //option.dataset.concentraciones = item.concentraciones || "";
            option.dataset.formaFarmaceutica = item.forma_farmaceutica || "";
            option.dataset.presentacion = item.presentacion || "";
            option.dataset.nombreComercial = item.nombre_comercial || "";
            datalistNombreGenerico.appendChild(option);
          });
        })
        .catch((error) =>
          console.error("Error al buscar nombres genéricos:", error)
        );
    }
  });
  //agrego el id del medicamento en el input oculto
  inputBuscar.addEventListener("change", function () {
    const selectedOption = Array.from(datalistNombreGenerico.options).find(
      (option) => option.value === inputBuscar.value
    );

    if (selectedOption) {
      inputMedicamentoId.value = selectedOption.dataset.id;
      console.log(inputMedicamentoId.value);
    } else {
      inputMedicamentoId.value = ""; // Resetea el campo oculto si no hay una opción válida seleccionada
    }
  });
  //selecciono el nombre generico, forma y presentacion
  inputBuscar.addEventListener("change", function () {
    const selectedOption = Array.from(
      datalistNombreGenerico.querySelectorAll("option")
    ).find((option) => option.value === inputBuscar.value);

    if (selectedOption) {
      // Actualiza los input con los datos del medicamento seleccionado
      inputBuscar.value =
        selectedOption.dataset.nombreGenerico +
        " " +
        selectedOption.dataset.formaFarmaceutica +
        " " +
        selectedOption.dataset.presentacion;
      inputNombreComercial.value = selectedOption.dataset.nombreComercial || "";
    }
  });
  //input y datalist para dosis, intervalo_tiempo y duracion
  const datalistDosis = document.querySelector("#dosiss");

  const datalistTiempo = document.querySelector("#tiempos");

  const datalistDuracion = document.querySelector("#duracions");

  // fetch para opciones de dosis, tiempo y duracion
  function fetchData(endpoint, datalistId) {
    fetch(`/medicamentos/${endpoint}`)
      .then((response) => response.json())
      .then((data) => {
        const datalist = document.getElementById(datalistId);
        data.forEach((item) => {
          const option = document.createElement("option");
          option.value = item.nombre;
          option.dataset.id = item.id;
          datalist.appendChild(option);
        });
      })
      .catch((error) => console.error(`Error al buscar ${endpoint}:`, error));
  }

  //capturo id de dosis, tiempo, duracion
  document.querySelectorAll("input[list]").forEach((input) => {
    input.addEventListener("input", function () {
      const datalist = document.getElementById(this.getAttribute("list"));
      const selectedOption = Array.from(datalist.options).find(
        (option) => option.value === this.value
      );

      if (selectedOption) {
        const inputId = this.getAttribute("id");
        const idValue = selectedOption.dataset.id;

        if (inputId === "dosis") {
          document.getElementById("dosisId").value = idValue;
        } else if (inputId === "tiempo") {
          document.getElementById("tiempoId").value = idValue;
        } else if (inputId === "duracion") {
          document.getElementById("duracionId").value = idValue;
        }

        // Llamar a la función para actualizar el ID de administración
        updateAdministrationId();
      }
    });
  });
  //formo id de administracion
  function updateAdministrationId() {
    const dosisId = document.getElementById("dosisId").value;
    const tiempoId = document.getElementById("tiempoId").value;
    const duracionId = document.getElementById("duracionId").value;

    // Concatenar los IDs solo si todos tienen un valor
    if (dosisId && tiempoId && duracionId) {
      const administracionId = `${dosisId}${tiempoId}${duracionId}`;
      document.getElementById("administracion").value = administracionId;
      console.log(`Administración ID: ${administracionId}`);
    }
  }
});
