const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const pool = require("../config/database");

async function processLogin(req, res) {
  //console.log(req.body);
  console.log("llego al login");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM usuario WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res
        .status(401)
        .json({ message: "Correo electrónico o contraseña inválidos" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Correo electrónico o contraseña inválidos" });
    }

    req.session.userId = user.id;
    req.session.rol = user.rol;

    console.log("User ID36:", user.id);
    console.log("User Role:", user.rol);

    // Redirijo segun el rol del usuario
    const responseData = {
      userId: user.id,
      userRole: user.rol,
      redirectUrl:
        user.rol === "administrador" || user.rol === "admin_profesional"
          ? "/inicio"
          : user.rol === "profesional"
          ? "/formPrescripcion"
          : "/",
    };
    console.log("Datos enviados al cliente:", responseData);

    return res.status(200).json(responseData);
  } catch (err) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function logoutSession(req, res) {
  console.log("aqui llego");
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error al cerrar sesión" });
    }
    console.log("Sesión cerrada");
    res.redirect("/"); // Redirijo a la página de inicio de sesión
  });
}

module.exports = {
  processLogin,
  logoutSession,
};
