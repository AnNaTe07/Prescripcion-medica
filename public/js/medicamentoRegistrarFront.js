let unidadesArray = [];
const maxComponentes = 4;
let componenteCounter = 0;
let data;
const toggleSwitch = document.getElementById("modoFormulario");
const componentesContainerModificar = document.getElementById(
  "componentesContainerModificar"
);
const componentesContainerRegistro = document.getElementById(
  "componentesContainerRegistro"
);
const addComponenteButton = document.getElementById("addComponenteButton");
const btnRegistrar = document.getElementById("btnRegistrar");
const btnModificar = document.getElementById("btnModificar");
const inputNombreGenerico = document.getElementById("nombre");
const inputBuscar = document.getElementById("buscar");
const labeln = document.getElementById("labeln");
const h4 = document.querySelector("h4");
const formRegistro = document.querySelector(".form-row.registro");
const formModificacion = document.querySelector(".form-row.modificacion");
const estadoSelect = document.getElementById("estado");

const populateSelect = (select) => {
  unidadesArray.forEach((unidad) => {
    const option = document.createElement("option");
    option.value = unidad.id;
    option.textContent = unidad.nombre;
    select.appendChild(option);
  });
};

const populateSelects = () => {
  const unidadSelects = document.querySelectorAll("select.unidad-select");
  unidadSelects.forEach((select) => {
    select.innerHTML = "";
    unidadesArray.forEach((unidad) => {
      const option = document.createElement("option");
      option.value = unidad.id;
      option.textContent = unidad.nombre;
      select.appendChild(option);
    });
  });
};

