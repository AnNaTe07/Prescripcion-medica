document.addEventListener("DOMContentLoaded", () => {
  const prescripCheckbox = document.getElementById("prescrip");
  let paciente_id = null;
  const prescripcionesAnterioresDiv = document.getElementById(
    "prescripcionesAnteriores"
  );
  prescripCheckbox.addEventListener("change", async () => {
    if (prescripCheckbox.checked) {
      paciente_id = window.pacienteId;
      const idREFEPS = window.idREFEPS;
      if (!paciente_id) {
        console.error("Debe buscar un paciente antes de proceder.");
        prescripcionesAnterioresDiv.innerHTML =
          "<p class='error-message'>Debe buscar un paciente antes de proceder.</p>";
        prescripcionesAnterioresDiv.classList.remove("hidden");
        prescripcionesAnterioresDiv.style.display = "block";
        return; // Salir de la función si no se ha buscado un paciente
      }
      console.log(paciente_id);
      console.log(idREFEPS);
      // Muestro el contenedor y cargo las prescripciones
      prescripcionesAnterioresDiv.classList.remove("hidden");
      prescripcionesAnterioresDiv.style.display = "block";

      try {
        const response = await fetch(
          `/prescripcion/anteriores/${paciente_id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ idREFEPS }),
          }
        );
        if (!response.ok) {
          throw new Error("Error al obtener las prescripciones anteriores");
        }
        const prescripciones = await response.json();
        console.log("Prescripciones obtenidas:", prescripciones);
        muestraPrescripciones(prescripciones);
      } catch (error) {
        console.error(error);
        prescripcionesAnterioresDiv.innerHTML =
          "<p class='error-message'>Error al obtener las prescripciones anteriores</p>";
      }
    } else {
      // Oculto el contenedor
      prescripcionesAnterioresDiv.classList.add("hidden");
      prescripcionesAnterioresDiv.innerHTML = ""; // Limpio el contenedor cuando se oculta
    }
  });
  const muestraPrescripciones = (prescripciones) => {
    const contenedor = document.getElementById("prescripcionesAnteriores");
    contenedor.innerHTML = ""; // Limpio contenido anterior

    Object.keys(prescripciones).forEach((prescripcionId) => {
      const prescripcion = prescripciones[prescripcionId];

      const divPrescripcion = document.createElement("div");
      divPrescripcion.classList.add("prescripcion");

      const fecha = document.createElement("p");
      fecha.textContent = `Fecha: ${prescripcion.fecha}`;
      divPrescripcion.appendChild(fecha);

      const diagnostico = document.createElement("p");
      diagnostico.textContent = `Diagnóstico: ${prescripcion.diagnostico}`;
      divPrescripcion.appendChild(diagnostico);

      prescripcion.medicamentos.forEach((medicamento, index) => {
        const divMedicamento = document.createElement("div");
        divMedicamento.classList.add("medicamento");

        const nombre = document.createElement("p");
        nombre.textContent = `Medicamento ${index + 1}: ${
          medicamento.nombre_generico
        }`;
        divMedicamento.appendChild(nombre);

        const dosis = document.createElement("p");
        dosis.textContent = `Dosis: ${medicamento.dosis}`;
        divMedicamento.appendChild(dosis);

        const intervalo = document.createElement("p");
        intervalo.textContent = `Intervalo de Tiempo: ${medicamento.intervalo_tiempo}`;
        divMedicamento.appendChild(intervalo);

        const duracion = document.createElement("p");
        duracion.textContent = `Duración: ${medicamento.duracion}`;
        divMedicamento.appendChild(duracion);

        divPrescripcion.appendChild(divMedicamento);
      });

      prescripcion.prestaciones.forEach((prestacion, index) => {
        const divPrestacion = document.createElement("div");
        divPrestacion.classList.add("prestacion");

        const nombre = document.createElement("p");
        nombre.textContent = `Prestación ${index + 1}: ${
          prestacion.nombre_prestacion
        }`;
        divPrestacion.appendChild(nombre);

        const observacion = document.createElement("p");
        observacion.textContent = `Observación: ${
          prestacion.observacion || "N/A"
        }`;
        divPrestacion.appendChild(observacion);

        // Agreog inputs ocultos con los IDs
        const prescripcionIdInput = document.createElement("input");
        prescripcionIdInput.type = "hidden";
        prescripcionIdInput.value = prescripcionId;
        divPrestacion.appendChild(prescripcionIdInput);

        const prestacionIdInput = document.createElement("input");
        prestacionIdInput.type = "hidden";
        prestacionIdInput.value = prestacion.prestacion_id;
        console.log(prestacionIdInput);
        divPrestacion.appendChild(prestacionIdInput);

        if (observacion.textContent === "Observación: N/A") {
          const inputObservacion = document.createElement("input");
          inputObservacion.type = "text";
          inputObservacion.classList.add("form-control", "md-2");
          inputObservacion.placeholder = "Agregar observación";
          divPrestacion.appendChild(inputObservacion);

          const botonGuardar = document.createElement("button");
          botonGuardar.classList.add("btn", "btn-warning", "mt-2", "md-2");
          botonGuardar.textContent = "Guardar Observación";
          botonGuardar.onclick = async () => {
            const nuevaObservacion = inputObservacion.value;
            console.log("Nueva observación:", nuevaObservacion);

            try {
              const response = await fetch(
                `/prescripcion/prestacion/${prescripcionId}/${prestacion.prestacion_id}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ observacion: nuevaObservacion }),
                }
              );

              if (!response.ok) {
                throw new Error("Error al actualizar la observación");
              }

              const result = await response.json();
              console.log("Resultado de la actualización:", result);

              // Actualizo el contenido de la observación en la interfaz
              observacion.textContent = `Observación: ${nuevaObservacion}`;
              inputObservacion.disabled = true;
              botonGuardar.disabled = true;
            } catch (error) {
              console.error("Error al actualizar la observación:", error);
            }
          };
          divPrestacion.appendChild(botonGuardar);
        }
        divPrescripcion.appendChild(divPrestacion);
      });

      contenedor.appendChild(divPrescripcion);
    });
  };
});
