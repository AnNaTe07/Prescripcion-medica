document.addEventListener("DOMContentLoaded", function () {
  const botonAgregarP = document.querySelector(".add-prestacion");
  const botonConfirmarP = document.querySelector(".confirmarPrestacion");
  const contenedorPrestaciones = document.getElementById(
    "contenedor-prestaciones"
  );
  const listaPrestaciones = document.createElement("div");
  contenedorPrestaciones.appendChild(listaPrestaciones);
  const modalError = document.getElementById("modalError");
  const mensajeError = document.getElementById("mensajeError");
  const MAX_PRESTACIONES = 3;
  window.prestaciones = [];

  botonAgregarP.addEventListener("click", function () {
    mostrarCampos();
  });

  botonConfirmarP.addEventListener("click", function () {
    agregarPrestacionAlContenedor();
    ocultarCampos();
  });

  // Evento change para tipo de prestación
  document
    .getElementById("tipoPrestacion")
    .addEventListener("change", function () {
      const errorNombreElemento = document.getElementById("errorNombre");
      if (errorNombreElemento) {
        errorNombreElemento.textContent = "";
      }
    });

  // Evento change para nombre de prestación
  document
    .getElementById("nombrePrestacion")
    .addEventListener("change", function () {
      const errorNombreElemento = document.getElementById("errorNombre");
      if (errorNombreElemento) {
        errorNombreElemento.textContent = "";
      }
    });

  function agregarPrestacionAlContenedor() {
    const tipoPrestacionElement = document.getElementById("tipoPrestacion");
    const tipoPrestacion = tipoPrestacionElement.value.trim();
    const nombrePrestacion = document
      .getElementById("nombrePrestacion")
      .value.trim();
    const indicacion = document.getElementById("indicaciones").value.trim();
    const justificacion = document
      .getElementById("justificaciones")
      .value.trim();
    const posicion = document.getElementById("posiciones").value.trim();
    const tipoPrestacionNombre =
      tipoPrestacionElement.options[
        tipoPrestacionElement.selectedIndex
      ].text.trim();

    if (!tipoPrestacion) {
      mostrarError("Por favor selecciona un tipo de prestación.", "errorTipo");
      return;
    }

    if (!nombrePrestacion) {
      mostrarError(
        "Por favor ingresa el nombre de la prestación.",
        "errorNombre"
      );
      return;
    }

    // Verificar si la combinación ya existe
    const prestacionExistente = prestaciones.find(
      (p) =>
        p.tipoPrestacion === tipoPrestacion &&
        p.nombrePrestacion === nombrePrestacion
    );

    if (prestacionExistente) {
      limpiarCamposP();
      mostrarError(
        "Esta combinación de tipo y nombre de prestación ya fue agregada.",
        "errorNombre"
      );

      return;
    }

    // Hacer una solicitud al servidor para obtener el ID de la prestación seleccionada
    obtenerIdPrestacion(nombrePrestacion)
      .then((idPrestacion) => {
        // Agregar la prestación al arreglo con su respectivo ID
        prestaciones.push({
          id: idPrestacion,
          tipoPrestacion,
          nombrePrestacion,
          indicacion,
          justificacion,
          posicion,
          tipoPrestacionNombre,
        });

        // Mostrar las prestaciones en el contenedor
        mostrarPrestaciones();

        // Log para verificar la prestación agregada
        console.log("Prestación agregada:", {
          id: idPrestacion,
          tipoPrestacion,
          nombrePrestacion,
          indicacion,
          justificacion,
          posicion,
          tipoPrestacionNombre,
        });

        console.log("Prestaciones:", prestaciones);
        if (prestaciones.length >= MAX_PRESTACIONES) {
          showNotification(
            "Se ha alcanzado el número máximo de prestaciones.",
            false
          );
          botonAgregarP.disabled = true;
        }
      })
      .catch((error) => {
        console.error("Error al obtener ID de prestación:", error);
        mostrarError("Error al obtener ID de prestación.", "errorId");
      });
  }

  function mostrarPrestaciones() {
    listaPrestaciones.innerHTML = "";

    prestaciones.forEach((prestacion, index) => {
      const prestacionDiv = document.createElement("div");
      prestacionDiv.classList.add("prestacion-item");
      prestacionDiv.innerHTML = `
        ${index + 1})
        <strong>${prestacion.tipoPrestacionNombre}</strong> -
        <strong>${prestacion.nombrePrestacion}</strong><br>
        <strong>Indicación:</strong> ${prestacion.indicacion}<br>
        <strong>Justificación:</strong> ${prestacion.justificacion}<br>
        <strong>Posición:</strong> ${prestacion.posicion}
        <button type="button" class="btn btn-danger btn-sm remove-prestacion">-</button>
      `;
      const botonRemover = prestacionDiv.querySelector(".remove-prestacion");
      botonRemover.addEventListener("click", function () {
        eliminarPrestacion(index);
      });
      listaPrestaciones.appendChild(prestacionDiv);
    });

    contenedorPrestaciones.style.display =
      prestaciones.length > 0 ? "block" : "none";
  }
  window.mostrarPrestaciones = mostrarPrestaciones;

  function eliminarPrestacion(index) {
    const prestacionEliminada = prestaciones[index];
    prestaciones.splice(index, 1);
    mostrarPrestaciones();

    // Log para verificar la prestación eliminada
    console.log("Prestación eliminada:", prestacionEliminada);

    if (prestaciones.length < MAX_PRESTACIONES) {
      hideNotification();
      botonAgregarP.disabled = false;
    }
  }

  function mostrarError(mensaje, idElementoError) {
    const elementoError = document.getElementById(idElementoError);
    if (elementoError) {
      elementoError.textContent = mensaje;
      modalError.style.display = "block";
      setTimeout(function () {
        modalError.style.display = "none";
      }, 3000); // Ocultar el modal en 3 segundos
    } else {
      console.error(`Elemento con ID ${idElementoError} no encontrado.`);
    }

    // Limpiar el mensaje de error de nombre cuando se cambia el nombre de prestación
    if (idElementoError === "errorNombre") {
      document
        .getElementById("nombrePrestacion")
        .addEventListener("change", function () {
          elementoError.textContent = "";
        });
    }

    // Limpiar el mensaje de error de nombre cuando se cambia el tipo de prestación
    if (idElementoError === "errorNombre") {
      document
        .getElementById("tipoPrestacion")
        .addEventListener("change", function () {
          elementoError.textContent = "";
        });
    }
  }
  function mostrarCampos() {
    const camposOcultos = document.querySelectorAll(".prestacion-row.hidden");
    camposOcultos.forEach(function (campo) {
      campo.classList.remove("hidden");
    });

    botonAgregarP.style.display = "none";
    botonConfirmarP.style.display = "inline-block";
    document.querySelector(".min-prestacion").style.display = "inline-block";
  }

  function ocultarCampos() {
    const camposVisibles = document.querySelectorAll(
      ".prestacion-row:not(.hidden)"
    );
    camposVisibles.forEach(function (campo) {
      campo.classList.add("hidden");
    });

    document.getElementById("tipoPrestacion").value = "";
    document.getElementById("nombrePrestacion").value = "";
    document.getElementById("indicaciones").value = "";
    document.getElementById("justificaciones").value = "";
    document.getElementById("posiciones").value = "";

    botonAgregarP.style.display = "inline-block";
    botonConfirmarP.style.display = "none";
    document.querySelector(".min-prestacion").style.display = "none";
  }

  function showNotification(message, isSuccess) {
    const mensajeElemento = document.getElementById("mensajePrestacion");
    mensajeElemento.textContent = message;
    mensajeElemento.style.display = "block";
    mensajeElemento.className = isSuccess
      ? "alert alert-success"
      : "alert alert-danger";
  }

  function hideNotification() {
    const mensajeElemento = document.getElementById("mensajePrestacion");
    mensajeElemento.style.display = "none";
  }
});
