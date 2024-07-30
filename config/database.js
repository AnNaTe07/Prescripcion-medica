// config/database.js--Este archivo configura y exporta una conexión de pool a la base de datos usando mysql2/promise.
/* Es útil para cualquier operación directa con la base de datos que necesite una conexión del pool. para manejar la conexión de la base de datos. */
const mysql = require("mysql2/promise");
//const config = require("./config");
//require("dotenv").config();

const pool = mysql.createPool({
  host: "localhost", //config.env.DB_HOST,
  user: "root", //config.env.DB_USER,
  password: "", //config.env.DB_PASSWORD,
  database: "prescripcion", // config.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Prueba de conexión
/*pool
  .getConnection()
  .then((conn) => {
    console.log("Conexión a la base de datos exitosa.");
    conn.release();
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
  });*/

module.exports = pool;
