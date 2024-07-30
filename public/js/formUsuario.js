document.addEventListener("DOMContentLoaded", function () {
  // Elementos comunes
  const forms = document.querySelectorAll(".form-usuario");

  // Función para manejar el cambio de rol
  function handleRolChange(rolUsuario, form) {
    const containers = {
      profesion: form.querySelector(".profesion-container"),
      especialidad: form.querySelector(".especialidad-container"),
      refeps: form.querySelector(".refeps-container"),
      matricula: form.querySelector(".matricula-container"),
      verificar: form.querySelector(".verificar-container"),
      caducidad: form.querySelector(".caducidad-container"),
    };

    if (rolUsuario.value === "profesional") {
      for (const key in containers) {
        containers[key].classList.remove("hidden");
      }
    } else {
      for (const key in containers) {
        containers[key].classList.add("hidden");
      }
    }
  }

  // Función para validar contraseñas
  function validatePasswords(form) {
    const password = form.querySelector(".contrasena").value;
    const confirmPassword = form.querySelector(".confirmarContrasena").value;

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return false;
    }
    return true;
  }

  // Aplicar eventos a todos los formularios
  forms.forEach((form) => {
    const rolUsuario = form.querySelector(".rolUsuario");

    rolUsuario.addEventListener("change", function () {
      handleRolChange(rolUsuario, form);
    });

    form.addEventListener("submit", function (event) {
      if (!validatePasswords(form)) {
        event.preventDefault();
      }
    });
  });
});
