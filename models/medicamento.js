const pool = require("../config/database");

class Medicamento {
  constructor(
    id,
    nombreGenerico,
    nombreComercialId,
    formaFarmaceuticaId,
    presentacionId,
    categoriaMedicamentoId,
    familiaMedicamentoId
  ) {
    this.id = id;
    this.nombreGenerico = nombreGenerico;
    this.nombreComercialId = nombreComercialId;
    this.formaFarmaceuticaId = formaFarmaceuticaId;
    this.presentacionId = presentacionId;
    this.categoriaMedicamentoId = categoriaMedicamentoId;
    this.familiaMedicamentoId = familiaMedicamentoId;
  }

  static async getById(id) {
    const [rows] = await pool.query("SELECT * FROM medicamento WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      throw new Error("Medicamento no encontrado");
    }
    const medicamentoData = rows[0];
    return new Medicamento(
      medicamentoData.id,
      medicamentoData.nombre_generico,
      medicamentoData.nombre_comercial_id,
      medicamentoData.forma_farmaceutica_id,
      medicamentoData.presentacion_id,
      medicamentoData.categoria_medicamento_id,
      medicamentoData.familia_medicamento_id
    );
  }

  static async findOne({ nombre_generico }) {
    const [rows] = await pool.query(
      `SELECT * FROM medicamento WHERE nombre_generico = ? LIMIT 1`,
      [nombre_generico]
    );
    if (rows.length === 0) {
      return null;
    }
    const medicamentoData = rows[0];
    return new Medicamento(
      medicamentoData.id,
      medicamentoData.nombre_generico,
      medicamentoData.nombre_comercial_id,
      medicamentoData.forma_farmaceutica_id,
      medicamentoData.presentacion_id,
      medicamentoData.categoria_medicamento_id,
      medicamentoData.familia_medicamento_id
    );
  }

  static async buscarNombre(query) {
    const sql = `SELECT DISTINCT nombre_generico FROM medicamento WHERE nombre_generico LIKE ? LIMIT 10`;
    try {
      const [results] = await pool.query(sql, [`%${query}%`]);
      return results.map((result) => result.nombre_generico);
    } catch (error) {
      console.error("Error en buscarNombre:", error);
      throw error; // Lanza el error para manejarlo en el controlador
    }
  }

  async create(req, res) {
    const conn = await pool.getConnection();
    try {
      const {
        nombre_comercial,
        forma_farmaceutica,
        presentacion,
        categoria,
        familia,
        estado,
        componentes,
      } = req.body;

      await conn.beginTransaction();

      const nombreComercialId = await insertOrGetId(
        conn,
        "nombre_comercial",
        nombre_comercial
      );

      const formaFarmaceuticaId = await this.findOrCreate(
        conn,
        "forma_farmaceutica",
        "nombre",
        forma_farmaceutica
      );
      const presentacionId = await this.findOrCreate(
        conn,
        "presentacion",
        "cantidad",
        presentacion
      );
      const categoriaMedicamentoId = await this.findOrCreate(
        conn,
        "categoria_medicamento",
        "nombre",
        categoria
      );
      const familiaMedicamentoId = await this.findOrCreate(
        conn,
        "familia_medicamento",
        "nombre",
        familia
      );

      const monodrogasConcentraciones = componentes.map(
        ({ monodroga, cantidad, unidad }) => ({
          monodroga,
          cantidad,
          unidad,
        })
      );

      const nombreGenerico = await Medicamento.generateNombreGenerico(
        conn,
        monodrogasConcentraciones
      );

      const [result] = await conn.query(
        `INSERT INTO medicamento (nombre_generico, nombre_comercial_id, forma_farmaceutica_id, 
            presentacion_id, categoria_medicamento_id, familia_medicamento_id, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          nombreGenerico,
          nombreComercialId,
          formaFarmaceuticaId,
          presentacionId,
          categoriaMedicamentoId,
          familiaMedicamentoId,
          estado,
        ]
      );

      const medicamentoId = result.insertId;

      for (let i = 0; i < componentes.length; i++) {
        const componente = componentes[i];
        const monodrogaId = await insertOrGetId(
          conn,
          "monodroga",
          componente.monodroga
        );
        const unidadId = await insertOrGetId(conn, "unidad", componente.unidad);
        const concentracionId = await this.findOrCreateConcentracion(
          conn,
          componente.cantidad,
          unidadId
        );

        const orden = i + 1;

        await conn.query(
          "INSERT INTO medicamento_monodroga (medicamento_id, monodroga_id, concentracion_id, orden) VALUES (?, ?, ?, ?)",
          [medicamentoId, monodrogaId, concentracionId, orden]
        );
      }

      await conn.commit();
      res.status(201).json({
        message: "Medicamento creado exitosamente",
        medicamentoId,
        nombreGenerico,
      });
    } catch (error) {
      await conn.rollback();
      console.error("Error al crear el medicamento:", error);
      res.status(500).json({ message: "Error al crear el medicamento" });
    } finally {
      conn.release();
    }
  }

  async delete() {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        "UPDATE medicamento SET estado = 'Inactivo' WHERE id = ?",
        [this.id]
      );

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async getAll() {
    const [rows] = await pool.query("SELECT * FROM medicamento");
    return rows.map(
      (row) =>
        new Medicamento(
          row.id,
          row.nombre_generico,
          row.nombre_comercial_id,
          row.forma_farmaceutica_id,
          row.presentacion_id,
          row.categoria_medicamento_id,
          row.familia_medicamento_id
        )
    );
  }
}

module.exports = Medicamento;
