document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM completamente cargado y analizado.");

  const loginForm = document.querySelector("#loginForm");
  if (!loginForm) {
    console.error("No se encontró el formulario de inicio de sesión.");
    return;
  } else {
    console.log("Formulario de inicio de sesión encontrado.");
  }
  const logoutLink = document.getElementById("logout-link");

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Evito la recarga de la página

    if (!validateForm()) {
      return;
    }

    const email = document.getElementById("emaillogin").value.trim();
    const password = document.getElementById("passwordlogin").value.trim();

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      // Guardo datos en localStorage
      localStorage.setItem("userRole", data.userRole);
      localStorage.setItem("userId", data.userId);
      console.log("Rol del usuario:", localStorage.getItem("userId"));
      console.log("Rol del usuario:", localStorage.getItem("userRole"));
      console.log("Respuesta del servidor:", data);

      if (!response.ok) {
        showErrorModal(data.message || "Error desconocido");
        return false;
      }

      // Redirijo si el inicio de sesión es exitoso
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      showErrorModal(
        "Error al intentar iniciar sesión. Por favor, inténtalo nuevamente."
      );
    }
  });

  function showErrorModal(message) {
    document.getElementById("errorModalMessage").textContent = message;
    const errorModal = new bootstrap.Modal(
      document.getElementById("errorModal")
    );
    errorModal.show();
  }

  function validateForm() {
    const email = document.getElementById("emaillogin").value.trim();
    const password = document.getElementById("passwordlogin").value.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      showErrorModal("Por favor, ingresa un correo electrónico válido.");
      return false;
    }

    if (password.length < 6 || password.length > 10) {
      showErrorModal("La contraseña debe tener entre 6 y 10 caracteres.");
      return false;
    }

    const containsNumber = /\d/.test(password);
    const containsLetter = /[a-zA-Z]/.test(password);
    if (!containsNumber || !containsLetter) {
      showErrorModal(
        "La contraseña debe contener al menos un número y una letra."
      );
      return false;
    }

    return true;
  }

  if (logoutLink) {
    logoutLink.addEventListener("click", async function (event) {
      event.preventDefault(); // Prevenir la acción por defecto del enlace

      try {
        const response = await fetch("/login/logout", {
          method: "GET",
          credentials: "same-origin", // Incluir credenciales de la sesión
        });

        if (response.ok) {
          window.location.href = "/"; // Redirigir a la página de inicio de sesión
        } else {
          showErrorModal(
            "Error al cerrar sesión. Por favor, inténtalo nuevamente."
          );
        }
      } catch (error) {
        showErrorModal("Error de red. Por favor, inténtalo nuevamente.");
      }
    });
  }
});
