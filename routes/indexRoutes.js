const express = require("express");
const router = express.Router();

// Importar los controladores
const usuarioController = require("../controllers/usuarioController");
const personaController = require("../controllers/personaController");
const profesionalController = require("../controllers/profesionalController");

// Rutas para Usuarios
router.get("/usuarios", usuarioController.getAllUsuarios);
router.get("/usuarios/:id", usuarioController.getUsuarioById);
router.post("/usuarios", usuarioController.createUsuario);
router.put("/usuarios/:id", usuarioController.updateUsuario);
router.delete("/usuarios/:id", usuarioController.deleteUsuario);

// Rutas para Personas
router.get("/personas", personaController.getAllPersonas);
router.get("/personas/:id", personaController.getPersonaById);
router.post("/personas", personaController.createPersona);
router.put("/personas/:id", personaController.updatePersona);

// Rutas para Profesionales
router.get("/profesionales", profesionalController.getAllProfesionales);
router.get("/profesionales/:id", profesionalController.getProfesionalById);
router.post("/profesionales", profesionalController.createProfesional);
router.put("/profesionales/:id", profesionalController.updateProfesional);
router.delete("/profesionales/:id", profesionalController.deleteProfesional);

module.exports = router;
