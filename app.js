const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const usuarioRoutes = require("./routes/usuarioRoutes");
const loginRoutes = require("./routes/loginRoutes");
const auxiliarRoutes = require("./routes/auxiliarRoutes");
const pacienteRoutes = require("./routes/pacienteRoutes");
const prestacionRoutes = require("./routes/prestacionRoutes");
const medicamentoRoutes = require("./routes/medicamentoRoutes");
const profesionalRoutes = require("./routes/profesionalRoutes");
const prescripcionRoutes = require("./routes/prescripcionRoutes");

const { checkAuthentication } = require("./middleware/middleware");

const app = express();

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
//la carpeta 'pdf' como estática
app.use("/pdf", express.static(path.join(__dirname, "PDF")));

// Middleware para analizar el cuerpo de las solicitudes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración del motor de plantillas
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Middleware de sesión
app.use(
  session({
    secret: "laboratorio2",
    resave: false, //evita que la sesión se reescriba si no ha cambiado
    saveUninitialized: true, //guarda la sesión aunque no se inicialice
    cookie: { secure: false }, //configuracion de desarrollo
  })
);

// Ruta para renderizar la página de inicio de sesión (login)
app.get("/", (req, res) => {
  res.render("login");
});

// Ruta para procesar el inicio de sesión (POST)
app.use("/login", loginRoutes);
// Ruta para formPrescripcion
app.get("/formPrescripcion", checkAuthentication, (req, res) => {
  if (
    req.session.rol === "profesional" ||
    req.session.rol === "admin_profesional"
  ) {
    res.render("formPrescripcion", {
      usuario: req.session.userId,
      rol: req.session.rol,
    });
  } else {
    res.redirect("/"); // Redirige si el rol no tiene acceso
  }
});
// Rutas protegidas
app.get("/inicio", checkAuthentication, (req, res) => {
  const rol = req.session.rol;
  console.log("Rol en /inicio:", rol);
  res.render("inicio", {
    usuario: req.session.userId,
    rol: req.session.rol,
  });
});

app.get("/formUsuario", checkAuthentication, (req, res) => {
  if (
    req.session.rol === "administrador" ||
    req.session.rol === "admin_profesional"
  ) {
    res.render("formUsuario", {
      usuario: req.session.userId,
      rol: req.session.rol,
    });
  } else {
    res.redirect("/"); // Redirige si el rol no tiene acceso
  }
});

/* app.get("/formPaciente", checkAuthentication, (req, res) => {
  res.render("formPaciente");
}); */

app.get("/formMedicamento", checkAuthentication, (req, res) => {
  if (
    req.session.rol === "administrador" ||
    req.session.rol === "admin_profesional"
  ) {
    res.render("formMedicamento", {
      usuario: req.session.userId,
      rol: req.session.rol,
    });
  } else {
    res.redirect("/"); // Redirige si el rol no tiene acceso
  }
});

app.use("/aux", auxiliarRoutes);
app.use("/pacientes", pacienteRoutes);
app.use("/", prestacionRoutes);
app.use("/medicamentos", medicamentoRoutes);
app.use("/usuario", usuarioRoutes);
app.use("/profesional", profesionalRoutes);
app.use("/prescripcion", prescripcionRoutes);
// Ruta por defecto para manejar otras peticiones
app.use((req, res) => {
  res.status(404).send("Página no encontrada");
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
