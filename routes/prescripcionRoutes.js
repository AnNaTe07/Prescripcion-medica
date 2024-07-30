const express = require("express");
const router = express.Router();
const PrescripcionController = require("../controllers/PrescripcionController");

//Ruta para crear prescripcion
router.post("/crear", PrescripcionController.crearPrescripcion);
// Ruta para obtener los diagnósticos
router.get("/diagnosticos", PrescripcionController.buscarDiagnosticos);
module.exports = router;
