const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const ProfesionalController = require("../controllers/profesionalController");
const { checkAuthentication } = require("../middleware/middleware");

router.get(
  "/datosProfesional",
  checkAuthentication,
  ProfesionalController.obtenerDatosProfesional
);
router.post(
  "/datosBasicos",
  checkAuthentication,
  ProfesionalController.obtenerDatosBasicos
);

module.exports = router;
