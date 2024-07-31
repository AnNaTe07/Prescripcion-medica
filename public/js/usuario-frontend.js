document.addEventListener("DOMContentLoaded", function () {
  // Selecciono todos los formularios de usuario
  const formularios = document.querySelectorAll(".form-usuario");
  let localidadId = null;
  window.codigo_pais = null;
  window.especialidad_id = null;
  window.buscarBtn = document.querySelector("#buscarBtn");

  formularios.forEach((formulario) => {
    window.tipoDniElement = document.getElementById("tipoDni");
    window.documentoElement = document.getElementById("documento");
    //console.log("buscarBtn:", buscarBtn);
    let nombre = document.getElementById("nombre");
    let apellido = document.getElementById("apellido");
    const email = document.getElementById("email");
    const telefono = document.getElementById("telefono");
    const contrasena = document.getElementById("contrasena");
    const confirmarContrasena = formulario.querySelector(
      "#confirmarContrasena"
    );
    const rolUsuario = formulario.querySelector("#rolUsuario");
    let pais = document.getElementById("pais");
    const provinciaInput = document.getElementById("provincia");
    const provinciaDatalist = document.getElementById("provinciaList");
    const localidadInput = document.getElementById("localidad");
    const localidadDatalist = document.getElementById("localidadList");
    const cpInput = document.getElementById("cp");
    const cpDatalist = document.getElementById("cpList");
    const profesionSelect = document.getElementById("profesion");
    const especialidadDatalist = document.getElementById("especialidadList");
    const especialidadInput = document.getElementById("especialidad");
    const especialidadNombre = especialidadInput.value;
    window.camposProfesional = document.getElementById("camposProfesional");
    window.camposRegistroModificacion = document.getElementById(
      "camposRegistroModificacion"
    );

    function validarDocumento() {
      limpiarErrores();
      let esValido = true;
      // Validar tipoDni
      if (tipoDniElement.value === "") {
        mostrarError(tipoDniElement, "Seleccione un tipo de DNI");
        esValido = false;
      }

      // Validar documento
      if (documentoElement.value === "") {
        mostrarError(documentoElement, "El campo N° Documento es requerido.");
        esValido = false;
      } else if (!documentoElement.value.match(/^\d{7,9}$/)) {
        mostrarError(
          documentoElement,
          "Ingrese un número de documento válido (entre 7 y 9 dígitos)"
        );
        esValido = false;
      }

      return esValido;
    }
    window.validarDocumento = validarDocumento;
    function validarContrasenas() {
      limpiarErrores();
      let esValido = true;

      if (
        contrasena.value.trim() === "" ||
        confirmarContrasena.value.trim() === ""
      ) {
        mostrarError(confirmarContrasena, "Debe confirmar la contraseña");
        esValido = false;
      } else if (contrasena.value !== confirmarContrasena.value) {
        mostrarError(confirmarContrasena, "Las contraseñas no coinciden");
        esValido = false;
      }
      return esValido;
    }
    window.validarContrasenas = validarContrasenas;
    // Función para validar campos del formulario
    function validarFormulario() {
      limpiarErrores();
      validarDocumento();
      validarContrasenas();
      let esValido = true;

      // Validar nombre
      if (nombre.value === "") {
        mostrarError(nombre, "Ingrese un nombre");
        esValido = false;
      }

      // Validar apellido
      if (apellido.value === "") {
        mostrarError(apellido, "Ingrese un apellido");
        esValido = false;
      }

      // Validar email
      if (email.value.trim() === "" || !esEmailValido(email.value)) {
        mostrarError(email, "Ingrese un email válido");
        esValido = false;
      }

      // Validar teléfono
      if (telefono.value.trim() === "" || !telefono.value.match(/^\d{8,}$/)) {
        mostrarError(telefono, "Ingrese un teléfono válido (mínimo 8 dígitos)");
        esValido = false;
      }

      // Validar rolUsuario
      if (rolUsuario.value === "") {
        mostrarError(rolUsuario, "Seleccione un rol de usuario");
        esValido = false;
      }

      return esValido;
    }
    window.validarFormulario = validarFormulario;
    function validarFormularioProfesional() {
      limpiarErrores(); // Suponiendo que tienes una función para limpiar errores previos
      let esValido = validarFormulario();

      // Validar nacionalidad
      const pais = document.querySelector("#pais");
      if (pais.value.trim() === "") {
        mostrarError(pais, "Ingrese una nacionalidad");
        esValido = false;
      }

      // Validar matrícula
      const matricula = document.querySelector("#matricula");
      if (matricula.value.trim() === "") {
        mostrarError(matricula, "Ingrese una matrícula");
        esValido = false;
      }

      // Validar profesión
      const profesion = document.querySelector("#profesion");
      if (profesion.value === "") {
        mostrarError(profesion, "Seleccione una profesión");
        esValido = false;
      }

      // Validar especialidad
      const especialidad = document.querySelector("#especialidad");
      if (especialidad.value.trim() === "") {
        mostrarError(especialidad, "Ingrese una especialidad");
        esValido = false;
      }

      // Validar ID REFEPS
      const refeps = document.querySelector("#refeps");
      if (refeps.value.trim() === "") {
        mostrarError(refeps, "Ingrese el ID REFEPS");
        esValido = false;
      }

      // Validar calle
      const calle = document.querySelector("#calle");
      if (calle.value.trim() === "") {
        mostrarError(calle, "Ingrese la calle");
        esValido = false;
      }

      // Validar número
      const numero = document.querySelector("#numero");
      if (numero.value.trim() === "") {
        mostrarError(numero, "Ingrese el número");
        esValido = false;
      }

      // Validar provincia
      const provincia = document.querySelector("#provincia");
      if (provincia.value.trim() === "") {
        mostrarError(provincia, "Ingrese la provincia");
        esValido = false;
      }

      // Validar localidad
      const localidad = document.querySelector("#localidad");
      if (localidad.value.trim() === "") {
        mostrarError(localidad, "Ingrese la localidad");
        esValido = false;
      }

      // Validar código postal
      const cp = document.querySelector("#cp");
      if (cp.value.trim() === "") {
        mostrarError(cp, "Ingrese el código postal");
        esValido = false;
      }

      // Validar fecha de caducidad
      const caducidad = document.querySelector("#caducidad");
      if (caducidad.value.trim() === "") {
        mostrarError(caducidad, "Ingrese la fecha de caducidad");
        esValido = false;
      }

      return esValido;
    }
    window.validarFormularioProfesional = validarFormularioProfesional;

    function validarYEnviarFormulario() {
      let esValido;

      if (rolUsuario.value === "administrador") {
        esValido = validarFormulario();
      } else if (
        rolUsuario.value === "profesional" ||
        rolUsuario.value === "admin_profesional"
      ) {
        esValido = validarFormularioProfesional();
      } else {
        // Manejar el caso en que el rol no es válido
        console.error("Rol de usuario no válido");
      }
      return esValido;
    }
    window.validarYEnviarFormulario = validarYEnviarFormulario;

    // Función para mostrar mensajes de error
    function mostrarError(elemento, mensaje) {
      if (!elemento || !elemento.parentElement) {
        console.error("El elemento o su elemento padre no existen");
        return;
      }

      // Primero eliminar cualquier mensaje de error existente
      const existingError =
        elemento.parentElement.querySelector(".error-message");
      if (existingError) {
        existingError.remove();
      }

      const elementoError = document.createElement("p");
      elementoError.classList.add("error-message");
      elementoError.textContent = mensaje;
      elementoError.style.color = "red"; // Establezco color rojo para mensajes de error
      elemento.parentElement.appendChild(elementoError);
    }
    window.mostrarError = mostrarError;

    function limpiarCampos() {
      document.querySelector("#tipoDni").value = "";
      document.querySelector("#documento").value = "";
      document.querySelector("#nombre").value = "";
      document.querySelector("#apellido").value = "";
      document.querySelector("#email").value = "";
      document.querySelector("#telefono").value = "";
      document.querySelector("#contrasena").value = "";
      document.querySelector("#confirmarContrasena").value = "";
      document.querySelector("#rolUsuario").value = "";
    }
    window.limpiarCampos = limpiarCampos;

    function limpiarCamposProfesional() {
      document.querySelector("#profesion").value = "";
      document.querySelector("#especialidad").value = "";
      document.querySelector("#refeps").value = "";
      document.querySelector("#matricula").value = "";
      document.querySelector("#caducidad").value = "";
      document.querySelector("#localidad").value = "";
      document.querySelector("#provincia").value = "";
      document.querySelector("#cp").value = "";
      document.querySelector("#pais").value = "";
      document.querySelector("#calle").value = "";
      document.querySelector("#numero").value = "";
      document.querySelector("#piso").value = "";
      document.querySelector("#depto").value = "";
    }
    window.limpiarCamposProfesional = limpiarCamposProfesional;

    // Función para limpiar mensajes de error
    function limpiarErrores() {
      const mensajesError = document.querySelectorAll(".error-message");
      mensajesError.forEach((msg) => msg.remove());
    }
    window.limpiarErrores = limpiarErrores;

    // Función para validar formato de email
    function esEmailValido(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }

    rolUsuario.addEventListener("change", function () {
      document.getElementById("estado-container2").classList.add("hidden");

      if (
        (rolUsuario.value === "profesional" ||
          rolUsuario.value === "admin_profesional") &&
        accion === "registrar"
      ) {
        mensajeUsuario.classList.add("hidden");
        camposProfesional.classList.remove("hidden");
        camposProfesional
          .querySelectorAll(".hidden")
          .forEach((el) => el.classList.remove("hidden"));
        console.log("aqui llego");
        document.getElementById("caducidad-container2").classList.add("hidden");
        document.getElementById("estado-container").classList.add("hidden");
        //document.getElementById("estado-container2").classList.add("hidden");
        document.getElementById("check-container").classList.add("hidden");
      } else if (
        rolUsuario.value === "administrador" &&
        accion === "registrar"
      ) {
        mensajeUsuario.classList.add("hidden");
        document.getElementById("estado-container").classList.add("hidden");
        //document.getElementById("estado-container2").classList.add("hidden");
        document.getElementById("check-container").classList.add("hidden");
      } else if (
        (rolUsuario.value === "profesional" ||
          rolUsuario.value === "admin_profesional") &&
        (accion === "modificar" || accion === "eliminar")
      ) {
        mensajeUsuario.classList.add("hidden");
        camposRegistroModificacion.classList.remove("hidden");
        //camposProfesional.classList.add("hidden");
        document
          .getElementById("caducidad-container2")
          .classList.remove("hidden");
        document.getElementById("estado-container").classList.remove("hidden");

        //document.getElementById("estado-container2").classList.add("hidden");
        document.getElementById("check-container").classList.remove("hidden");
      } else if (
        rolUsuario.value === "administrador" &&
        (accion === "modificar" || accion === "eliminar")
      ) {
        //camposProfesional.classList.add("hidden");
        //  camposRegistroModificacion.classList.remove("hidden");
        document.getElementById("caducidad-container2").classList.add("hidden");
        document.getElementById("check-container").classList.remove("hidden");
        document.getElementById("estado-container").classList.remove("hidden");
        //document.getElementById("estado-container2").classList.add("hidden");
      } else {
        camposProfesional.classList.add("hidden");
        camposProfesional
          .querySelectorAll(".form-group")
          .forEach((el) => el.classList.add("hidden"));
        document.getElementById("caducidad-container2").classList.add("hidden");
        document.getElementById("estado-container").classList.add("hidden");
        document.getElementById("check-container").classList.add("hidden");
      }
    });
    //funcion buscar usuario (fetch)
    function buscarUsuario(tipoDni, documento) {
      return fetch("/usuario/buscarUsuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tipoDni, documento }),
      });
    }
    window.buscarUsuario = buscarUsuario;
    // Evento para el botón de búsqueda
    if (buscarBtn) {
      buscarBtn.addEventListener("click", async function () {
        const mensajeElemento = document.getElementById("mensajeUsuario");
        mensajeElemento.style.display = "none";
        if (!validarDocumento()) return;

        const tipoDni = tipoDniElement.value;
        const documento = documentoElement.value.trim();
        const accionElement = document.querySelector(
          'input[name="accion"]:checked'
        );
        const accion = accionElement ? accionElement.value : "";

        // Solo proceder si la acción seleccionada es "modificar"
        if (accion === "registrar" && documento !== "") {
          try {
            const response = await window.buscarUsuario(tipoDni, documento);
            console.log("Respuesta recibida del servidor");

            if (response.status === 404) {
              // Si el usuario no fue encontrado, mostrar los campos para registro
              if (document.querySelector("#registrar").checked) {
                camposRegistroModificacion.classList.remove("hidden");
                document
                  .getElementById("caducidad-container2")
                  .classList.add("hidden");
                document
                  .getElementById("estado-container")
                  .classList.add("hidden");
                document
                  .getElementById("check-container")
                  .classList.add("hidden");
                registroBtn.style.display = "block";
                document
                  .getElementById("estado-container2")
                  .classList.add("hidden");
                registroBtn.style.display = "block";
              }
            } else if (!response.ok) {
              console.error("Error en la respuesta del servidor");
              throw new Error("Error en la respuesta del servidor");
            } else {
              const data = await response.json();
              console.log("Usuario encontrado:", data);
              limpiarCampos();
              mostrarError(documentoElement, "Usuario registrado.");
            }
          } catch (error) {
            console.error("Error al buscar usuario:", error);
            mostrarError(documentoElement, "Error al buscar usuario.");
          }
        }
      });
    }
    async function cargarpaises() {
      try {
        const response = await fetch("/usuario/obtener-paises");
        const paises = await response.json();

        const datalist = document.getElementById("paisList");

        paises.forEach((pais) => {
          const option = document.createElement("option");
          option.value = pais.nombre_pais; // Mostrar el nombre del país
          option.setAttribute("data-id", pais.codigo_pais); // Almacenar el ID del país
          datalist.appendChild(option);
        });
      } catch (error) {
        console.error("Error al obtener la lista de países:", error);
      }
    }
    cargarpaises();
    document.getElementById("pais").addEventListener("change", function () {
      const selectedOption = Array.from(
        document.getElementById("paisList").options
      ).find((option) => option.value === this.value);

      if (selectedOption) {
        this.dataset.id = selectedOption.getAttribute("data-id");
      }
      pais = document.getElementById("pais").dataset.id;
      codigo_pais = pais;
      console.log("pais", codigo_pais);
    });
    async function cargarProfesiones() {
      try {
        const response = await fetch("/usuario/obtener-profesiones");
        const profesiones = await response.json();

        const select = document.getElementById("profesion");

        // Limpiar opciones existentes
        select.innerHTML = '<option value="">Seleccione...</option>';

        profesiones.forEach((profesion) => {
          const option = document.createElement("option");
          option.value = profesion.id; //  ID como valor del option
          option.textContent = profesion.nombre; //nombre de la profesión como texto del option
          select.appendChild(option);
        });
      } catch (error) {
        console.error("Error al cargar profesiones:", error);
      }
    }

    cargarProfesiones();
    // Función para cargar especialidades basadas en la profesión seleccionada
    async function cargarEspecialidades(profesionId) {
      try {
        const response = await fetch(
          `/usuario/obtener-especialidades/${profesionId}`
        );
        const especialidades = await response.json();

        // Limpiar datalist actual
        especialidadDatalist.innerHTML = "";

        // Agregar nuevas opciones
        especialidades.forEach((especialidad) => {
          const option = document.createElement("option");
          option.value = especialidad.nombre;
          option.dataset.id = especialidad.id; // Guardar el id en un atributo data-id
          especialidadDatalist.appendChild(option);
        });
      } catch (error) {
        console.error("Error al cargar especialidades:", error);
      }
    }
    // Función para obtener el id de la especialidad seleccionada
    function obtenerEspecialidadId(nombre) {
      const options = especialidadDatalist.querySelectorAll("option");
      for (let option of options) {
        if (option.value === nombre) {
          return option.dataset.id;
        }
      }
      return null;
    }

    // Manejar el evento de cambio en el campo de especialidad
    especialidadInput.addEventListener("input", () => {
      const especialidadNombre = especialidadInput.value;
      especialidad_id = obtenerEspecialidadId(especialidadNombre);
      console.log("ID de la especialidad:", especialidad_id);
    });

    // Event listener para el cambio en el select de profesión
    profesionSelect.addEventListener("change", (event) => {
      const profesionId = event.target.value;
      if (profesionId) {
        cargarEspecialidades(profesionId);
      } else {
        // Limpiar datalist si no hay profesión seleccionada
        especialidadDatalist.innerHTML = "";
      }
      async function verificarREFEPS() {
        tipoDni = document.getElementById("tipoDni").value;
        documento = document.getElementById("documento").value;
        nombre = document.getElementById("nombre").value;
        apellido = document.getElementById("apellido").value;

        // Validación de los campos
        if (!tipoDni || !documento || !nombre || !apellido || !pais) {
          mostrarError(refeps, "Por favor, complete todos los campos.");
          return;
        }
        console.log("Pais:", pais);
        console.log("Documento:", documento);
        console.log("Nombre:", nombre);
        console.log("Apellido:", apellido);

        try {
          const response = await fetch("/usuario/verificar-refeps", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tipoDni,
              documento,
              nombre,
              apellido,
              codigo_pais: pais,
            }),
          });

          const data = await response.json();

          if (data.success) {
            limpiarErrores();
            document.getElementById("refeps").value = data.idREFEPS;
            console.log("REFEPS:", data.idREFEPS);
            mostrarError(refeps, "Profesional registrado en REFEPS");
          } else {
            mostrarError(refeps, data.message);
          }
        } catch (error) {
          showNotification(
            "Error al verificar en REFEPS, persona no registrada",
            false
          );
          limpiarCampos();
          limpiarCamposProfesional();
          document.querySelector("#registroBtn").style.display = "none";
          camposRegistroModificacion.classList.add("hidden");
          camposProfesional.classList.add("hidden");
          //limpiarErrores();
          //mostrarError(refeps, "Error al verificar en REFEPS");
        }
      }
      document
        .getElementById("verificarBtn")
        .addEventListener("click", verificarREFEPS);

      // Función para cargar provincias basadas en el texto de búsqueda
      async function cargarProvincias(search) {
        try {
          const response = await fetch(
            `/usuario/provincias?search=${encodeURIComponent(search)}`
          );
          const provincias = await response.json();

          // Limpiar datalist actual
          provinciaDatalist.innerHTML = "";

          // Agregar nuevas opciones
          provincias.forEach((provincia) => {
            const option = document.createElement("option");
            option.value = provincia.nombre;
            option.dataset.id = provincia.id; // Almacenar el ID en un atributo de datos
            provinciaDatalist.appendChild(option);
          });
        } catch (error) {
          console.error("Error al cargar provincias:", error);
        }
      }

      // Event listener para el input de provincia
      provinciaInput.addEventListener("input", (event) => {
        const search = event.target.value.trim();
        if (search.length >= 2) {
          cargarProvincias(search);
        } else {
          // Limpiar datalist si el texto es menor a 2 caracteres
          provinciaDatalist.innerHTML = "";
        }
      });
      // Función para cargar localidades basadas en el ID de la provincia
      async function cargarLocalidades(provinciaId) {
        try {
          const response = await fetch(
            `/usuario/obtener-localidades/${provinciaId}`
          );
          const localidades = await response.json();

          // Limpiar datalist actual
          localidadDatalist.innerHTML = "";

          // Agrego nuevas opciones
          localidades.forEach((localidad) => {
            const option = document.createElement("option");
            option.value = localidad.nombre;
            option.dataset.id = localidad.id; // Almaceno el ID de la localidad en el data attribute
            localidadDatalist.appendChild(option);
            console.log("Localidad:", localidad);
          });
        } catch (error) {
          console.error("Error al cargar localidades:", error);
        }
      }
      // Event listener para el input de provincia
      provinciaInput.addEventListener("input", (event) => {
        const provinciaNombre = event.target.value.trim();

        // Obtener el ID de la provincia seleccionada
        const selectedOption = Array.from(event.target.list.options).find(
          (option) => option.value === provinciaNombre
        );

        if (selectedOption) {
          const provinciaId = selectedOption.dataset.id;
          cargarLocalidades(provinciaId);
        } else {
          // Limpiar datalist si no hay una provincia válida seleccionada
          localidadDatalist.innerHTML = "";
        }
      });
      // Función para cargar códigos postales basados en los IDs de la provincia y la localidad
      async function cargarCodigosPostales(localidadId) {
        try {
          const response = await fetch(
            `/usuario/codigos-postales/${localidadId}`
          );
          const codigosPostales = await response.json();

          // Limpiar datalist actual
          cpDatalist.innerHTML = "";

          // Agregar nuevas opciones
          codigosPostales.forEach((cp) => {
            const option = document.createElement("option");
            option.value = cp.codigo;
            option.dataset.id = cp.id; // Almaceno el ID en un atributo de data
            cpDatalist.appendChild(option);
          });
        } catch (error) {
          console.error("Error al cargar códigos postales:", error);
        }
      }

      // Event listener para el input de localidad
      localidadInput.addEventListener("input", (event) => {
        const localidadNombre = event.target.value.trim();

        // Obtener el ID de la localidad seleccionada
        const selectedLocalidad = Array.from(localidadDatalist.options).find(
          (option) => option.value === localidadNombre
        );

        console.log("Selected Localidad:", selectedLocalidad);

        if (selectedLocalidad) {
          localidadId = selectedLocalidad.dataset.id;
          console.log("Localidad ID:", localidadId);
          cargarCodigosPostales(localidadId);
        } else {
          // Limpiar datalist si no hay una localidad válida seleccionada
          cpDatalist.innerHTML = "";
        }
      });
    });
  });
});
