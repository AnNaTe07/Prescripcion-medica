document.addEventListener("DOMContentLoaded", () => {
  console.log("Archivo medicamentoFront.js cargado correctamente");
  // const inputNombreGenerico = document.getElementById("nombre");
  const datalistNombreGenerico = document.getElementById("nombreGenericoList");
  unidadesArray;
  console.log("unidades", unidadesArray);

  function limpiarForm() {
    document.getElementById("medicamentoForm").reset();
    // Limpiar el contenedor de componentes para el modo de modificación
    componentesContainerModificar.classList.add("hidden");

    // Limpiar el contenedor de componentes para el modo de registro
    //componentesContainerRegistro.innerHTML = "";
    componentesContainerModificar.classList.add("hidden");
    if (inputBuscar) {
      inputBuscar.value = "";
    }

    // Seleccionar los campos dentro de componentesContainerModificar y limpiarlos
    const camposAResetear = document.querySelectorAll(
      ".form-row.componentesContainerModificar .form-control"
    );

    camposAResetear.forEach((campo) => {
      if (campo.tagName === "SELECT") {
        campo.selectedIndex = 0; // Reiniciar a la primera opción
      } else {
        campo.value = ""; // Limpiar el valor del campo de entrada
      }
    });
  }
  window.limpiarForm = limpiarForm;
  function addEventListenersToComponentes() {
    const concentraciones = document.querySelectorAll(".cantidad");
    const unidades = document.querySelectorAll(".unidad-select");

    concentraciones.forEach((input) => {
      input.addEventListener("input", updateNombreGenerico);
    });

    unidades.forEach((select) => {
      select.addEventListener("change", updateNombreGenerico);
    });
  }
  function limpiarComponentes() {
    const componentesContainerModificar = document.getElementById(
      "componentesContainerModificar"
    );
    if (componentesContainerModificar) {
      componentesContainerModificar.innerHTML = "";
    }
    while (componentesContainerModificar.firstChild) {
      componentesContainerModificar.removeChild(
        componentesContainerModificar.firstChild
      );
    }
  }
  window.limpiarComponentes = limpiarComponentes;
  function obtenerOpcionesUnidades(unidadSeleccionadaId) {
    let opcionesHTML = "";
    unidadesArray.forEach((unidad) => {
      opcionesHTML += `
    <option value="${unidad.id}" ${
        unidad.id === unidadSeleccionadaId ? "selected" : ""
      }>
      ${unidad.nombre}
    </option>`;
    });
    return opcionesHTML;
  }
  function llenarComponentes(componentes) {
    let componentesContainerModificar = document.getElementById(
      "componentesContainerModificar"
    );

    // Limpiar el contenido anterior del contenedor
    componentesContainerModificar.innerHTML = "";

    // Procesar los componentes agrupados
    const agrupados = componentes.reduce((acc, componente) => {
      const { monodroga, unidadSeleccionadaId, concentraciones } = componente;
      const existente = acc.find((c) => c.monodroga === monodroga);

      if (existente) {
        existente.concentraciones.push({
          cantidad: parseFloat(concentraciones),
          unidadSeleccionadaId,
        });
      } else {
        acc.push({
          ...componente,
          concentraciones: [
            {
              cantidad: parseFloat(concentraciones),
              unidadSeleccionadaId,
            },
          ],
        });
      }
      return acc;
    }, []);

    // Generar el HTML dinámico para cada componente y sus concentraciones
    agrupados.forEach((componente, index) => {
      const { monodroga, concentraciones } = componente;

      let componenteHTML = `
    <div class="form-row componente" id="componente_${index}" data-index="${index}">
      <div class="form-group col-3">
        <label for="monodroga_${index}">Monodroga</label>
        <input type="text" class="form-control monodroga-input" name="monodroga_${index}" value="${monodroga}" required, readonly>
      </div>
      <div class="form-group col-3">
        <label for="cantidad_${index}_0">Concentración</label>
        <input type="number" class="form-control cantidad" name="cantidad_${index}_0" value="${
        concentraciones[0].cantidad
      }" step="any" required>
      </div>
      <div class="form-group col-3">
        <label for="unidad_id_${index}_0">Unidad de medida</label>
        <select class="form-control unidad-select" name="unidad_id_${index}_0" required>
          <option value="">Seleccionar...</option>
          ${obtenerOpcionesUnidades(concentraciones[0].unidadSeleccionadaId)}
        </select>
      </div>`;

      concentraciones.slice(1).forEach((conc, cIndex) => {
        componenteHTML += `
      <div class="form-row concentraciones-extra">
        <div class="form-group col-4 align-self-end">
          <label for="cantidad_${index}_${cIndex + 1}">Concentración</label>
          <input type="number" class="form-control cantidad" name="cantidad_${index}_${
          cIndex + 1
        }" value="${conc.cantidad}" step="any" required>
        </div>
        <div class="form-group col-4 align-self-end">
          <label for="unidad_id_${index}_${cIndex + 1}">Unidad de medida</label>
          <select class="form-control unidad-select" name="unidad_id_${index}_${
          cIndex + 1
        }" required>
            <option value="">Seleccionar...</option>
            ${obtenerOpcionesUnidades(conc.unidadSeleccionadaId)}
          </select>
      `;
      });

      componentesContainerModificar.insertAdjacentHTML(
        "beforeend",
        componenteHTML
      );
      console.log(`HTML generado para el componente ${index}:`);
      console.log(componenteHTML);
    });
    // Actualizar componenteCounter para reflejar el número actual de componentes
    componenteCounter = agrupados.length;
    addEventListenersToComponentes();
  }
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
            // Concatenate all details to show in the datalist
            option.value = `${item.nombre_generico} ${
              item.nombre_comercial || ""
            } ${item.forma_farmaceutica || ""} ${
              item.presentacion || ""
            }`.trim();
            option.dataset.id = item.id;
            option.dataset.nombreGenerico = item.nombre_generico;
            option.dataset.concentraciones = item.concentraciones || "";
            option.dataset.formaFarmaceutica = item.forma_farmaceutica || "";
            option.dataset.presentacion = item.presentacion || "";
            datalistNombreGenerico.appendChild(option);
          });
        })
        .catch((error) =>
          console.error("Error al buscar nombres genéricos:", error)
        );
    }
  });

  // funcion para cuando se selecciona un nombre genérico
  inputBuscar.addEventListener("change", function () {
    const selectedValue = inputBuscar.value.trim().toLowerCase();
    console.log("Selected value:", selectedValue);

    // Comparar valores después de eliminar espacios adicionales y convertir a minúsculas
    const selectedOption = Array.from(
      datalistNombreGenerico.querySelectorAll("option")
    ).find((option) => option.value.trim().toLowerCase() === selectedValue);

    console.log("Selected option:", selectedOption);

    if (selectedOption) {
      const medicamentoId = selectedOption.dataset.id;
      console.log("Medicamento ID", medicamentoId);

      if (medicamentoId) {
        fetch(`/medicamentos/buscarPorId/${medicamentoId}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Error al obtener detalles del medicamento");
            }
            return response.json();
          })
          .then((medicamento) => {
            console.log("Medicamento recibido:", medicamento);
            if (!medicamento) {
              throw new Error("No se encontró el medicamento");
            }
            // Actualizar los campos del formulario

            componentesContainerModificar.classList.remove("hidden");
            document.getElementById("nombre").value =
              medicamento.nombre_generico;
            document.getElementById("medicamentoId").value = medicamento.id;
            document.getElementById("estado").value = medicamento.estado || "";
            document.getElementById("categoria").value =
              medicamento.categoria_medicamento?.nombre || "";
            document.getElementById("familia").value =
              medicamento.familia_medicamento?.nombre || "";
            document.getElementById("forma_farmaceutica").value =
              medicamento.forma_farmaceutica?.nombre || "";
            document.getElementById("nombre_comercial").value =
              medicamento.nombre_comercial?.nombre || "";
            document.getElementById("presentacion").value =
              medicamento.presentacion?.nombre || "";

            // Limpiar y llenar dinámicamente los campos de componentes y concentraciones
            limpiarComponentes();
            llenarComponentes(medicamento.componentes);
          })
          .catch((error) => {
            console.error("Error al obtener detalles del medicamento:", error);
            mostrarModalM(
              "Error al obtener detalles del medicamento. Verifica el nombre e intenta de nuevo."
            );
          });
      } else {
        console.error("No se encontró el ID del medicamento en la selección.");
      }
    } else {
      console.error("No se encontró la opción seleccionada en el datalist.");
    }
  });
});
