const express = require("express");
const router = express.Router();
const prestacionController = require("../controllers/prestacionController");

router.get(
  "/obtenerNombresPrestacionPorTipo/:tipo",
  prestacionController.getNombresPrestacionPorTipo
);
router.get(
  "/obtenerOpcionesRelacionadasPorNombre/:nombreSeleccionado",
  prestacionController.getOpcionesRelacionadasPorNombre
);
router.get(
  "/prestacion/id/:nombrePrestacion",
  prestacionController.getIdPrestacionPorNombre
);

module.exports = router;
