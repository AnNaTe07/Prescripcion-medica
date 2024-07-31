const express = require("express");
const router = express.Router();
const PrescripcionController = require("../controllers/prescripcionController");

//Ruta para crear prescripcion
router.post("/crear", PrescripcionController.crearPrescripcion);
// Ruta para obtener los diagnósticos
router.get("/diagnosticos", PrescripcionController.buscarDiagnosticos);
router.post(
  "/anteriores/:paciente_id",
  PrescripcionController.getPrescripcionesAnteriores
);
router.put(
  "/prestacion/:prescripcionId/:prestacionId",
  PrescripcionController.modificarPrestacion
);
module.exports = router;
