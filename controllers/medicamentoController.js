const pool = require("../config/database");
const Medicamento = require("../models/medicamento");
//const querystring = require("querystring");

const medicamentoController = {
  async obtenerPorId(req, res) {
    try {
      const id = req.params.id;
      const medicamento = await Medicamento.getById(id);
      res.json(medicamento);
    } catch (error) {
      console.error("Error al obtener medicamento por ID:", error);
      res.status(500).json({ error: "Error al obtener medicamento por ID" });
    }
  },

  async buscarNombreGenerico(req, res) {
    try {
      const terminoABuscar = req.query.q;
      console.log("Término a buscar:", terminoABuscar);
      const [results] = await pool.query(
        `SELECT m.id, m.nombre_generico, nc.nombre AS nombre_comercial, f.nombre AS forma_farmaceutica, p.nombre AS presentacion
       FROM medicamento m
       JOIN forma_farmaceutica f ON m.forma_farmaceutica_id = f.id
       JOIN presentacion p ON m.presentacion_id = p.id
       LEFT JOIN nombre_comercial nc ON m.nombre_comercial_id = nc.id
       LEFT JOIN medicamento_monodroga mm ON m.id = mm.medicamento_id
       WHERE m.nombre_generico LIKE ?
       GROUP BY m.id, f.nombre, p.nombre, nc.nombre`,
        [`%${terminoABuscar}%`]
      );
      res.json(results);
    } catch (error) {
      console.error("Error al buscar nombre genérico:", error);
      res.status(500).json({ error: "Error al buscar nombre genérico" });
    }
  },

  // Función para buscar medicamento por nombre genérico
  async buscarPorId(req, res) {
    console.log("aqui ingreso!!!:", req.params.id);
    console.log("Medicamento ID recibido:", req.params.id);
    try {
      const medicamentoId = req.params.id;
      console.log("Medicamento ID recibido42:", medicamentoId);

      const [medicamentos] = await pool.query(
        "SELECT * FROM medicamento WHERE id = ?",
        [medicamentoId]
      );

      if (medicamentos.length === 0) {
        return res.status(404).json({ error: "Medicamento no encontrado" });
      }

      const medicamento = medicamentos[0];

      const [categoria] = await pool.query(
        "SELECT * FROM categoria_medicamento WHERE id = ?",
        [medicamento.categoria_medicamento_id]
      );
      const [familia] = await pool.query(
        "SELECT * FROM familia_medicamento WHERE id = ?",
        [medicamento.familia_medicamento_id]
      );
      const [formaFarmaceutica] = await pool.query(
        "SELECT * FROM forma_farmaceutica WHERE id = ?",
        [medicamento.forma_farmaceutica_id]
      );
      const [presentacion] = await pool.query(
        "SELECT * FROM presentacion WHERE id = ?",
        [medicamento.presentacion_id]
      );

      const [componentesConsulta] = await pool.query(
        `SELECT mm.id, mm.monodroga_id, m.nombre AS monodroga, c.cantidad, u.id AS unidad_id, u.nombre AS unidad
        FROM medicamento_monodroga mm
        JOIN monodroga m ON mm.monodroga_id = m.id
        LEFT JOIN concentracion c ON mm.concentracion_id = c.id
        LEFT JOIN unidad u ON c.unidad_id = u.id
        WHERE mm.medicamento_id = ?
        ORDER BY mm.orden;`,
        [medicamento.id]
      );

      const componentes = componentesConsulta.map((componente) => ({
        id: componente.id,
        monodroga: componente.monodroga,
        unidadSeleccionadaId: componente.unidad_id,
        concentraciones: parseFloat(componente.cantidad),
      }));

      const [nombreComercial] = await pool.query(
        "SELECT * FROM nombre_comercial WHERE id = ?",
        [medicamento.nombre_comercial_id]
      );

      // Preparar datos del medicamento para enviar como respuesta
      const response = {
        id: medicamento.id,
        nombre_generico: medicamento.nombre_generico,
        nombre_comercial:
          nombreComercial.length > 0
            ? { id: nombreComercial[0].id, nombre: nombreComercial[0].nombre }
            : null,
        estado: medicamento.estado,
        categoria_medicamento:
          categoria.length > 0
            ? { id: categoria[0].id, nombre: categoria[0].nombre }
            : null,
        familia_medicamento:
          familia.length > 0
            ? { id: familia[0].id, nombre: familia[0].nombre }
            : null,
        forma_farmaceutica: {
          id: formaFarmaceutica[0].id,
          nombre: formaFarmaceutica[0].nombre,
        },
        presentacion: {
          id: presentacion[0].id,
          nombre: presentacion[0].nombre,
        },
        componentes,
      };

      console.log(response);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error al buscar medicamento:", error);
      res.status(500).json({ error: "Error al buscar medicamento" });
    }
  },
  async crear(req, res) {
    const conn = await pool.getConnection();
    try {
      const {
        nombre_generico,
        nombre_comercial,
        categoria,
        familia,
        forma_farmaceutica,
        presentacion,
        estado,
        componentes,
      } = req.body;

      await conn.beginTransaction();

      const nombreComercialId = await insertOrGetId(
        conn,
        "nombre_comercial",
        nombre_comercial
      );
      const categoriaMedicamentoId = await insertOrGetId(
        conn,
        "categoria_medicamento",
        categoria
      );
      const familiaMedicamentoId = await insertOrGetId(
        conn,
        "familia_medicamento",
        familia
      );
      const formaFarmaceuticaId = await insertOrGetId(
        conn,
        "forma_farmaceutica",
        forma_farmaceutica
      );
      const presentacionId = await insertOrGetId(
        conn,
        "presentacion",
        presentacion
      );
      const [existingEntry] = await conn.query(
        `SELECT * FROM forma_presentacion WHERE forma_farmaceutica_id = ? AND presentacion_id = ?`,
        [formaFarmaceuticaId, presentacionId]
      );

      if (existingEntry.length === 0) {
        // Insertar la relación en la tabla forma_presentacion solo si no existe
        await conn.query(
          `INSERT INTO forma_presentacion (forma_farmaceutica_id, presentacion_id) VALUES (?, ?)`,
          [formaFarmaceuticaId, presentacionId]
        );
      }

      const [result] = await conn.query(
        `INSERT INTO medicamento (nombre_generico, nombre_comercial_id, forma_farmaceutica_id, 
          presentacion_id, categoria_medicamento_id, familia_medicamento_id, estado) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre_generico,
          nombreComercialId,
          formaFarmaceuticaId,
          presentacionId,
          categoriaMedicamentoId,
          familiaMedicamentoId,
          estado,
        ]
      );

      const medicamentoId = result.insertId;

      let orden = 1;
      for (const componente of componentes) {
        const monodrogaId = await insertOrGetId(
          conn,
          "monodroga",
          componente.monodroga
        );

        // Primera concentración
        const unidadId = await insertOrGetId(conn, "unidad", componente.unidad);
        const concentracionId = await insertOrGetConcentrationId(
          conn,
          parseFloat(componente.cantidad),
          unidadId
        );
        await conn.query(
          "INSERT INTO medicamento_monodroga (medicamento_id, monodroga_id, concentracion_id, orden) VALUES (?, ?, ?, ?)",
          [medicamentoId, monodrogaId, concentracionId, orden]
        );
        orden++;

        // Concentraciones adicionales
        for (const extraConcentracion of componente.concentraciones) {
          const extraUnidadId = await insertOrGetId(
            conn,
            "unidad",
            extraConcentracion.unidad
          );
          const extraConcentracionId = await insertOrGetConcentrationId(
            conn,
            parseFloat(extraConcentracion.cantidad),
            extraUnidadId
          );
          await conn.query(
            "INSERT INTO medicamento_monodroga (medicamento_id, monodroga_id, concentracion_id, orden) VALUES (?, ?, ?, ?)",
            [medicamentoId, monodrogaId, extraConcentracionId, orden]
          );
          orden++;
        }
      }
      await conn.commit();
      console.log("Medicamento creado exitosamente");
      return res
        .status(201)
        .json({ message: "Medicamento creado exitosamente", medicamentoId });
    } catch (error) {
      await conn.rollback();
      console.error("Error al crear el medicamento:", error);
      return res.status(500).json({ message: "Error al crear el medicamento" });
    } finally {
      conn.release();
    }
  },

  async modificar(req, res) {
    const conn = await pool.getConnection();
    try {
      const id = req.params.id;
      const {
        nombre_generico,
        nombre_comercial,
        categoria,
        familia,
        forma_farmaceutica,
        presentacion,
        estado,
        componentes,
      } = req.body;

      // Validar ID de medicación
      if (!id) {
        throw new Error("El ID del medicamento es requerido.");
      }

      // Validar datos de los componentes
      function validateComponent(component) {
        component.concentraciones.forEach((conc, index) => {
          if (!conc.cantidad) {
            throw new Error(
              `Cantidad de la concentración ${index + 1} es requerida.`
            );
          }
          if (!conc.unidadSeleccionadaId) {
            throw new Error(
              `Unidad de la concentración ${index + 1} es requerida.`
            );
          }
        });
      }

      componentes.forEach(validateComponent);
      await conn.beginTransaction();

      // Verificar que la medicación existe
      const [existingMedicamento] = await conn.query(
        `SELECT * FROM medicamento WHERE id = ?`,
        [id]
      );

      if (existingMedicamento.length === 0) {
        throw new Error("El medicamento no existe.");
      }

      // Actualizar el medicamento
      const medicamento = await Medicamento.getById(id);
      medicamento.nombreGenerico = nombre_generico;
      medicamento.nombreComercialId = await insertOrGetId(
        conn,
        "nombre_comercial",
        nombre_comercial || null
      );
      medicamento.formaFarmaceuticaId = await insertOrGetId(
        conn,
        "forma_farmaceutica",
        forma_farmaceutica
      );
      medicamento.presentacionId = await insertOrGetId(
        conn,
        "presentacion",
        presentacion
      );
      medicamento.categoriaMedicamentoId = await insertOrGetId(
        conn,
        "categoria_medicamento",
        categoria || null
      );
      medicamento.familiaMedicamentoId = await insertOrGetId(
        conn,
        "familia_medicamento",
        familia || null
      );
      medicamento.estado = estado;

      await conn.query(
        `UPDATE medicamento SET nombre_generico = ?, nombre_comercial_id = ?, forma_farmaceutica_id = ?, 
    presentacion_id = ?, categoria_medicamento_id = ?, familia_medicamento_id = ?, estado = ? 
    WHERE id = ?`,
        [
          medicamento.nombreGenerico,
          medicamento.nombreComercialId,
          medicamento.formaFarmaceuticaId,
          medicamento.presentacionId,
          medicamento.categoriaMedicamentoId,
          medicamento.familiaMedicamentoId,
          medicamento.estado,
          id,
        ]
      );

      // Actualizar la relación en la tabla forma_presentacion
      const [existingEntry] = await conn.query(
        `SELECT * FROM forma_presentacion WHERE forma_farmaceutica_id = ? AND presentacion_id = ?`,
        [
          await insertOrGetId(conn, "forma_farmaceutica", forma_farmaceutica),
          await insertOrGetId(conn, "presentacion", presentacion),
        ]
      );

      if (existingEntry.length === 0) {
        await conn.query(
          `INSERT INTO forma_presentacion (forma_farmaceutica_id, presentacion_id) VALUES (?, ?)`,
          [
            await insertOrGetId(conn, "forma_farmaceutica", forma_farmaceutica),
            await insertOrGetId(conn, "presentacion", presentacion),
          ]
        );
      }
      console.log("componentes", componentes);
      // Eliminar componentes antiguos sólo si hay nuevos componentes
      if (componentes.length > 0) {
        await conn.query(
          "DELETE FROM medicamento_monodroga WHERE medicamento_id = ?",
          [id]
        );
      }

      // Insertar componentes nuevos
      let orden = 1;
      for (const componente of componentes) {
        const monodrogaId = await insertOrGetId(
          conn,
          "monodroga",
          componente.monodroga
        );

        for (const extraConcentracion of componente.concentraciones) {
          const extraUnidadId = await insertOrGetId(
            conn,
            "unidad",
            extraConcentracion.unidadSeleccionadaId
          );
          const extraConcentracionId = await insertOrGetConcentrationId(
            conn,
            extraConcentracion.cantidad,
            extraUnidadId
          );
          await conn.query(
            "INSERT INTO medicamento_monodroga (medicamento_id, monodroga_id, concentracion_id, orden) VALUES (?, ?, ?, ?)",
            [id, monodrogaId, extraConcentracionId, orden]
          );
          orden++;
        }
      }

      await conn.commit();
      console.log("Medicamento actualizado exitosamente");
      res.status(200).json({ message: "Medicamento actualizado exitosamente" });
    } catch (error) {
      await conn.rollback();
      console.error("Error al actualizar el medicamento:", error);
      res.status(500).json({
        message: "Error al actualizar el medicamento",
        error: error.message,
      });
    } finally {
      conn.release();
    }
  },
  async obtenerDosis(req, res) {
    try {
      console.log(req);
      console.log(res);
      console.log("Entrando a obtenerDosis");
      const terminoABuscar = req.query.q || "";
      //console.log("Término a buscar:", terminoABuscar);
      const [results] = await pool.query(`SELECT id, nombre FROM dosis `);
      //console.log("Resultados de la consulta:", results);
      res.json(results);
    } catch (error) {
      console.error("Error al buscar dosis:", error);
      res.status(500).json({ error: "Error al buscar dosis" });
    }
  },

  async obtenerIntervalosTiempo(req, res) {
    try {
      console.log(req);
      console.log(res);
      //console.log("Entrando a obtenerIntervalosTiempo");
      const terminoABuscar = req.query.q || "";
      //console.log("Término a buscar:", terminoABuscar);
      const [results] = await pool.query(
        `SELECT id, nombre FROM intervalo_tiempo `
      );
      // console.log("Resultados de la consulta:", results);
      res.json(results);
    } catch (error) {
      console.error("Error al buscar intervalos de tiempo:", error);
      res.status(500).json({ error: "Error al buscar intervalos de tiempo" });
    }
  },

  async obtenerDuraciones(req, res) {
    try {
      //console.log("Entrando a obtenerDuraciones");
      const terminoABuscar = req.query.q || "";
      console.log("Término a buscar:", terminoABuscar);
      const [results] = await pool.query(`SELECT id, nombre FROM duracion`);
      // console.log("Resultados de la consulta:", results);
      res.json(results);
    } catch (error) {
      console.error("Error al buscar duraciones:", error);
      res.status(500).json({ error: "Error al buscar duraciones" });
    }
  },

  async obtenerOpcionesForm(req, res) {
    try {
      const [unidades] = await pool.query("SELECT * FROM unidad");
      const [monodrogas] = await pool.query("SELECT * FROM monodroga");
      const [categorias] = await pool.query(
        "SELECT * FROM categoria_medicamento"
      );
      const [familias] = await pool.query("SELECT * FROM familia_medicamento");
      const [formas] = await pool.query("SELECT * FROM forma_farmaceutica");
      //console.log(formas);
      const [presentaciones] = await pool.query(`
      SELECT p.id, p.nombre, fp.forma_farmaceutica_id, ff.nombre AS forma_nombre
      FROM presentacion p
      JOIN forma_presentacion fp ON p.id = fp.presentacion_id
      JOIN forma_farmaceutica ff ON fp.forma_farmaceutica_id = ff.id
    `);

      // Agrupar presentaciones por forma farmacéutica
      const presentacionesPorForma = {};
      presentaciones.forEach((presentacion) => {
        const formaNombre = presentacion.forma_nombre.toLowerCase();
        if (!presentacionesPorForma[formaNombre]) {
          presentacionesPorForma[formaNombre] = [];
        }
        presentacionesPorForma[formaNombre].push({
          id: presentacion.id,
          nombre: presentacion.nombre,
        });
      });
      console.log(presentacionesPorForma);
      res.json({
        unidades,
        formOptions: {
          monodrogas,
          categorias,
          familias,
          formas,
          presentaciones: presentacionesPorForma,
        },
      });
    } catch (error) {
      console.error("Error al obtener opciones de formulario:", error);
      res
        .status(500)
        .json({ error: "Error al obtener opciones de formulario" });
    }
  },
};

// Función reutilizable para insertar o obtener el ID de un registro
async function insertOrGetId(conn, tableName, value) {
  if (!value) {
    return null;
  }

  // Si el valor es un número, asumimos que es un ID y lo retornamos directamente
  if (!isNaN(value)) {
    return value;
  }

  // Si el valor es una cadena, asumimos que es un nombre y buscamos su ID
  let [rows] = await conn.query(
    `SELECT id FROM ${tableName} WHERE nombre = ?`,
    [value]
  );

  if (rows.length > 0) {
    return rows[0].id;
  }

  // Si no encontramos el nombre, lo insertamos y retornamos el nuevo ID
  let result = await conn.query(
    `INSERT INTO ${tableName} (nombre) VALUES (?)`,
    [value]
  );

  return result[0].insertId;
}

// Función específica para obtener el ID de la concentración
async function insertOrGetConcentrationId(conn, cantidad, unidadId) {
  let [rows] = await conn.query(
    `SELECT id FROM concentracion WHERE cantidad = ? AND unidad_id = ?`,
    [cantidad, unidadId]
  );

  if (rows.length > 0) {
    return rows[0].id;
  }

  let result = await conn.query(
    `INSERT INTO concentracion (cantidad, unidad_id) VALUES (?, ?)`,
    [cantidad, unidadId]
  );

  return result[0].insertId;
}

module.exports = medicamentoController;
