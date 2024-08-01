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

module.exports = router;
