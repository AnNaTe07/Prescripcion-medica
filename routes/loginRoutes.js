const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");

router.post("/", loginController.processLogin); // Esta ruta procesa el inicio de sesión
router.get("/logout", loginController.logoutSession); // Esta ruta procesa el cierre de sesión
module.exports = router;
