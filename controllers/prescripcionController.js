const pool = require("../config/database");
const nodemailer = require("nodemailer");
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
    enviarEmail,
    pacienteEmail,
  } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Registro de depuración
    console.log("Datos de entrada:", req.body);

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

    // Registro de depuración
    console.log("Prescripción creada con ID:", prescripcionId);

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

      // Registro de depuración
      console.log("IDs de administración:", {
        dosis_id,
        intervalo_tiempo_id,
        duracion_id,
      });

      // Compruebo si la administración ya está registrada, sino, se insertar
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

      // Registro de depuración
      console.log("Medicamento insertado:", {
        prescripcionId,
        medicamentoId,
        dosis_id,
        intervalo_tiempo_id,
        duracion_id,
      });
    }

    // Inserto prestaciones con posicion_id y observacion
    for (let prestacion of prestaciones) {
      const { id: prestacion_id, posicionId, observacion } = prestacion;

      // Registro de depuración
      console.log("Prestación a insertar:", {
        prestacion_id,
        posicionId,
        observacion,
      });

      // Insertar en prescripcion_prestacion con posicion_id y observacion
      const queryPrescripcionPrestacion = `
        INSERT INTO prescripcion_prestacion (prescripcion_id, prestacion_id, posicion_id, observacion) 
        VALUES (?, ?, ?, ?)
      `;
      await connection.execute(queryPrescripcionPrestacion, [
        prescripcionId,
        prestacion_id, // Aquí usamos prestacion_id
        posicionId,
        observacion || null, // Si no hay observación, establecer como NULL
      ]);

      // Registro de depuración
      console.log("Prestación insertada:", {
        prescripcionId,
        prestacion_id,
        posicionId,
        observacion,
      });

      // Verificar si la combinación prestacion_id y posicionId ya existe en prestacion_posicion
      const checkPrestacionPosicion = `
        SELECT COUNT(*) as count FROM prestacion_posicion 
        WHERE prestacion_id = ? AND posicion_id = ?
      `;
      const [rows] = await connection.execute(checkPrestacionPosicion, [
        prestacion_id,
        posicionId,
      ]);
      const count = rows[0].count;

      if (count === 0) {
        // Insertar en prestacion_posicion si no existe
        const queryPrestacionPosicion = `
          INSERT INTO prestacion_posicion (prestacion_id, posicion_id) 
          VALUES (?, ?)
        `;
        await connection.execute(queryPrestacionPosicion, [
          prestacion_id,
          posicionId,
        ]);

        // Registro de depuración
        console.log("Prestacion_posicion insertada:", {
          prestacion_id,
          posicionId,
        });
      } else {
        // Registro de depuración
        console.log("Prestacion_posicion ya existe:", {
          prestacion_id,
          posicionId,
        });
      }
    }

    // Generar el PDF
    const pdfPath = await generarPDF({
      profesional,
      paciente,
      diagnostico,
      fechaPrescripcion: new Date().toISOString().split("T")[0], // fecha actual en formato YYYY-MM-DD
      vigencia,
      medicamentos,
      prestaciones,
    });

    await connection.commit();

    if (enviarEmail) {
      if (!pacienteEmail) {
        throw new Error("Email del paciente no proporcionado");
      }
      // Configuro el transporte de correo electrónico (utilizando nodemailer)
      const transporter = nodemailer.createTransport({
        service: "outlook",
        auth: {
          user: "andreanataliatello@outlook.com",
          pass: "Amorina11",
          //user: "usuarioprueba77@hotmail.com",
          //pass: "77usuarioprueba",
        },
      });
      console.log("PDF Path:", pacienteEmail);
      // Configuro las opciones del correo electrónico
      const mailOptions = {
        from: "andreanataliatello@outlook.com",
        to: pacienteEmail, // correo electrónico del paciente
        subject: "Prescripción Médica",
        text: "Adjunto encontrará su prescripción médica.",
        attachments: [
          {
            path: pdfPath,
          },
        ],
      };

      // Envío el correo electrónico
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error al enviar el correo electrónico:", error);
        } else {
          console.log("Correo electrónico enviado:", info.response);
        }
      });
    }
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
const buildInClause = (array) => {
  return array.map(() => "?").join(",");
};
const getPrescripcionesAnteriores = async (req, res) => {
  const { paciente_id } = req.params;
  const { idREFEPS } = req.body;
  console.log("IdREFEPS:", idREFEPS);
  console.log("PacienteId:", paciente_id);

  try {
    // Consulta para obtener prescripciones
    const prescripcionQuery = `
      SELECT 
        p.id AS prescripcion_id,
        p.fecha,
        d.descripcion AS nombre_diagnostico
      FROM 
        prescripcion p
        LEFT JOIN diagnostico d ON p.diagnostico_id = d.id
      WHERE 
        p.idREFEPS = ? AND p.paciente_id = ?
      ORDER BY 
        p.fecha DESC;
    `;
    const [prescripciones] = await pool.execute(prescripcionQuery, [
      idREFEPS,
      paciente_id,
    ]);

    if (prescripciones.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron prescripciones" });
    }

    // Obtengo una lista de IDs de prescripción
    const prescripcionIds = prescripciones.map((p) => p.prescripcion_id);

    if (prescripcionIds.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron prescripciones con los IDs dados" });
    }

    // Consulta para obtener medicamentos
    const medicamentosQuery = `
      SELECT 
        pm.prescripcion_id,
        m.nombre_generico AS nombre_medicamento,
        ds.nombre AS nombre_dosis,
        it.nombre AS nombre_intervalo_tiempo,
        du.nombre AS nombre_duracion
      FROM 
        prescripcion_medicamento pm
        LEFT JOIN medicamento m ON pm.medicamento_id = m.id
        LEFT JOIN dosis ds ON pm.dosis_id = ds.id
        LEFT JOIN intervalo_tiempo it ON pm.intervalo_tiempo_id = it.id
        LEFT JOIN duracion du ON pm.duracion_id = du.id
      WHERE 
        pm.prescripcion_id IN (${buildInClause(prescripcionIds)})
      ORDER BY 
        pm.prescripcion_id;
    `;
    const [medicamentos] = await pool.execute(
      medicamentosQuery,
      prescripcionIds
    );

    // Consulta para obtener prestaciones y posiciones de manera optimizada
    const prestacionesQuery = `
      SELECT 
        pr.prescripcion_id,
        pr.prestacion_id,
        pt.nombre AS nombre_prestacion,
        pos.nombre AS nombre_posicion,
        pr.observacion
      FROM 
        prescripcion_prestacion pr
        LEFT JOIN prestacion pt ON pr.prestacion_id = pt.id
        LEFT JOIN (
          SELECT ppos.prestacion_id, pos.nombre 
          FROM prestacion_posicion ppos 
          LEFT JOIN posicion pos ON ppos.posicion_id = pos.id
        ) pos ON pr.prestacion_id = pos.prestacion_id
      WHERE 
        pr.prescripcion_id IN (${buildInClause(prescripcionIds)})
      ORDER BY 
        pr.prescripcion_id;
    `;
    const [prestaciones] = await pool.execute(
      prestacionesQuery,
      prescripcionIds
    );

    const formatearFecha = (fecha) => {
      const date = new Date(fecha);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const resultadosAgrupados = {};
    console.log("Prescripciones:", prescripciones);
    prescripciones.forEach((prescripcion) => {
      resultadosAgrupados[prescripcion.prescripcion_id] = {
        fecha: formatearFecha(prescripcion.fecha),
        diagnostico: prescripcion.nombre_diagnostico,
        medicamentos: [],
        prestaciones: [],
      };
    });

    medicamentos.forEach((medicamento) => {
      if (resultadosAgrupados[medicamento.prescripcion_id]) {
        resultadosAgrupados[medicamento.prescripcion_id].medicamentos.push({
          nombre_generico: medicamento.nombre_medicamento,
          dosis: medicamento.nombre_dosis,
          intervalo_tiempo: medicamento.nombre_intervalo_tiempo,
          duracion: medicamento.nombre_duracion,
        });
      }
    });

    const prestacionesMap = new Map();
    prestaciones.forEach((prestacion) => {
      const key = `${prestacion.prescripcion_id}-${prestacion.prestacion_id}`;
      if (!prestacionesMap.has(key)) {
        prestacionesMap.set(key, {
          prestacion_id: prestacion.prestacion_id,
          nombre_prestacion: prestacion.nombre_prestacion,
          nombre_posicion: prestacion.nombre_posicion, // Incluye el nombre de la posición
          observacion: prestacion.observacion || "N/A",
        });
      }
    });

    prestacionesMap.forEach((prestacion, key) => {
      const [prescripcion_id, prestacion_id] = key.split("-");
      if (resultadosAgrupados[prescripcion_id]) {
        resultadosAgrupados[prescripcion_id].prestaciones.push(prestacion);
      }
    });

    res.status(200).json(resultadosAgrupados);
  } catch (error) {
    console.error("Error al obtener las prescripciones anteriores:", error);
    res
      .status(500)
      .json({ error: "Error al obtener las prescripciones anteriores" });
  }
};
//para agregar la observacion
const modificarPrestacion = async (req, res) => {
  const { prescripcionId, prestacionId } = req.params;
  const { observacion } = req.body;
  console.log("prescripcionId:", prescripcionId);
  console.log("prestacionId:", prestacionId);
  try {
    const [result] = await pool.query(
      "UPDATE prescripcion_prestacion SET observacion = ? WHERE prescripcion_id = ? AND prestacion_id = ?",
      [observacion, prescripcionId, prestacionId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Prestación no encontrada" });
    }
    res.status(200).json({ message: "Observación actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar la observación:", error);
    res.status(500).json({ error: "Error al actualizar la observación" });
  }
};
module.exports = {
  crearPrescripcion,
  buscarDiagnosticos,
  getPrescripcionesAnteriores,
  modificarPrestacion,
};
