document.addEventListener("DOMContentLoaded", () => {
  const btnModificar = document.getElementById("btnModificar");
  btnModificar.addEventListener("click", async () => {
    console.log("Actualizando medicamento...");
    const medicamentoId = document.getElementById("medicamentoId").value;
    const nombreGenerico = document.getElementById("nombre").value;
    const nombreComercialId = document.getElementById("nombre_comercial").value;
    const categoriaMedicamentoId = document.getElementById("categoria").value;
    const familiaMedicamentoId = document.getElementById("familia").value;
    const formaFarmaceuticaId =
      document.getElementById("forma_farmaceutica").value;
    const presentacionId = document.getElementById("presentacion").value;
    const estado = document.getElementById("estado").value;
    const componentes = [];
    // Recorremos cada componente para capturar los datos
    document.querySelectorAll(".componente").forEach((componente) => {
      const index = componente.getAttribute("data-index");
      const monodrogaInput = componente.querySelector(
        `input[name="monodroga_${index}"]`
      );

      if (monodrogaInput) {
        const monodroga = monodrogaInput.value.trim();
        const concentraciones = [];
        // Capturamos todas las concentraciones
        componente
          .querySelectorAll(`[name^="cantidad_${index}_"]`)
          .forEach((cantidadInput, cIndex) => {
            const unidadSelect = componente.querySelector(
              `select[name="unidad_id_${index}_${cIndex}"]`
            );

            console.log(
              `Cantidad Input: ${
                cantidadInput ? cantidadInput.value : "No encontrado"
              }`
            );
            console.log(
              `Unidad Select: ${
                unidadSelect ? unidadSelect.value : "No encontrado"
              }`
            );

            if (cantidadInput && unidadSelect) {
              const cantidad = parseFloat(cantidadInput.value.trim());
              const unidadId = unidadSelect.value.trim();
              console.log(
                `Encontrado concentración adicional: ${cantidad}, ${unidadId}`
              );

              if (!isNaN(cantidad) && unidadId) {
                concentraciones.push({
                  cantidad: cantidad,
                  unidadSeleccionadaId: unidadId,
                });
              }
            }
          });

        if (monodroga && concentraciones.length > 0) {
          componentes.push({
            monodroga: monodroga,
            concentraciones: concentraciones,
          });
        } else {
          console.log(`Componente vacío o sin concentraciones: ${index}`);
        }
      } else {
        console.log(
          `No se encontró el input para monodroga con nombre monodroga_${index}`
        );
      }
    });

    const medicamentoData = {
      id: parseInt(medicamentoId),
      nombre_generico: nombreGenerico,
      nombre_comercial: nombreComercialId || "",
      categoria: categoriaMedicamentoId || "",
      familia: familiaMedicamentoId || "",
      forma_farmaceutica: formaFarmaceuticaId,
      presentacion: presentacionId,
      estado: estado,
      componentes: componentes,
    };
    console.log("Datos del medicamento:", medicamentoData);
    try {
      const response = await fetch(`/medicamentos/modificar/${medicamentoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(medicamentoData),
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log("Medicamento actualizado:", responseData);
        showNotification("Medicamento actualizado con éxito", true);
        limpiarForm();
        limpiarComponentes();
      } else {
        const errorData = await response.json();
        console.error("Error al actualizar medicamento:", errorData);
        showNotification("Error al actualizar medicamento: ", false);
      }
    } catch (error) {
      console.error("Error al enviar la solicitud de actualización:", error);
      showNotification("Error al enviar la solicitud de actualización", false);
    }
  });
});
/* function capturarDatosComponentes() {
  const componentes = [];

  // Verificar que se encuentran elementos con la clase componente
  const componentesDOM = document.querySelectorAll(".componente");
  console.log(`Total de componentes encontrados: ${componentesDOM.length}`);

  componentesDOM.forEach((componente, index) => {
    console.log(`Procesando componente ${index}`);

    // Verificar el nombre del input esperado
    const nombreMonodroga = `monodroga_${index - 1}`;
    const nombreCantidadPrimera = `cantidad_${index - 1}_0`;
    const nombreUnidadPrimera = `unidad_id_${index - 1}_0`;

    // Debug: imprimir el HTML del componente para verificar su estructura
    console.log(`HTML del componente ${index}:`, componente.innerHTML);

    console.log(`Buscando input con nombre: ${nombreMonodroga}`);
    const monodrogaInput = componente.querySelector(
      `input[name="${nombreMonodroga}"]`
    );

    if (monodrogaInput) {
      console.log(`Encontrado monodroga input: ${monodrogaInput.value}`);
      const monodroga = monodrogaInput.value.trim();
      const concentraciones = [];

      // Capturar la primera concentración
      console.log(`Buscando input con nombre: ${nombreCantidadPrimera}`);
      console.log(`Buscando select con nombre: ${nombreUnidadPrimera}`);
      const cantidadInputPrimera = componente.querySelector(
        `input[name="${nombreCantidadPrimera}"]`
      );
      const unidadSelectPrimera = componente.querySelector(
        `select[name="${nombreUnidadPrimera}"]`
      );

      if (cantidadInputPrimera && unidadSelectPrimera) {
        console.log(
          `Encontrado concentración primera: ${cantidadInputPrimera.value}, ${unidadSelectPrimera.value}`
        );
        const cantidadPrimera = parseFloat(cantidadInputPrimera.value.trim());
        const unidadIdPrimera = unidadSelectPrimera.value.trim();

        if (!isNaN(cantidadPrimera) && unidadIdPrimera) {
          concentraciones.push({
            cantidad: cantidadPrimera,
            unidadSeleccionadaId: unidadIdPrimera,
          });
        }
      } else {
        console.log(
          `No se encontró input o select para la primera concentración en el componente ${index}`
        );
      }

      // Capturar concentraciones adicionales
      componente
        .querySelectorAll(".concentraciones-extra")
        .forEach((row, cIndex) => {
          const nombreCantidadExtra = `cantidad_${index}_${cIndex + 1}`;
          const nombreUnidadExtra = `unidad_id_${index}_${cIndex + 1}`;

          console.log(`Buscando input con nombre: ${nombreCantidadExtra}`);
          console.log(`Buscando select con nombre: ${nombreUnidadExtra}`);
          const cantidadInput = row.querySelector(
            `input[name="${nombreCantidadExtra}"]`
          );
          const unidadSelect = row.querySelector(
            `select[name="${nombreUnidadExtra}"]`
          );

          if (cantidadInput && unidadSelect) {
            console.log(
              `Encontrado concentración adicional: ${cantidadInput.value}, ${unidadSelect.value}`
            );
            const cantidad = parseFloat(cantidadInput.value.trim());
            const unidadId = unidadSelect.value.trim();

            if (!isNaN(cantidad) && unidadId) {
              concentraciones.push({
                cantidad,
                unidadSeleccionadaId: unidadId,
              });
            }
          } else {
            console.log(
              `No se encontró input o select para la concentración adicional en el componente ${index}, concentración ${cIndex}`
            );
          }
        });

      if (monodroga && concentraciones.length > 0) {
        componentes.push({
          monodroga,
          concentraciones,
        });
      } else {
        console.log(`Componente vacío o sin concentraciones: ${index}`);
      }
    } else {
      console.log(
        `No se encontró el input para monodroga con nombre ${nombreMonodroga}`
      );
    }
  });

  console.log("Componentes capturados:", componentes);
  return componentes;
}

// Ejemplo de cómo llamar a la función para verificar los datos capturados
document
  .getElementById("btnModificarMedicamento")
  .addEventListener("click", () => {
    const componentes = capturarDatosComponentes();
    console.log("Datos de componentes enviados:", componentes);
  });
 */
