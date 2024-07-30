const express = require("express");
const router = express.Router();
const medicamentoController = require("../controllers/medicamentoController");

router.get("/buscar/:id", medicamentoController.obtenerPorId);
router.get("/buscar", medicamentoController.buscarNombreGenerico);
/* router.get(
  "/:id/nombres-comerciales",
  medicamentoController.buscarNombresComerciales
); */

router.get("/buscarPorId/:id", medicamentoController.buscarPorId);
router.post("/registrarMedicamento", medicamentoController.crear);
router.put("/modificar/:id", medicamentoController.modificar);
//router.delete("/borrar/:id", medicamentoController.delete);
//router.get("/", medicamentoController.getAll);
router.get("/form-options", medicamentoController.obtenerOpcionesForm);
// rutas para dosis, intervalos de tiempo y duraciones
router.get("/dosis", medicamentoController.obtenerDosis);
router.get("/tiempo", medicamentoController.obtenerIntervalosTiempo);
router.get("/duracion", medicamentoController.obtenerDuraciones);

module.exports = router;
