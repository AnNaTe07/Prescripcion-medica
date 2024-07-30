// función obtenerIdPrestacion
async function obtenerIdPrestacion(nombreSeleccionado) {
  try {
    const response = await fetch(`/prestacion/id/${nombreSeleccionado}`);
    if (response.ok) {
      const data = await response.json();
      return data.id;
    } else {
      console.error(
        "Error al obtener ID de prestación por nombre:",
        response.statusText
      );
      return null;
    }
  } catch (error) {
    console.error("Error al obtener ID de prestación por nombre:", error);
    return null;
  }
}

// Asigno la función al objeto global window
window.obtenerIdPrestacion = obtenerIdPrestacion;

document.addEventListener("DOMContentLoaded", function () {
  // Obtengo opciones de tipo de prestación al cargar la página
  obtenerTiposPrestacion();

  function mostrarCampos() {
    const camposOcultos = document.querySelectorAll(".prestacion-row.hidden");
    camposOcultos.forEach(function (campo) {
      campo.classList.remove("hidden");
    });

    // Ocultar botón agregar y mostrar botón confirmar
    botonAgregarPrestacion.style.display = "none";
    botonConfirmarPrestacion.style.display = "inline-block";
    botonRemoverPrestacion.style.display = "inline-block";
  }

  function ocultarCampos() {
    const camposVisibles = document.querySelectorAll(
      ".prestacion-row:not(.hidden)"
    );
    camposVisibles.forEach(function (campo) {
      campo.classList.add("hidden");
    });
    nombrePrestacionInput.value = "";

    inputJustificacion.value = "";
    inputIndicacion.value = "";
    inputPosicion.value = "";

    // Mostrar botón agregar y ocultar botón confirmar
    botonAgregarPrestacion.style.display = "inline-block";
    botonConfirmarPrestacion.style.display = "none";
    botonRemoverPrestacion.style.display = "none";
  }
  function limpiarCamposP() {
    document.getElementById("tipoPrestacion").selectedIndex = 0; // Reset select
    document.getElementById("nombrePrestacion").value = ""; // Clear input
    document.getElementById("posiciones").value = ""; // Clear input
    document.getElementById("indicaciones").value = ""; // Clear input
    document.getElementById("justificaciones").value = ""; // Clear input

    // Clear error messages
    document.getElementById("errorTipo").textContent = "";
    document.getElementById("errorNombre").textContent = "";
    document.getElementById("errorIndicacion").textContent = "";
    document.getElementById("errorJustificacion").textContent = "";
  }
  window.limpiarCamposP = limpiarCamposP;
  const botonAgregarPrestacion = document.querySelector(".add-prestacion");
  const botonRemoverPrestacion = document.querySelector(".min-prestacion");
  const botonConfirmarPrestacion = document.querySelector(
    ".confirmarPrestacion"
  );

  if (botonRemoverPrestacion) {
    botonRemoverPrestacion.addEventListener("click", function () {
      ocultarCampos();
    });
  }

  if (botonAgregarPrestacion) {
    botonAgregarPrestacion.addEventListener("click", function () {
      mostrarCampos();
    });
  }

  const tipoPrestacionSelect = document.getElementById("tipoPrestacion");
  const datalistNombres = document.getElementById("nombresPrestacion");
  const inputPosicion = document.getElementById("posiciones");
  const inputJustificacion = document.getElementById("justificaciones");
  const inputIndicacion = document.getElementById("indicaciones");

  let nombresPrestacionCache = [];

  async function obtenerNombresPrestacionPorTipo(tipoSeleccionado) {
    try {
      const response = await fetch(
        `/obtenerNombresPrestacionPorTipo/${tipoSeleccionado}`
      );
      const nombresPrestacion = await response.json();
      console.log("Nombres de prestación recibidos:", nombresPrestacion);

      // Limpiar datalist de nombres de prestación
      datalistNombres.innerHTML = "";

      // Agregar nombres de prestación al datalist
      nombresPrestacion.forEach((nombre) => {
        const option = document.createElement("option");
        option.value = nombre.nombre;
        option.id = nombre.id;
        datalistNombres.appendChild(option);
      });

      // Actualizar cache de nombres de prestación
      nombresPrestacionCache = nombresPrestacion.map((nombre) => nombre.nombre);
    } catch (error) {
      console.error("Error al obtener nombres de prestación por tipo:", error);
    }
  }

  tipoPrestacionSelect.addEventListener("change", async function () {
    const tipoSeleccionado = tipoPrestacionSelect.value;
    console.log("Tipo de prestación seleccionado:", tipoSeleccionado);

    // Limpiar los campos de entrada relacionados
    nombrePrestacionInput.value = "";

    inputJustificacion.value = "";
    inputIndicacion.value = "";
    inputPosicion.value = "";

    if (tipoSeleccionado) {
      await obtenerNombresPrestacionPorTipo(tipoSeleccionado);
    }
  });

  const nombrePrestacionInput = document.getElementById("nombrePrestacion");
  let prestacionSeleccionadaId = null;

  console.log("Input de nombre de prestación:", nombrePrestacionInput);

  nombrePrestacionInput.addEventListener("input", async function (event) {
    const nombreSeleccionado = event.target.value.trim();
    console.log("Nombre seleccionado:", nombreSeleccionado);
    if (nombreSeleccionado) {
      try {
        const response = await fetch(
          `/obtenerOpcionesRelacionadasPorNombre/${nombreSeleccionado}`
        );
        const opcionesRelacionadas = await response.json();
        console.log(opcionesRelacionadas);

        // Limpiar los inputs
        inputPosicion.value = "";
        inputJustificacion.value = "";
        inputIndicacion.value = "";

        // Llenar los inputs con las opciones relacionadas
        if (opcionesRelacionadas.posiciones.length > 0) {
          inputPosicion.value = opcionesRelacionadas.posiciones[0].nombre;
        }
        if (opcionesRelacionadas.justificaciones.length > 0) {
          inputJustificacion.value =
            opcionesRelacionadas.justificaciones[0].nombre;
        }
        if (opcionesRelacionadas.indicaciones.length > 0) {
          inputIndicacion.value = opcionesRelacionadas.indicaciones[0].nombre;
        }
        // Asignar el ID de la prestación seleccionada
        const prestacion = opcionesRelacionadas.prestacion;
        prestacionSeleccionadaId = prestacion ? prestacion.id : null;
      } catch (error) {
        console.error("Error al obtener opciones relacionadas:", error);
      }
    }
  });
});