// Función para actualizar el formulario basado en el estado del toggle switch
function actualizarFormulario() {
  limpiarForm(); // Limpia los campos del formulario

  if (toggleSwitch.checked) {
    // Modo Modificación
    h4.style.display = "none";
    labeln.style.display = "block";
    btnRegistrar.style.display = "none";
    btnModificar.style.display = "block";
    estadoSelect.disabled = false;
    inputBuscar.classList.remove("hidden");
    componentesContainerModificar.classList.remove("hidden");
    componentesContainerRegistro.classList.add("hidden");
    addComponenteButton.classList.add("hidden");
  } else {
    // Modo Registro
    h4.style.display = "block";
    labeln.style.display = "none";
    btnRegistrar.style.display = "block";
    btnModificar.style.display = "none";
    estadoSelect.disabled = true;
    inputBuscar.classList.add("hidden");
    componentesContainerModificar.classList.add("hidden");
    componentesContainerRegistro.classList.remove("hidden");
    addComponenteButton.classList.remove("hidden");
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  //formo el nombre generico
  const updateNombreGenerico = () => {
    const componentesContainer = document.querySelector(
      ".componentesContainerRegistro"
    );
    //const nombreGenericoInput = document.getElementById("nombre");
    const componentes = componentesContainer.querySelectorAll(".componente");
    let nombreGenericoParts = [];

    componentes.forEach((componente) => {
      const monodroga = componente
        .querySelector(".monodroga-input")
        .value.trim();
      const concentracion = componente.querySelector(".cantidad").value.trim();
      const unidadSelect = componente.querySelector(".unidad-select");
      const unidad =
        unidadSelect.options[unidadSelect.selectedIndex].text.trim();

      if (monodroga && concentracion && unidad) {
        let componenteText = `${monodroga} ${concentracion} ${unidad}`;

        const extraConcentraciones = componente.querySelectorAll(
          ".extra-concentracion"
        );
        extraConcentraciones.forEach((extra) => {
          const extraConcentracion = extra
            .querySelector(".cantidad")
            .value.trim();
          const extraUnidadSelect = extra.querySelector(".unidad-select");
          const extraUnidad =
            extraUnidadSelect.options[
              extraUnidadSelect.selectedIndex
            ].text.trim();

          if (extraConcentracion && extraUnidad) {
            componenteText += ` / ${extraConcentracion} ${extraUnidad}`;
          }
        });
        nombreGenericoParts.push(componenteText);
      }
    });

    if (nombreGenericoParts.length > 0) {
      inputNombreGenerico.value = nombreGenericoParts.join(" + ");
    } else {
      inputNombreGenerico.value = "";
    }
  };
  window.updateNombreGenerico = updateNombreGenerico;
  //funcion agregar concentracion
  const addConcentracion = (button) => {
    const componenteContainer = button.closest(".componente");
    if (!componenteContainer) {
      console.error("No se encontró el contenedor de componente.");
      return;
    }

    // Verificar si existe el contenedor de concentraciones
    let concentracionContainer = componenteContainer.querySelector(
      ".componentes-concentracion"
    );

    if (!concentracionContainer) {
      // Si no existe, crear el contenedor de concentraciones
      concentracionContainer = document.createElement("div");
      concentracionContainer.classList.add("componentes-concentracion");
      componenteContainer.appendChild(concentracionContainer);
    }

    // Crear nueva fila de concentración
    const newConcentracionRow = document.createElement("div");
    newConcentracionRow.classList.add("form-row", "extra-concentracion");
    newConcentracionRow.innerHTML = `
    <div class="form-group col-md-4">
      <label for="cantidad_${componenteCounter}_extra">Concentración*</label>
      <input class="form-control cantidad form-control-lg" type="number" name="cantidad_${componenteCounter}_extra" step="any" required>
    </div>
    <div class="form-group col-md-4">
      <label for="unidad_id_${componenteCounter}_extra">Unidad de medida*</label>
      <select class="form-control unidad-select form-control-lg" name="unidad_id_${componenteCounter}_extra">
        <option value=""></option>
      </select>
    </div>
    <div class="form-group col-md-2 d-flex align-items-end">
      <button class="btn btn-danger" type="button" onclick="removeConcentracion(this)"> - </button>
    </div>
  `;

    // Agregar la nueva fila al contenedor de concentraciones
    concentracionContainer.appendChild(newConcentracionRow);

    // Llenar el select de unidades de medida
    populateSelect(newConcentracionRow.querySelector(".unidad-select"));
    button.style.display = "none";
    updateNombreGenerico();

    // Escuchar cambios en los inputs de cantidad y select de unidades
    newConcentracionRow
      .querySelectorAll(".cantidad, .unidad-select")
      .forEach((input) => {
        input.addEventListener("input", updateNombreGenerico);
      });
  };
  window.addConcentracion = addConcentracion;
  //funcion agregar componente
  const addComponente = () => {
    const errorComponente = document.getElementById("errorComponente");

    if (componenteCounter >= maxComponentes) {
      errorComponente.textContent =
        "No puedes agregar más de cuatro componentes.";
      errorComponente.style.display = "block";
      return;
    }

    errorComponente.style.display = "none";

    // Buscar el contenedor correcto
    let componentesContainer = document.querySelector(
      ".componentesContainerRegistro"
    );
    if (!componentesContainer) {
      componentesContainer = document.getElementById(
        "componentesContainerRegistro"
      );
    }

    const newComponenteRow = document.createElement("div");
    newComponenteRow.classList.add("form-row", "componente");

    newComponenteRow.innerHTML = `
    <div class="form-group col-md-3">
      <label for="componente_nombre_${componenteCounter}">Monodroga*</label>
      <input class="form-control monodroga-input" id="componente_nombre_${componenteCounter}" type="text" name="componente_nombre" list="monodrogas_${componenteCounter}" required>
      <datalist id="monodrogas_${componenteCounter}"></datalist>
    </div>
    <div class="componentes-concentracion col-md-9">
      <div class="form-row">
        <div class="form-group col-md-4">
          <label for="cantidad_${componenteCounter}_1">Concentración*</label>
          <input class="form-control cantidad" type="number" name="cantidad_${componenteCounter}_1" step="any" required>
        </div>
        <div class="form-group col-md-4">
          <label for="unidad_id_${componenteCounter}_1">Unidad de medida*</label>
          <select class="form-control unidad-select" name="unidad_id_${componenteCounter}_1">
            <option value=""></option>
          </select>
        </div>
        <div class="form-group col-md-4 d-flex align-items-end">
          <button class="btn btn-primary addConcentracion btnAgregarConcentracion" type="button" onclick="addConcentracion(this)">Agregar Concentración</button>
        </div>
      </div>
    </div>
    ${
      componenteCounter > 0
        ? `<div class="form-group col-md-4 d-flex align-items-end">
            <button class="btn btn-danger" type="button" onclick="removeComponente(this)">Remover Componente</button>
          </div>`
        : ""
    }
  `;

    componentesContainer.appendChild(newComponenteRow);
    componenteCounter++;
    populateSelect(newComponenteRow.querySelector(".unidad-select"));
    setupDatalistFiltering();
    updateNombreGenerico();

    newComponenteRow
      .querySelectorAll(".monodroga-input, .cantidad, .unidad-select")
      .forEach((input) => {
        input.addEventListener("input", updateNombreGenerico);
      });
  };
  window.addComponente = addComponente;

  // Función  eliminar concentración
  function removeConcentracion(button) {
    const componenteContainer = button.closest(".componente");

    if (!componenteContainer) {
      console.error("No se encontró el contenedor de componente.");
      return;
    }

    // Buscar la fila de concentración actual para eliminarla
    const concentracionRow = button.closest(".form-row");
    if (concentracionRow) {
      concentracionRow.remove();
    } else {
      console.error("No se encontró la fila de concentración.");
      return;
    }

    // Verificar el número de concentraciones restantes
    const remainingConcentrations = componenteContainer.querySelectorAll(
      ".form-row.concentraciones-extra"
    );

    if (remainingConcentrations.length === 0) {
      // Mostrar el botón de agregar concentración si solo queda una concentración
      let addConcentracionButton = componenteContainer.querySelector(
        ".btnAgregarConcentracion"
      );
      if (!addConcentracionButton) {
        // Crear y agregar el botón de agregar concentración si no existe
        addConcentracionButton = document.createElement("button");
        addConcentracionButton.className =
          "btn btn-primary addConcentracion btnAgregarConcentracion";
        addConcentracionButton.type = "button";
        addConcentracionButton.textContent = "Agregar Concentración";
        addConcentracionButton.onclick = function () {
          addConcentracion(this);
        };

        // Encontrar el primer grupo de formulario que contiene un select de unidad
        const firstSelectGroup = componenteContainer.querySelector(
          ".form-group.col-3:nth-of-type(3)"
        );
        if (firstSelectGroup) {
          const newDiv = document.createElement("div");
          newDiv.className = "form-group col-3 d-flex align-items-end";
          newDiv.appendChild(addConcentracionButton);
          firstSelectGroup.insertAdjacentElement("afterend", newDiv);
        }
      } else {
        addConcentracionButton.style.display = "inline-block";
      }
    }

    updateNombreGenerico();
  }
  window.removeConcentracion = removeConcentracion;
  //funcion remover componente
  const removeComponente = (button) => {
    // Ocultar el mensaje de error si existe
    const errorComponente = document.getElementById("errorComponente");
    if (errorComponente) {
      errorComponente.style.display = "none";
    }

    const errorComponenteMod = document.getElementById("errorComponenteMod");
    if (errorComponenteMod) {
      errorComponenteMod.style.display = "none";
    }

    // Eliminar el componente seleccionado
    const componente = button.closest(".componente");
    if (componente) {
      componente.remove();
      componenteCounter--;
      updateNombreGenerico();
    } else {
      console.error("No se encontró el contenedor .componente");
    }

    console.log(button.closest(".componente"));
  };
  window.removeComponente = removeComponente;

  // Función de filtrado de datos
  const setupDatalistFiltering = () => {
    const monodrogaInputs = document.querySelectorAll(".monodroga-input");
    const categoriaInputs = document.querySelectorAll(".categoria-input");
    const familiaInputs = document.querySelectorAll(".familia-input");
    const formaInputs = document.querySelectorAll(".forma_farmaceutica-input");

    // Función de filtrado de datos
    const filterDatalist = (inputs, dataListId, dataListData) => {
      inputs.forEach((input) => {
        const datalistId = input.getAttribute("list");
        const datalist = document.getElementById(datalistId);

        input.addEventListener("input", () => {
          const inputValue = input.value.toLowerCase().trim();

          console.log(`Input value: ${inputValue}`);
          console.log(`Data list items:`, dataListData);

          const filteredItems = dataListData.filter((item) => {
            if (typeof item === "string") {
              return item.toLowerCase().includes(inputValue);
            } else if (typeof item === "object" && item.nombre) {
              return item.nombre.toLowerCase().includes(inputValue);
            }
            return false;
          });

          console.log(`Filtered items:`, filteredItems);

          while (datalist.firstChild) {
            datalist.removeChild(datalist.firstChild);
          }

          filteredItems.forEach((item) => {
            const option = document.createElement("option");
            option.value = typeof item === "string" ? item : item.nombre;
            datalist.appendChild(option);
          });
        });
      });
    };
    //segun la forma farmaceutica se filtra las presentaciones
    const setupFormaFarmaceuticaEvent = () => {
      formaInputs.forEach((input) => {
        input.addEventListener("change", () => {
          const selectedForma = input.value.toLowerCase().trim();

          // Verifico que data.presentaciones sea un objeto con arreglos
          if (typeof data.presentaciones === "object") {
            // Encontro el arreglo correspondiente a la forma seleccionada
            const presentacionesArray = data.presentaciones[selectedForma];

            if (
              presentacionesArray &&
              Array.isArray(presentacionesArray) &&
              presentacionesArray.length > 0
            ) {
              // Filtro opciones de datalist de presentaciones basado en la forma seleccionada
              const filteredPresentaciones = presentacionesArray.map((item) => {
                return { nombre: item.nombre };
              });

              console.log(
                `Presentaciones filtradas para ${selectedForma}:`,
                filteredPresentaciones
              );

              const presentacionInput = document.querySelector(
                ".presentacion-input"
              );
              const datalistId = presentacionInput.getAttribute("list");
              const datalist = document.getElementById(datalistId);

              // Limpio el datalist antes de agregar nuevas opciones
              while (datalist.firstChild) {
                datalist.removeChild(datalist.firstChild);
              }

              // Agrego las opciones filtradas al datalist
              filteredPresentaciones.forEach((item) => {
                const option = document.createElement("option");
                option.value = item.nombre;
                datalist.appendChild(option);
              });
            } else {
              console.error(
                "No se encontraron presentaciones para la forma seleccionada:",
                selectedForma
              );
            }
          } else {
            console.error(
              "data.presentaciones no es un objeto:",
              data.presentaciones
            );
          }
        });
      });
    };
    filterDatalist(monodrogaInputs, "monodrogas", data.monodrogas);
    filterDatalist(categoriaInputs, "categorias", data.categorias);
    filterDatalist(familiaInputs, "familias", data.familias);
    filterDatalist(formaInputs, "forma_farmaceutica", data.formas);

    setupFormaFarmaceuticaEvent();
  };
  window.setupDatalistFiltering = setupDatalistFiltering;
  // Cargar las opciones del formulario
  try {
    const response = await fetch("/medicamentos/form-options");
    const { unidades, formOptions } = await response.json();

    unidadesArray = unidades;
    data = formOptions;
    console.log("data:", data);
    console.log("unidadesArray:", unidadesArray);

    populateSelects();
    setupDatalistFiltering();

    document
      .querySelectorAll(".monodroga-input, .cantidad, .unidad-select")
      .forEach((input) => {
        input.addEventListener("input", updateNombreGenerico);
      });

    document
      .getElementById("addComponenteButton")
      .addEventListener("click", addComponente);

    addComponente();
    updateNombreGenerico();
  } catch (error) {
    console.error("Error al cargar las opciones del formulario:", error);
  }
  // Inicializo el formulario según el estado inicial del toggle switch
  actualizarFormulario();

  // ejecuto evento cuando el toggle switch cambia
  toggleSwitch.addEventListener("change", actualizarFormulario);
});
