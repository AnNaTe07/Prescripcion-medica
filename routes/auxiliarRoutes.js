const express = require("express");
const router = express.Router();
const auxiliarController = require("../controllers/auxiliarController");

router.get("/tipos-dni", auxiliarController.getTiposDNI);
router.get("/sexos", auxiliarController.getSexos);
router.get("/obras-sociales", auxiliarController.getObrasSociales);
router.get("/planes", auxiliarController.getPlanes);
//router.get("/diagnosticos", auxiliarController.getDiagnosticos);
router.get("/obtenerTiposPrestacion", auxiliarController.getTiposPrestacion);

module.exports = router;
