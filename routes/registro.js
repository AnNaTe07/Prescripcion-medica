const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const User = require("../models/user");

// Ruta para mostrar el formulario de registro
router.get("/register", (req, res) => {
  res.render("register"); // Asegúrate de tener una vista 'register.pug' para mostrar el formulario
});

// Ruta para manejar el envío del formulario de registro
router.post(
  "/register",
  [
    check("email")
      .isEmail()
      .withMessage("Ingrese un correo electrónico válido"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres")
      .matches(/\d/)
      .withMessage("La contraseña debe contener al menos un número")
      .matches(/[A-Z]/)
      .withMessage("La contraseña debe contener al menos una letra mayúscula"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("register", { errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Verifica si el usuario ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res
          .status(400)
          .render("register", { errors: [{ msg: "El usuario ya existe" }] });
      }

      // Genera un hash de la contraseña con bcrypt
      const hashedPassword = await bcryptjs.hash(password, 10); // 10 es el número de rondas de hashing

      // Crea un nuevo usuario en la base de datos
      await User.create({ email, password: hashedPassword });

      // Respuesta exitosa
      res.status(201).send("Usuario registrado correctamente");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error interno del servidor");
    }
  }
);

module.exports = router;
