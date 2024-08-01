document.addEventListener("DOMContentLoaded", function () {
  const contenedorMedicamento = document.getElementById(
    "contenedor-medicamento"
  );

  const MAX_MEDICAMENTOS = 3;
  window.medicamentos = [];

  botonConfirmar.addEventListener("click", function () {
    agregarMedicamento();
    ocultarCampos();
  });

  botonRemover.addEventListener("click", function () {
    contenedorMedicamento.style.display = "none";
    mostrarMedicamentos();
    botonConfirmar.style.display = "none";
    botonAgregar.style.display = "inline-block";
  });
  // limpio error nombre
  document.getElementById("nomgen").addEventListener("change", function () {
    const errorNomgen = document.getElementById("errorNomgen");
    if (errorNomgen) {
      errorNomgen.textContent = "";
    }
  });
  // limpio error dosis
  document.getElementById("dosis").addEventListener("change", function () {
    const errorDosis = document.getElementById("errorDosis");
    if (errorDosis) {
      errorDosis.textContent = "";
    }
  });
  // limpio error tiempo
  document.getElementById("tiempo").addEventListener("change", function () {
    const errorTiempo = document.getElementById("errorTiempo");
    if (errorTiempo) {
      errorTiempo.textContent = "";
    }
  });
  // limpio error duracion
  document.getElementById("duracion").addEventListener("change", function () {
    const errorDuracion = document.getElementById("errorDuracion");
    if (errorDuracion) {
      errorDuracion.textContent = "";
    }
  });
  function mostrarMedicamentos() {
    contenedorMedicamento.innerHTML = "";

    window.medicamentos.forEach((medicamento, index) => {
      const medicamentoDiv = document.createElement("div");
      medicamentoDiv.classList.add("medicamento-item");

      medicamentoDiv.innerHTML = `${index + 1}) <strong>${
        medicamento.nombreG
      } - ${medicamento.nombreComercial}</strong>
      <br> Administración: <strong> ${medicamento.administracion.dosis} -  ${
        medicamento.administracion.tiempo
      } -  ${medicamento.administracion.duracion}</strong>`;

      const botonEliminarM = document.createElement("button");
      botonEliminarM.textContent = "-";
      botonEliminarM.classList.add(
        "btn",
        "btn-sm",
        "btn-danger",
        "ml-2",
        "m-2"
      );
      botonEliminarM.addEventListener("click", function () {
        eliminarMedicamento(index);
      });

      medicamentoDiv.appendChild(botonEliminarM);
      contenedorMedicamento.appendChild(medicamentoDiv);
    });

    contenedorMedicamento.style.display =
      window.medicamentos.length > 0 ? "block" : "none";
  }
  window.mostrarMedicamentos = mostrarMedicamentos;
  function agregarMedicamento() {
    if (window.medicamentos.length === MAX_MEDICAMENTOS) {
      showNotification(
        "Se ha alcanzado el número máximo de medicamentos.",
        false
      );
      botonAgregar.disabled = true;
    }

    const nombreG = document.getElementById("nomgen").value.trim();
    const nombreComercial = document.getElementById("nomcom").value.trim();
    const dosis = document.getElementById("dosis").value.trim();
    const tiempo = document.getElementById("tiempo").value.trim();
    const duracion = document.getElementById("duracion").value.trim();

    const isValid = validarCampos(nombreG, dosis, tiempo, duracion);

    if (!isValid) {
      return;
    }

    const duplicada = window.medicamentos.some(
      (medicamento) => medicamento.nombreG === nombreG
    );

    if (duplicada) {
      limpiarCampos();
      mostrarError(
        "No se pueden agregar medicamentos duplicados.",
        "errorNomgen"
      );
      return;
    }

    const medicamentoId = document.getElementById("medicamentoId").value.trim();
    const administracionId = document
      .getElementById("administracion")
      .value.trim();
    console.log(medicamentoId, administracionId);
    if (!medicamentoId || !administracionId) {
      mostrarError(
        "No se pudo obtener el ID del medicamento o de la administración. Por favor, intenta nuevamente.",
        "errorNomgen"
      );
      return;
    }
    const nuevoMedicamento = {
      medicamentoId: medicamentoId,
      nombreG,
      nombreComercial,
      administracion: {
        administracionId: administracionId,
        dosis,
        tiempo,
        duracion,
      },
    };
    console.log(nuevoMedicamento);
    window.medicamentos.push(nuevoMedicamento);
    mostrarMedicamentos();
    limpiarCampos();
    ocultarCampos();
    if (window.medicamentos.length >= MAX_MEDICAMENTOS) {
      botonAgregar.disabled = true; // Deshabilito botón de agregar si se alcanza el límite

      showNotification(
        "Se ha alcanzado el número máximo de medicamentos.",
        false
      );
    }
  }

  function eliminarMedicamento(index) {
    window.medicamentos.splice(index, 1);
    mostrarMedicamentos();
    if (medicamentos.length < MAX_PRESTACIONES) {
      hideNotification();
      botonAgregar.disabled = false;
    }
  }

  function validarCampos(nombreG, dosis, tiempo, duracion) {
    let isValid = true; // Variable para validar todos los campos

    if (!nombreG) {
      mostrarError(
        "Por favor ingresa el nombre genérico del medicamento.",
        "errorNomgen"
      );
      isValid = false;
    } else {
      document.getElementById("errorNomgen").textContent = "";
    }

    // Validación de la dosis
    if (!dosis) {
      mostrarError("Por favor ingresa la dosis del medicamento.", "errorDosis");
      isValid = false;
    } else {
      document.getElementById("errorDosis").textContent = "";
    }

    // Validación del tiempo de administración
    if (!tiempo) {
      mostrarError(
        "Por favor ingresa el tiempo de administración.",
        "errorTiempo"
      );
      isValid = false;
    } else {
      document.getElementById("errorTiempo").textContent = "";
    }

    // Validación de la duración del tratamiento
    if (!duracion) {
      mostrarError(
        "Por favor ingresa la duración del tratamiento.",
        "errorDuracion"
      );
      isValid = false;
    } else {
      document.getElementById("errorDuracion").textContent = "";
    }

    return isValid;
  }
  function limpiarCampos() {
    document.getElementById("nomgen").value = "";

    document.getElementById("nomcom").value = "";
    document.getElementById("dosis").value = "";
    document.getElementById("tiempo").value = "";
    document.getElementById("duracion").value = "";

    document.getElementById("errorNomgen").textContent = "";

    document.getElementById("errorDosis").textContent = "";
    document.getElementById("errorTiempo").textContent = "";
    document.getElementById("errorDuracion").textContent = "";
  }

  function mostrarError(mensaje, idElementoError) {
    const elementoError = document.getElementById(idElementoError);
    if (elementoError) {
      elementoError.textContent = mensaje;
      modalError.style.display = "block";
    } else {
      console.error(`Elemento con ID ${idElementoError} no encontrado.`);
    }
  }
  function showNotification(message, isSuccess) {
    const mensajeElemento = document.getElementById("mensajeMedicamento");
    mensajeElemento.textContent = message;
    mensajeElemento.style.display = "block";
    mensajeElemento.className = isSuccess
      ? "alert alert-success"
      : "alert alert-danger";
  }
  window.showNotification = showNotification;
  function hideNotification() {
    const mensajeElemento = document.getElementById("mensajeMedicamento");
    mensajeElemento.style.display = "none";
  }
});
