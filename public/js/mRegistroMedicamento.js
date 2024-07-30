document.addEventListener("DOMContentLoaded", () => {
  const medicamentoForm = document.getElementById("medicamentoForm");
  const btnRegistrar = document.getElementById("btnRegistrar");

  btnRegistrar.addEventListener("click", async () => {
    const formData = new FormData(medicamentoForm);
    const componentes = [];

    document
      .querySelectorAll(".componentesContainerRegistro .form-row")
      .forEach((container) => {
        const monodrogaElement = container.querySelector(".monodroga-input");
        const cantidadElement = container.querySelector(".cantidad");
        const unidadElement = container.querySelector(".unidad-select");

        if (monodrogaElement && cantidadElement && unidadElement) {
          const monodroga = monodrogaElement.value.trim();
          const cantidad = parseFloat(cantidadElement.value.trim());
          const unidad =
            unidadElement.options[unidadElement.selectedIndex].text.trim();

          // Validar la cantidad
          if (isNaN(cantidad) || cantidad <= 0) {
            showNotification("Por favor, ingresa una cantidad válida.", false);
            return;
          }

          const concentraciones = [];
          container
            .querySelectorAll(".extra-concentracion")
            .forEach((extra) => {
              const extraCantidadElement = extra.querySelector(".cantidad");
              const extraUnidadElement = extra.querySelector(".unidad-select");

              if (extraCantidadElement && extraUnidadElement) {
                const extraCantidad = parseFloat(
                  extraCantidadElement.value.trim()
                );
                const extraUnidad =
                  extraUnidadElement.options[
                    extraUnidadElement.selectedIndex
                  ].text.trim();

                // Validar la cantidad adicional
                if (!isNaN(extraCantidad) && extraCantidad > 0 && extraUnidad) {
                  concentraciones.push({
                    cantidad: extraCantidad,
                    unidad: extraUnidad,
                  });
                } else {
                  showNotification(
                    "Por favor, ingresa una cantidad y unidad válidas para las concentraciones adicionales.",
                    false
                  );
                  return;
                }
              }
            });

          componentes.push({ monodroga, cantidad, unidad, concentraciones });
        }
      });

    // Log para verificar el contenido de componentes antes de enviarlo al backend
    console.log(
      "Datos del arreglo componentes:",
      JSON.stringify(componentes, null, 2)
    );

    const dataToSend = {
      nombre_generico: formData.get("nombre"),
      nombre_comercial: formData.get("nombre_comercial"),
      categoria: formData.get("categoria"),
      familia: formData.get("familia"),
      forma_farmaceutica: formData.get("forma_farmaceutica"),
      presentacion: formData.get("presentacion"),
      estado: "Activo",
      componentes,
    };

    console.log(dataToSend);

    try {
      const response = await fetch("/medicamentos/registrarMedicamento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        showNotification("Medicamento registrado exitosamente", true);
        resetForm();
      } else {
        // Manejo de errores del servidor
        const errorData = await response.json();
        switch (response.status) {
          case 400:
            showNotification(
              `Error de solicitud incorrecta: ${
                errorData.message || "Revisa los datos ingresados."
              }`,
              false
            );
            break;
          case 401:
            showNotification(
              `Error de autenticación: ${
                errorData.message || "No autorizado."
              }`,
              false
            );
            break;
          case 403:
            showNotification(
              `Error de permiso: ${errorData.message || "Permiso denegado."}`,
              false
            );
            break;
          case 404:
            showNotification(
              `Error de no encontrado: ${
                errorData.message || "Recurso no encontrado."
              }`,
              false
            );
            break;
          case 500:
            showNotification(
              `Error del servidor: ${
                errorData.message || "Error interno del servidor."
              }`,
              false
            );
            break;
          default:
            showNotification(
              `Error desconocido: ${
                errorData.message || "Por favor, intenta de nuevo más tarde."
              }`,
              false
            );
            break;
        }
      }
    } catch (error) {
      // Manejo de errores de red
      console.error("Error:", error);
      showNotification(
        "Error de red al registrar el medicamento. Por favor, intenta de nuevo más tarde.",
        false
      );
    }
  });

  // Función para resetear el formulario
  function resetForm() {
    // Restablecer los campos del formulario
    medicamentoForm.reset();

    // Eliminar campos de concentración adicionales
    document.querySelectorAll(".extra-concentracion").forEach((extra) => {
      extra.remove();
    });

    // Eliminar cualquier campo oculto que tenga el atributo "required"
    document.querySelectorAll("[required]").forEach((element) => {
      if (element.style.display === "none") {
        element.removeAttribute("required");
      }
    });

    // Asegurar que el botón "Agregar Concentración" en la primera fila sea visible
    const addConcentracionButton = document.querySelector(".addConcentracion");
    if (addConcentracionButton) {
      addConcentracionButton.style.display = "inline-block";
    }

    // Eliminar filas de componentes adicionales a partir de la segunda fila
    const componentRows = document.querySelectorAll(
      ".componentes-container .form-row:not(:first-child)"
    );
    for (let i = componentRows.length - 1; i >= 0; i--) {
      componentRows[i].remove();
    }
  }
});
