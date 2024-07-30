window.datosProfesional = null;

// Obtengo los valores de localStorage
const rol = localStorage.getItem("userRole");
const userId = localStorage.getItem("userId");

console.log("Rol del usuario:", rol);
console.log("ID del usuario:", userId);

document.addEventListener("DOMContentLoaded", () => {
  console.log("Cargado");

  async function obtenerDatosProfesional() {
    console.log("Intentando obtener los datos del profesional");
    try {
      let response;

      // Verifico el rol y realizo la solicitud correspondiente
      if (rol === "profesional" || rol === "admin_profesional") {
        // solicitud GET para obtener datos de profesional
        response = await fetch("/profesional/datosProfesional", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
      } else if (rol === "administrador") {
        // solicitud POST para obtener datos administrador
        response = await fetch("/profesional/datosBasicos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ userId }), // Paso el userId en el cuerpo de la solicitud
        });
      } else {
        throw new Error("Rol no reconocido");
      }

      // si la respuesta fue exitosa
      if (!response.ok) {
        throw new Error("No se pudieron obtener los datos de usuario.");
      }

      // Convierto la respuesta a JSON
      const data = await response.json();

      window.idREFEPS = data.idREFEPS;
      console.log("IDREFEPS:", window.idREFEPS);
      window.profesionalId = data.profesional_id;
      console.log("ID del profesional:", window.profesionalId);
      window.datosProfesional = data;

      console.log("Datos del profesional:", datosProfesional);
      // Actualizo el sidebar con los datos obtenidos
      actualizarSidebar(datosProfesional);
    } catch (error) {
      console.error("Error al obtener los datos del profesional:", error);
    }
  }

  // Llamo a la función para obtener los datos del profesional
  obtenerDatosProfesional();
});

function actualizarSidebar(datos) {
  if (datos) {
    const rol = localStorage.getItem("userRole");
    document.getElementById("persona_nombre").textContent =
      datos.persona_nombre || "";
    document.getElementById("persona_apellido").textContent =
      datos.persona_apellido || "";

    if (rol === "profesional" || rol === "admin_profesional") {
      document.getElementById("profesion_nombre").textContent =
        datos.profesion_nombre || "";
      document.getElementById("especialidad_nombre").textContent =
        datos.especialidad_nombre || "";
      document.getElementById("idREFEPS").textContent =
        "idREFEPS:" + datos.idREFEPS;
    } else {
      document.getElementById("rol").textContent = datos.rol || "";
      document.getElementById("idREFEPS").textContent = "";
    }
  }
}
