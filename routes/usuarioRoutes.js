const express = require("express");

const { body } = require("express-validator");
const router = express.Router();
const UsuarioController = require("../controllers/usuarioController");

// Rutas para usuarios
router.post("/", UsuarioController.create); // Crear un nuevo usuario
router.put("/:id", UsuarioController.update); // Actualizar un usuario por su ID
router.put("/:id/estado", UsuarioController.modificarEstado);
router.post("/buscarUsuario", UsuarioController.buscarUsuario);
router.post("/verificar-refeps", UsuarioController.verificarREFEPS);
router.get("/obtener-paises", UsuarioController.obtenerPaises);
router.get("/obtener-profesiones", UsuarioController.obtenerProfesiones);
router.get(
  "/obtener-especialidades/:profesionId",
  UsuarioController.obtenerEspecialidades
);
router.post("/registro", UsuarioController.create);
router.get("/provincias", UsuarioController.obtenerProvincias);
router.get(
  "/obtener-localidades/:provinciaId",
  UsuarioController.obtenerLocalidades
);
router.get("/codigos-postales/:localidadId", UsuarioController.obtenerCp);
/* router.post(
  "/gestionUsuario",
  [
    body("nombre").optional().notEmpty().withMessage("El nombre es requerido"),
    body("apellido")
      .optional()
      .notEmpty()
      .withMessage("El apellido es requerido"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Ingrese un correo electrónico válido"),
    body("telefono")
      .optional()
      .notEmpty()
      .withMessage("El teléfono es requerido"),
    body("accion").notEmpty().withMessage("La acción es requerida"),
  ],
  UsuarioController.gestionUsuario
);

router.post(
  "/buscarUsuario",
  [
    body("documento")
      .notEmpty()
      .withMessage("El número de documento es requerido"),
  ],
  UsuarioController.buscarUsuario
); */

module.exports = router;
