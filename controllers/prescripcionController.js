const pool = require("../config/database");

const { generarPDF } = require("../PDF/generarPDF");

const crearPrescripcion = async (req, res) => {
  const {
    idREFEPS,
    paciente_id,
    diagnostico_id,
    plan_id,
    vigencia,
    medicamentos,
    prestaciones,
    profesional,
    paciente,
    diagnostico,
  } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Crear la prescripción con la fecha actual usando NOW()
    const queryPrescripcion = `
      INSERT INTO prescripcion (idREFEPS, paciente_id, fecha, diagnostico_id, plan_id, vigencia) 
      VALUES (?, ?, NOW(), ?, ?, ?)
    `;
    const [prescripcionResult] = await connection.execute(queryPrescripcion, [
      idREFEPS,
      paciente_id,
      diagnostico_id,
      plan_id,
      vigencia,
    ]);
    const prescripcionId = prescripcionResult.insertId;

    // Insertar medicamentos
    for (let medicamento of medicamentos) {
      const {
        medicamentoId,
        administracion: { dosis, tiempo, duracion },
      } = medicamento;

      // Obtener o registrar IDs de dosis, intervalo de tiempo y duración
      const dosis_id = await obtenerIdONuevoRegistro("dosis", dosis);
      const intervalo_tiempo_id = await obtenerIdONuevoRegistro(
        "intervalo_tiempo",
        tiempo
      );
      const duracion_id = await obtenerIdONuevoRegistro("duracion", duracion);

      // Comprobar si la administración ya está registrada, sino, insertarla
      await obtenerIdONuevoRegistro(
        "administracion",
        null,
        dosis_id,
        intervalo_tiempo_id,
        duracion_id
      );

      const queryPrescripcionMedicamento = `
        INSERT INTO prescripcion_medicamento (prescripcion_id, medicamento_id, dosis_id, intervalo_tiempo_id, duracion_id) 
        VALUES (?, ?, ?, ?, ?)
      `;
      await connection.execute(queryPrescripcionMedicamento, [
        prescripcionId,
        medicamentoId,
        dosis_id,
        intervalo_tiempo_id,
        duracion_id,
      ]);
    }

    // Insertar prestaciones
    for (let prestacion of prestaciones) {
      const { id } = prestacion;
      const queryPrescripcionPrestacion = `
        INSERT INTO prescripcion_prestacion (prescripcion_id, prestacion_id) 
        VALUES (?, ?)
      `;
      await connection.execute(queryPrescripcionPrestacion, [
        prescripcionId,
        id,
      ]);
    }

    // Generar el PDF
    const pdfPath = await generarPDF({
      profesional,
      paciente,
      diagnostico,
      fechaPrescripcion: new Date().toISOString().split("T")[0], // Obtén la fecha actual en formato YYYY-MM-DD
      vigencia,
      medicamentos,
      prestaciones,
    });

    await connection.commit();

    res.status(201).json({
      message: "Prescripción creada exitosamente y PDF generado.",
      pdfPath: "../PDF/prescripcion.pdf", //  ruta del PDF al cliente
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error en la transacción:", error);
    res.status(500).json({ message: "Error al crear la prescripción" });
  } finally {
    connection.release();
  }
};

// Función para obtener o insertar un nuevo registro en la tabla
const obtenerIdONuevoRegistro = async (
  tabla,
  nombre,
  dosis_id = null,
  intervalo_tiempo_id = null,
  duracion_id = null
) => {
  const connection = await pool.getConnection();
  try {
    let query;
    let params;

    if (tabla === "administracion") {
      query = `SELECT 1 FROM administracion WHERE dosis_id = ? AND intervalo_tiempo_id = ? AND duracion_id = ?`;
      params = [dosis_id, intervalo_tiempo_id, duracion_id];
    } else {
      switch (tabla) {
        case "dosis":
          query = `SELECT id FROM dosis WHERE nombre = ?`;
          params = [nombre];
          break;
        case "intervalo_tiempo":
          query = `SELECT id FROM intervalo_tiempo WHERE nombre = ?`;
          params = [nombre];
          break;
        case "duracion":
          query = `SELECT id FROM duracion WHERE nombre = ?`;
          params = [nombre];
          break;
        default:
          throw new Error("Tabla no reconocida");
      }
    }

    const [result] = await connection.execute(query, params);

    if (result.length > 0) {
      return tabla === "administracion" ? params : result[0].id;
    } else {
      if (tabla === "administracion") {
        const insertQuery = `INSERT INTO administracion (dosis_id, intervalo_tiempo_id, duracion_id) VALUES (?, ?, ?)`;
        await connection.execute(insertQuery, params);
        return params; // Devolvemos los mismos ids que se usaron para la inserción
      } else {
        const insertQuery = `INSERT INTO ${tabla} (nombre) VALUES (?)`;
        const [insertResult] = await connection.execute(insertQuery, params);
        return insertResult.insertId;
      }
    }
  } catch (error) {
    console.error(`Error al obtener o insertar en ${tabla}:`, error);
    throw error;
  } finally {
    connection.release();
  }
};
// Función para obtener los diagnósticos
const buscarDiagnosticos = async (req, res, next) => {
  try {
    const [diagnosticos] = await pool.query(
      "SELECT id, descripcion FROM diagnostico"
    );
    res.json(diagnosticos);
  } catch (error) {
    console.error("Error obteniendo diagnósticos:", error);
    next(error);
  }
};
module.exports = {
  crearPrescripcion,
  buscarDiagnosticos,
};
