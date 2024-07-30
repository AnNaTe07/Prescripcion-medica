const express = require("express");
const router = express.Router();
const pacienteController = require("../controllers/pacienteController");

//router.post("/", pacienteController.create);
//router.get("/:id", pacienteController.getById);
//router.get("/", pacienteController.getAll);
// Ruta para buscar paciente por documento
router.get("/buscar", pacienteController.buscarPacientePorDocumento);
// Ruta para registrar un nuevo paciente
router.post("/registrar", pacienteController.registrarPaciente);

// Ruta para modificar un paciente existente
router.put("/modificar/:id", pacienteController.modificarPaciente);
module.exports = router;
